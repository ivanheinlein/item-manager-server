const sequelize = require('../utils/database');
const { DataTypes } = require('sequelize');

module.exports = sequelize.define('message', {
  receiverId: {
    type: DataTypes.INTEGER,
  },
  type: {
    type: DataTypes.STRING,
  },
  text: {
    type: DataTypes.STRING,
  },
});
