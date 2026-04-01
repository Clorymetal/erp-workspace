# 📊 ERP Development Task Tracker (Agente de Desarrollo)

## Fase 1: Planificación y Arquitectura (Actual)
- [x] Definir visión arquitectónica (Monolito Modular / Múltiples Agentes documentales).
- [x] Elaborar guías de diseño (`architecture_overview.md`, `module_integration.md`).
- [ ] Validar con el usuario el plan, el enfoque de la base de datos y la interfaz de diseño.

## Fase 2: Configuración del Cimiento ERP (Core)
- [x] Inicializar monorepo estructurado (`erp-workspace`).
- [x] Configurar y levantar contenedor Docker de PostgreSQL (`erp_db`).
- [x] Configurar TypeScript estricto, ESLint y Prettier.
- [x] Inicializar servidor Node.js base (Gateway / Core App).
- [x] Configurar conexión central de ORM (Prisma/Sequelize).

## Fase 3: Creación del Módulo 1 (Proveedores)
- [x] **Esquema:** Definir tablas `Proveedores`, `Cuentas`, `Contactos`, `Facturas`, `Pagos`.
- [x] **API Interna:** Crear la interfaz interna (Qué expone Proveedores al resto del ERP).
- [x] **API REST (Externa):** Desarrollar rutas de ingreso para el Frontend web.
- [x] **Servicios:** Lógica de registro, control de saldo en Cuenta Corriente e imputación de notas de crédito.
- [x] **Reportes:** Motor de generación de consultas con flitros dinámicos (Buffer PDF, CSV/Excel).

## Fase 4: Frontend y Sistema de Diseño (UI Premium)
- [x] Inicializar app React + Vite dentro del monorepo.
- [x] Configurar Tailwind CSS y paleta de colores vibrante + Dark Mode.
- [x] Crear Layout Core (Sidebar expansible, Header, Notificaciones).
- [x] Desarrollar componentes "Primitivos" con Framer Motion (Buttons, Modals, DataTables).
- [x] **Acople UI Proveedores:** Conectar las pantallas del gestor a layout central.
- [x] **Exportación UX:** Botones dinámicos para Exportar vistas (A Excel, PDF) y compartir link por WhatsApp.

## Fase 5: Pruebas y Simulacro de Integración
- [x] **Levantar Entorno:** Al inicio de la próxima sesión, ejecutar `npm run dev` en la raíz del monorepo (`erp-workspace`), asegurando que Postgres, el Backend (puerto 4000) y Frontend operen de manera sincronizada.
- [x] Crear un "Módulo Ficticio" (Ej: *Notificaciones Internas*) para probar y demostrar cómo se acopla según la `module_integration.md` guide.
- [x] Pruebas end-to-end completas.

## Fase 6: Módulo de Compras y Reportes Contables (Nivel Operativo)
- [x] **Módulo de Compras:** Consulta global de facturas con filtros transversales.
- [x] **Exportación Contable:** Generación de reportes de 23 columnas (Excel/PDF) compatibles con AFIP/Contadora.
- [x] **Lógica de Cta Cte:** Filtros precisos para diferenciar proveedores de contado vs deuda real.
- [x] **Dashboard Real:** Panel de control con KPIs (Deuda total, Compras del mes, Alerta de vencimientos).

## Fase 7: Gestión de Pagos e Imputación (Próximo)
- [ ] **Registrar Pago:** Formulario para procesar pagos a proveedores (Efectivo/Cheque/Transferencia).
- [ ] **Imputación Automática:** Vincular pagos a facturas pendientes para descontar saldos.
- [ ] **Cartera de Tesorería:** Visualización de cheques emitidos y estados de cuentas bancarias.

## Fase 8: Módulo de Empleados y RRHH (Completado)
- [x] **Base de Datos:** Estructura que separa Períodos Mensuales de Adelantos continuos.
- [x] **Vistas Generales:** Tarjeta por empleado desglosando base salarial, adelantos totales (Efectivo/Transf/Cheques) y saldo maestro.
- [x] **Carga Interactiva:** Formulario rápido de "Adelanto" y baja destructiva de compensación matemática (recálculo en cascada temporal).
- [x] **Exportación Inteligente:** PDF compreso (A4 Vertical denso), envíos WhatsApp de texto resumido y tabulación en CSV.

### Fase 9: Infraestructura y Despliegue Cloud (COMPLETADA ✅)
- [X] Crear Repositorio GitHub (Oficial)
- [X] Configurar Base de Datos PostgreSQL en **Neon.tech**
- [X] Desplegar Backend API en **Render.com**
- [X] Refactorizar Frontend para URLs dinámicas (Desarrollo vs Producción)
- [X] Desplegar Frontend en **Vercel.com**

### Próximos Pasos (Fase 7 - Continuación):
- [ ] Implementar Modal de Pago en Compras (Cta Cte)
- [ ] Auditoría de Saldos en tiempo real
- [ ] Módulo Inventario (Preliminar)
