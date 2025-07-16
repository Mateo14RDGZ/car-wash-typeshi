/**
 * 👤 MODELO DE USUARIOS - CAR WASH TYPESHI
 * Modelo Sequelize para la tabla users
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
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
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            len: [8, 20]
        }
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Métodos estáticos útiles
User.findByEmail = function(email) {
    return this.findOne({
        where: {
            email: email
        }
    });
};

User.findOrCreate = async function(userData) {
    const [user, created] = await this.findOrCreate({
        where: {
            email: userData.email
        },
        defaults: userData
    });
    
    return { user, created };
};

module.exports = User;
