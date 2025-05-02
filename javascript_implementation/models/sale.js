const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Movie = require("./movie");
const Theater = require("./theater");

const Sale = sequelize.define("sales", {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  movie_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Movie,
      key: "id",
    },
  },
  theater_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Theater,
      key: "id",
    },
  },
  tickets_sold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
});

// Define associations between models
Sale.belongsTo(Movie, { foreignKey: "movie_id" });
Movie.hasMany(Sale, { foreignKey: "movie_id" });

Sale.belongsTo(Theater, { foreignKey: "theater_id" });
Theater.hasMany(Sale, { foreignKey: "theater_id" });

module.exports = Sale;
