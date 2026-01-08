from flask import Flask, send_from_directory, request, jsonify
import sqlite3
import os

app = Flask(__name__, static_folder='../frontend', static_url_path='')
DB_NAME = 'tracker_v2.db' # New DB for date-based schema

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            month TEXT NOT NULL
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS habit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            completed BOOLEAN NOT NULL CHECK (completed IN (0, 1)),
            UNIQUE(habit_id, date),
            FOREIGN KEY (habit_id) REFERENCES habits (id)
        )
    ''')
    conn.commit()
    conn.close()

if not os.path.exists(DB_NAME):
    init_db()
else:
    init_db()

@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/habits', methods=['GET'])
def get_habits():
    month = request.args.get('month')
    if not month:
        return jsonify([])
        
    conn = get_db_connection()
    habits = conn.execute('SELECT * FROM habits WHERE month = ?', (month,)).fetchall()
    conn.close()
    return jsonify([dict(h) for h in habits])

@app.route('/habits', methods=['POST'])
def add_habit():
    data = request.json
    name = data.get('name')
    month = data.get('month')
    
    if not name or not month:
        return jsonify({'error': 'Name and Month are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.execute('INSERT INTO habits (name, month) VALUES (?, ?)', (name, month))
    conn.commit()
    habit_id = cursor.lastrowid
    conn.close()
    
    return jsonify({'id': habit_id, 'name': name, 'month': month}), 201

@app.route('/logs', methods=['GET'])
def get_logs():
    habit_ids = request.args.getlist('habit_ids[]') # Filter by habits if needed, or get all
    # Ideally simpler: fetch all logs for the current habits
    # But for simplicity, let's just fetch all logs for now, or filter by date on frontend
    # Better: Filter by date range (e.g. 2026-01-%)
    
    date_prefix = request.args.get('date_prefix') # e.g. "2026-01"
    
    conn = get_db_connection()
    if date_prefix:
        logs = conn.execute('SELECT * FROM habit_logs WHERE completed = 1 AND date LIKE ?', (f'{date_prefix}%',)).fetchall()
    else:
         logs = conn.execute('SELECT * FROM habit_logs WHERE completed = 1').fetchall()
         
    conn.close()
    return jsonify([dict(l) for l in logs])

@app.route('/log', methods=['POST'])
def update_log():
    data = request.json
    habit_id = data.get('habit_id')
    date_str = data.get('date')
    completed = data.get('completed')
    
    if habit_id is None or not date_str or completed is None:
        return jsonify({'error': 'Missing fields'}), 400

    # Prevent future dates
    from datetime import datetime, date
    try:
        log_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        if log_date > date.today():
            return jsonify({'error': 'Cannot log future dates'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    conn = get_db_connection()
    if completed:
        conn.execute('''
            INSERT INTO habit_logs (habit_id, date, completed) 
            VALUES (?, ?, 1) 
            ON CONFLICT(habit_id, date) DO UPDATE SET completed=1
        ''', (habit_id, date_str))
    else:
        conn.execute('''
            INSERT INTO habit_logs (habit_id, date, completed) 
            VALUES (?, ?, 0) 
            ON CONFLICT(habit_id, date) DO UPDATE SET completed=0
        ''', (habit_id, date_str))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
