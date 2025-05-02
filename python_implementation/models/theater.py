from models import Base
from sqlalchemy import Column, Integer, String


class Theater(Base):
    __tablename__ = "theaters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
