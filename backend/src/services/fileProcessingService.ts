import { logger } from '@/config/logger';
import { FileProcessingJob, FileType } from '@/types';

export const processFile = async (filePath: string, fileType: FileType): Promise<string> => {
  logger.info('File processing called', { filePath, fileType });

  return 'File processing - TODO: Implement';
};

export const extractTextFromPDF = async (filePath: string): Promise<string> => {
  logger.info('PDF text extraction called', { filePath });

  return 'PDF text extraction - TODO: Implement';
};

export default {
  processFile,
  extractTextFromPDF,
};