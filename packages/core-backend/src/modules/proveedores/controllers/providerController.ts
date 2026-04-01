import { Request, Response } from 'express';
import { 
    createProvider, 
    updateProvider, 
    getSupplierBalance, 
    getAllInvoices,
    createInvoice,
    updateInvoice
} from '../services/providerService';
import { prisma } from '../../../db';

export const getAllProviders = async (req: Request, res: Response) => {
    try {
        const providers = await prisma.prov_Provider.findMany({
            include: { contacts: true, invoices: true }
        });
        
        // Calcular balance para cada uno
        const providersWithBalance = await Promise.all(providers.map(async (p) => {
            const balanceData = await getSupplierBalance(p.id);
            return { ...p, balance: balanceData.balance };
        }));

        res.json(providersWithBalance);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createNewProvider = async (req: Request, res: Response) => {
    try {
        const provider = await createProvider(req.body);
        res.status(201).json(provider);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateExistingProvider = async (req: Request, res: Response) => {
    try {
        const provider = await updateProvider(req.params.id, req.body);
        res.json(provider);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getBalance = async (req: Request, res: Response) => {
    try {
        const balance = await getSupplierBalance(req.params.id);
        res.json(balance);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getProviderInvoices = async (req: Request, res: Response) => {
    try {
        const invoices = await prisma.prov_Invoice.findMany({
            where: { providerId: req.params.id },
            orderBy: { issueDate: 'desc' }
        });
        res.json(invoices);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createNewInvoice = async (req: Request, res: Response) => {
    try {
        const invoice = await createInvoice(req.params.id, req.body);
        res.status(201).json(invoice);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const patchInvoice = async (req: Request, res: Response) => {
    try {
        const invoice = await updateInvoice(req.params.invoiceId, req.body);
        res.json(invoice);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllFinancialInvoices = async (req: Request, res: Response) => {
    try {
        const invoices = await getAllInvoices(req.query);
        res.json(invoices);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getReportCSV = async (req: Request, res: Response) => {
    // Stub
    res.send('CSV Report Generic');
};
