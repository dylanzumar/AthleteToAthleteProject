import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./app.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

interface SalesData {
  movie: string;
  movie_id: number;
  theater: string;
  theater_id: number;
  total_sales: number;
}

interface MovieTotals {
  [movieId: string]: number;
}

interface TheaterTotals {
  [theaterId: string]: number;
}

interface ApiResponse {
  movie_totals: MovieTotals;
  sales_data: SalesData[];
  theater_totals: TheaterTotals;
}

function App() {
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [startDate, setStartDate] = useState<Value>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minDate, setMinDate] = useState<Date>(new Date());
  const [maxDate, setMaxDate] = useState<Date>(new Date());

  useEffect(() => {
    fetch("http://127.0.0.1:5000/dates")
      .then((response) => response.json())
      .then((data) => {
        setMinDate(new Date(data.min_year, data.min_month, data.min_day));
        setMaxDate(new Date(data.max_year, data.max_month, data.max_day));
        setStartDate(new Date(data.min_year, data.min_month, data.min_day));
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (startDate == null || !(startDate instanceof Date)) return;
    fetch(
      `http://127.0.0.1:5000/records?year=${startDate.getFullYear()}&month=${startDate.getMonth()}&day=${startDate.getDate()}`
    )
      .then((response) => response.json())
      .then((data) => setResults(data));
  }, [startDate]);

  return (
    <div>
      <center>
        <h2>
          <b>
            Select the date for which you want to see movie ticket sales data:
          </b>
        </h2>
        {isLoading ? (
          <h3>Is loading...</h3>
        ) : (
          <Calendar
            minDate={minDate}
            maxDate={maxDate}
            onClickDay={setStartDate}
            value={startDate}
          />
        )}
      </center>
      {results ? (
        <center>
          <table>
            <thead>
              <tr>
                <th></th>
                {Array.from(
                  new Set(results.sales_data.map((sale) => sale.movie))
                ).map((movie) => (
                  <th key={movie}>{movie}</th>
                ))}
                <th id="total">Theater Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(
                new Set(results.sales_data.map((sale) => sale.theater))
              ).map((theater) => {
                const theaterSales = results.sales_data.filter(
                  (sale) => sale.theater === theater
                );
                const theaterTotal =
                  results.theater_totals[theaterSales[0].theater_id] || 0;

                return (
                  <tr key={theater}>
                    <td>{theater}</td>
                    {Array.from(
                      new Set(results.sales_data.map((sale) => sale.movie))
                    ).map((movie) => {
                      const movieSale = theaterSales.find(
                        (sale) => sale.movie === movie
                      );
                      const sales = movieSale ? movieSale.total_sales : 0;
                      return <td key={`${theater}-${movie}`}>{sales}</td>;
                    })}
                    <td id="total">{theaterTotal}</td>
                  </tr>
                );
              })}
              <tr>
                <td id="total">Movie Total</td>
                {Array.from(
                  new Set(results.sales_data.map((sale) => sale.movie))
                ).map((movie) => {
                  const movieTotal =
                    results.movie_totals[
                      results.sales_data.find((sale) => sale.movie === movie)
                        ?.movie_id || 0
                    ] || 0;
                  return (
                    <td id="total" key={`total-${movie}`}>
                      {movieTotal}
                    </td>
                  );
                })}
                <td></td>
              </tr>
            </tbody>
          </table>
        </center>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default App;
