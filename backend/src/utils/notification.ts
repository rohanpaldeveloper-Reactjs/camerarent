import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createNotification(userId: string, title: string, message: string, type: string) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function notifyAdmins(title: string, message: string, type: string) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    for (const admin of admins) {
      await createNotification(admin.id, title, message, type);
    }
  } catch (error) {
    console.error('Error notifying admins:', error);
  }
}
