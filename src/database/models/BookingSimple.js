const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Booking extends Model {}

Booking.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    clientName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    clientPhone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    vehicleType: {
        type: DataTypes.ENUM('auto', 'camioneta_caja', 'camioneta_sin_caja'),
        allowNull: false
    },
    vehiclePlate: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serviceType: {
        type: DataTypes.ENUM('basico', 'premium', 'detailing'),
        allowNull: false
    },
    extras: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        defaultValue: 'confirmed'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings'
});

module.exports = Booking;