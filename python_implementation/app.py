from flask import Flask, request
from movie_trends import (
    create_database,
    create_session,
)
from models.sale import Sale
from models.movie import Movie
from models.theater import Theater
from sqlalchemy import func
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)

CORS(app)


@app.route("/dates")
def get_dates():
    with create_session() as session:
        create_database(session)
        results = session.query(func.min(Sale.date), func.max(Sale.date))
        return {
            "min_year": results[0][0].year,
            "min_month": results[0][0].month - 1,  # months are 0-indexed in TS
            "min_day": results[0][0].day,
            "max_year": results[0][1].year,
            "max_month": results[0][1].month - 1,  # months are 0-indexed in TS
            "max_day": results[0][1].day,
        }


@app.route("/records")
def get_sales_data():
    year = request.args["year"]
    month = request.args["month"]
    day = request.args["day"]
    request_date = datetime(int(year), int(month) + 1, int(day))
    with create_session() as session:
        create_database(session)
        records = (
            session.query(Sale, Movie, Theater)
            .filter(Sale.date == request_date)
            .join(Movie)
            .join(Theater)
            .order_by(Sale.date.asc())
            .all()
        )
        response = []
        movie_totals = {}
        theater_totals = {}
        for sale, movie, theater in records:
            if movie.id not in movie_totals:
                movie_totals[movie.id] = 0
            if theater.id not in theater_totals:
                theater_totals[theater.id] = 0
            movie_totals[movie.id] += sale.tickets_sold
            theater_totals[theater.id] += sale.tickets_sold
            response.append(
                {
                    "total_sales": sale.tickets_sold,
                    "movie": movie.name,
                    "movie_id": movie.id,
                    "theater_id": theater.id,
                    "theater": theater.name,
                }
            )
        return {
            "movie_totals": movie_totals,
            "theater_totals": theater_totals,
            "sales_data": response,
        }


if __name__ == "__main__":
    app.run(debug=True)
