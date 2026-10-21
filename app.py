"""
SubAlert - Flask Application Server
Visual Subscription Expiry Alert & Alarm Generator
"""
import os
import json
from datetime import datetime, date, timedelta
from flask import Flask, render_template, request, jsonify, session, Response
from werkzeug.security import check_password_hash

import database

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.environ.get('SECRET_KEY', 'subalert-super-secret-key-2026-v1')

# Initialize DB on start
database.init_db()

def get_current_user_id():
    return session.get('user_id')

def calculate_subscription_meta(sub):
    """Calculates days left, urgency level, alert trigger state, and progress percentage."""
    today = date.today()
    renewal = datetime.strptime(sub['renewal_date'], '%Y-%m-%d').date()
    days_left = (renewal - today).days

    # Urgency levels:
    # 'expired' (<= 0)
    # 'critical' (1-2 days)
    # 'warning' (3-5 days)
    # 'upcoming' (6-10 days)
    # 'safe' (> 10 days)
    if days_left < 0:
        urgency = 'expired'
        urgency_label = f'Venció hace {abs(days_left)} {"día" if abs(days_left) == 1 else "días"}'
        urgency_color = '#ef4444' # red
    elif days_left == 0:
        urgency = 'critical'
        urgency_label = '¡Vence HOY!'
        urgency_color = '#ef4444' # red
    elif days_left == 1:
        urgency = 'critical'
        urgency_label = '¡Vence mañana!'
        urgency_color = '#f97316' # orange
    elif days_left <= 3:
        urgency = 'critical'
        urgency_label = f'Vence en {days_left} días'
        urgency_color = '#f59e0b' # amber
    elif days_left <= 7:
        urgency = 'warning'
        urgency_label = f'Vence en {days_left} días'
        urgency_color = '#eab308' # yellow
    else:
        urgency = 'safe'
        urgency_label = f'{days_left} días restantes'
        urgency_color = '#10b981' # green

    # Determine if alert is actively triggered right now based on alert_days_before
    alert_days = sub.get('alert_days_before', 3)
    is_alert_triggered = 0 <= days_left <= alert_days

    # Approximate 30-day billing cycle progress
    cycle_days = 30
    if sub.get('billing_cycle') == 'yearly':
        cycle_days = 365
    elif sub.get('billing_cycle') == 'weekly':
        cycle_days = 7
    elif sub.get('billing_cycle') == 'quarterly':
        cycle_days = 90

    elapsed_days = max(0, min(cycle_days, cycle_days - days_left))
    progress_pct = min(100, max(5, int((elapsed_days / cycle_days) * 100)))

    sub_dict = dict(sub)
    sub_dict['days_left'] = days_left
    sub_dict['urgency'] = urgency
    sub_dict['urgency_label'] = urgency_label
    sub_dict['urgency_color'] = urgency_color
    sub_dict['is_alert_triggered'] = is_alert_triggered
    sub_dict['progress_pct'] = progress_pct

    return sub_dict

# ----------------- Web UI Route -----------------
@app.route('/')
def index():
    return render_template('index.html')

# ----------------- Auth API -----------------
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')
    name = data.get('name', '').strip()

    if not email or not password or not name:
        return jsonify({'error': 'Todos los campos son obligatorios.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres.'}), 400

    user_id, error = database.create_user(email, password, name)
    if error:
        return jsonify({'error': error}), 400

    session['user_id'] = user_id
    user = database.get_user_by_id(user_id)
    return jsonify({
        'message': 'Registro exitoso.',
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'currency': user['currency'],
            'default_alert_days': user['default_alert_days'],
            'default_alert_type': user['default_alert_type'],
            'alarm_sound': user['alarm_sound'],
            'alarm_volume': user['alarm_volume'],
            'theme': user['theme']
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Introduce correo y contraseña.'}), 400

    user = database.get_user_by_email(email)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Credenciales incorrectas.'}), 401

    session['user_id'] = user['id']
    return jsonify({
        'message': 'Inicio de sesión correcto.',
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'currency': user['currency'],
            'default_alert_days': user['default_alert_days'],
            'default_alert_type': user['default_alert_type'],
            'alarm_sound': user['alarm_sound'],
            'alarm_volume': user['alarm_volume'],
            'theme': user['theme']
        }
    })

@app.route('/api/auth/demo', methods=['POST'])
def demo_login():
    """Quick 1-click access to the pre-filled demo account."""
    user = database.get_user_by_email('demo@subalert.app')
    if not user:
        database.init_db()
        user = database.get_user_by_email('demo@subalert.app')

    session['user_id'] = user['id']
    return jsonify({
        'message': 'Sesión de demostración iniciada.',
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'currency': user['currency'],
            'default_alert_days': user['default_alert_days'],
            'default_alert_type': user['default_alert_type'],
            'alarm_sound': user['alarm_sound'],
            'alarm_volume': user['alarm_volume'],
            'theme': user['theme']
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Sesión cerrada correctamente.'})

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'user': None})

    user = database.get_user_by_id(user_id)
    if not user:
        session.clear()
        return jsonify({'user': None})

    return jsonify({
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'currency': user['currency'],
            'default_alert_days': user['default_alert_days'],
            'default_alert_type': user['default_alert_type'],
            'alarm_sound': user['alarm_sound'],
            'alarm_volume': user['alarm_volume'],
            'theme': user['theme']
        }
    })

# ----------------- User Settings API -----------------
@app.route('/api/user/settings', methods=['PUT'])
def update_settings():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'No autorizado.'}), 401

    data = request.get_json() or {}
    database.update_user_settings(
        user_id,
        currency=data.get('currency', 'EUR'),
        default_alert_days=int(data.get('default_alert_days', 3)),
        default_alert_type=data.get('default_alert_type', 'alarm'),
        alarm_sound=data.get('alarm_sound', 'cyber_pulse'),
        alarm_volume=float(data.get('alarm_volume', 0.8)),
        theme=data.get('theme', 'dark')
    )
    user = database.get_user_by_id(user_id)
    return jsonify({
        'message': 'Ajustes guardados correctamente.',
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'currency': user['currency'],
            'default_alert_days': user['default_alert_days'],
            'default_alert_type': user['default_alert_type'],
            'alarm_sound': user['alarm_sound'],
            'alarm_volume': user['alarm_volume'],
            'theme': user['theme']
        }
    })

# ----------------- Subscriptions CRUD API -----------------
@app.route('/api/subscriptions', methods=['GET'])
def get_subscriptions():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'No autenticado.'}), 401

    subs = database.get_user_subscriptions(user_id)
    enhanced = [calculate_subscription_meta(s) for s in subs]

    # Calculate summary metrics
    total_monthly = 0.0
    critical_count = 0
    warning_count = 0
    active_count = len(enhanced)

    for s in enhanced:
        price = s['price']
        cycle = s['billing_cycle']
        if cycle == 'yearly':
            total_monthly += price / 12.0
        elif cycle == 'weekly':
            total_monthly += price * 4.33
        elif cycle == 'quarterly':
            total_monthly += price / 3.0
        else: # monthly
            total_monthly += price

        if s['urgency'] in ('expired', 'critical'):
            critical_count += 1
        elif s['urgency'] == 'warning':
            warning_count += 1

    return jsonify({
        'subscriptions': enhanced,
        'summary': {
            'total_monthly': round(total_monthly, 2),
            'total_yearly': round(total_monthly * 12.0, 2),
            'active_count': active_count,
            'critical_count': critical_count,
            'warning_count': warning_count
        }
    })

@app.route('/api/subscriptions', methods=['POST'])
def create_subscription():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'No autenticado.'}), 401

    data = request.get_json() or {}
    if not data.get('name') or not data.get('renewal_date'):
        return jsonify({'error': 'El nombre y la fecha de renovación son obligatorios.'}), 400

    new_id = database.create_subscription(user_id, data)
    sub = database.get_subscription_by_id(new_id, user_id)
    return jsonify({
        'message': 'Suscripción guardada con éxito.',
        'subscription': calculate_subscription_meta(sub)
    }), 201

@app.route('/api/subscriptions/<int:sub_id>', methods=['GET'])
def get_subscription(sub_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'No autenticado.'}), 401

    sub = database.get_subscription_by_id(sub_id, user_id)
    if not sub:
        return jsonify({'error': 'Suscripción no encontrada.'}), 404

    return jsonify({'subscription': calculate_subscription_meta(sub)})

@app.route('/api/subscriptions/<int:sub_id>', methods=['PUT'])
def update_subscription(sub_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'No autenticado.'}), 401

    data = request.get_json() or {}
    if not data.get('name') or not data.get('renewal_date'):
        return jsonify({'error': 'El nombre y la fecha de renovación son obligatorios.'}), 400

    database.update_subscription(sub_id, user_id, data)
    sub = database.get_subscription_by_id(sub_id, user_id)
    return jsonify({
        'message': 'Suscripción actualizada correctamente.',
        'subscription': calculate_subscription_meta(sub)
    })

@app.route('/api/subscriptions/<int:sub_id>/renew', methods=['POST'])
def renew_subscription(sub_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'No autenticado.'}), 401

    next_date = database.renew_subscription(sub_id, user_id)
    if not next_date:
        return jsonify({'error': 'Suscripción no encontrada.'}), 404

    sub = database.get_subscription_by_id(sub_id, user_id)
    return jsonify({
        'message': f'Suscripción renovada. Nueva fecha: {next_date}',
        'subscription': calculate_subscription_meta(sub)
    })

@app.route('/api/subscriptions/<int:sub_id>', methods=['DELETE'])
def delete_subscription(sub_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'No autenticado.'}), 401

    database.delete_subscription(sub_id, user_id)
    return jsonify({'message': 'Suscripción eliminada con éxito.'})

@app.route('/api/subscriptions/reset', methods=['POST'])
def reset_subscriptions():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'No autenticado.'}), 401

    database.reset_user_subscriptions(user_id)
    return jsonify({'message': 'Valores y suscripciones restablecidas a los valores iniciales por defecto.'})

@app.route('/api/subscriptions/restore', methods=['POST'])
def restore_subscriptions():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'No autenticado.'}), 401

    data = request.get_json() or {}
    subs_list = data.get('subscriptions', [])
    database.restore_user_subscriptions(user_id, subs_list)
    return jsonify({'message': 'Último cambio deshecho correctamente.'})

@app.route('/api/subscriptions/save-all', methods=['POST'])
def save_all_changes():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'No autenticado.'}), 401

    return jsonify({'message': '¡Todos los cambios han sido guardados con éxito en la base de datos!'})


# ----------------- Calendar .ICS Export -----------------
@app.route('/api/export/calendar.ics', methods=['GET'])
def export_calendar():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({'error': 'No autenticado.'}), 401

    subs = database.get_user_subscriptions(user_id)
    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//SubAlert//Visual Subscription Alerts//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Alertas de Suscripciones - SubAlert"
    ]

    for s in subs:
        try:
            rdate = datetime.strptime(s['renewal_date'], '%Y-%m-%d')
            date_str = rdate.strftime('%Y%m%d')
            uid = f"subalert-{s['id']}-{date_str}@subalert.app"
            summary = f"Vencimiento: {s['name']} ({s['price']} {s['currency']})"
            desc = f"Alerta de suscripción {s['name']}. Categoría: {s['category']}. Notas: {s.get('notes', '')}"

            ics_lines.extend([
                "BEGIN:VEVENT",
                f"UID:{uid}",
                f"DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}",
                f"DTSTART;VALUE=DATE:{date_str}",
                f"SUMMARY:{summary}",
                f"DESCRIPTION:{desc}",
                "BEGIN:VALARM",
                f"TRIGGER:-P{s.get('alert_days_before', 3)}D",
                "ACTION:DISPLAY",
                f"DESCRIPTION:Alerta: Vence {s['name']} pronto!",
                "END:VALARM",
                "END:VEVENT"
            ])
        except Exception:
            continue

    ics_lines.append("END:VCALENDAR")
    ics_content = "\r\n".join(ics_lines)

    return Response(
        ics_content,
        mimetype="text/calendar",
        headers={"Content-Disposition": "attachment; filename=subalert-vencimientos.ics"}
    )

if __name__ == '__main__':
    # Run development server on port 5000
    print("Iniciando SubAlert en http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
