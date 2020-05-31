"use strict";

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "postgres://root:root@localhost/scheduler",
);

module.exports = {
  database: sequelize,
  Sequelize: Sequelize,
};
