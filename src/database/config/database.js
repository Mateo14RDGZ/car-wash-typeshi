const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Indicar la ruta absoluta al archivo .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME || 'car_wash_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize; 