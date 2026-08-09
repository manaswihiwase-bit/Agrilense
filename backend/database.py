import sqlite3

def init_db():
    conn = sqlite3.connect("agrilense.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            disease TEXT,
            suggestion TEXT,
            confidence TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    try:
        cursor.execute(
            "ALTER TABLE predictions ADD COLUMN user_id INTEGER"
        )
    except sqlite3.OperationalError:
        pass

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


def save_prediction(user_id, disease, suggestion, confidence):
    conn = sqlite3.connect("agrilense.db")
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO predictions
    (user_id, disease, suggestion, confidence)
    VALUES (?, ?, ?, ?)
""", (user_id, disease, suggestion, confidence))

    conn.commit()
    conn.close()


def get_predictions(user_id):
    conn = sqlite3.connect("agrilense.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT disease, suggestion, confidence, created_at
        FROM predictions
        WHERE user_id = ?
        ORDER BY id DESC
    """,(user_id,))

    data = cursor.fetchall()

    conn.close()
    return data

def save_user(name, email, password):
    conn = sqlite3.connect("agrilense.db")
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        """, (name, email, password))

        conn.commit()
        return True

    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()    

def login_user(email):
    conn = sqlite3.connect("agrilense.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM users
        WHERE email = ?
    """, (email,))

    user = cursor.fetchone()

    conn.close()

    return user

    