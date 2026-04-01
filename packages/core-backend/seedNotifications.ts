import { prisma } from './src/db';

async function seedNotifications() {
  console.log('🔔 Sembrando notificaciones de prueba...');
  
  await prisma.core_Notification.createMany({
    data: [
      {
        title: 'Nueva Factura A Importada',
        description: 'Se ha procesado la factura 0001-00000123 del proveedor Aceros del Sur S.A.',
        type: 'SUCCESS',
        metadata: { invoiceId: '...' }
      },
      {
        title: 'Alerta: Deuda Pendiente',
        description: 'El proveedor WOLSE SRL tiene una deuda mayor a $1.000.000 vencida.',
        type: 'WARNING',
        metadata: { providerId: '...' }
      },
      {
        title: 'Sistema Actualizado',
        description: 'El ERP Clorymetal se ha actualizado a la versión de integración modular.',
        type: 'INFO',
      }
    ]
  });

  console.log('✅ Notificaciones creadas.');
}

seedNotifications()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
