const sequelize = require('../utils/database');
const { DataTypes } = require('sequelize');

module.exports = sequelize.define('item', {
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
});
