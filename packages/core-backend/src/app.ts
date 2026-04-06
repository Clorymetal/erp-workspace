import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import errorMiddleware from './core/middleware/errorMiddleware';

const app: Express = express();

// Middlewares Globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas Globales Base (Gateway)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'ERP Core is running', version: '2.2.2-iva-migration' });
});

// Módulos
import dashboardRouter from './modules/dashboard/api/dashboardRoutes';
import proveedoresRouter from './modules/proveedores/api/providerRoutes';
import notificationsRouter from './modules/notificaciones/api/notificationRoutes';
import parametersRouter from './modules/parametros/api/parameterRoutes';
import employeeRouter from './modules/empleados/employee.routes';
import authRouter from './modules/auth/api/authRoutes';

app.use('/api/dashboard', dashboardRouter);
app.use('/api/proveedores', proveedoresRouter);
app.use('/api/notificaciones', notificationsRouter);
app.use('/api/parametros', parametersRouter);
app.use('/api/empleados', employeeRouter);
app.use('/api/auth', authRouter);

// Standard Error Handler (must be last)
app.use(errorMiddleware);

export default app;
