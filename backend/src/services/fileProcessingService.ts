import { logger } from '@/config/logger';
import { FileProcessingJob, FileType } from '@/types';
import { promises as fs } from 'fs';
import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import path from 'path';

interface ProcessedFileResult {
  text: string;
  wordCount: number;
  charCount: number;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];

const validateFile = async (filePath: string): Promise<void> => {
  try {
    const stats = await fs.stat(filePath);

    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    const extension = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      throw new Error(`Unsupported file type: ${extension}. Supported types: ${SUPPORTED_EXTENSIONS.join(', ')}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('no such file')) {
      throw new Error('File not found');
    }
    throw error;
  }
};

const getFileType = (filePath: string): FileType => {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case '.pdf':
      return 'application/pdf';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.txt':
      return 'text/plain';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
};

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  logger.info('Starting PDF text extraction', { filePath });

  try {
    await validateFile(filePath);

    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }

    logger.info('PDF text extraction completed successfully', {
      filePath,
      textLength: data.text.length,
      pages: data.numpages
    });

    return data.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('PDF text extraction failed', { filePath, error: errorMessage });
    throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
  }
};

const extractTextFromDOCX = async (filePath: string): Promise<string> => {
  logger.info('Starting DOCX text extraction', { filePath });

  try {
    const result = await mammoth.extractRawText({ path: filePath });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in DOCX');
    }

    if (result.messages.length > 0) {
      logger.warn('DOCX extraction warnings', {
        filePath,
        warnings: result.messages.map(m => m.message)
      });
    }

    logger.info('DOCX text extraction completed successfully', {
      filePath,
      textLength: result.value.length
    });

    return result.value;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('DOCX text extraction failed', { filePath, error: errorMessage });
    throw new Error(`Failed to extract text from DOCX: ${errorMessage}`);
  }
};

const extractTextFromTXT = async (filePath: string): Promise<string> => {
  logger.info('Starting TXT file reading', { filePath });

  try {
    const text = await fs.readFile(filePath, 'utf-8');

    if (!text || text.trim().length === 0) {
      throw new Error('Text file is empty');
    }

    logger.info('TXT file reading completed successfully', {
      filePath,
      textLength: text.length
    });

    return text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('TXT file reading failed', { filePath, error: errorMessage });
    throw new Error(`Failed to read text file: ${errorMessage}`);
  }
};

const extractTextFromImage = async (filePath: string): Promise<string> => {
  logger.info('Starting OCR text extraction from image', { filePath });

  let worker: Tesseract.Worker | null = null;

  try {
    worker = await createWorker('eng');

    const { data: { text } } = await worker.recognize(filePath);

    if (!text || text.trim().length === 0) {
      throw new Error('No text found in image through OCR');
    }

    logger.info('OCR text extraction completed successfully', {
      filePath,
      textLength: text.length
    });

    return text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('OCR text extraction failed', { filePath, error: errorMessage });
    throw new Error(`Failed to extract text from image via OCR: ${errorMessage}`);
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
};

const analyzeText = (text: string): ProcessedFileResult => {
  const cleanText = text.trim();
  const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = cleanText.length;

  return {
    text: cleanText,
    wordCount,
    charCount
  };
};

export const processFile = async (filePath: string, fileType?: string): Promise<string> => {
  logger.info('Starting file processing', { filePath, fileType });

  try {
    await validateFile(filePath);

    const detectedFileType = fileType || getFileType(filePath);
    const extension = path.extname(filePath).toLowerCase();

    let extractedText: string;

    switch (extension) {
      case '.pdf':
        extractedText = await extractTextFromPDF(filePath);
        break;
      case '.docx':
        extractedText = await extractTextFromDOCX(filePath);
        break;
      case '.txt':
        extractedText = await extractTextFromTXT(filePath);
        break;
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
        extractedText = await extractTextFromImage(filePath);
        break;
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }

    const result = analyzeText(extractedText);

    if (result.wordCount < 10) {
      throw new Error('Extracted text is too short to generate meaningful flashcards (minimum 10 words required)');
    }

    logger.info('File processing completed successfully', {
      filePath,
      fileType: detectedFileType,
      wordCount: result.wordCount,
      charCount: result.charCount
    });

    return result.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('File processing failed', { filePath, error: errorMessage });
    throw error;
  }
};

export const getSupportedFileTypes = (): string[] => {
  return SUPPORTED_EXTENSIONS;
};

export const getMaxFileSize = (): number => {
  return MAX_FILE_SIZE;
};

export default {
  processFile,
  extractTextFromPDF,
  getSupportedFileTypes,
  getMaxFileSize,
};