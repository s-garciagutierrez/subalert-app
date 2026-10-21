/**
 * SubAlert - Notification & Alarm Management System
 * Handles Browser Notifications, in-app Toasts, and full-screen visual alarms.
 */
class NotificationManager {
    constructor() {
        this.hasPermission = false;
        this.checkPermission();
    }

    checkPermission() {
        if ('Notification' in window) {
            this.hasPermission = Notification.permission === 'granted';
        }
        return this.hasPermission;
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            this.showToast('Tu navegador no soporta notificaciones de escritorio.', 'warning');
            return false;
        }

        try {
            const perm = await Notification.requestPermission();
            this.hasPermission = perm === 'granted';
            if (this.hasPermission) {
                this.showToast('¡Notificaciones de escritorio habilitadas!', 'success');
                this.sendNativeNotification('SubAlert Activo', {
                    body: 'Te avisaremos puntualmente antes de que venzan tus suscripciones.',
                    icon: '/static/icons/bell.png'
                });
            } else {
                this.showToast('Permiso de notificaciones denegado.', 'warning');
            }
            return this.hasPermission;
        } catch (e) {
            console.error('Error requesting notification permission:', e);
            return false;
        }
    }

    sendNativeNotification(title, options = {}) {
        if (this.checkPermission()) {
            try {
                const notif = new Notification(title, {
                    icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%236366f1" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
                    badge: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
                    ...options
                });
                notif.onclick = () => {
                    window.focus();
                    notif.close();
                };
            } catch (err) {
                console.warn('Native notification failed:', err);
            }
        }
    }

    // In-app visual Toast notification
    showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const bgColors = {
            success: 'bg-emerald-600/90 border-emerald-500 text-white',
            warning: 'bg-amber-600/90 border-amber-500 text-white',
            error: 'bg-rose-600/90 border-rose-500 text-white',
            info: 'bg-indigo-600/90 border-indigo-500 text-white'
        };

        const icons = {
            success: '✓',
            warning: '⚠️',
            error: '✕',
            info: 'ℹ️'
        };

        const colorClass = bgColors[type] || bgColors.info;
        const iconSymbol = icons[type] || 'ℹ️';

        toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transform transition-all duration-300 ease-out translate-y-2 opacity-0 text-sm font-medium ${colorClass}`;
        toast.innerHTML = `
            <span class="text-base font-bold">${iconSymbol}</span>
            <div class="flex-1">${message}</div>
            <button class="text-white/70 hover:text-white transition ml-2">&times;</button>
        `;

        toast.querySelector('button').onclick = () => {
            toast.classList.add('opacity-0', 'translate-y-2');
            setTimeout(() => toast.remove(), 300);
        };

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0', 'translate-y-2');
        });

        // Auto remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }

    // Trigger full alarm modal + sound
    triggerVisualAlarm(sub) {
        const modal = document.getElementById('alarm-overlay-modal');
        if (!modal) return;

        // Set alarm content
        document.getElementById('alarm-service-name').innerText = sub.name;
        document.getElementById('alarm-service-cost').innerText = `${sub.price.toFixed(2)} ${sub.currency}`;
        document.getElementById('alarm-urgency-badge').innerText = sub.urgency_label || '¡Vencimiento Inminente!';
        document.getElementById('alarm-renewal-date').innerText = `Fecha programada: ${sub.renewal_date}`;
        
        const noteEl = document.getElementById('alarm-service-note');
        if (sub.notes) {
            noteEl.innerText = `Nota: "${sub.notes}"`;
            noteEl.classList.remove('hidden');
        } else {
            noteEl.classList.add('hidden');
        }

        // Store active sub for action buttons
        window.activeAlarmSub = sub;

        // Start sound
        const sound = sub.alarm_sound || 'cyber_pulse';
        window.soundEngine.startAlarm(sound);

        // Native notification as well
        this.sendNativeNotification(`🚨 ALERTA: ${sub.name} vence pronto`, {
            body: `Tu suscripción de ${sub.price} ${sub.currency} vence el ${sub.renewal_date}. ${sub.urgency_label}`,
            requireInteraction: true
        });

        // Show modal with animation
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    dismissActiveAlarm() {
        const modal = document.getElementById('alarm-overlay-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        window.soundEngine.stopAlarm();
        window.activeAlarmSub = null;
    }
}

window.notifManager = new NotificationManager();
