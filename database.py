import sqlite3


connection = sqlite3.connect("sneakers.db")

cursor = connection.cursor()


# Create the sneakers table
cursor.execute("""
CREATE TABLE IF NOT EXISTS sneakers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    release_date TEXT,
    status TEXT,
    price REAL,
    image TEXT
)
""")


# Add our first sneakers
sneakers = [
    (
        "Jordan 1 High Chicago",
        "March 14, 2027",
        "Confirmed",
        180,
        "images/jordan1.png"
    ),
    (
        "Jordan 1 Low Travis Scott",
        "April 2, 2027",
        "Rumor",
        155,
        "images/jordan1low.png"
    ),
    (
        "Nike Air Force One",
        "May 10, 2027",
        "Confirmed",
        120,
        "images/af1.png"
    ),
    (
        "Yeezy Boost 350",
        "June 5, 2027",
        "Rumor",
        230,
        "images/yeezy350.png"
    )
]


# Insert the sneakers into the database
cursor.executemany("""
INSERT INTO sneakers
(name, release_date, status, price, image)
VALUES (?, ?, ?, ?, ?)
""", sneakers)


connection.commit()

connection.close()

print("Sneakers added to database!")