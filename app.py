from flask import Flask, jsonify, request, session
from flask_cors import CORS
from google import genai
from google.genai import types
import psycopg2
import os
import json


app = Flask(__name__)

# ===============================
# DATABASE
# ===============================

def get_db_connection():
    return psycopg2.connect(
        os.environ.get("DATABASE_URL")
    )


# ===============================
# CONFIGURATION
# ===============================

app.secret_key = os.environ.get(
    "FLASK_SECRET_KEY",
    "sneaker-tracker-development-key"
)

CORS(
    app,
    supports_credentials=True,
    origins=["https://vineelkundula.github.io"]
)

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")


# ===============================
# GEMINI AI
# ===============================

client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY")
)


# ===============================
# ADMIN AUTHENTICATION
# ===============================

def admin_required():
    return session.get("is_admin") is True


# ===============================
# ADMIN LOGIN
# ===============================

@app.route("/api/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json() or {}
    password = data.get("password")

    if not ADMIN_PASSWORD:
        return jsonify({
            "error": "ADMIN_PASSWORD is not configured."
        }), 500

    if password != ADMIN_PASSWORD:
        return jsonify({
            "error": "Incorrect password."
        }), 401

    session["is_admin"] = True

    return jsonify({
        "message": "Admin login successful!",
        "admin": True
    })


# ===============================
# ADMIN LOGOUT
# ===============================

@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():

    session.pop("is_admin", None)

    return jsonify({
        "message": "Logged out successfully."
    })


# ===============================
# ADMIN STATUS
# ===============================

@app.route("/api/admin/status")
def admin_status():

    return jsonify({
        "admin": admin_required()
    })


# ===============================
# GEMINI EXTRACTION
# ===============================

def extract_sneaker(news):

    prompt = f"""
You are a sneaker release information extractor.

Read this sneaker news:

{news}

Extract these fields:

- name
- releaseDate
- status
- price
- image

Rules:
- status must be either "Confirmed" or "Rumor"
- price must be a number only
- Do not include a dollar sign
- image should be a URL only if one is provided in the news
- If information is missing, use null
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )

    sneaker = json.loads(response.text)

    return sneaker


# ===============================
# HOME
# ===============================

@app.route("/")
def home():

    return "Sneaker Tracker Backend is Running!"


# ===============================
# GET SNEAKERS
# PUBLIC
# ===============================

@app.route("/api/sneakers")
def get_sneakers():

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            name,
            release_date,
            status,
            price,
            image,
            source
        FROM sneakers
        ORDER BY id
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    sneakers = []

    for row in rows:

        sneaker = {
            "id": row[0],
            "name": row[1],
            "releaseDate": row[2],
            "status": row[3],
            "price": row[4],
            "image": row[5],
            "source": row[6]
        }

        sneakers.append(sneaker)

    return jsonify(sneakers)


# ===============================
# ADD SNEAKER
# ADMIN ONLY
# ===============================

@app.route("/api/sneakers", methods=["POST"])
def add_sneaker():

    if not admin_required():

        return jsonify({
            "error": "Admin access required."
        }), 401

    data = request.get_json() or {}

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO sneakers
        (
            name,
            release_date,
            status,
            price,
            image,
            source
        )
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        data.get("name"),
        data.get("releaseDate"),
        data.get("status"),
        data.get("price"),
        data.get("image"),
        data.get("source")
    ))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Sneaker added successfully!"
    }), 201


# ===============================
# UPDATE SNEAKER
# ADMIN ONLY
# ===============================

@app.route(
    "/api/sneakers/<int:sneaker_id>",
    methods=["PUT"]
)
def update_sneaker(sneaker_id):

    if not admin_required():

        return jsonify({
            "error": "Admin access required."
        }), 401

    data = request.get_json() or {}

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE sneakers
        SET
            name = %s,
            release_date = %s,
            status = %s,
            price = %s,
            image = %s,
            source = %s
        WHERE id = %s
    """, (
        data.get("name"),
        data.get("releaseDate"),
        data.get("status"),
        data.get("price"),
        data.get("image"),
        data.get("source"),
        sneaker_id
    ))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Sneaker updated successfully!"
    })


# ===============================
# UPDATE IMAGE
# ADMIN ONLY
# ===============================

@app.route(
    "/api/sneakers/<int:sneaker_id>/image",
    methods=["PUT"]
)
def update_sneaker_image(sneaker_id):

    if not admin_required():

        return jsonify({
            "error": "Admin access required."
        }), 401

    data = request.get_json() or {}

    image = data.get("image")

    if not image:

        return jsonify({
            "error": "Image URL is required."
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        UPDATE sneakers
        SET image = %s
        WHERE id = %s
    """, (
        image,
        sneaker_id
    ))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Sneaker image updated successfully!"
    })


# ===============================
# DELETE SNEAKER
# ADMIN ONLY
# ===============================

@app.route(
    "/api/sneakers/<int:sneaker_id>",
    methods=["DELETE"]
)
def delete_sneaker(sneaker_id):

    if not admin_required():

        return jsonify({
            "error": "Admin access required."
        }), 401

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM sneakers
        WHERE id = %s
    """, (
        sneaker_id,
    ))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Sneaker deleted successfully!"
    })


# ===============================
# AI SNEAKER ANALYZER
# ADMIN ONLY
# ===============================

@app.route(
    "/api/ai/extract",
    methods=["POST"]
)
def ai_extract():

    if not admin_required():

        return jsonify({
            "error": "Admin access required."
        }), 401

    data = request.get_json() or {}

    news = data.get("news")

    if not news:

        return jsonify({
            "error": "Sneaker news is required."
        }), 400

    sneaker = extract_sneaker(news)

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id
        FROM sneakers
        WHERE name = %s
    """, (
        sneaker.get("name"),
    ))

    existing = cursor.fetchone()

    if existing:

        cursor.execute("""
            UPDATE sneakers
            SET
                release_date = %s,
                status = %s,
                price = %s
            WHERE id = %s
        """, (
            sneaker.get("releaseDate"),
            sneaker.get("status"),
            sneaker.get("price"),
            existing[0]
        ))

        action = "updated"

    else:

        cursor.execute("""
            INSERT INTO sneakers
            (
                name,
                release_date,
                status,
                price,
                image,
                source
            )
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            sneaker.get("name"),
            sneaker.get("releaseDate"),
            sneaker.get("status"),
            sneaker.get("price"),
            sneaker.get("image"),
            data.get("source")
        ))

        action = "created"

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "action": action,
        "sneaker": sneaker
    })


# ===============================
# RUN SERVER
# ===============================

if __name__ == "__main__":

    app.run(
        debug=True
    )
