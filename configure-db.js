/**
 * Script para configurar la base de datos MySQL y asegurar que está correctamente configurada
 * para la aplicación Car Wash
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

// Función para leer input del usuario
async function getUserInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Verificar y actualizar el archivo .env
async function checkAndUpdateEnvFile() {
    console.log(`${colors.bright}${colors.blue}=== Verificando configuración del archivo .env ===${colors.reset}`);
    
    const envPath = path.join(__dirname, '.env');
    let envExists = fs.existsSync(envPath);
    let envContent = '';
    
    if (envExists) {
        envContent = fs.readFileSync(envPath, 'utf8');
        console.log(`${colors.green}✓ Archivo .env encontrado${colors.reset}`);
    } else {
        console.log(`${colors.yellow}! Archivo .env no encontrado, se creará uno nuevo${colors.reset}`);
    }

    // Verificar variables necesarias
    let dbHost = process.env.DB_HOST;
    let dbUser = process.env.DB_USER;
    let dbPass = process.env.DB_PASS;
    let dbName = process.env.DB_NAME;
    let port = process.env.PORT;

    // Si alguna variable no está definida, preguntar al usuario
    if (!dbHost) {
        dbHost = await getUserInput('Ingrese el host de la base de datos (default: localhost): ') || 'localhost';
    }

    if (!dbUser) {
        dbUser = await getUserInput('Ingrese el usuario de MySQL (default: root): ') || 'root';
    }

    if (!dbPass) {
        dbPass = await getUserInput('Ingrese la contraseña de MySQL: ');
    }

    if (!dbName) {
        dbName = await getUserInput('Ingrese el nombre de la base de datos (default: car_wash_db): ') || 'car_wash_db';
    }

    if (!port) {
        port = await getUserInput('Ingrese el puerto para el servidor (default: 3003): ') || '3003';
    }

    // Crear o actualizar el archivo .env
    const envData = `# Base de datos
DB_HOST=${dbHost}
DB_USER=${dbUser}
DB_PASS=${dbPass}
DB_NAME=${dbName}

# Puerto del servidor
PORT=${port}

# Email (opcional para notificaciones)
GMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
`;

    fs.writeFileSync(envPath, envData);
    console.log(`${colors.green}✓ Archivo .env ${envExists ? 'actualizado' : 'creado'} correctamente${colors.reset}`);

    // Recargar variables de entorno
    process.env.DB_HOST = dbHost;
    process.env.DB_USER = dbUser;
    process.env.DB_PASS = dbPass;
    process.env.DB_NAME = dbName;
    process.env.PORT = port;

    return { dbHost, dbUser, dbPass, dbName, port };
}

// Función para probar conexión a MySQL
async function testMySQLConnection({ dbHost, dbUser, dbPass }) {
    console.log(`${colors.bright}${colors.blue}=== Probando conexión a MySQL ===${colors.reset}`);
    console.log(`Intentando conectar a MySQL como ${dbUser}@${dbHost}...`);

    try {
        const connection = await mysql.createConnection({
            host: dbHost,
            user: dbUser,
            password: dbPass
        });

        console.log(`${colors.green}✓ Conexión a MySQL exitosa${colors.reset}`);
        await connection.end();
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Error al conectar a MySQL:${colors.reset}`, error.message);
        
        // Sugerir soluciones basadas en el error
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log(`${colors.yellow}Sugerencia: Verifique las credenciales de MySQL en el archivo .env${colors.reset}`);
        } else if (error.code === 'ECONNREFUSED') {
            console.log(`${colors.yellow}Sugerencia: Asegúrese de que MySQL está en ejecución y escuchando en el puerto 3306${colors.reset}`);
        }
        
        return false;
    }
}

// Función para crear la base de datos si no existe
async function createDatabase({ dbHost, dbUser, dbPass, dbName }) {
    console.log(`${colors.bright}${colors.blue}=== Creando/verificando base de datos ===${colors.reset}`);
    console.log(`Verificando si existe la base de datos ${dbName}...`);

    try {
        const connection = await mysql.createConnection({
            host: dbHost,
            user: dbUser,
            password: dbPass
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`${colors.green}✓ Base de datos ${dbName} lista${colors.reset}`);
        
        // Usar la base de datos
        await connection.query(`USE \`${dbName}\``);
        
        await connection.end();
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Error al crear la base de datos:${colors.reset}`, error.message);
        return false;
    }
}

// Función para probar la conexión con Sequelize
async function testSequelizeConnection() {
    console.log(`${colors.bright}${colors.blue}=== Probando conexión con Sequelize ===${colors.reset}`);
    
    try {
        const sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASS,
            {
                host: process.env.DB_HOST,
                dialect: 'mysql',
                logging: false
            }
        );

        await sequelize.authenticate();
        console.log(`${colors.green}✓ Conexión con Sequelize exitosa${colors.reset}`);
        
        // Cerrar la conexión
        await sequelize.close();
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Error al conectar con Sequelize:${colors.reset}`, error.message);
        return false;
    }
}

// Función para inicializar los modelos y tablas
async function initializeDatabase() {
    console.log(`${colors.bright}${colors.blue}=== Inicializando modelos y tablas ===${colors.reset}`);
    
    try {
        const { initDatabase } = require('./src/database/init');
        const initialized = await initDatabase();
        
        if (initialized) {
            console.log(`${colors.green}✓ Modelos y tablas inicializados correctamente${colors.reset}`);
        } else {
            console.error(`${colors.red}✗ Error al inicializar modelos y tablas${colors.reset}`);
        }
        
        return initialized;
    } catch (error) {
        console.error(`${colors.red}✗ Error al inicializar modelos y tablas:${colors.reset}`, error.message);
        return false;
    }
}

// Función principal
async function main() {
    console.log(`${colors.bright}${colors.blue}==========================================${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}  CONFIGURACIÓN DE BASE DE DATOS MYSQL  ${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}  Extreme Wash - Sistema de Reservas   ${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}==========================================${colors.reset}`);
    
    try {
        // Verificar y actualizar .env
        const envConfig = await checkAndUpdateEnvFile();
        
        // Probar conexión a MySQL
        const mysqlConnected = await testMySQLConnection(envConfig);
        if (!mysqlConnected) {
            console.log(`${colors.red}✗ No se pudo conectar a MySQL. Por favor revise las credenciales e intente nuevamente.${colors.reset}`);
            return;
        }
        
        // Crear base de datos
        const dbCreated = await createDatabase(envConfig);
        if (!dbCreated) {
            console.log(`${colors.red}✗ No se pudo crear la base de datos. Por favor revise los permisos e intente nuevamente.${colors.reset}`);
            return;
        }
        
        // Probar conexión con Sequelize
        const sequelizeConnected = await testSequelizeConnection();
        if (!sequelizeConnected) {
            console.log(`${colors.red}✗ No se pudo conectar con Sequelize. Por favor revise la configuración e intente nuevamente.${colors.reset}`);
            return;
        }
        
        // Inicializar base de datos
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
            console.log(`${colors.red}✗ No se pudieron inicializar las tablas. Verifique los logs para más información.${colors.reset}`);
            return;
        }
        
        console.log(`${colors.bright}${colors.green}==========================================${colors.reset}`);
        console.log(`${colors.bright}${colors.green}  ¡CONFIGURACIÓN COMPLETADA CON ÉXITO!  ${colors.reset}`);
        console.log(`${colors.bright}${colors.green}==========================================${colors.reset}`);
        console.log(`\nAhora puede iniciar el servidor con base de datos usando:`);
        console.log(`${colors.bright}npm run start:db${colors.reset}`);
        
    } catch (error) {
        console.error(`${colors.red}Error en el proceso de configuración:${colors.reset}`, error);
    }
}

// Ejecutar la función principal
main();
