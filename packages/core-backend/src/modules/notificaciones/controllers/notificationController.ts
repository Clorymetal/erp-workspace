import { Request, Response } from 'express';
import { getRecentNotifications, markAsRead } from '../services/notificationService';

export const listNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const notifications = await getRecentNotifications();
        res.status(200).json(notifications);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateNotificationReadStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updated = await markAsRead(id);
        res.status(200).json(updated);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
