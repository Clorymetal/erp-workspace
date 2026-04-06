# 🚀 Plan de Despliegue: Libro IVA Compras a Producción

> **Fecha:** 6 de Abril 2026  
> **Estado:** PENDIENTE - Probado exitosamente en local  
> **Conversación de origen:** cc4b3392-0a81-4957-8674-4780defb9475

---

## 📋 Resumen de lo que se hizo en esta sesión

Se creó el módulo **Libro IVA Compras** que permite:
- Consultar todas las facturas filtradas por **período fiscal** (mes/año)
- **Asignar un número de orden** (Rec) editable directamente en la tabla
- **Exportar** los datos en formato CSV/Excel para enviar a la contadora
- Filtrar por búsqueda rápida (proveedor, CUIT, factura)

### Cambios técnicos realizados:
1. **Base de datos:** Se agregaron campos `ivaPeriod` (String) e `ivaNumber` (Int) al modelo `Prov_Invoice`
2. **Backend:** Nuevas rutas y filtros por período en el servicio de facturas
3. **Frontend:** Nueva página `LibroIvaComprasPage.tsx`, menú lateral actualizado, modal de factura actualizado
4. **Login:** Botón "Acceso Alternativo" protegido con PIN personal

---

## 🎯 Pasos para desplegar a producción

### Paso 1: Subir código a GitHub
```powershell
cd d:\E\Clorymetal\Desarrollo\Aplicaciones\erp-workspace
git add .
git commit -m "feat: módulo Libro IVA Compras con filtros por período y secuenciación"
git push origin main
```
> Esto dispara el deploy automático en **Vercel** (frontend) y **Render** (backend).

### Paso 2: Migrar la base de datos de producción (Neon)
Necesitamos agregar las 2 columnas nuevas (`ivaPeriod`, `ivaNumber`) a la DB de producción.

**Opción A** - Desde la terminal local apuntando a Neon:
```powershell
cd packages/core-backend
# Temporalmente cambiar DATABASE_URL en .env a la URL de Neon (producción)
# Luego ejecutar:
npx prisma db push
# Después, restaurar DATABASE_URL al valor local
```

**Opción B** - Si Render ya tiene configurado `prisma migrate deploy` en su build command:
El backend en Render debería correr las migraciones automáticamente al deployarse.

### Paso 3: Asignar período marzo a las facturas de producción
Ejecutar el script `scripts/update_iva_period.js` apuntando a la base de datos de Neon:
```powershell
cd packages/core-backend
# Con DATABASE_URL apuntando a Neon:
node scripts/update_iva_period.js
```
Esto asigna `2026-03` a todas las facturas existentes.

---

## ⚠️ Precauciones importantes

- **Los datos de producción NO se pierden.** Solo se agregan columnas nuevas vacías y luego se rellenan.
- **El login con Google** sigue funcionando igual en producción. El botón "Acceso Alternativo" es solo una opción adicional protegida con PIN.
- **Verificar** que después del deploy, al entrar a `/libro-iva` en producción, aparezcan las facturas correctamente.

---

## 📁 Archivos modificados / creados en esta sesión

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `prisma/schema.prisma` | Modificado | Nuevos campos `ivaPeriod`, `ivaNumber` |
| `src/modules/proveedores/services/providerService.ts` | Modificado | CRUD + filtro por período |
| `src/modules/proveedores/api/providerRoutes.ts` | Modificado | Ruta PATCH global para facturas |
| `src/modules/proveedores/pages/LibroIvaComprasPage.tsx` | **Nuevo** | Página principal del Libro IVA |
| `src/modules/proveedores/components/InvoiceModal.tsx` | Modificado | Campos IVA en modal |
| `src/core/layout/Sidebar.tsx` | Modificado | Enlace "Libro IVA" en menú |
| `src/App.tsx` | Modificado | Ruta `/libro-iva` |
| `src/core/contexts/AuthContext.tsx` | Modificado | Mock login para desarrollo |
| `src/modules/auth/pages/LoginPage.tsx` | Modificado | Botón "Acceso Alternativo" con PIN |
| `scripts/update_iva_period.js` | **Nuevo** | Script para asignar períodos |

---

## 🔑 Nota sobre el acceso alternativo
El botón "Acceso Alternativo" en la pantalla de login pide un PIN numérico antes de permitir el ingreso.
