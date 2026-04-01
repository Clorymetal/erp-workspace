import { prisma } from '../../../db';

export const getRecentNotifications = async (limit: number = 10) => {
    return await prisma.core_Notification.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' }
    });
};

export const markAsRead = async (id: string) => {
    return await prisma.core_Notification.update({
        where: { id },
        data: { isRead: true }
    });
};

export const createNotification = async (data: { title: string, description?: string, type?: string, metadata?: any }) => {
    return await prisma.core_Notification.create({
        data: {
            title: data.title,
            description: data.description,
            type: data.type || 'INFO',
            metadata: data.metadata || {}
        }
    });
};
