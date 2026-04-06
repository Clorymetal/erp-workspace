# Deuda Técnica y Riesgos Estructurales (Technical Debt)

*Documento generado a partir del corte de estado el 01 de Abril de 2026. Este archivo debe ser revisado para priorizar refactorizaciones antes de construir módulos complejos.*

## 🚨 Puntos de Riesgo Críticos Actuales

### 1. Gestión de Migraciones (Desincronización) ✅ RESUELTO
Hoy sufrimos problemas de despliegue porque la base local y la de producción tenían esquemas distintos (`isCtaCte` faltante en remoto). Ejecutar `prisma db push` manualmente en producción es una mala práctica propensa a pérdida de datos. 
**Solución implementada:** Ahora utilizamos `prisma migrate deploy` en el despliegue a producción y garantizamos consistencia de esquemas.

### 2. Deuda Técnica (SQL Crudo vs ORM) ✅ RESUELTO
Para solucionar una urgencia de fallos 500 durante el inicio de sesión con Google, reescribimos el controlador inyectando código SQL "crudo" (`$executeRawUnsafe`). Esto mitiga temporalmente el problema del cliente Prisma desactualizado en caché, pero rompe la capa de seguridad de tipos del ORM.
**Solución implementada:** Se reescribió el código del inicio de sesión para que utilice los comandos nativos de Prisma, devolviendo toda la seguridad de tipos.

### 3. Falta de Pruebas Automatizadas (Testing) 🚧 EN PROCESO
Actualmente estamos realizando control de calidad (QA) directamente contra el entorno de Producción. Un error de sintaxis no detectado en un nuevo módulo podría inhabilitar módulos de uso diario (como Facturas o Salarios).
**Solución implementada:** Se configuró un script de `lint` global en el monorepo para catching de errores estáticos antes de cada build y se está evaluando Vitest.

### 4. Acoplamiento de Estados en Frontend ✅ RESUELTO
La aplicación maneja las peticiones mediante llamadas de Fetch/Axios en bruto desde los componentes. A medida que la cantidad de facturas y operaciones crezca, volver a consultar iterativamente el backend causará un embudo de red y lentitud en el dashboard.
**Solución implementada:** Se instaló y configuró **TanStack Query (React Query)** en todo el monorepo. Se refactorizaron los módulos de Proveedores y Empleados para usar custom hooks (useProviders, useEmployees) con caché inteligente de 5 minutos, eliminando peticiones redundantes y mejorando la velocidad de navegación.

### 5. Manejo Deficiente de Errores (Error Handling) ✅ RESUELTO
El Backend carece de un atrapador global de errores (Global Error Boundary). Rutas que fallan por problemas de llave externa, nulos, o caídas de BD envían un error `500` crudo y silencioso que no permite diagnosticar en cliente.
**Solución implementada:** Se implementó un **Middleware de Errores Global** en el Backend Core. Ahora todos los errores se capturan centralizadamente, se loguean en el servidor con detalle y se devuelven al cliente en un formato JSON estandarizado (`{status: 'error', statusCode, message}`).

---
**Conclusión Estratégica:**
Poseemos una excelente infraestructura basada en tecnologías de punta (Neon, Prisma, Node, Vercel). Sin embargo, el esfuerzo de ingeniería a corto plazo debe centrarse temporalmente en la estabilización, consistencia de CI/CD y pago de esta deuda técnica antes de escalar a módulos robustos como Ventas e Inventario.
