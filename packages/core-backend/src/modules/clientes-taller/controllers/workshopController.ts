import { Request, Response } from 'express';
import * as workshopService from '../services/workshopService';
import { OrderStatus } from '@prisma/client';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const order = await workshopService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await workshopService.getOrders(req.query);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await workshopService.updateOrderStatus(id, status as OrderStatus);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await workshopService.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isCompleted } = req.body;
    const task = await workshopService.updateTaskStatus(id, isCompleted);
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await workshopService.updateOrder(id, req.body);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await workshopService.deleteOrder(id);
    res.json({ success: true, message: 'Orden eliminada correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
