import { Router } from 'express';
import { 
    getAllProviders, 
    createNewProvider, 
    getBalance, 
    getReportCSV, 
    getProviderInvoices, 
    createNewInvoice, 
    patchInvoice,
    deleteExistingInvoice,
    updateExistingProvider,
    getAllFinancialInvoices,
    runIvaMigration,
    fixDueDatesMigration,
    getProviderCtaCte,
    getProviderPendingItems,
    createNewPayment,
    annulPayment,
    getPaymentTraceability
} from '../controllers/providerController';

const router = Router();

// Endpoint Temporal de Mantenimiento
router.get('/maintenance/migrate-iva', runIvaMigration);
router.get('/maintenance/fix-due-dates', fixDueDatesMigration);

// Endpoints globales de facturas
router.get('/facturas', getAllFinancialInvoices);
router.patch('/facturas/:invoiceId', patchInvoice);
router.delete('/facturas/:invoiceId', deleteExistingInvoice);

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

// Cuenta Corriente y Pagos
router.get('/:id/cta-cte', getProviderCtaCte);
router.get('/:id/items-pendientes', getProviderPendingItems);
router.post('/:id/pagos', createNewPayment);
router.get('/pagos/:paymentId', getPaymentTraceability);
router.patch('/pagos/:paymentId/annul', annulPayment);

export default router;
