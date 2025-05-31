const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Service extends Model { }

Service.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER, // duración en minutos
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('basic', 'premium', 'complete', 'detail'),
        allowNull: false
    },
    available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    image: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'Service'
});

module.exports = Service; 