"""
Database layer for SubAlert: Visual Subscription Expiry Alert Generator.
Handles SQLite connection, schema creation, demo data seeding, and data queries.
"""
import sqlite3
import os
from datetime import datetime, date, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'subalert.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        currency TEXT DEFAULT 'EUR',
        default_alert_days INTEGER DEFAULT 3,
        default_alert_type TEXT DEFAULT 'alarm',
        alarm_sound TEXT DEFAULT 'cyber_pulse',
        alarm_volume REAL DEFAULT 0.8,
        theme TEXT DEFAULT 'dark',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Subscriptions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        currency TEXT DEFAULT 'EUR',
        billing_cycle TEXT NOT NULL DEFAULT 'monthly',
        renewal_date DATE NOT NULL,
        alert_days_before INTEGER NOT NULL DEFAULT 3,
        alert_time TEXT DEFAULT '09:00',
        alert_type TEXT NOT NULL DEFAULT 'alarm',
        alarm_sound TEXT DEFAULT 'cyber_pulse',
        icon TEXT DEFAULT 'tv',
        color TEXT DEFAULT '#6366f1',
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # Alert logs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alert_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subscription_id INTEGER NOT NULL,
        message TEXT,
        alert_type TEXT,
        triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dismissed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    seed_demo_user_if_needed(conn)
    conn.close()

def seed_demo_user_if_needed(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = 'demo@subalert.app'")
    user = cursor.fetchone()

    today = date.today()

    if not user:
        demo_pass_hash = generate_password_hash('demo123')
        cursor.execute("""
            INSERT INTO users (email, password_hash, name, currency, default_alert_days, default_alert_type, alarm_sound, alarm_volume, theme)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ('demo@subalert.app', demo_pass_hash, 'Usuario Demo', 'EUR', 3, 'alarm', 'cyber_pulse', 0.85, 'dark'))
        user_id = cursor.lastrowid

        # Insert realistic popular subscriptions with dates relative to today
        demo_subs = [
            (
                user_id, 'Netflix Premium', 'Streaming Video', 17.99, 'EUR', 'monthly',
                (today + timedelta(days=2)).isoformat(), 2, '10:00', 'alarm', 'cyber_pulse',
                'film', '#E50914', 'Plan 4K familiar. Vence muy pronto, probar alarma.'
            ),
            (
                user_id, 'Spotify Premium', 'Música', 10.99, 'EUR', 'monthly',
                (today + timedelta(days=5)).isoformat(), 3, '09:00', 'notification', 'chime_zen',
                'music', '#1DB954', 'Suscripción individual mensual.'
            ),
            (
                user_id, 'Gimnasio Basic-Fit', 'Salud y Deporte', 29.99, 'EUR', 'monthly',
                (today + timedelta(days=1)).isoformat(), 3, '08:30', 'alarm', 'radar_alert',
                'dumbbell', '#FF6600', 'Cuota Comfort + Live Classes. Vence mañana.'
            ),
            (
                user_id, 'ChatGPT Plus', 'Software & IA', 22.00, 'EUR', 'monthly',
                (today + timedelta(days=14)).isoformat(), 5, '12:00', 'notification', 'ascending_melody',
                'bot', '#10A37F', 'OpenAI GPT-4o & Canvas access.'
            ),
            (
                user_id, 'Amazon Prime', 'Servicios & Envíos', 4.99, 'EUR', 'monthly',
                (today + timedelta(days=21)).isoformat(), 2, '09:00', 'notification', 'classic_beep',
                'package', '#00A8E1', 'Envíos gratis y Prime Video.'
            ),
            (
                user_id, 'PlayStation Plus Extra', 'Gaming', 13.99, 'EUR', 'monthly',
                (today + timedelta(days=8)).isoformat(), 3, '18:00', 'alarm', 'cyber_pulse',
                'gamepad-2', '#00439C', 'Catálogo de juegos PS5/PS4.'
            )
        ]

        cursor.executemany("""
            INSERT INTO subscriptions 
            (user_id, name, category, price, currency, billing_cycle, renewal_date, alert_days_before, alert_time, alert_type, alarm_sound, icon, color, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, demo_subs)

        conn.commit()

# User Helpers
def get_user_by_email(email):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),)).fetchone()
    conn.close()
    return user

def get_user_by_id(user_id):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return user

def create_user(email, password, name):
    conn = get_db()
    cursor = conn.cursor()
    password_hash = generate_password_hash(password)
    try:
        cursor.execute("""
            INSERT INTO users (email, password_hash, name)
            VALUES (?, ?, ?)
        """, (email.lower().strip(), password_hash, name.strip()))
        user_id = cursor.lastrowid
        conn.commit()
        return user_id, None
    except sqlite3.IntegrityError:
        return None, "Este correo electrónico ya está registrado."
    finally:
        conn.close()

def update_user_settings(user_id, currency, default_alert_days, default_alert_type, alarm_sound, alarm_volume, theme):
    conn = get_db()
    conn.execute("""
        UPDATE users SET 
            currency = ?,
            default_alert_days = ?,
            default_alert_type = ?,
            alarm_sound = ?,
            alarm_volume = ?,
            theme = ?
        WHERE id = ?
    """, (currency, default_alert_days, default_alert_type, alarm_sound, alarm_volume, theme, user_id))
    conn.commit()
    conn.close()

# Subscription Helpers
def get_user_subscriptions(user_id):
    conn = get_db()
    subs = conn.execute("""
        SELECT * FROM subscriptions 
        WHERE user_id = ? AND is_active = 1
        ORDER BY renewal_date ASC
    """, (user_id,)).fetchall()
    conn.close()
    return [dict(s) for s in subs]

def get_subscription_by_id(sub_id, user_id):
    conn = get_db()
    sub = conn.execute("""
        SELECT * FROM subscriptions WHERE id = ? AND user_id = ?
    """, (sub_id, user_id)).fetchone()
    conn.close()
    return dict(sub) if sub else None

def create_subscription(user_id, data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO subscriptions 
        (user_id, name, category, price, currency, billing_cycle, renewal_date, 
         alert_days_before, alert_time, alert_type, alarm_sound, icon, color, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        data.get('name', '').strip(),
        data.get('category', 'Otros'),
        float(data.get('price', 0)),
        data.get('currency', 'EUR'),
        data.get('billing_cycle', 'monthly'),
        data.get('renewal_date'),
        int(data.get('alert_days_before', 3)),
        data.get('alert_time', '09:00'),
        data.get('alert_type', 'alarm'),
        data.get('alarm_sound', 'cyber_pulse'),
        data.get('icon', 'tv'),
        data.get('color', '#6366f1'),
        data.get('notes', '')
    ))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def update_subscription(sub_id, user_id, data):
    conn = get_db()
    conn.execute("""
        UPDATE subscriptions SET
            name = ?,
            category = ?,
            price = ?,
            currency = ?,
            billing_cycle = ?,
            renewal_date = ?,
            alert_days_before = ?,
            alert_time = ?,
            alert_type = ?,
            alarm_sound = ?,
            icon = ?,
            color = ?,
            notes = ?
        WHERE id = ? AND user_id = ?
    """, (
        data.get('name', '').strip(),
        data.get('category', 'Otros'),
        float(data.get('price', 0)),
        data.get('currency', 'EUR'),
        data.get('billing_cycle', 'monthly'),
        data.get('renewal_date'),
        int(data.get('alert_days_before', 3)),
        data.get('alert_time', '09:00'),
        data.get('alert_type', 'alarm'),
        data.get('alarm_sound', 'cyber_pulse'),
        data.get('icon', 'tv'),
        data.get('color', '#6366f1'),
        data.get('notes', ''),
        sub_id,
        user_id
    ))
    conn.commit()
    conn.close()

def renew_subscription(sub_id, user_id):
    """Advance subscription renewal_date according to billing_cycle."""
    conn = get_db()
    sub = conn.execute("SELECT * FROM subscriptions WHERE id = ? AND user_id = ?", (sub_id, user_id)).fetchone()
    if not sub:
        conn.close()
        return None

    current_date = datetime.strptime(sub['renewal_date'], '%Y-%m-%d').date()
    cycle = sub['billing_cycle']

    if cycle == 'weekly':
        next_date = current_date + timedelta(days=7)
    elif cycle == 'yearly':
        try:
            next_date = current_date.replace(year=current_date.year + 1)
        except ValueError:
            next_date = current_date + timedelta(days=365)
    elif cycle == 'quarterly':
        month = current_date.month + 3
        year = current_date.year + (month - 1) // 12
        month = ((month - 1) % 12) + 1
        day = min(current_date.day, 28)
        next_date = date(year, month, day)
    else:  # monthly
        month = current_date.month + 1
        year = current_date.year + (month - 1) // 12
        month = ((month - 1) % 12) + 1
        day = min(current_date.day, 28)
        next_date = date(year, month, day)

    conn.execute("UPDATE subscriptions SET renewal_date = ? WHERE id = ? AND user_id = ?", (next_date.isoformat(), sub_id, user_id))
    conn.commit()
    conn.close()
    return next_date.isoformat()

def delete_subscription(sub_id, user_id):
    conn = get_db()
    conn.execute("DELETE FROM subscriptions WHERE id = ? AND user_id = ?", (sub_id, user_id))
    conn.commit()
    conn.close()

def reset_user_subscriptions(user_id):
    """Resets user subscriptions to clean realistic defaults."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM subscriptions WHERE user_id = ?", (user_id,))
    today = date.today()
    demo_subs = [
        (
            user_id, 'Netflix Premium', 'Streaming Video', 17.99, 'EUR', 'monthly',
            (today + timedelta(days=2)).isoformat(), 2, '10:00', 'alarm', 'cyber_pulse',
            'film', '#E50914', 'Plan 4K familiar. Vence muy pronto, probar alarma.'
        ),
        (
            user_id, 'Spotify Premium', 'Música', 10.99, 'EUR', 'monthly',
            (today + timedelta(days=5)).isoformat(), 3, '09:00', 'notification', 'chime_zen',
            'music', '#1DB954', 'Suscripción individual mensual.'
        ),
        (
            user_id, 'Gimnasio Basic-Fit', 'Salud y Deporte', 29.99, 'EUR', 'monthly',
            (today + timedelta(days=1)).isoformat(), 3, '08:30', 'alarm', 'radar_alert',
            'dumbbell', '#FF6600', 'Cuota Comfort + Live Classes. Vence mañana.'
        ),
        (
            user_id, 'ChatGPT Plus', 'Software & IA', 22.00, 'EUR', 'monthly',
            (today + timedelta(days=14)).isoformat(), 5, '12:00', 'notification', 'ascending_melody',
            'bot', '#10A37F', 'OpenAI GPT-4o & Canvas access.'
        ),
        (
            user_id, 'Amazon Prime', 'Servicios & Envíos', 4.99, 'EUR', 'monthly',
            (today + timedelta(days=21)).isoformat(), 2, '09:00', 'notification', 'classic_beep',
            'package', '#00A8E1', 'Envíos gratis y Prime Video.'
        ),
        (
            user_id, 'PlayStation Plus Extra', 'Gaming', 13.99, 'EUR', 'monthly',
            (today + timedelta(days=8)).isoformat(), 3, '18:00', 'alarm', 'cyber_pulse',
            'gamepad-2', '#00439C', 'Catálogo de juegos PS5/PS4.'
        )
    ]
    cursor.executemany("""
        INSERT INTO subscriptions 
        (user_id, name, category, price, currency, billing_cycle, renewal_date, alert_days_before, alert_time, alert_type, alarm_sound, icon, color, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, demo_subs)
    conn.commit()
    conn.close()

def restore_user_subscriptions(user_id, subs_list):
    """Restores a snapshot of subscriptions."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM subscriptions WHERE user_id = ?", (user_id,))
    for s in subs_list:
        cursor.execute("""
            INSERT INTO subscriptions 
            (user_id, name, category, price, currency, billing_cycle, renewal_date, alert_days_before, alert_time, alert_type, alarm_sound, icon, color, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            s.get('name', 'Suscripción'),
            s.get('category', 'Otros'),
            float(s.get('price', 0)),
            s.get('currency', 'EUR'),
            s.get('billing_cycle', 'monthly'),
            s.get('renewal_date'),
            int(s.get('alert_days_before', 3)),
            s.get('alert_time', '09:00'),
            s.get('alert_type', 'alarm'),
            s.get('alarm_sound', 'cyber_pulse'),
            s.get('icon', 'tv'),
            s.get('color', '#6366f1'),
            s.get('notes', '')
        ))
    conn.commit()
    conn.close()

