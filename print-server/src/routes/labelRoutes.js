import { Router } from 'express';
import {
  printLabel,
  previewLabel,
  exportLabel,
  getPrinters,
  getTemplates,
  checkPrinterStatus,
} from '../controllers/labelController.js';

const router = Router();

// Label operations
router.post('/print', printLabel);
router.post('/preview', previewLabel);
router.post('/export', exportLabel);

// Printer information
router.get('/printers', getPrinters);
router.get('/printers/:printer/status', checkPrinterStatus);

// Template information
router.get('/templates', getTemplates);

export default router;
