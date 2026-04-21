import { Request, Response } from 'express';
import * as clientService from '../services/clientService';

export const getClients = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const clients = await clientService.getAllClients(search as string);
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await clientService.getClientById(id);
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(client);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const client = await clientService.createClient(req.body);
    res.status(201).json(client);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = await clientService.updateClient(id, req.body);
    res.json(client);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await clientService.deleteClient(id);
    res.status(204).json({ message: 'Cliente eliminado correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getClientBalance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const balance = await clientService.getClientBalance(id);
    res.json(balance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getClientCtaCte = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = await clientService.getClientMovementHistory(id);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
