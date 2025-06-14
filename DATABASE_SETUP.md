# 🗄️ Configuración de Base de Datos - Extreme Wash

Este documento proporciona instrucciones detalladas para configurar la base de datos MySQL necesaria para el sistema de reservas de Extreme Wash.

## 🌐 Entornos Soportados

El sistema de reservas puede funcionar en dos entornos:

1. **Entorno Local de Desarrollo**: Usando MySQL instalado en tu máquina
2. **Entorno de Producción**: Usando un servicio MySQL remoto (como db4free.net para la versión de Vercel)

## Requisitos Previos

1. **MySQL** instalado (versión 5.7 o superior)

   - Windows: Descargar desde [MySQL Official](https://dev.mysql.com/downloads/installer/)
   - Mac: `brew install mysql`
   - Linux: `sudo apt-get install mysql-server`

2. **Node.js** (versión 14 o superior)

## Pasos de Configuración

### 1. Crear archivo de configuración

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_contraseña_mysql
DB_NAME=car_wash_db

# Puerto del servidor
PORT=3001

# Email (opcional para notificaciones)
GMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
```

### 2. Configurar la base de datos

Ejecuta el script de configuración:

```bash
npm run setup:db
```

Este comando:

- Creará la base de datos `car_wash_db` si no existe
- Creará todas las tablas necesarias
- Configurará las relaciones entre tablas

### 3. Ejecutar el servidor con base de datos

```bash
# Desarrollo con base de datos
npm run dev:db

# Producción con base de datos
npm run start:db
```

## Comandos Útiles

### Gestión de la base de datos

```bash
# Sincronizar modelos con la BD (sin eliminar datos)
npm run db:sync

# Resetear la BD (⚠️ ELIMINA TODOS LOS DATOS)
npm run db:reset
```

### Verificar conexión

Visita: `http://localhost:3001/api/health`

Deberías ver:

```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2024-01-15T..."
}
```

## Estructura de la Base de Datos

### Tabla: `bookings`

| Campo        | Tipo          | Descripción                 |
| ------------ | ------------- | --------------------------- |
| id           | INT           | ID único (auto-incremental) |
| clientName   | VARCHAR(255)  | Nombre del cliente          |
| clientPhone  | VARCHAR(255)  | Teléfono (opcional)         |
| date         | DATETIME      | Fecha y hora de la reserva  |
| vehicleType  | ENUM          | Tipo de vehículo            |
| vehiclePlate | VARCHAR(255)  | Patente del vehículo        |
| serviceType  | ENUM          | Tipo de servicio            |
| extras       | JSON          | Extras seleccionados        |
| price        | DECIMAL(10,2) | Precio total                |
| status       | ENUM          | Estado de la reserva        |
| notes        | TEXT          | Notas adicionales           |
| createdAt    | DATETIME      | Fecha de creación           |
| updatedAt    | DATETIME      | Última actualización        |

## Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"

- Verifica que la contraseña en `.env` sea correcta
- Asegúrate de que MySQL esté ejecutándose

### Error: "Unknown database 'car_wash_db'"

- Ejecuta `npm run setup:db` para crear la base de datos

### Error: "Cannot connect to MySQL"

- Verifica que MySQL esté instalado y ejecutándose
- Windows: Busca "MySQL" en servicios
- Mac/Linux: `sudo service mysql status`

## Migración de Datos

Si ya tienes reservas en memoria y quieres migrarlas a la BD:

1. Exporta las reservas actuales (desde el servidor en memoria)
2. Ejecuta el servidor con BD
3. Importa las reservas usando la API

## Ventajas de usar Base de Datos

✅ **Persistencia**: Los datos no se pierden al reiniciar el servidor
✅ **Escalabilidad**: Puede manejar miles de reservas
✅ **Consultas avanzadas**: Búsquedas, filtros y reportes
✅ **Concurrencia**: Múltiples usuarios simultáneos
✅ **Respaldos**: Backup y restauración de datos
✅ **Integridad**: Validaciones a nivel de BD

## Próximos Pasos

1. **Panel de Administración**: Ver todas las reservas
2. **Reportes**: Estadísticas de servicios más solicitados
3. **Clientes frecuentes**: Sistema de fidelización
4. **Notificaciones**: Recordatorios automáticos
5. **Pagos**: Integración con pasarelas de pago
