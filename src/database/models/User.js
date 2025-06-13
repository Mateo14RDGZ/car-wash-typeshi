const { DataTypes } = require('sequelize');
const sequelize = require('../../database/config/database');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'users'
  });

  User.prototype.comparePassword = async function (password) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, this.password);
  };

  return User;
};
