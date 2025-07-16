/**
 * 🛠️ MODELO DE SERVICIOS - CAR WASH TYPESHI
 * Modelo Sequelize para la tabla services
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [2, 100],
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 90, // minutos
        validate: {
            min: 15,
            max: 300
        }
    },
    service_type: {
        type: DataTypes.ENUM('basico', 'premium', 'detailing'),
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'services',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Métodos estáticos útiles
Service.findActive = function() {
    return this.findAll({
        where: {
            active: true
        },
        order: [['price', 'ASC']]
    });
};

Service.findByType = function(serviceType) {
    return this.findAll({
        where: {
            service_type: serviceType,
            active: true
        }
    });
};

Service.findByPriceRange = function(minPrice, maxPrice) {
    const { Op } = require('sequelize');
    
    return this.findAll({
        where: {
            price: {
                [Op.between]: [minPrice, maxPrice]
            },
            active: true
        },
        order: [['price', 'ASC']]
    });
};

module.exports = Service;
