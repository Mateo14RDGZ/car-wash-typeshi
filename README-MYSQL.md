# 🚗 Car Wash Typeshi - Sistema de Reservas

Sistema de reservas para lavado de autos con base de datos MySQL y despliegue en Vercel.

## 🔧 Configuración Inicial

### 1. Requisitos Previos
- Node.js 18.x o superior
- MySQL 8.0 o superior
- MySQL Workbench (opcional pero recomendado)

### 2. Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Mateo14RDGZ/car-wash-typeshi.git
cd car-wash-typeshi

# Ejecutar configuración automática
node setup.js
```

### 3. Configuración de Base de Datos

#### Opción A: Usando MySQL Workbench
1. Abrir MySQL Workbench
2. Crear una nueva conexión:
   - Host: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: (tu contraseña)
3. Ejecutar el archivo `database-setup.sql`

#### Opción B: Usando línea de comandos
```bash
mysql -u root -p < database-setup.sql
```

### 4. Configuración de Variables de Entorno

El archivo `.env` debe contener:
```env
DB_HOST=localhost
DB_NAME=car_wash_db
DB_USER=root
DB_PASS=tu_contraseña
DB_PORT=3306
```

## 🚀 Uso

### Desarrollo Local
```bash
npm run dev
```
- Aplicación: http://localhost:3000
- Base de datos: localhost:3306

### Producción
```bash
npm run build
```

### Comandos de Base de Datos
```bash
# Inicializar base de datos
npm run db:init

# Migrar esquema
npm run db:migrate

# Insertar datos iniciales
npm run db:seed
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

#### `services`
- `id` - ID único del servicio
- `name` - Nombre del servicio
- `description` - Descripción detallada
- `price` - Precio en pesos mexicanos
- `duration` - Duración en minutos
- `service_type` - Tipo: 'basico', 'premium', 'detailing'

#### `users`
- `id` - ID único del usuario
- `name` - Nombre completo
- `email` - Email único
- `phone` - Teléfono
- `address` - Dirección

#### `bookings`
- `id` - ID único de la reserva
- `user_id` - ID del usuario (FK)
- `service_id` - ID del servicio (FK)
- `booking_date` - Fecha de la reserva
- `time_slot` - Horario (ej: "08:30-10:00")
- `customer_name` - Nombre del cliente
- `customer_email` - Email del cliente
- `customer_phone` - Teléfono del cliente
- `status` - Estado: 'pending', 'confirmed', 'completed', 'cancelled'
- `total_price` - Precio total

## 🌐 API Endpoints

### Estado del Sistema
```
GET /api/status
```

### Servicios
```
GET /api/services
```

### Horarios Disponibles
```
GET /api/available-slots?date=2025-07-15
```

### Reservas
```
GET /api/bookings          # Obtener todas las reservas
POST /api/bookings         # Crear nueva reserva
```

#### Ejemplo de Reserva (POST)
```json
{
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "5551234567",
    "date": "2025-07-15",
    "timeSlot": "08:30-10:00",
    "serviceType": "premium"
}
```

## 🔧 Conexión con MySQL Workbench

### Configuración de Conexión
1. Abrir MySQL Workbench
2. Crear nueva conexión con estos datos:
   - **Connection Name**: Car Wash Typeshi
   - **Hostname**: localhost
   - **Port**: 3306
   - **Username**: root
   - **Password**: (tu contraseña del .env)
   - **Default Schema**: car_wash_db

### Consultas Útiles

#### Ver todas las reservas
```sql
SELECT 
    b.id,
    b.customer_name,
    b.customer_email,
    b.booking_date,
    b.time_slot,
    s.name as service_name,
    s.price,
    b.status
FROM bookings b
JOIN services s ON b.service_id = s.id
ORDER BY b.booking_date DESC, b.start_time ASC;
```

#### Ver reservas por fecha
```sql
SELECT * FROM bookings 
WHERE booking_date = '2025-07-15'
ORDER BY start_time;
```

#### Ver estadísticas
```sql
SELECT 
    COUNT(*) as total_reservas,
    SUM(total_price) as ingresos_totales,
    AVG(total_price) as promedio_por_reserva
FROM bookings 
WHERE status = 'confirmed';
```

## 📁 Estructura del Proyecto

```
car-wash-typeshi/
├── api/
│   └── index.js              # API principal de Vercel
├── src/
│   ├── database/
│   │   ├── config/
│   │   │   └── database.js   # Configuración de Sequelize
│   │   ├── models/
│   │   │   ├── BookingNew.js # Modelo de reservas
│   │   │   ├── ServiceNew.js # Modelo de servicios
│   │   │   └── UserNew.js    # Modelo de usuarios
│   │   └── init-database.js  # Inicializador de BD
│   └── frontend/
│       ├── index.html        # Página principal
│       ├── app.js           # Lógica de frontend
│       ├── api-helper.js    # Helper para API
│       └── styles.css       # Estilos
├── public/                  # Archivos estáticos
├── database-setup.sql       # Script SQL inicial
├── setup.js                # Script de configuración
├── package.json            # Dependencias
├── vercel.json            # Configuración de Vercel
└── .env                   # Variables de entorno
```

## 🚀 Despliegue en Vercel

### 1. Configuración en Vercel
1. Conectar repositorio en Vercel
2. Configurar variables de entorno en Vercel:
   - `DB_HOST` - Host de tu base de datos
   - `DB_NAME` - Nombre de la base de datos
   - `DB_USER` - Usuario de la base de datos
   - `DB_PASS` - Contraseña de la base de datos
   - `DB_PORT` - Puerto (3306)

### 2. Base de Datos en Producción
Para producción se recomienda usar un servicio como:
- **PlanetScale** (MySQL compatible)
- **Railway** (PostgreSQL/MySQL)
- **AWS RDS** (MySQL)

### 3. URL de Producción
https://car-wash-typeshi.vercel.app

## 🐛 Troubleshooting

### Error de Conexión a MySQL
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Verificar conexión
mysql -u root -p -h localhost
```

### Error 404 en Vercel
- Verificar que `vercel.json` esté configurado correctamente
- Revisar logs en Vercel Dashboard

### Error de CORS
- Verificar configuración de CORS en `api/index.js`
- Asegurar que el dominio esté en la lista de orígenes permitidos

## 📞 Soporte

- **Repositorio**: https://github.com/Mateo14RDGZ/car-wash-typeshi
- **Issues**: https://github.com/Mateo14RDGZ/car-wash-typeshi/issues
- **Autor**: Mateo14RDGZ

## 📄 Licencia

MIT License - Ver archivo `LICENSE` para más detalles.
