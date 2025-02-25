const sequelize = require('../utils/database');
const { DataTypes } = require('sequelize');

module.exports = sequelize.define('category', {
  name: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING,
  },
});
