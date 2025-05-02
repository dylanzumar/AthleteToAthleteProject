from models import Base
from sqlalchemy import Column, Integer, String


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
