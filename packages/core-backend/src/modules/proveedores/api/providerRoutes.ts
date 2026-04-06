import { Router } from 'express';
import { 
    getAllProviders, 
    createNewProvider, 
    getBalance, 
    getReportCSV, 
    getProviderInvoices, 
    createNewInvoice, 
    patchInvoice,
    updateExistingProvider,
    getAllFinancialInvoices,
    runIvaMigration
} from '../controllers/providerController';

const router = Router();

// Endpoint Temporal de Mantenimiento
router.get('/maintenance/migrate-iva', runIvaMigration);

// Endpoints globales de facturas
router.get('/facturas', getAllFinancialInvoices);
router.patch('/facturas/:invoiceId', patchInvoice);

// Endpoints principales de proveedores
router.get('/', getAllProviders);
router.post('/', createNewProvider);
router.patch('/:id', updateExistingProvider);
router.get('/report/csv', getReportCSV);
router.get('/:id/balance', getBalance);

// Facturas por proveedor (Contextuales)
router.get('/:id/facturas', getProviderInvoices);
router.post('/:id/facturas', createNewInvoice);
router.patch('/:id/facturas/:invoiceId', patchInvoice);

export default router;
