const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
const logger = require('../config/logger');

class FileProcessingService {
    constructor() {
        this.limits = {
            maxFileSize: 10 * 1024 * 1024, 
            maxTextLength: 100000,
            minTextLength: 50
        };
    }

    validateFile(file) {
        if (!file) throw new Error('Nenhum arquivo fornecido');
        if (file.size > this.limits.maxFileSize) {
            throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
        }
        return true;
    }

    cleanText(text) {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    async extractText(file) {
        this.validateFile(file);
        const { buffer, mimetype, originalname } = file;
        
        logger.info('Processing file', { originalname, mimetype, size: buffer.length });
        
        let extractedText;
        
        try {
            switch (mimetype) {
                case 'application/pdf':
                    const pdfData = await pdf(buffer);
                    extractedText = pdfData.text;
                    logger.info('PDF processed successfully', { originalname, textLength: extractedText.length });
                    break;
                    
                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                    const docxResult = await mammoth.extractRawText({ buffer });
                    extractedText = docxResult.value;
                    logger.info('DOCX processed successfully', { originalname, textLength: extractedText.length });
                    break;
                    
                case 'text/plain':
                case 'text/markdown':
                    extractedText = buffer.toString('utf-8');
                    logger.info('Text file processed successfully', { originalname, textLength: extractedText.length });
                    break;
                    
                case 'image/jpeg':
                case 'image/jpg':
                case 'image/png':
                case 'image/webp':
                    logger.info('Starting OCR processing', { originalname });
                    const startTime = Date.now();
                    const { data: { text } } = await Tesseract.recognize(buffer, 'por');
                    const processingTime = Date.now() - startTime;
                    extractedText = text;
                    logger.info('OCR processing completed', { originalname, processingTime: `${processingTime}ms`, textLength: extractedText.length });
                    break;
                    
                default:
                    throw new Error(`Tipo de arquivo não suportado: ${mimetype}`);
            }

            if (!extractedText || extractedText.trim().length < this.limits.minTextLength) {
                throw new Error(`Texto extraído é muito curto (mínimo ${this.limits.minTextLength} caracteres)`);
            }

            const cleanedText = this.cleanText(extractedText);
            const wasOptimized = cleanedText.length > this.limits.maxTextLength;
            const finalText = wasOptimized 
                ? cleanedText.substring(0, this.limits.maxTextLength) + '...'
                : cleanedText;
            
            logger.info('File processing completed', {
                originalname,
                originalLength: extractedText.length,
                finalLength: finalText.length,
                wasOptimized
            });
            
            return {
                text: finalText,
                originalLength: extractedText.length,
                wasOptimized,
                processingInfo: {
                    filename: originalname,
                    mimetype,
                    extractedAt: new Date().toISOString()
                }
            };
            
        } catch (error) {
            console.error(`❌ Erro ao processar ${originalname}:`, error.message);
            throw new Error(`Erro ao processar ${originalname}: ${error.message}`);
        }
    }

    async cleanup() {
        logger.info('FileProcessingService cleanup completed');
    }
}

module.exports = new FileProcessingService();