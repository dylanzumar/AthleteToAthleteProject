Author: Dylan Zumar
Date: 5/2/25

• Explanation of the schema and database dump files to show data created.
- All of the example data is stored in-memory to make it easier to recreate locally, but the schema I used can be found in the
  `/models` directory of each implementation and is the following:
   - A `Theater` table with ID and name
   - A `Movie` table with ID and name
   - A `Sale` with a date, movie ID, and theater ID as primary keys so you could only have one record per date/movie/theater combination. There is also a 
   `tickets_sold` field to show the sales for that combination of date/movie/theater.

• A few explanatory sentences on your extension and why you chose it.
- I decided to create a React/TS frontend, since it's not always ideal to ask the user to input a date in a specific format. This way, you can 
simply select a date on the calendar and see all the data and totals that the command line programs do not provide. Although I'm primarily a backend 
engineer, I love React and have lots of experience with Flask which I used to make the APIs for the frontend.

• Instructions on running the programs:

    Python:
    • python3 -m venv .venv
    • pip3 install -r python_implementation/requirements.txt
    • python3 python_implementation/movie_trends.py (for command line program)
    • python3 python_implementation/app.py (for Flask APIs)

    Javascript:
    • cd javascript_implementation
    • npm install
    • node movie_trends.py

    React Frontend:
    • cd frontend
    • npm install
    • npm run dev