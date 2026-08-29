# Sneaker Tracker

Sneaker Tracker is a web application for keeping track of upcoming sneaker releases, confirmed releases, and rumors in one place.

The project also includes an AI-powered analyzer that can take sneaker news or release posts and extract useful information such as the sneaker name, release date, status, and price.

## Live Demo

https://vineelkundula.github.io/sneaker-tracker/

## About the Project

Sneaker release information can be difficult to keep track of because it is often spread across social media, articles, and different sneaker accounts.

I built Sneaker Tracker to have one place where that information can be organized and viewed.

The application has a public release database where users can search, sort, filter, and favorite sneakers. An admin account can also add, update, and delete releases.

The AI Analyzer is designed to make adding releases easier. An administrator can paste sneaker-related information into the analyzer, and Gemini extracts the relevant details and adds them to the database.

## Features

* View upcoming sneaker releases
* Search for sneakers
* Sort releases by name, price, or release date
* Filter confirmed releases and rumors
* Save sneakers as favorites
* Admin login
* Add, edit, and delete sneaker releases
* Update sneaker images
* AI-powered sneaker news analyzer
* PostgreSQL database for storing releases

## Tech Stack

**Frontend**

* HTML
* CSS
* JavaScript
* GitHub Pages

**Backend**

* Python
* Flask
* Gunicorn
* Render

**Database**

* PostgreSQL
* psycopg2

**AI**

* Google Gemini API

## How It Works

The frontend is hosted on GitHub Pages and communicates with a Flask backend hosted on Render.

When the website loads, JavaScript requests the current sneaker data from the Flask API. The Flask backend retrieves the data from PostgreSQL and sends it back to the frontend.

For administrative actions, the user signs in through the admin login. Once authenticated, the admin can manage the sneaker database and use the AI Analyzer.

The AI Analyzer sends the submitted sneaker information to Gemini, which returns structured data that can be stored in PostgreSQL.

```text
GitHub Pages
     |
     | API requests
     v
Flask API (Render)
     |
     | SQL
     v
PostgreSQL
```

## Database

Sneaker releases are stored in PostgreSQL.

The current database includes fields for:

* ID
* Sneaker name
* Release date
* Status
* Price
* Image
* Source

The database allows release information to remain available after the website is refreshed or a user signs out.

## Project Structure

```text
sneaker-tracker/
├── index.html
├── style.css
├── script.js
├── app.py
├── database.py
├── requirements.txt
├── images/
└── README.md
```

## Deployment

The frontend is hosted using GitHub Pages.

The Flask backend is hosted on Render.

The PostgreSQL database is also hosted through Render.

Environment variables are used for sensitive information such as the database connection, Gemini API key, admin password, and Flask secret key.

## What I Learned

This project gave me experience working with a full-stack application rather than just building a frontend.

Some of the main things I worked with were:

* Building a frontend with HTML, CSS, and JavaScript
* Creating API routes with Flask
* Connecting Flask to PostgreSQL
* Migrating the project from SQLite to PostgreSQL
* Working with authentication and sessions
* Connecting a frontend and backend hosted on different platforms
* Integrating the Gemini API
* Deploying a Flask application with Render
* Deploying a frontend with GitHub Pages

## Future Plans

Some features I may add in the future include:

* Automated sneaker news collection
* Release notifications
* User accounts
* Cloud-synced favorites
* Better release verification
* More detailed sneaker information
* Improved mobile support
* Automated tests
* A custom domain

## Author

Vineel Kundula
