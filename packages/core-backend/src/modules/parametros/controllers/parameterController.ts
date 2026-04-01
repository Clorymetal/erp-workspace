import { Request, Response } from 'express';
import * as parameterService from '../services/parameterService';

export const listParameters = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.query;
        const params = await parameterService.getParameters(category as string);
        res.status(200).json(params);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createNewParameter = async (req: Request, res: Response): Promise<void> => {
    try {
        const param = await parameterService.createParameter(req.body);
        res.status(201).json(param);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateExistingParameter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updated = await parameterService.updateParameter(id, req.body);
        res.status(200).json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteParameter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await parameterService.deleteParameter(id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
