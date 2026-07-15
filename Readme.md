# 🛡️ Disaster Preparedness and Response Education System
📄 **Project Proposal:** See [PROJECT_PROPOSAL.md](./PROJECT_PROPOSAL.md) for the original problem statement, objectives, and planned system design.

📄 **This document** describes the final implemented system — setup instructions, database schema, and API details.
A full-stack web application for learning disaster safety, built with **React + Flask + SQLite**.

---

## 📁 Project Structure

```
disaster-app/
├── backend/
│   ├── app.py              ← Flask server (all APIs here)
│   ├── requirements.txt    ← Python packages
│   └── disaster_app.db     ← SQLite database (auto-created on first run)
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── DisasterList.js
    │   │   ├── DisasterDetail.js
    │   │   ├── Quiz.js
    │   │   └── AdminPanel.js
    │   ├── components/
    │   │   └── Navbar.js
    │   ├── services/
    │   │   ├── api.js          ← All fetch/API calls
    │   │   └── AuthContext.js  ← User session management
    │   ├── App.js              ← Routes + layout
    │   ├── App.css             ← All styles
    │   └── index.js            ← React entry point
    └── package.json
```

---

## ⚙️ How to Run

### Step 1 — Backend (Flask)

Open a terminal and run:

```bash
# Go into the backend folder
cd disaster-app/backend

# Create a Python virtual environment (recommended)
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Start the Flask server
python app.py
```

✅ Flask runs at: **http://127.0.0.1:5000**
The database (`disaster_app.db`) and sample data are created automatically.

---

### Step 2 — Frontend (React)

Open a **second terminal** and run:

```bash
# Go into the frontend folder
cd disaster-app/frontend

# Install Node packages
npm install

# Start the React app
npm start
```

✅ React opens at: **http://localhost:3000**

---

## 🔑 Demo Login Accounts

| Username   | Password     | Role    |
|------------|-------------|---------|
| `admin`    | `admin123`  | Admin   |
| `student1` | `student123`| Student |

---

## 🗄️ Database Tables

### `users`
| Column   | Type    | Description              |
|----------|---------|--------------------------|
| id       | INTEGER | Primary key              |
| username | TEXT    | Unique login name        |
| password | TEXT    | SHA-256 hashed password  |
| role     | TEXT    | `student` or `admin`     |
| email    | TEXT    | Optional email           |

### `disasters`
| Column      | Type | Description                    |
|-------------|------|--------------------------------|
| id          | INT  | Primary key                    |
| title       | TEXT | Disaster name (e.g. Earthquake)|
| category    | TEXT | Natural / Man-made             |
| description | TEXT | Full explanation               |
| dos         | TEXT | Do's (newline separated)       |
| donts       | TEXT | Don'ts (newline separated)     |
| image_icon  | TEXT | Emoji icon                     |

### `quiz_questions`
| Column         | Type | Description           |
|----------------|------|-----------------------|
| id             | INT  | Primary key           |
| disaster_id    | INT  | FK → disasters.id     |
| question       | TEXT | The MCQ question      |
| option_a/b/c/d | TEXT | Four answer choices   |
| correct_option | TEXT | A, B, C, or D         |

### `quiz_results`
| Column      | Type      | Description            |
|-------------|-----------|------------------------|
| id          | INT       | Primary key            |
| user_id     | INT       | FK → users.id          |
| disaster_id | INT       | FK → disasters.id      |
| score       | INT       | Correct answers        |
| total       | INT       | Total questions        |
| taken_at    | TIMESTAMP | Auto-set date/time     |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint        | Description         |
|--------|----------------|---------------------|
| POST   | /api/register  | Register new user   |
| POST   | /api/login     | Login + get user    |

### Disasters
| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| GET    | /api/disasters        | List all disasters      |
| GET    | /api/disasters/:id    | Get one disaster detail |
| POST   | /api/disasters        | Admin: add disaster     |
| DELETE | /api/disasters/:id    | Admin: delete disaster  |

### Quiz
| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| GET    | /api/quiz/:disaster_id    | Get questions             |
| POST   | /api/quiz/add             | Admin: add question       |
| POST   | /api/quiz/submit          | Submit + get score        |
| GET    | /api/quiz/results/:user_id| Student's past results    |
| DELETE | /api/quiz/questions/:id   | Admin: delete question    |

### Admin
| Method | Endpoint         | Description         |
|--------|-----------------|---------------------|
| GET    | /api/admin/users | List all users     |
| GET    | /api/admin/stats | Dashboard stats    |

---

## 📱 Features Summary

### Student
- Register and login
- View all 5 disaster modules with Do's & Don'ts
- Take MCQ quizzes with real-time navigation
- See score breakdown after quiz
- Track past quiz results on dashboard

### Admin / Teacher
- All student features
- Add new disaster modules
- Add quiz questions to any disaster
- Delete disasters and questions
- View all registered users
- See system-wide statistics

---

## 🛠️ Tech Stack

| Layer    | Technology         |
|----------|--------------------|
| Frontend | React 18           |
| Routing  | React Router v6    |
| Backend  | Python Flask       |
| Database | SQLite             |
| Styling  | Custom CSS         |
| Auth     | SHA-256 + Session  |

---

## 💡 Viva Explanation Summary

**Q: Why SQLite?**
A: SQLite is a file-based database. No separate server needed. Perfect for beginner/localhost projects.

**Q: How does login work without JWT?**
A: User credentials are sent to Flask. Flask checks the database. If valid, user info (id, name, role) is returned and stored in React's sessionStorage. Each page reads from there.

**Q: How is the role system implemented?**
A: Each user has a `role` column (`student` or `admin`). React Router checks the role before showing `/admin`. Flask does not enforce role on APIs (beginner level — can be added later).

**Q: How are passwords stored?**
A: Using Python's `hashlib.sha256`. The plain text password is never stored. Only the hash is saved.

**Q: How does the quiz scoring work?**
A: The student's answers are sent as a dictionary `{question_id: "A/B/C/D"}`. Flask looks up the correct answer for each ID, counts matches, and saves the result to `quiz_results`.

**Q: How does React talk to Flask?**
A: Using the browser's built-in `fetch()` API. All API calls are in `src/services/api.js`. Flask has CORS enabled via `flask-cors` so React (port 3000) can call Flask (port 5000).
