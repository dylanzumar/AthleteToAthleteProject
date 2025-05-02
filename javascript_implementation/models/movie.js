const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Movie = sequelize.define("movies", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Movie;
