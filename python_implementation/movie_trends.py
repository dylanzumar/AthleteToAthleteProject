from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, Session
from models import Base
from models.sale import Sale
from models.movie import Movie
from models.theater import Theater
from datetime import datetime
from typing import List, Tuple


def create_session() -> Session:
    """
    Sets up the in-memory database.

    Returns:
        Session: A session object for interacting with the database.
    """
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def create_database(session: Session) -> None:
    """
    Populates the in-memory database with sample data.

    Args:
        session (Session): The SQLAlchemy session to use for database operations.

    Returns:
        None
    """
    movie_1 = Movie(name="Movie 1")
    movie_2 = Movie(name="Movie 2")
    theater_1 = Theater(name="Theater 1")
    theater_2 = Theater(name="Theater 2")
    session.add_all([movie_1, movie_2, theater_1, theater_2])
    session.flush()
    sale_1 = Sale(
        date=datetime(2025, 2, 24),
        movie=movie_1,
        theater=theater_1,
        tickets_sold=100,
    )
    sale_2 = Sale(
        date=datetime(2025, 2, 24),
        movie=movie_1,
        theater=theater_2,
        tickets_sold=200,
    )
    sale_3 = Sale(
        date=datetime(2025, 2, 24),
        movie=movie_2,
        theater=theater_1,
        tickets_sold=150,
    )
    sale_4 = Sale(
        date=datetime(2025, 2, 24),
        movie=movie_2,
        theater=theater_2,
        tickets_sold=250,
    )
    sale_5 = Sale(
        date=datetime(2025, 2, 25),
        movie=movie_1,
        theater=theater_1,
        tickets_sold=500,
    )
    sale_6 = Sale(
        date=datetime(2025, 2, 25),
        movie=movie_1,
        theater=theater_2,
        tickets_sold=400,
    )
    sale_7 = Sale(
        date=datetime(2025, 2, 25),
        movie=movie_2,
        theater=theater_1,
        tickets_sold=350,
    )
    sale_8 = Sale(
        date=datetime(2025, 2, 25),
        movie=movie_2,
        theater=theater_2,
        tickets_sold=450,
    )
    session.add_all([sale_1, sale_2, sale_3, sale_4, sale_5, sale_6, sale_7, sale_8])
    session.commit()


def get_user_input() -> datetime:
    """
    Prompts the user for a date for which to see the best selling theater. Continues asking until a valid date is provided.

    Returns:
        datetime: The valid date entered by the user.
    """
    valid_date = None
    print(
        "Enter the date (MM/DD/YYYY) for which you want to see the best selling theater:"
    )
    date = input()
    while not valid_date:
        try:
            valid_date = datetime.strptime(date, "%m/%d/%Y")
        except ValueError:
            print("Invalid date format. Please enter the date in MM/DD/YYYY format:")
            date = input()
    return valid_date


def get_best_selling_theater_results(session: Session, date: datetime) -> None:
    """
    Retrieves and the best selling theater(s) for a given date.

    Args:
        session (Session): The SQLAlchemy session to use for database operations.
        date (datetime): The date for which to find the best selling theater.

    Returns:
        None
    """
    # Subquery to find the maximum tickets sold for each theater on the given date
    max_subquery = (
        session.query(func.sum(Sale.tickets_sold).label("total"))
        .filter(Sale.date == date)
        .group_by(Sale.theater_id)
        .subquery()
    )
    # Scalar subquery to find the maximum total tickets sold over all theaters on the given date
    max_total = session.query(func.max(max_subquery.c.total)).scalar_subquery()
    results = (
        session.query(Theater, func.sum(Sale.tickets_sold))
        .join(Sale, Sale.theater_id == Theater.id)
        .filter(Sale.date == date)
        .group_by(Sale.theater_id)
        .having(func.sum(Sale.tickets_sold) == max_total)
        .all()
    )
    print_results(results, date)


def print_results(results: List[Tuple[Theater, int]], date: datetime) -> None:
    """
    Neatly prints the best selling theater(s) for a given date.

    Args:
        results (List[Tuple[Theater, int]]): The results of the query of the theater(s) with the most tickets sold on the given date.
        date (datetime): The date for which to find the best selling theater.

    Returns:
        None
    """
    if results:
        # Handles the case where there are multiple theaters with the same max sales
        print(
            f"The best selling theater{"s" if len(results) > 1 else ""} on {date.strftime('%m/%d/%Y')} {"are" if len(results) > 1 else "is"}:"
        )
        for theater, tickets_sold in results:
            print(f"{theater.name} with {tickets_sold} tickets sold.")
    else:
        print(f"No sales data available for {date.strftime('%m/%d/%Y')}.")


if __name__ == "__main__":
    date: datetime = get_user_input()
    with create_session() as session:
        create_database(session)
        get_best_selling_theater_results(session, date)
