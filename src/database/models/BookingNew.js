/**
 * 📅 MODELO DE RESERVAS - CAR WASH TYPESHI
 * Modelo Sequelize para la tabla bookings
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'services',
            key: 'id'
        }
    },
    booking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: true,
            isAfter: new Date().toISOString().split('T')[0]
        }
    },
    time_slot: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            is: /^[0-9]{2}:[0-9]{2}-[0-9]{2}:[0-9]{2}$/
        }
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    customer_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [2, 100],
            notEmpty: true
        }
    },
    customer_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    customer_phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            len: [8, 20],
            notEmpty: true
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        defaultValue: 'confirmed',
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    }
}, {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['booking_date', 'time_slot']
        },
        {
            fields: ['booking_date']
        },
        {
            fields: ['status']
        },
        {
            fields: ['customer_email']
        }
    ]
});

// Métodos estáticos útiles
Booking.findByDate = function(date) {
    return this.findAll({
        where: {
            booking_date: date
        },
        order: [['start_time', 'ASC']]
    });
};

Booking.findByStatus = function(status) {
    return this.findAll({
        where: {
            status: status
        },
        order: [['booking_date', 'ASC'], ['start_time', 'ASC']]
    });
};

Booking.findByCustomer = function(email) {
    return this.findAll({
        where: {
            customer_email: email
        },
        order: [['booking_date', 'DESC']]
    });
};

// Método para verificar disponibilidad
Booking.isTimeSlotAvailable = async function(date, timeSlot) {
    const { Op } = require('sequelize');
    
    const existing = await this.findOne({
        where: {
            booking_date: date,
            time_slot: timeSlot,
            status: {
                [Op.ne]: 'cancelled'
            }
        }
    });
    
    return !existing;
};

module.exports = Booking;
