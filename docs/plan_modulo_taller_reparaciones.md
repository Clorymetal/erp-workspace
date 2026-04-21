# 🛠️ Plan Maestro: Ecosistema Taller, Ventas y Finanzas - Clorymetal

Este documento es la hoja de ruta detallada para la transformación digital del core operativo de la empresa, respetando la cultura organizacional y garantizando la integridad de los datos existentes.

---

## 👥 1. Estructura de Usuarios y Permisos (RBAC)
Para segmentar la operación y proteger la información sensible de Gabriel (Admin):

### 1.1. Perfiles de Usuario
- **Administrador (Gabriel):** Acceso total a Proveedores, Empleados, Configuración Global, Cta Cte unificada y reportes de rentabilidad.
- **Mostrador (Antonio, Jorge, Alfredo):**
  - **Antonio (Cajero Principal):** Gestión de Cajas, Ventas y Cobranza de OR.
  - **Jorge/Alfredo (Ventas y Soporte):** Carga de OR, Pedidos y Consultas de Stock/Precios.
  - *Restricciones:* No pueden ver el módulo de Proveedores ni los SUELDOS de empleados.

---

## 🏛️ 6. Aspectos Legales y Correlatividad
Para garantizar una transición legal y ordenada:

### 6.1. Facturación Electrónica (ARCA/AFIP)
- Integración vía Web Services para la obtención automática del **CAE (Código de Autorización de Impresión)** en Facturas A, B y C.
- Implementación de regímenes impositivos vigentes en Argentina.

### 6.2. Control de Numeración Progresiva
- El sistema permitirá configurar los contadores de cada punto de venta (PV):
  - **Facturas (PV 0004):** Inicialización en `00000001` para pruebas.
  - **Remitos (PV 0001):** Inicialización en `00000001` para pruebas.
  - **Órdenes de Reparación:** Numeración incremental única para control interno.
- **Acción de Sincronización:** Botón de ajuste para "enganchar" la numeración del sistema anterior en el momento del despliegue definitivo.

---

## 📋 2. Módulo de Taller y Órdenes de Reparación (OR)
La OR es el "Contrato de Servicio" que une al cliente con el taller.

### 2.1. Modelo de Datos Multitarea
Una OR no es un ítem único, sino un contenedor de trabajos:
- **Cabecera:** Nro OR (Auto-incremental), Cliente (Link a Base Clientes), Vehículo (Patente, Marca, Modelo), Fecha/Hora Ingreso, Operador que tomó el trabajo.
- **Líneas de Tarea:**
  - **Pieza:** Pedalera, Válvula, Campana, Pulmón, etc.
  - **Servicio:** Revisar, Reparar, Rectificar, Encintar.
  - **Mecánico:** Asignación específica (Nino: Metalúrgica/Rectificación, José: Pesados, Néstor: Livianos).
  - **Prioridad:** Normal, Media, Alta, Urgente (Color en Kanban).

### 2.2. Lista de Precios Estándar (Automática)
El sistema sugerirá precios base para agilizar el presupuesto en mostrador:
- **Rectificación:** Liviano ($20k), Mediano ($30k), Pesado ($40k).
- **Encintado:** Liviano ($5k), Mediano ($6k), Pesado ($7.5k).
  - *Regla Especial:* Cintas >10" o exceso de remaches -> $8.5k.

### 2.3. Salida Física (Formato Raúl)
- **Impresión A4 Integral:**
  - **Frente:** Datos de la OR + **Texto Legal de Responsabilidad** (Autorización de trabajo).
  - **Dorso:** Detalle para el mecánico (Repuestos usados, mano de obra extra, observaciones técnicas).
  - **Rótulo (Pie de página):** Cupón troquelado/recortable para abrochar a la pieza/vehículo con los datos esenciales para el taller.

---

## 📈 3. Tablero Kanban y Dashboard de Control
Visualización en tiempo real de la "fábrica":
- **Columnas:** 
  1. `INGRESADO` (Recién tomado en mostrador).
  2. `PRESUPUESTO PENDIENTE` (Mecánico revisó, falta aviso al cliente).
  3. `EN REPARACIÓN` (Mecánico trabajando).
  4. `ESPERANDO REPUESTOS` (Frenado por logística).
  5. `LISTO / POR COBRAR` (Trabajo terminado, avisado al cliente).
- **Indicadores Visuales:** Alerta si una OR lleva más de X días sin movimiento.

---

## 🚛 4. Ventas Directas, Logística y Muestras
Para los pedidos telefónicos y clientes de otras localidades (Sáenz Peña, Formosa).

### 4.1. Gestión de Muestras (Consignación)
- Salida de stock sin cobro inmediato (ej: 3 juegos de pastillas).
- Registro de **Devolución Parcial**: El cliente devuelve 2, se factura 1.
- Alerta de "Muestras Pendientes" para reclamo de piezas.

### 4.2. Logística de Contra-reembolsos
- Generación de Remito con estado **"PENDIENTE DE COBRO (FLETE)"**.
- Alerta automática a los 2-4 días hábiles (según zona) para reclamar el dinero al transporte/cliente.

---

## 💰 5. Finanzas, Clientes y Cta Cte
La unificación de toda la cobranza.

### 5.1. Cuenta Corriente de Clientes
- Plazos de pago definidos por cliente (25, 30, 45 días).
- Posibilidad de **Override** (Sobreescribir): Aunque el cliente tenga 30 días, esta venta específica es a 2 días (COD).

### 5.2. Sistema de Pagos Múltiples (Combinados)
Liquidación de OR o saldo de Cta Cte permitiendo:
- **Efectivo + Cheque + Transferencia + Tarjeta** en una sola transacción.

### 5.3. Caja y Egresos
- **Caja Mostrador:** Registro de ingresos por ventas y OR.
- **Egresos de OR:** Registro inmediato cuando se saca plata de la caja para comprar un repuesto "a la vuelta" específico para una OR.
- **Flujo de Pases:** Administración de la recaudación (Pasar de Mostrador a Bancos o Administración).

---

---

## 🏛️ 7. Gestión de Datos Maestros y Localidades
Para optimizar la carga y evitar errores de tipeo en zonas críticas:

### 7.1. Provincias y Parámetros
- **Selector Dinámico:** El sistema consume la tabla `Core_Parameter` (Categoría `PROVINCIA`) cargada desde los datos reales de producción.
- **Sincronización:** Se dispone de scripts (`pullParamsFromProd.ts`) para mantener la base local de desarrollo idéntica a la nube en términos de alícuotas, condiciones fiscales y provincias.

### 7.2. Ciudades y Direcciones
- **Ciudad / Localidad:** Se mantiene como **campo de texto libre** para permitir máxima flexibilidad (ej. "Resistencia", "Fontana", "Barranqueras") sin las limitaciones de una tabla estática incompleta.
- **Normalización Visual:** La tabla de clientes concatena automáticamente Ciudad y Provincia (ej: `Resistencia (Chaco)`) para mejorar la legibilidad en el mostrador.

---
_Nota: Al retomar el trabajo, leer siempre el último registro de estado y revisar `task.md`._
