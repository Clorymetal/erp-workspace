# 🚀 Plan de Despliegue y Operaciones - ERP Clorymetal

## 📜 Visión General
Este proyecto sigue una estrategia de **Despliegue Continuo (CI/CD)**. El ERP se encuentra en fase de desarrollo activo, pero con módulos productivos que deben permanecer operativos las 24/7. 

La arquitectura está diseñada para permitir que el desarrollo de nuevos módulos no interrumpa el funcionamiento de los que ya están en "Producción".

**Repositorio Central:** [GitHub Clorymetal](https://github.com/Clorymetal)

---

## 🏗️ Arquitectura de Ambientes

### 1. Entorno de Desarrollo (Local)
- **Localhost:** `http://localhost:5173` (Frontend) / `http://localhost:3001` (Backend)
- **Base de Datos:** Docker PostgreSQL (`erp_database`)
- **Uso:** Pruebas intensivas, creación de esquemas, prototipado de UI y "breaking changes".
- **Comandos Clave:**
  - `npm run dev`: Levanta todo el monorepo.
  - `npx prisma migrate dev`: Crea nuevas migraciones tras cambios en `schema.prisma`.

### 2. Entorno de Producción (Cloud - Free Tier)
- **Frontend (Vite/React):** Alojado en **Vercel** (vía GitHub).
- **Backend (Node.js/Express):** Alojado en **Render.com** (vía GitHub).
- **Base de Datos:** **Neon.tech** (PostgreSQL Serverless).
- **Uso:** Módulos estables (Proveedores, Empleados) consumidos por el usuario final.

---

## 🔄 Flujo de Trabajo (Workflow)

Para garantizar que la base de datos no se rompa en producción mientras desarrollamos localmente, seguimos este flujo:

1.  **Desarrollo Local:** Se crea el código y se ajusta el DB Schema.
2.  **Generación de Migración:** Se ejecuta `npx prisma migrate dev --name <descripcion>`. Esto genera un script SQL en `prisma/migrations`.
3.  **Push a GitHub:** Se sube el código a la rama `main`.
4.  **Auto-Despliegue:**
    - **Vercel** reconstruye el Frontend.
    - **Render** reconstruye el Backend y ejecuta `npx prisma migrate deploy`. Este comando aplica *solo* los cambios nuevos en la base de datos de Neon **sin borrar los datos existentes**.
5.  **Validación:** Se verifica que el nuevo módulo aparezca en la URL de producción sin afectar lo anterior.

---

## 🔑 Variables de Envío (Secrets)

| Variable | Descripción | Valor Local | Valor Producción |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://...localhost:5432` | `postgresql://...neon.tech` |
| `VITE_API_URL` | URL del Backend para el Front | `http://localhost:3001/api` | `https://erp-backend.onrender.com/api` |
| `PORT` | Puerto del API | `3001` | Manejado por Render |

---

## ⚠️ Reglas de Oro para Desarrolladores
- **NUNCA** usar `prisma db push` directamente sobre la base de datos de Producción (Neon). Siempre usar `migrate deploy`.
- **BACKUPS:** Antes de una migración compleja en producción, crear un "Branch" en Neon como respaldo.
- **ESTADO DE MÓDULOS:** Consultar siempre `task.md` para saber qué secciones están en modo "Experimental" y cuáles en "Productivo".
