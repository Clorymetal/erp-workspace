# Deuda Técnica y Riesgos Estructurales (Technical Debt)

*Documento generado a partir del corte de estado el 01 de Abril de 2026. Este archivo debe ser revisado para priorizar refactorizaciones antes de construir módulos complejos.*

## 🚨 Puntos de Riesgo Críticos Actuales

### 1. Gestión de Migraciones (Desincronización)
Hoy sufrimos problemas de despliegue porque la base local y la de producción tenían esquemas distintos (`isCtaCte` faltante en remoto). Ejecutar `prisma db push` manualmente en producción es una mala práctica propensa a pérdida de datos. 
**Solución requerida:** Necesitamos establecer un proceso sólido de migraciones (`prisma migrate deploy`) que se ejecute automáticamente al compilar en Render.

### 2. Deuda Técnica (SQL Crudo vs ORM)
Para solucionar una urgencia de fallos 500 durante el inicio de sesión con Google, reescribimos el controlador inyectando código SQL "crudo" (`$executeRawUnsafe`). Esto mitiga temporalmente el problema del cliente Prisma desactualizado en caché, pero rompe la capa de seguridad de tipos del ORM.
**Solución requerida:** Revertir temporalmente el código a métodos de Prisma una vez que el pipeline de migraciones CI/CD sea estable.

### 3. Falta de Pruebas Automatizadas (Testing)
Actualmente estamos realizando control de calidad (QA) directamente contra el entorno de Producción. Un error de sintaxis no detectado en un nuevo módulo podría inhabilitar módulos de uso diario (como Facturas o Salarios).
**Solución requerida:** Introducir test básicos estáticos (eslint estricto en CI) y tests de integración básicos en las rutas principales (ej. Verificar que la API siempre devuelve 200 en los endpoints vitales).

### 4. Acoplamiento de Estados en Frontend
La aplicación maneja las peticiones mediante llamadas de Fetch/Axios en bruto desde los componentes. A medida que la cantidad de facturas y operaciones crezca, volver a consultar iterativamente el backend causará un embudo de red y lentitud en el dashboard.
**Solución requerida:** Instalar y configurar una capa formal de caché e in-memory state management como `TanStack Query (React Query)` o `SWR`, reduciendo las lecturas de red innecesarias.

### 5. Manejo Deficiente de Errores (Error Handling)
El Backend carece de un atrapador global de errores (Global Error Boundary). Rutas que fallan por problemas de llave externa, nulos, o caídas de BD envían un error `500` crudo y silencioso que no permite diagnosticar en cliente.
**Solución requerida:** Implementar un middleware unificado para formatear respuestas de error estandarizadas evitando fugas de información y facilitando la depuración frontend.

---
**Conclusión Estratégica:**
Poseemos una excelente infraestructura basada en tecnologías de punta (Neon, Prisma, Node, Vercel). Sin embargo, el esfuerzo de ingeniería a corto plazo debe centrarse temporalmente en la estabilización, consistencia de CI/CD y pago de esta deuda técnica antes de escalar a módulos robustos como Ventas e Inventario.
