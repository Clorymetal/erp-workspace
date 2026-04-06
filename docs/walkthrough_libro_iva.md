# 📦 Implementación: Libro IVA Compras y Secuenciación Manual

He completado los cambios necesarios para habilitar la consulta del **Libro de IVA Compras**, incluyendo la capacidad de ordenar facturas manualmente por número de orden (`Rec`) y filtrar por períodos fiscales.

## 📁 Archivos Modificados / Creados

### 🔹 Backend (`packages/core-backend`)
1.  **[schema.prisma](file:///d:/E/Clorymetal/Desarrollo/Aplicaciones/erp-workspace/packages/core-backend/prisma/schema.prisma)**: Se agregaron los campos `ivaPeriod` (String?) e `ivaNumber` (Int?).
2.  **[providerService.ts](file:///d:/E/Clorymetal/Desarrollo/Aplicaciones/erp-workspace/packages/core-backend/src/modules/proveedores/services/providerService.ts)**: Lógica actualizada para CRUD y filtrado por período.
3.  **[providerRoutes.ts](file:///d:/E/Clorymetal/Desarrollo/Aplicaciones/erp-workspace/packages/core-backend/src/modules/proveedores/api/providerRoutes.ts)**: Nueva ruta `PATCH /facturas/:invoiceId` para actualizaciones rápidas desde la tabla.

### 🔹 Frontend (`packages/erp-frontend`)
1.  **[LibroIvaComprasPage.tsx](file:///d:/E/Clorymetal/Desarrollo/Aplicaciones/erp-workspace/packages/erp-frontend/src/modules/proveedores/pages/LibroIvaComprasPage.tsx)**: **NUEVA PÁGINA**. Contiene la tabla editable y exportable.
2.  **[InvoiceModal.tsx](file:///d:/E/Clorymetal/Desarrollo/Aplicaciones/erp-workspace/packages/erp-frontend/src/modules/proveedores/components/InvoiceModal.tsx)**: Campos contables agregados al formulario de carga de facturas.
3.  **[Sidebar.tsx](file:///d:/E/Clorymetal/Desarrollo/Aplicaciones/erp-frontend/src/core/layout/Sidebar.tsx)**: Enlace "Libro IVA" agregado al menú.
4.  **[App.tsx](file:///d:/E/Clorymetal/Desarrollo/Aplicaciones/erp-frontend/src/App.tsx)**: Registro de la nueva ruta `/libro-iva`.

---

## 🧪 Cómo probar los cambios localmente

1.  **Actualizar Dependencias y DB**:
    Ejecutar en la raíz del proyecto para asegurar que la base de datos tenga las nuevas columnas:
    ```powershell
    cd packages/core-backend
    npx prisma generate
    npx prisma db push
    ```

2.  **Iniciar el Sistema**:
    ```powershell
    npm run dev
    ```

3.  **Flujo de Pruebas**:
    -   Ir a la sección **Libro IVA** en el menú lateral.
    -   Seleccionar el período **Marzo 2026**.
    -   Deberías ver tus facturas cargadas. En la primera columna (`Rec`), ingresá un número (ej: 1, 2, 3...) y presioná `Enter` o clickeá afuera.
    -   La tabla se reordenará automáticamente según esos números.
    -   Clickeá en **Exportar > Excel/CSV** y verificá que el archivo generado tenga el formato solicitado para la contadora.

---

## 🚀 Pasos para Producción

> [!IMPORTANT]
> Al subir a producción, es vital que corras la migración de la base de datos.

Si usás un pipeline de CI/CD (como Vercel/Render):
-   Asegurate de que el comando de build del backend incluya `npx prisma migrate deploy` o `npx prisma db push`.
-   Si tenés acceso manual:
    ```bash
    npx prisma migrate deploy
    ```

---

¿Hay algún detalle adicional en el formato de exportación que quieras ajustar antes de subirlo?
