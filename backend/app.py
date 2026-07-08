# ============================================================
#  Disaster Preparedness and Response Education System
#  Backend: Python Flask + SQLite
# ============================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
import os

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this backend

DATABASE = "disaster_app.db"

# ─────────────────────────────────────────────
#  DATABASE HELPERS
# ─────────────────────────────────────────────

def get_db():
    """Open a database connection."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row   # rows behave like dicts
    return conn


def hash_password(password):
    """Simple SHA-256 hash for passwords (beginner-friendly)."""
    return hashlib.sha256(password.encode()).hexdigest()


# ─────────────────────────────────────────────
#  DATABASE INITIALISATION
# ─────────────────────────────────────────────

def init_db():
    """Create tables and seed sample data on first run."""
    conn = get_db()
    cursor = conn.cursor()

    # --- USERS TABLE ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT    UNIQUE NOT NULL,
            password TEXT    NOT NULL,
            role     TEXT    NOT NULL DEFAULT 'student',  -- 'student' or 'admin'
            email    TEXT
        )
    """)

    # --- DISASTERS TABLE ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS disasters (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT NOT NULL,
            category    TEXT NOT NULL,
            description TEXT NOT NULL,
            dos         TEXT NOT NULL,   -- stored as newline-separated list
            donts       TEXT NOT NULL,   -- stored as newline-separated list
            image_icon  TEXT DEFAULT '🌪️'
        )
    """)

    # --- QUIZ QUESTIONS TABLE ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_questions (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            disaster_id    INTEGER NOT NULL,
            question       TEXT NOT NULL,
            option_a       TEXT NOT NULL,
            option_b       TEXT NOT NULL,
            option_c       TEXT NOT NULL,
            option_d       TEXT NOT NULL,
            correct_option TEXT NOT NULL,  -- 'A', 'B', 'C', or 'D'
            FOREIGN KEY (disaster_id) REFERENCES disasters(id)
        )
    """)

    # --- QUIZ RESULTS TABLE ---
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_results (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            disaster_id INTEGER NOT NULL,
            score       INTEGER NOT NULL,
            total       INTEGER NOT NULL,
            taken_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id)     REFERENCES users(id),
            FOREIGN KEY (disaster_id) REFERENCES disasters(id)
        )
    """)

    conn.commit()

    # ── Seed default admin ──────────────────────────────────
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (username, password, role, email) VALUES (?,?,?,?)",
            ("admin", hash_password("admin123"), "admin", "admin@disaster.edu")
        )

    # ── Seed sample student ─────────────────────────────────
    cursor.execute("SELECT id FROM users WHERE username = 'student1'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (username, password, role, email) VALUES (?,?,?,?)",
            ("student1", hash_password("student123"), "student", "student@disaster.edu")
        )

    # ── Seed sample disasters ───────────────────────────────
    cursor.execute("SELECT COUNT(*) FROM disasters")
    if cursor.fetchone()[0] == 0:
        disasters = [
            (
                "Earthquake", "Natural",
                "An earthquake is the shaking of the Earth caused by sudden movement of tectonic plates. It can cause buildings to collapse, landslides, and tsunamis. Earthquakes can happen without warning and last from a few seconds to minutes.",
                "Drop to the ground and take cover under a sturdy table\nHold on until shaking stops\nMove to open areas away from buildings\nTurn off gas and electricity after shaking stops\nKeep an emergency kit ready",
                "Do not run outside during shaking\nDo not use elevators after an earthquake\nDo not stand near windows or glass\nDo not light candles or matches after a quake (gas leaks)\nDo not spread rumors or misinformation",
                "🏔️"
            ),
            (
                "Flood", "Natural",
                "A flood occurs when water overflows onto normally dry land. It can be caused by heavy rain, storm surges, broken dams, or tsunamis. Floods are one of the most common and deadly natural disasters worldwide.",
                "Move to higher ground immediately\nDisconnect electrical appliances\nStore clean drinking water\nFollow local authority instructions\nHelp elderly and disabled neighbors",
                "Do not walk or drive through flood water\nDo not touch electrical equipment in wet areas\nDo not drink flood water\nDo not return home until authorities say it is safe\nDo not ignore evacuation orders",
                "🌊"
            ),
            (
                "Fire", "Man-made",
                "Fire emergencies can occur anywhere — homes, schools, forests. They spread quickly and produce toxic smoke. Early detection and proper evacuation can save lives. Fire preparedness is a critical life skill for everyone.",
                "Alert others by shouting 'Fire!'\nActivate the nearest fire alarm\nCall fire department (101)\nEscape using stairs, not elevators\nCrawl low under smoke to exit",
                "Do not use elevators during a fire\nDo not go back for belongings\nDo not open hot doors (fire may be behind them)\nDo not hide in closets or under beds\nDo not try to fight large fires yourself",
                "🔥"
            ),
            (
                "Cyclone", "Natural",
                "A cyclone is a powerful rotating storm with strong winds and heavy rain. It forms over warm ocean waters and can cause widespread destruction when it hits land. Cyclones are known as hurricanes in the Atlantic and typhoons in the Pacific.",
                "Stay indoors away from windows\nStore emergency food and water\nSecure loose outdoor items\nListen to official weather updates\nKeep charged torches and power banks ready",
                "Do not go outdoors during the storm\nDo not shelter under trees\nDo not use candles near gas lines\nDo not travel on roads during the cyclone\nDo not ignore official warnings",
                "🌀"
            ),
            (
                "Landslide", "Natural",
                "A landslide is the movement of rock, soil, and debris down a slope. It is often triggered by heavy rainfall, earthquakes, or human activity. Landslides can be extremely fast and give little to no warning.",
                "Evacuate immediately when warned\nMove to higher and stable ground\nReport unusual sounds like cracking trees\nAvoid river valleys and low-lying areas\nMonitor local news for updates",
                "Do not stay in the path of a landslide\nDo not attempt to stop or divert a slide\nDo not return until declared safe\nDo not build on steep unstable slopes\nDo not ignore early warning signs",
                "⛰️"
            ),
        ]
        cursor.executemany(
            "INSERT INTO disasters (title, category, description, dos, donts, image_icon) VALUES (?,?,?,?,?,?)",
            disasters
        )

    conn.commit()

    # ── Seed sample quiz questions ──────────────────────────
    cursor.execute("SELECT COUNT(*) FROM quiz_questions")
    if cursor.fetchone()[0] == 0:
        cursor.execute("SELECT id FROM disasters WHERE title = 'Earthquake'")
        eq_id = cursor.fetchone()[0]
        cursor.execute("SELECT id FROM disasters WHERE title = 'Flood'")
        fl_id = cursor.fetchone()[0]
        cursor.execute("SELECT id FROM disasters WHERE title = 'Fire'")
        fi_id = cursor.fetchone()[0]
        cursor.execute("SELECT id FROM disasters WHERE title = 'Cyclone'")
        cy_id = cursor.fetchone()[0]

        questions = [
            # Earthquake
            (eq_id, "What should you do first when an earthquake starts?",
             "Run outside immediately", "Drop, cover, and hold on",
             "Call a friend", "Stand near a window", "B"),
            (eq_id, "Where is the safest place during an earthquake indoors?",
             "Near a window", "Under a strong table",
             "In the kitchen", "On the stairs", "B"),
            (eq_id, "After an earthquake, what should you check for?",
             "Social media updates", "Gas leaks and structural damage",
             "Weather forecasts", "Sports news", "B"),
            (eq_id, "What item is essential in an earthquake emergency kit?",
             "Luxury clothing", "Flashlight and first aid kit",
             "Gaming console", "Laptop", "B"),
            # Flood
            (fl_id, "What is the safest action during a flood?",
             "Drive through floodwater", "Move to higher ground",
             "Stay in the basement", "Swim to safety", "B"),
            (fl_id, "Can you drink flood water?",
             "Yes, it is safe", "No, it is contaminated",
             "Only if boiled first (not ideal)", "Yes if it looks clean", "B"),
            (fl_id, "What should you disconnect during a flood?",
             "TV antenna", "Electrical appliances",
             "Phone chargers", "All of the above", "B"),
            (fl_id, "When can you return home after a flood?",
             "Immediately after water recedes", "Only when authorities say it is safe",
             "After 1 hour", "When neighbours return", "B"),
            # Fire
            (fi_id, "What number do you call for the fire department in India?",
             "100", "101", "108", "112", "B"),
            (fi_id, "How should you move through a smoke-filled room?",
             "Run upright quickly", "Crawl low below the smoke",
             "Cover your eyes only", "Stand and hold your breath", "B"),
            (fi_id, "Why should you not open a hot door during a fire?",
             "It wastes time", "Fire may be right behind it",
             "It is impolite", "It makes noise", "B"),
            (fi_id, "What should you do if your clothes catch fire?",
             "Run for help", "Stop, drop, and roll",
             "Jump into water", "Fan the flames", "B"),
            # Cyclone
            (cy_id, "Where should you stay during a cyclone?",
             "On the rooftop", "Indoors away from windows",
             "Under a tree", "On the beach", "B"),
            (cy_id, "What should you do with loose outdoor items before a cyclone?",
             "Leave them outside", "Secure or bring them inside",
             "Paint them bright colours", "Ignore them", "B"),
        ]
        cursor.executemany(
            """INSERT INTO quiz_questions
               (disaster_id, question, option_a, option_b, option_c, option_d, correct_option)
               VALUES (?,?,?,?,?,?,?)""",
            questions
        )

    conn.commit()
    conn.close()
    print("✅ Database initialised successfully.")


# ═══════════════════════════════════════════════════════════
#  AUTH ROUTES
# ═══════════════════════════════════════════════════════════

@app.route("/api/register", methods=["POST"])
def register():
    """Register a new user (student by default)."""
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    email    = data.get("email", "").strip()
    role     = data.get("role", "student")

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required."}), 400

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, password, role, email) VALUES (?,?,?,?)",
            (username, hash_password(password), role, email)
        )
        conn.commit()
        return jsonify({"success": True, "message": "Registration successful! Please login."})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Username already exists."}), 409
    finally:
        conn.close()


@app.route("/api/login", methods=["POST"])
def login():
    """Authenticate a user and return their info."""
    data     = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (username, hash_password(password))
    )
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({
            "success": True,
            "user": {
                "id":       user["id"],
                "username": user["username"],
                "role":     user["role"],
                "email":    user["email"]
            }
        })
    return jsonify({"success": False, "message": "Invalid username or password."}), 401


# ═══════════════════════════════════════════════════════════
#  DISASTER CONTENT ROUTES
# ═══════════════════════════════════════════════════════════

@app.route("/api/disasters", methods=["GET"])
def get_disasters():
    """Fetch all disaster modules (list view)."""
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, category, image_icon FROM disasters")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/disasters/<int:disaster_id>", methods=["GET"])
def get_disaster_detail(disaster_id):
    """Fetch full details for one disaster."""
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM disasters WHERE id = ?", (disaster_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({"error": "Disaster not found"}), 404
    d = dict(row)
    # Split stored newline strings into proper lists
    d["dos"]   = d["dos"].split("\n")
    d["donts"] = d["donts"].split("\n")
    return jsonify(d)


@app.route("/api/disasters", methods=["POST"])
def add_disaster():
    """Admin: add a new disaster module."""
    data = request.get_json()
    required = ["title", "category", "description", "dos", "donts"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "message": f"'{field}' is required."}), 400

    conn = get_db()
    conn.execute(
        "INSERT INTO disasters (title, category, description, dos, donts, image_icon) VALUES (?,?,?,?,?,?)",
        (
            data["title"], data["category"], data["description"],
            data["dos"], data["donts"],
            data.get("image_icon", "🌪️")
        )
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Disaster module added successfully."})


@app.route("/api/disasters/<int:disaster_id>", methods=["DELETE"])
def delete_disaster(disaster_id):
    """Admin: delete a disaster module."""
    conn = get_db()
    conn.execute("DELETE FROM disasters WHERE id = ?", (disaster_id,))
    conn.execute("DELETE FROM quiz_questions WHERE disaster_id = ?", (disaster_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Disaster module deleted."})


# ═══════════════════════════════════════════════════════════
#  QUIZ ROUTES
# ═══════════════════════════════════════════════════════════

@app.route("/api/quiz/<int:disaster_id>", methods=["GET"])
def get_quiz_questions(disaster_id):
    """Fetch quiz questions for a specific disaster."""
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM quiz_questions WHERE disaster_id = ?", (disaster_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/quiz/add", methods=["POST"])
def add_quiz_question():
    """Admin: add a quiz question."""
    data = request.get_json()
    required = ["disaster_id", "question", "option_a", "option_b",
                "option_c", "option_d", "correct_option"]
    for field in required:
        if not data.get(field):
            return jsonify({"success": False, "message": f"'{field}' is required."}), 400

    conn = get_db()
    conn.execute(
        """INSERT INTO quiz_questions
           (disaster_id, question, option_a, option_b, option_c, option_d, correct_option)
           VALUES (?,?,?,?,?,?,?)""",
        (
            data["disaster_id"], data["question"],
            data["option_a"], data["option_b"],
            data["option_c"], data["option_d"],
            data["correct_option"].upper()
        )
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Question added successfully."})


@app.route("/api/quiz/submit", methods=["POST"])
def submit_quiz():
    """Student: submit quiz answers and get score."""
    data        = request.get_json()
    user_id     = data.get("user_id")
    disaster_id = data.get("disaster_id")
    answers     = data.get("answers", {})   # { "question_id": "A/B/C/D" }

    if not user_id or not disaster_id or not answers:
        return jsonify({"success": False, "message": "Missing required data."}), 400

    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, correct_option FROM quiz_questions WHERE disaster_id = ?",
        (disaster_id,)
    )
    questions = cursor.fetchall()

    score = 0
    total = len(questions)
    results = []

    for q in questions:
        qid            = str(q["id"])
        correct        = q["correct_option"]
        student_answer = answers.get(qid, "")
        is_correct     = (student_answer.upper() == correct.upper())
        if is_correct:
            score += 1
        results.append({
            "question_id":      q["id"],
            "your_answer":      student_answer,
            "correct_answer":   correct,
            "is_correct":       is_correct
        })

    # Save result
    conn.execute(
        "INSERT INTO quiz_results (user_id, disaster_id, score, total) VALUES (?,?,?,?)",
        (user_id, disaster_id, score, total)
    )
    conn.commit()
    conn.close()

    percentage = round((score / total) * 100) if total > 0 else 0
    return jsonify({
        "success":    True,
        "score":      score,
        "total":      total,
        "percentage": percentage,
        "results":    results
    })


@app.route("/api/quiz/results/<int:user_id>", methods=["GET"])
def get_user_results(user_id):
    """Fetch all quiz results for a student."""
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT qr.id, qr.score, qr.total, qr.taken_at,
               d.title AS disaster_name, d.image_icon
        FROM quiz_results qr
        JOIN disasters d ON qr.disaster_id = d.id
        WHERE qr.user_id = ?
        ORDER BY qr.taken_at DESC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


# ═══════════════════════════════════════════════════════════
#  ADMIN ROUTES
# ═══════════════════════════════════════════════════════════

@app.route("/api/admin/users", methods=["GET"])
def get_all_users():
    """Admin: list all users."""
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, role, email FROM users")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/admin/stats", methods=["GET"])
def get_stats():
    """Admin: dashboard statistics."""
    conn   = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'student'")
    students = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM disasters")
    disasters = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM quiz_questions")
    questions = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM quiz_results")
    attempts = cursor.fetchone()[0]
    conn.close()
    return jsonify({
        "students":  students,
        "disasters": disasters,
        "questions": questions,
        "attempts":  attempts
    })


@app.route("/api/quiz/questions/<int:disaster_id>", methods=["DELETE"])
def delete_question(disaster_id):
    """Admin: delete a specific question."""
    question_id = request.args.get("question_id")
    conn = get_db()
    conn.execute("DELETE FROM quiz_questions WHERE id = ? AND disaster_id = ?",
                 (question_id, disaster_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Question deleted."})


# ═══════════════════════════════════════════════════════════
#  ENTRY POINT
# ═══════════════════════════════════════════════════════════

if __name__ == "__main__":
    init_db()
    print("🚀 Server running at http://127.0.0.1:5000")
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)

