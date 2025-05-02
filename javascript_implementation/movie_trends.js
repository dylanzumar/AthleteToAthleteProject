const sequelize = require("./models/db");
const Movie = require("./models/movie");
const Theater = require("./models/theater");
const Sale = require("./models/sale");
const prompt = require("prompt-sync")();
const { QueryTypes } = require("sequelize");

async function create_session() {
  /*
  Sets up the in-memory database.

  Args:
    None
  Returns:
    Nones
*/
  await sequelize.sync({ force: true });
}

async function create_database() {
  /*
  Populates the in-memory database with sample data.

  Args:
    None
  Returns:
    Nones
*/
  const movie_1 = await sequelize.models.movies.create({
    name: "Movie 1",
  });
  const movie_2 = await Movie.create({
    name: "Movie 2",
  });
  const theater_1 = await Theater.create({
    name: "Theater 1",
  });
  const theater_2 = await Theater.create({
    name: "Theater 2",
  });
  const sale_1 = await Sale.create({
    date: new Date(2025, 1, 24, 19), // Adding 19 hours to the date so it doesn't change upon conversion to UTC by default
    movie_id: movie_1.id,
    theater_id: theater_1.id,
    tickets_sold: 100,
  });
  const sale_2 = await Sale.create({
    date: new Date(2025, 1, 24, 19),
    movie_id: movie_1.id,
    theater_id: theater_2.id,
    tickets_sold: 200,
  });
  const sale_3 = await Sale.create({
    date: new Date(2025, 1, 24, 19),
    movie_id: movie_2.id,
    theater_id: theater_1.id,
    tickets_sold: 150,
  });
  const sale_4 = await Sale.create({
    date: new Date(2025, 1, 24, 19),
    movie_id: movie_2.id,
    theater_id: theater_2.id,
    tickets_sold: 250,
  });
  const sale_5 = await Sale.create({
    date: new Date(2025, 1, 25, 19),
    movie_id: movie_1.id,
    theater_id: theater_1.id,
    tickets_sold: 500,
  });
  const sale_6 = await Sale.create({
    date: new Date(2025, 1, 25, 19),
    movie_id: movie_1.id,
    theater_id: theater_2.id,
    tickets_sold: 400,
  });
  const sale_7 = await Sale.create({
    date: new Date(2025, 1, 25, 19),
    movie_id: movie_2.id,
    theater_id: theater_1.id,
    tickets_sold: 350,
  });
  const sale_8 = await Sale.create({
    date: new Date(2025, 1, 25, 19),
    movie_id: movie_2.id,
    theater_id: theater_2.id,
    tickets_sold: 450,
  });
}

function get_user_input() {
  /*
    Prompts the user for a date for which to see the best selling theater. Continues asking until a valid date is provided.

    Args:
        None
    Returns:
        Date: The valid date entered by the user.
 */
  let validDate;
  console.log(
    "Enter the date (MM/DD/YYYY) for which you want to see the best selling theater:"
  );
  let date = prompt("");
  while (true) {
    validDate = new Date(
      parseInt(date.split("/")[2]),
      parseInt(date.split("/")[0] - 1), // -1 because months are 0-indexed
      parseInt(date.split("/")[1])
    );
    // Taken from https://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript
    if (
      validDate.getFullYear() != date.split("/")[2] ||
      validDate.getMonth() != date.split("/")[0] - 1 ||
      validDate.getDate() != date.split("/")[1]
    ) {
      console.log(
        "Invalid date format. Please enter the date in MM/DD/YYYY format:"
      );
      date = prompt();
    } else break;
  }
  return validDate;
}

function convert_date_to_sql_format(date) {
  /* 
  Helper function to convert date to YYYY-MM-DD format 
  
  Args:
    date (Date): The date to convert.
  Returns:
    string: The date in YYYY-MM-DD format.
  */
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

async function get_best_selling_theater(date) {
  /* 
    Retrieves and the best selling theater(s) for a given date.

    Args:
        date (Date): The date for which to find the best selling theater.

    Returns:
        None
    */
  const results = await sequelize.query(
    `SELECT b.id, b.name, SUM(a.tickets_sold) as tickets_sold FROM 'sales' as a JOIN 'theaters' as b on a.theater_id = b.id WHERE a.date = '${convert_date_to_sql_format(
      date
    )}' GROUP BY b.id  HAVING SUM(a.tickets_sold) = (SELECT SUM(tickets_sold) FROM 'sales' WHERE date = '${convert_date_to_sql_format(
      date
    )}' GROUP BY theater_id ORDER BY 1 DESC LIMIT 1)`,
    {
      type: QueryTypes.SELECT,
    }
  );
  print_results(results, date);
}

function print_results(results, date) {
  /*
    Neatly prints the best selling theater(s) for a given date.

    Args:
        results (List[(number: theater ID, string: theater name, number: tickets sold)]): 
                                                The results of the query of the theater(s) with the most tickets sold on the given date.
        date (Date): The date for which to find the best selling theater.

    Returns:
        None
    */
  if (results.length) {
    // Handles the case where there are multiple theaters with the same max sales
    console.log(
      `The best selling theater${
        results.length > 1 ? "s" : ""
      } on ${convert_date_to_sql_format(date)} ${
        results.length > 1 ? "are" : "is"
      }:`
    );
    results.forEach((result) => {
      console.log(`${result.name} with ${result.tickets_sold} tickets sold.`);
    });
  } else {
    console.log(
      `No sales data available for ${convert_date_to_sql_format(date)}`
    );
  }
}

async function main() {
  const date = get_user_input();
  await create_session();
  await create_database();
  await get_best_selling_theater(date);
}

main();
