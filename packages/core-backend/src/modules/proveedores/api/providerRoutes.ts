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
    getAllFinancialInvoices
} from '../controllers/providerController';
import { prisma } from '../../../../db';

const router = Router();

// Endpoint temporal para actualizar las facturas historicas en produccion facilmente
router.get('/facturas/fix-iva-historico', async (req, res) => {
    try {
        const result = await prisma.prov_Invoice.updateMany({
            data: { ivaPeriod: '2026-03' }
        });
        res.json({ success: true, message: `Actualizadas ${result.count} facturas` });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

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
