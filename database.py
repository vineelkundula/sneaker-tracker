import psycopg2
import os

connection = psycopg2.connect(
    os.environ.get("DATABASE_URL")
)

cursor = connection.cursor()

# Create the sneakers table
cursor.execute("""
CREATE TABLE IF NOT EXISTS sneakers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    release_date TEXT,
    status TEXT,
    price REAL,
    image TEXT,
    source TEXT
)
""")

# Only add starter sneakers if the table is empty
cursor.execute("SELECT COUNT(*) FROM sneakers")
count = cursor.fetchone()[0]

if count == 0:

    sneakers = [
        (
            "Jordan 1 High Chicago",
            "March 14, 2027",
            "Confirmed",
            180,
            "images/jordan1.png",
            "Manual Entry"
        ),
        (
            "Jordan 1 Low Travis Scott",
            "April 2, 2027",
            "Rumor",
            155,
            "images/jordan1low.png",
            "Manual Entry"
        ),
        (
            "Nike Air Force One",
            "May 10, 2027",
            "Confirmed",
            120,
            "images/af1.png",
            "Manual Entry"
        ),
        (
            "Yeezy Boost 350",
            "June 5, 2027",
            "Rumor",
            230,
            "images/yeezy350.png",
            "Manual Entry"
        )
    ]

    cursor.executemany("""
    INSERT INTO sneakers
    (name, release_date, status, price, image, source)
    VALUES (%s, %s, %s, %s, %s, %s)
    """, sneakers)

connection.commit()

cursor.close()
connection.close()

print("PostgreSQL database initialized!")
