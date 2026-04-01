import express, { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();

// Middlewares Globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas Globales Base (Gateway)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'ERP Core is running' });
});

// Módulos
import dashboardRouter from './modules/dashboard/api/dashboardRoutes';
import proveedoresRouter from './modules/proveedores/api/providerRoutes';
import notificationsRouter from './modules/notificaciones/api/notificationRoutes';
import parametersRouter from './modules/parametros/api/parameterRoutes';
import employeeRouter from './modules/empleados/employee.routes';

app.use('/api/dashboard', dashboardRouter);
app.use('/api/proveedores', proveedoresRouter);
app.use('/api/notificaciones', notificationsRouter);
app.use('/api/parametros', parametersRouter);
app.use('/api/empleados', employeeRouter);

export default app;
