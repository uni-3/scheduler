"use strict";

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DATABASE_URL || "postgres://root:root@localhost/scheduler",
);

module.exports = {
  database: sequelize,
  Sequelize: Sequelize,
};
