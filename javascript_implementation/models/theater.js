const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Theater = sequelize.define("theaters", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Theater;
