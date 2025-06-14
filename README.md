# Sistema de Reservas para Lavado de Autos - Extreme Wash

Aplicación web para la gestión y reserva de turnos de lavado de autos.

## Características Principales

- Reserva de turnos online
- Selección de servicios de lavado (Básico, Premium, Detailing)
- Selección de fecha y horario
- Gestión de datos del cliente y vehículo
- Persistencia en base de datos MySQL
- Interfaz de usuario intuitiva y responsive

## 🚀 Configuración y Ejecución

### Requisitos Previos

- Node.js (versión 14 o superior)
- MySQL (local o remoto)
- npm o yarn

### Instalación

1. Clonar el repositorio

   ```bash
   git clone https://github.com/Mateo14RDGZ/car-wash-typeshi.git
   cd car-wash-typeshi
   ```

2. Instalar dependencias

   ```bash
   npm install
   ```

3. Configurar variables de entorno

   - Crea un archivo `.env` en la raíz del proyecto con la siguiente estructura:

   ```
   # Base de datos
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=tu_contraseña
   DB_NAME=car_wash_db

   # Puerto del servidor
   PORT=3003

   # Email (opcional para notificaciones)
   GMAIL_USER=tu_email@gmail.com
   EMAIL_PASSWORD=tu_contraseña_de_aplicacion
   ```

4. Configurar la base de datos (automático)
   ```bash
   npm run configure-db
   ```

### Ejecución

1. Iniciar el servidor con persistencia en base de datos

   ```bash
   npm run start:db
   ```

2. Acceder a la aplicación en el navegador
   ```
   http://localhost:3003
   ```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express.js
- **Base de datos**: MySQL, Sequelize ORM
- **Despliegue**: Vercel

## 🔧 Solución de Problemas

### Problemas de Conexión a la API

Si experimentas errores como `ERR_BLOCKED_BY_CLIENT` o `Mixed Content`, prueba lo siguiente:

1. Deshabilitar temporalmente bloqueadores de anuncios
2. Utilizar el modo incógnito del navegador
3. Acceder a la versión HTTPS completa: `https://car-wash-typeshi.vercel.app/`

### Problemas con la Base de Datos

Si tienes problemas con la conexión a MySQL:

1. Verifica que MySQL esté en ejecución
2. Ejecuta el comando `npm run configure-db` para diagnosticar y solucionar problemas

## Estructura del Proyecto

- `src/`: Código fuente
  - `frontend/`: Aplicación web (React)
  - `backend/`: API (Node.js/Express)
  - `database/`: Modelos y migraciones
- `docs/`: Documentación
- `assets/`: Recursos estáticos
- `config/`: Archivos de configuración

## Requisitos

- Node.js >= 14
- MySQL/PostgreSQL
- npm o yarn

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno: Copiar `.env.example` a `.env`
4. Iniciar el servidor de desarrollo: `npm run dev`

## Tecnologías Utilizadas

- Frontend: React.js, Material-UI
- Backend: Node.js, Express
- Base de datos: MySQL/PostgreSQL
- Autenticación: JWT
- Pagos: Stripe/MercadoPago

## Cómo empezar

1. Clona este repositorio
2. Navega a los directorios correspondientes según tus necesidades
3. ¡Comienza a trabajar en tus proyectos!

## Contribución

Si deseas contribuir a este workspace, por favor:

1. Crea un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
