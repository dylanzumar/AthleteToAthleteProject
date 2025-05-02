from models import Base
from sqlalchemy import Column, Integer, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from models.movie import Movie
from models.theater import Theater


class Sale(Base):
    __tablename__ = "sales"

    date = Column(DateTime, primary_key=True)
    movie_id = Column(Integer, ForeignKey("movies.id"), primary_key=True)
    movie = relationship(Movie)
    theater_id = Column(Integer, ForeignKey("theaters.id"), primary_key=True)
    theater = relationship(Theater)
    tickets_sold = Column(Integer, nullable=False)

    __table_args__ = (
        CheckConstraint(tickets_sold >= 0, name="check_tickets_sold_non_negative"),
    )
