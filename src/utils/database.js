const { Sequelize } = require('sequelize');

const { env } = process;

const sequelize = new Sequelize(
  env.PGDATABASE,
  env.PGUSER,
  env.PGPASSWORD,
  {
    host: env.PGHOST,
    dialect: 'postgres',
    port: env.PGPORT,
  },
);

module.exports = sequelize;
