/**
 * SubAlert - Main Frontend Controller
 * Reactive state management, API synchronization, UI rendering.
 */

// Popular Subscription Presets for Quick Auto-Fill
const PRESETS = [
    { name: 'Netflix', category: 'Streaming Video', price: 17.99, icon: 'film', color: '#E50914', billing_cycle: 'monthly' },
    { name: 'Spotify', category: 'Música', price: 10.99, icon: 'music', color: '#1DB954', billing_cycle: 'monthly' },
    { name: 'Gimnasio Basic-Fit', category: 'Salud y Deporte', price: 29.99, icon: 'dumbbell', color: '#FF6600', billing_cycle: 'monthly' },
    { name: 'ChatGPT Plus', category: 'Software & IA', price: 22.00, icon: 'bot', color: '#10A37F', billing_cycle: 'monthly' },
    { name: 'Amazon Prime', category: 'Servicios & Envíos', price: 4.99, icon: 'package', color: '#00A8E1', billing_cycle: 'monthly' },
    { name: 'Disney+', category: 'Streaming Video', price: 10.99, icon: 'tv', color: '#113CCF', billing_cycle: 'monthly' },
    { name: 'PlayStation Plus', category: 'Gaming', price: 13.99, icon: 'gamepad-2', color: '#00439C', billing_cycle: 'monthly' },
    { name: 'Xbox Game Pass', category: 'Gaming', price: 14.99, icon: 'gamepad-2', color: '#107C10', billing_cycle: 'monthly' },
    { name: 'Apple iCloud+', category: 'Almacenamiento', price: 2.99, icon: 'cloud', color: '#555555', billing_cycle: 'monthly' },
    { name: 'YouTube Premium', category: 'Streaming Video', price: 13.99, icon: 'youtube', color: '#FF0000', billing_cycle: 'monthly' },
    { name: 'DAZN', category: 'Salud y Deporte', price: 29.99, icon: 'activity', color: '#F8F9FA', billing_cycle: 'monthly' }
];

const ICONS_MAP = {
    'film': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M17 3v18M3 7.5h4M3 12h18M3 16.5h4M17 7.5h4M17 16.5h4"/></svg>',
    'music': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    'dumbbell': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m6.5 6.5 11 11M3 8l4-4M17 22l4-4M2 13l2-2M13 22l2-2M11 2l2 2M20 11l2 2"/></svg>',
    'bot': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg>',
    'package': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12.67 20.71 7"/><line x1="12" x2="12" y1="22.7" y2="12.5"/></svg>',
    'tv': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>',
    'gamepad-2': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>',
    'cloud': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
    'youtube': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10 15 15 12 10 9 10 15"/></svg>',
    'activity': '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
};

class SubAlertApp {
    constructor() {
        this.user = null;
        this.subscriptions = [];
        this.summary = { total_monthly: 0, total_yearly: 0, active_count: 0, critical_count: 0, warning_count: 0 };
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentView = 'cards'; // 'cards' | 'generator' | 'table'
        this.editingSubId = null;
        this.undoStack = [];
        this.modalOriginalData = null;

        this.init();
    }

    async init() {
        this.setupPresetPills();
        this.setupEventListeners();
        await this.checkAuth();
        this.startPeriodicChecker();
    }

    setupPresetPills() {
        const container = document.getElementById('presets-container');
        if (!container) return;

        container.innerHTML = PRESETS.map(p => `
            <button type="button" 
                    onclick="app.selectPreset('${p.name}')" 
                    class="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700 hover:border-slate-500 text-slate-300 transition flex items-center gap-1.5 shadow-sm">
                <span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color: ${p.color}"></span>
                ${p.name}
            </button>
        `).join('');
    }

    selectPreset(name) {
        const preset = PRESETS.find(p => p.name === name);
        if (!preset) return;

        document.getElementById('sub-name').value = preset.name;
        document.getElementById('sub-category').value = preset.category;
        document.getElementById('sub-price').value = preset.price;
        document.getElementById('sub-cycle').value = preset.billing_cycle;
        document.getElementById('sub-icon').value = preset.icon;
        document.getElementById('sub-color').value = preset.color;

        // Auto default renewal date to 30 days from now if empty
        const dateInput = document.getElementById('sub-renewal-date');
        if (!dateInput.value) {
            const d = new Date();
            d.setDate(d.getDate() + 30);
            dateInput.value = d.toISOString().split('T')[0];
        }

        window.notifManager.showToast(`Plantilla "${preset.name}" cargada. Ajusta tu fecha de renovación.`, 'info', 2500);
    }

    setupEventListeners() {
        // Search & Filters
        document.getElementById('search-input')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.renderSubscriptions();
        });

        document.getElementById('category-filter')?.addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.renderSubscriptions();
        });

        // Volume control slider in settings
        document.getElementById('settings-volume')?.addEventListener('input', (e) => {
            const vol = parseFloat(e.target.value);
            document.getElementById('volume-val-display').innerText = `${Math.round(vol * 100)}%`;
            window.soundEngine.setVolume(vol);
        });

        // Track changes inside the subscription modal form to enable modal undo
        document.getElementById('sub-form')?.addEventListener('input', () => {
            const btn = document.getElementById('btn-modal-undo');
            if (btn) {
                btn.removeAttribute('disabled');
                btn.classList.remove('opacity-40', 'cursor-not-allowed');
                btn.classList.add('text-indigo-300');
            }
        });

        // Global Keyboard shortcuts: Escape (close modals), Ctrl+Z (Undo), Ctrl+S (Save)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }

            // Ctrl+Z or Cmd+Z -> Undo last change
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                // If focus is in an input/textarea, allow normal browser undo; otherwise trigger app undo
                const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
                if (tag !== 'input' && tag !== 'textarea') {
                    e.preventDefault();
                    this.undoLastChange();
                }
            }

            // Ctrl+S or Cmd+S -> Save all changes
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                this.saveAllChanges();
            }
        });
    }

    // ---------------- AUTH ----------------
    async checkAuth() {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.user) {
                this.user = data.user;
                this.onAuthSuccess();
            } else {
                this.showAuthView(true);
            }
        } catch (e) {
            console.error('Error checking auth:', e);
            this.showAuthView(true);
        }
    }

    async login(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                window.notifManager.showToast(data.error || 'Error al iniciar sesión', 'error');
                return;
            }
            this.user = data.user;
            this.onAuthSuccess();
            window.notifManager.showToast(`¡Bienvenido de nuevo, ${this.user.name}!`, 'success');
        } catch (err) {
            window.notifManager.showToast('Error de red al conectar.', 'error');
        }
    }

    async register(event) {
        event.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                window.notifManager.showToast(data.error || 'Error al registrarse', 'error');
                return;
            }
            this.user = data.user;
            this.onAuthSuccess();
            window.notifManager.showToast('¡Cuenta creada exitosamente!', 'success');
        } catch (err) {
            window.notifManager.showToast('Error de red al crear cuenta.', 'error');
        }
    }

    async loginDemo() {
        try {
            const res = await fetch('/api/auth/demo', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                this.user = data.user;
                this.onAuthSuccess();
                window.notifManager.showToast('Sesión de prueba iniciada con suscripciones de ejemplo.', 'success');
            }
        } catch (e) {
            window.notifManager.showToast('Error al iniciar cuenta demo.', 'error');
        }
    }

    async logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        this.user = null;
        this.showAuthView(true);
        window.notifManager.showToast('Sesión finalizada.', 'info');
    }

    showAuthView(show) {
        const authView = document.getElementById('auth-section');
        const mainView = document.getElementById('dashboard-section');
        if (show) {
            authView?.classList.remove('hidden');
            mainView?.classList.add('hidden');
        } else {
            authView?.classList.add('hidden');
            mainView?.classList.remove('hidden');
        }
    }

    toggleAuthMode(mode) {
        const loginForm = document.getElementById('form-login');
        const regForm = document.getElementById('form-register');
        const tabLogin = document.getElementById('tab-btn-login');
        const tabReg = document.getElementById('tab-btn-register');

        if (mode === 'login') {
            loginForm.classList.remove('hidden');
            regForm.classList.add('hidden');
            tabLogin.classList.add('bg-indigo-600', 'text-white');
            tabLogin.classList.remove('text-slate-400');
            tabReg.classList.remove('bg-indigo-600', 'text-white');
            tabReg.classList.add('text-slate-400');
        } else {
            loginForm.classList.add('hidden');
            regForm.classList.remove('hidden');
            tabReg.classList.add('bg-indigo-600', 'text-white');
            tabReg.classList.remove('text-slate-400');
            tabLogin.classList.remove('bg-indigo-600', 'text-white');
            tabLogin.classList.add('text-slate-400');
        }
    }

    onAuthSuccess() {
        this.showAuthView(false);
        document.getElementById('user-display-name').innerText = this.user.name;
        document.getElementById('user-avatar-initial').innerText = this.user.name.charAt(0).toUpperCase();
        
        // Sync user sound volume & settings
        if (this.user.alarm_volume !== undefined) {
            window.soundEngine.setVolume(this.user.alarm_volume);
        }

        this.loadSubscriptions();
    }

    // ---------------- SUBSCRIPTIONS ----------------
    async loadSubscriptions() {
        try {
            const res = await fetch('/api/subscriptions');
            if (res.status === 401) {
                this.showAuthView(true);
                return;
            }
            const data = await res.json();
            this.subscriptions = data.subscriptions || [];
            this.summary = data.summary || {};

            this.updateSummaryMetrics();
            this.renderSubscriptions();
            this.updateUndoButtonState();

            // Check if any subscription has an active alarm triggered right now
            const urgentAlerts = this.subscriptions.filter(s => s.is_alert_triggered);
            if (urgentAlerts.length > 0) {
                this.updateAlertBanner(urgentAlerts);
            } else {
                document.getElementById('urgent-banner')?.classList.add('hidden');
            }
        } catch (e) {
            console.error('Error loading subscriptions:', e);
        }
    }

    updateSummaryMetrics() {
        const cur = this.user?.currency || 'EUR';
        const symbol = cur === 'EUR' ? '€' : cur === 'USD' ? '$' : cur;

        document.getElementById('metric-monthly').innerText = `${this.summary.total_monthly.toFixed(2)} ${symbol}`;
        document.getElementById('metric-yearly').innerText = `${this.summary.total_yearly.toFixed(2)} ${symbol}`;
        document.getElementById('metric-active').innerText = this.summary.active_count;
        document.getElementById('metric-critical').innerText = this.summary.critical_count;

        // Header warning badge
        const badge = document.getElementById('header-alert-badge');
        if (this.summary.critical_count > 0) {
            badge.innerText = `${this.summary.critical_count} urgentes`;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    updateAlertBanner(urgentList) {
        const banner = document.getElementById('urgent-banner');
        if (!banner) return;

        banner.classList.remove('hidden');
        const listText = urgentList.map(s => `${s.name} (${s.urgency_label})`).join(', ');
        document.getElementById('urgent-banner-text').innerText = 
            `Tienes ${urgentList.length} suscripción(es) en periodo de alerta: ${listText}`;
    }

    setUrgencyFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-pill').forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('bg-indigo-600', 'text-white', 'border-indigo-500');
                btn.classList.remove('bg-slate-800/80', 'text-slate-400');
            } else {
                btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-500');
                btn.classList.add('bg-slate-800/80', 'text-slate-400');
            }
        });
        this.renderSubscriptions();
    }

    setView(viewName) {
        this.currentView = viewName;
        ['cards', 'generator', 'table'].forEach(v => {
            const btn = document.getElementById(`view-btn-${v}`);
            const sec = document.getElementById(`view-container-${v}`);
            if (v === viewName) {
                btn?.classList.add('bg-indigo-600/30', 'text-indigo-400', 'border-indigo-500/50');
                sec?.classList.remove('hidden');
            } else {
                btn?.classList.remove('bg-indigo-600/30', 'text-indigo-400', 'border-indigo-500/50');
                sec?.classList.add('hidden');
            }
        });

        if (viewName === 'generator') {
            this.renderVisualGenerator();
        }
    }

    getFilteredSubscriptions() {
        return this.subscriptions.filter(sub => {
            // Text search
            const matchesSearch = !this.searchQuery || 
                sub.name.toLowerCase().includes(this.searchQuery) ||
                sub.category.toLowerCase().includes(this.searchQuery) ||
                (sub.notes && sub.notes.toLowerCase().includes(this.searchQuery));

            // Category filter
            const matchesCategory = this.currentCategory === 'all' || sub.category === this.currentCategory;

            // Urgency filter
            let matchesUrgency = true;
            if (this.currentFilter === 'critical') {
                matchesUrgency = sub.urgency === 'critical' || sub.urgency === 'expired';
            } else if (this.currentFilter === 'warning') {
                matchesUrgency = sub.urgency === 'warning';
            } else if (this.currentFilter === 'safe') {
                matchesUrgency = sub.urgency === 'safe';
            } else if (this.currentFilter === 'alerts') {
                matchesUrgency = sub.is_alert_triggered;
            }

            return matchesSearch && matchesCategory && matchesUrgency;
        });
    }

    renderSubscriptions() {
        const filtered = this.getFilteredSubscriptions();
        const container = document.getElementById('subscriptions-grid');
        const emptyState = document.getElementById('empty-state');

        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');

        container.innerHTML = filtered.map(sub => {
            const iconSvg = ICONS_MAP[sub.icon] || ICONS_MAP['tv'];
            const isCritical = sub.urgency === 'critical' || sub.urgency === 'expired';
            const isWarning = sub.urgency === 'warning';

            // Card highlight border
            const glowClass = isCritical ? 'animate-pulse-glow-red border-red-500/80 bg-red-950/20' : 
                              isWarning ? 'animate-pulse-glow-amber border-amber-500/70 bg-amber-950/20' : 
                              'border-slate-800 bg-slate-900/60';

            const badgeClass = `badge-${sub.urgency}`;
            const alertBadgeText = sub.alert_type === 'alarm' ? '🚨 Alarma acústica' : '🔔 Notificación';

            return `
            <div class="glass-card rounded-2xl p-5 border relative flex flex-col justify-between ${glowClass}">
                <!-- Top Brand row -->
                <div>
                    <div class="flex items-start justify-between gap-3 mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg" style="background-color: ${sub.color}">
                                ${iconSvg}
                            </div>
                            <div>
                                <h3 class="font-bold text-white text-base leading-tight flex items-center gap-2">
                                    ${sub.name}
                                    ${sub.is_alert_triggered ? '<span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" title="¡Alerta activa!"></span>' : ''}
                                </h3>
                                <span class="text-xs text-slate-400 font-medium">${sub.category}</span>
                            </div>
                        </div>

                        <!-- Price Tag -->
                        <div class="text-right">
                            <span class="text-lg font-black text-white">${sub.price.toFixed(2)} ${sub.currency === 'EUR' ? '€' : sub.currency}</span>
                            <span class="block text-[11px] text-slate-400">/${sub.billing_cycle === 'yearly' ? 'año' : sub.billing_cycle === 'weekly' ? 'sem' : 'mes'}</span>
                        </div>
                    </div>

                    <!-- Urgency Pill & Alert Type -->
                    <div class="flex flex-wrap items-center gap-2 my-3">
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}">
                            ${sub.urgency_label}
                        </span>
                        <span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700/60 flex items-center gap-1">
                            ${alertBadgeText} (${sub.alert_days_before}d antes a las ${sub.alert_time})
                        </span>
                    </div>

                    <!-- Cycle Progress Bar -->
                    <div class="mt-2 mb-4">
                        <div class="flex justify-between text-[11px] text-slate-400 mb-1">
                            <span>Vence: <strong class="text-slate-200">${sub.renewal_date}</strong></span>
                            <span>${sub.days_left < 0 ? 'Vencido' : `${sub.days_left} días restantes`}</span>
                        </div>
                        <div class="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/40">
                            <div class="h-full rounded-full transition-all duration-500" 
                                 style="width: ${sub.progress_pct}%; background-color: ${sub.urgency_color}">
                            </div>
                        </div>
                    </div>

                    ${sub.notes ? `<p class="text-xs text-slate-400 italic bg-slate-800/40 p-2 rounded-lg border border-slate-800 mb-4 line-clamp-2">"${sub.notes}"</p>` : ''}
                </div>

                <!-- Action Footer -->
                <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <!-- Simulate Alarm button -->
                    <button type="button" 
                            onclick="app.triggerSubscriptionAlarm(${sub.id})" 
                            class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition flex items-center gap-1.5"
                            title="Probar / Disparar la alarma de esta suscripción ahora">
                        <span>🚨</span> Probar Alarma
                    </button>

                    <div class="flex items-center gap-1">
                        <!-- Renew +1 month -->
                        <button type="button" 
                                onclick="app.renewSubscription(${sub.id})" 
                                class="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/40 transition" 
                                title="Avanzar ciclo de renovación (+1 periodo)">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                        </button>

                        <!-- Edit -->
                        <button type="button" 
                                onclick="app.openEditModal(${sub.id})" 
                                class="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-indigo-400 hover:bg-slate-800 transition" 
                                title="Editar suscripción y avisos">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>

                        <!-- Delete -->
                        <button type="button" 
                                onclick="app.deleteSubscription(${sub.id}, '${sub.name.replace(/'/g, "\\'")}')" 
                                class="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-red-400 hover:bg-slate-800 transition" 
                                title="Eliminar suscripción">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    // ---------------- VISUAL ALERT GENERATOR VIEW ----------------
    renderVisualGenerator() {
        const container = document.getElementById('generator-cards-container');
        if (!container) return;

        const subs = this.subscriptions;
        if (subs.length === 0) {
            container.innerHTML = '<p class="text-slate-400 text-center col-span-full py-8">No hay suscripciones para generar alertas visuales.</p>';
            return;
        }

        container.innerHTML = subs.map(s => {
            const isUrgent = s.urgency === 'critical' || s.urgency === 'expired';
            const urgencyBg = isUrgent ? 'from-rose-900/60 to-slate-900' : 'from-slate-900 to-indigo-950/50';
            const borderCol = isUrgent ? 'border-rose-500/80' : 'border-indigo-500/40';

            return `
            <div id="visual-badge-${s.id}" class="relative overflow-hidden rounded-3xl border-2 ${borderCol} bg-gradient-to-br ${urgencyBg} p-6 shadow-2xl flex flex-col justify-between transition-all hover:scale-[1.02]">
                <!-- Header badge decor -->
                <div class="flex items-center justify-between mb-4">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600/60 text-indigo-200'}">
                        <span>🚨</span> ALERTA DE CADUCIDAD
                    </span>
                    <span class="text-xs text-slate-400 font-mono">ID #${s.id}</span>
                </div>

                <div class="my-4 text-center">
                    <div class="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white shadow-xl" style="background-color: ${s.color}">
                        ${ICONS_MAP[s.icon] || ICONS_MAP['tv']}
                    </div>
                    <h2 class="text-2xl font-black text-white tracking-tight">${s.name}</h2>
                    <div class="text-4xl font-extrabold text-white my-3">
                        ${s.price.toFixed(2)} <span class="text-lg text-indigo-300 font-semibold">${s.currency}</span>
                    </div>
                    <div class="inline-block px-4 py-2 rounded-xl text-sm font-bold shadow-inner ${s.urgency === 'critical' ? 'bg-red-600/30 text-red-300 border border-red-500/50' : 'bg-slate-800 text-slate-200 border border-slate-700'}">
                        ${s.urgency_label} • Vence el ${s.renewal_date}
                    </div>
                </div>

                <!-- Footer with alert configuration info -->
                <div class="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <div>
                        <span class="block text-slate-400 text-[10px] uppercase font-semibold">Configuración de aviso</span>
                        <span>${s.alert_type === 'alarm' ? '🚨 Alarma Sonora' : '🔔 Notificación'} (${s.alert_days_before}d antes)</span>
                    </div>
                    <button type="button" 
                            onclick="app.copyAlertText('${s.name}', '${s.renewal_date}', '${s.price} ${s.currency}')"
                            class="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition flex items-center gap-1">
                        📋 Copiar Alerta
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }

    copyAlertText(name, date, price) {
        const text = `🚨 RECORDATORIO DE SUSCRIPCIÓN\nServicio: ${name}\nVence el: ${date}\nImporte: ${price}\n¡Revisa tu cuenta para renovar o cancelar a tiempo! (Generado con SubAlert)`;
        navigator.clipboard.writeText(text);
        window.notifManager.showToast('¡Texto de la alerta copiado al portapapeles!', 'success');
    }

    // ---------------- UNDO & RESTORE MANAGEMENT ----------------
    pushUndoSnapshot(actionLabel = 'Cambio') {
        const snapshot = JSON.parse(JSON.stringify(this.subscriptions));
        this.undoStack.push({ label: actionLabel, subscriptions: snapshot, timestamp: Date.now() });
        if (this.undoStack.length > 20) {
            this.undoStack.shift(); // Limit to 20 undo steps
        }
        this.updateUndoButtonState();
    }

    updateUndoButtonState() {
        const btn = document.getElementById('btn-undo-change');
        const badge = document.getElementById('undo-count-badge');
        if (!btn) return;

        if (this.undoStack.length > 0) {
            btn.removeAttribute('disabled');
            btn.classList.remove('opacity-40', 'cursor-not-allowed');
            btn.classList.add('hover:bg-slate-700', 'text-slate-200');
            const last = this.undoStack[this.undoStack.length - 1];
            btn.title = `Deshacer: ${last.label} (Ctrl+Z)`;
            if (badge) {
                badge.innerText = this.undoStack.length;
                badge.classList.remove('hidden');
            }
        } else {
            btn.setAttribute('disabled', 'true');
            btn.classList.add('opacity-40', 'cursor-not-allowed');
            btn.classList.remove('hover:bg-slate-700');
            btn.title = 'No hay cambios para deshacer (Ctrl+Z)';
            if (badge) {
                badge.classList.add('hidden');
            }
        }
    }

    async undoLastChange() {
        if (this.undoStack.length === 0) {
            window.notifManager.showToast('No hay cambios recientes para deshacer.', 'info', 2000);
            return;
        }

        const last = this.undoStack.pop();
        this.updateUndoButtonState();

        try {
            const res = await fetch('/api/subscriptions/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptions: last.subscriptions })
            });
            const data = await res.json();
            if (res.ok) {
                window.notifManager.showToast(`✓ Deshecho: "${last.label}".`, 'success', 3000);
                await this.loadSubscriptions();
            } else {
                window.notifManager.showToast(data.error || 'Error al deshacer.', 'error');
            }
        } catch (e) {
            window.notifManager.showToast('Error de red al deshacer cambio.', 'error');
        }
    }

    // ---------------- REINICIAR VALORES ----------------
    confirmResetValues() {
        const modal = document.getElementById('modal-confirm-reset');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    async executeResetValues() {
        document.getElementById('modal-confirm-reset')?.classList.add('hidden');
        
        // Save undo snapshot before resetting so it can be reverted
        this.pushUndoSnapshot('Reiniciar valores por defecto');

        try {
            const res = await fetch('/api/subscriptions/reset', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                window.notifManager.showToast('Valores restablecidos a los iniciales por defecto. (Puedes pulsar "Deshacer" si deseas volver)', 'info', 4000);
                await this.loadSubscriptions();
            } else {
                window.notifManager.showToast(data.error || 'Error al reiniciar.', 'error');
            }
        } catch (e) {
            window.notifManager.showToast('Error al conectar con el servidor.', 'error');
        }
    }

    // ---------------- GUARDAR CAMBIOS ----------------
    async saveAllChanges() {
        const btn = document.getElementById('btn-save-changes');
        const text = document.getElementById('save-btn-text');

        try {
            const res = await fetch('/api/subscriptions/save-all', { method: 'POST' });
            const data = await res.json();

            if (btn && text) {
                const originalText = text.innerText;
                btn.classList.add('bg-emerald-500', 'scale-105');
                text.innerText = '✓ ¡Cambios Guardados!';
                setTimeout(() => {
                    btn.classList.remove('bg-emerald-500', 'scale-105');
                    text.innerText = originalText;
                }, 2000);
            }

            window.notifManager.showToast('¡Todos los datos y configuraciones están guardados en la base de datos!', 'success', 2500);
        } catch (e) {
            window.notifManager.showToast('Error al confirmar guardado.', 'error');
        }
    }

    // ---------------- MODAL FORM HELPERS ----------------
    getFormData() {
        return {
            id: document.getElementById('sub-id').value,
            name: document.getElementById('sub-name').value,
            category: document.getElementById('sub-category').value,
            price: document.getElementById('sub-price').value,
            currency: document.getElementById('sub-currency').value,
            billing_cycle: document.getElementById('sub-cycle').value,
            renewal_date: document.getElementById('sub-renewal-date').value,
            alert_days_before: document.getElementById('sub-alert-days').value,
            alert_time: document.getElementById('sub-alert-time').value,
            alert_type: document.getElementById('sub-alert-type').value,
            alarm_sound: document.getElementById('sub-sound').value,
            icon: document.getElementById('sub-icon').value,
            color: document.getElementById('sub-color').value,
            notes: document.getElementById('sub-notes').value
        };
    }

    setFormData(data) {
        if (!data) return;
        document.getElementById('sub-id').value = data.id || '';
        document.getElementById('sub-name').value = data.name || '';
        document.getElementById('sub-category').value = data.category || 'Streaming Video';
        document.getElementById('sub-price').value = data.price || '';
        document.getElementById('sub-currency').value = data.currency || 'EUR';
        document.getElementById('sub-cycle').value = data.billing_cycle || 'monthly';
        document.getElementById('sub-renewal-date').value = data.renewal_date || '';
        document.getElementById('sub-alert-days').value = data.alert_days_before || 3;
        document.getElementById('sub-alert-time').value = data.alert_time || '09:00';
        document.getElementById('sub-alert-type').value = data.alert_type || 'alarm';
        document.getElementById('sub-sound').value = data.alarm_sound || 'cyber_pulse';
        document.getElementById('sub-icon').value = data.icon || 'tv';
        document.getElementById('sub-color').value = data.color || '#6366f1';
        document.getElementById('sub-notes').value = data.notes || '';
    }

    resetFormFields() {
        document.getElementById('sub-name').value = '';
        document.getElementById('sub-price').value = '';
        document.getElementById('sub-notes').value = '';
        document.getElementById('sub-category').value = 'Streaming Video';
        document.getElementById('sub-cycle').value = 'monthly';
        
        const d = new Date();
        d.setDate(d.getDate() + 30);
        document.getElementById('sub-renewal-date').value = d.toISOString().split('T')[0];
        document.getElementById('sub-alert-days').value = this.user?.default_alert_days || 3;
        document.getElementById('sub-alert-time').value = '09:00';
        document.getElementById('sub-alert-type').value = this.user?.default_alert_type || 'alarm';
        document.getElementById('sub-sound').value = this.user?.alarm_sound || 'cyber_pulse';
        document.getElementById('sub-icon').value = 'tv';
        document.getElementById('sub-color').value = '#6366f1';

        // Enable modal undo button so user can restore if desired
        const btn = document.getElementById('btn-modal-undo');
        if (btn) {
            btn.removeAttribute('disabled');
            btn.classList.remove('opacity-40', 'cursor-not-allowed');
            btn.classList.add('text-indigo-300');
        }

        window.notifManager.showToast('Campos reiniciados a los valores por defecto.', 'info', 2000);
    }

    undoFormChanges() {
        if (this.modalOriginalData) {
            this.setFormData(this.modalOriginalData);
            const btn = document.getElementById('btn-modal-undo');
            if (btn) {
                btn.setAttribute('disabled', 'true');
                btn.classList.add('opacity-40', 'cursor-not-allowed');
                btn.classList.remove('text-indigo-300');
            }
            window.notifManager.showToast('Cambios del formulario deshechos.', 'info', 2000);
        }
    }

    // ---------------- MODAL CREATE / EDIT ----------------
    openAddModal() {
        this.editingSubId = null;
        document.getElementById('modal-sub-title').innerText = 'Nueva Suscripción';
        document.getElementById('sub-form').reset();
        document.getElementById('sub-id').value = '';

        // Default renewal date to 30 days from today
        const d = new Date();
        d.setDate(d.getDate() + 30);
        document.getElementById('sub-renewal-date').value = d.toISOString().split('T')[0];

        // Apply user default alert days & alert type
        document.getElementById('sub-alert-days').value = this.user?.default_alert_days || 3;
        document.getElementById('sub-alert-time').value = '09:00';
        document.getElementById('sub-alert-type').value = this.user?.default_alert_type || 'alarm';
        document.getElementById('sub-sound').value = this.user?.alarm_sound || 'cyber_pulse';
        document.getElementById('sub-color').value = '#6366f1';

        this.modalOriginalData = this.getFormData();
        const undoBtn = document.getElementById('btn-modal-undo');
        if (undoBtn) {
            undoBtn.setAttribute('disabled', 'true');
            undoBtn.classList.add('opacity-40', 'cursor-not-allowed');
            undoBtn.classList.remove('text-indigo-300');
        }

        document.getElementById('modal-subscription').classList.remove('hidden');
    }

    async openEditModal(subId) {
        const sub = this.subscriptions.find(s => s.id === subId);
        if (!sub) return;

        this.editingSubId = subId;
        document.getElementById('modal-sub-title').innerText = `Editar: ${sub.name}`;
        document.getElementById('sub-id').value = sub.id;
        document.getElementById('sub-name').value = sub.name;
        document.getElementById('sub-category').value = sub.category;
        document.getElementById('sub-price').value = sub.price;
        document.getElementById('sub-currency').value = sub.currency;
        document.getElementById('sub-cycle').value = sub.billing_cycle;
        document.getElementById('sub-renewal-date').value = sub.renewal_date;
        document.getElementById('sub-alert-days').value = sub.alert_days_before;
        document.getElementById('sub-alert-time').value = sub.alert_time || '09:00';
        document.getElementById('sub-alert-type').value = sub.alert_type || 'alarm';
        document.getElementById('sub-sound').value = sub.alarm_sound || 'cyber_pulse';
        document.getElementById('sub-icon').value = sub.icon || 'tv';
        document.getElementById('sub-color').value = sub.color || '#6366f1';
        document.getElementById('sub-notes').value = sub.notes || '';

        this.modalOriginalData = this.getFormData();
        const undoBtn = document.getElementById('btn-modal-undo');
        if (undoBtn) {
            undoBtn.setAttribute('disabled', 'true');
            undoBtn.classList.add('opacity-40', 'cursor-not-allowed');
            undoBtn.classList.remove('text-indigo-300');
        }

        document.getElementById('modal-subscription').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('modal-subscription').classList.add('hidden');
    }

    closeAllModals() {
        document.getElementById('modal-subscription')?.classList.add('hidden');
        document.getElementById('modal-settings')?.classList.add('hidden');
        document.getElementById('modal-confirm-reset')?.classList.add('hidden');
        window.notifManager.dismissActiveAlarm();
    }

    async saveSubscription(event) {
        event.preventDefault();
        const data = {
            name: document.getElementById('sub-name').value,
            category: document.getElementById('sub-category').value,
            price: parseFloat(document.getElementById('sub-price').value) || 0,
            currency: document.getElementById('sub-currency').value,
            billing_cycle: document.getElementById('sub-cycle').value,
            renewal_date: document.getElementById('sub-renewal-date').value,
            alert_days_before: parseInt(document.getElementById('sub-alert-days').value) || 3,
            alert_time: document.getElementById('sub-alert-time').value || '09:00',
            alert_type: document.getElementById('sub-alert-type').value,
            alarm_sound: document.getElementById('sub-sound').value,
            icon: document.getElementById('sub-icon').value,
            color: document.getElementById('sub-color').value,
            notes: document.getElementById('sub-notes').value
        };

        const subId = document.getElementById('sub-id').value;
        const isEdit = !!subId;
        const url = isEdit ? `/api/subscriptions/${subId}` : '/api/subscriptions';
        const method = isEdit ? 'PUT' : 'POST';

        // Record undo snapshot before persisting
        this.pushUndoSnapshot(isEdit ? `Editar ${data.name}` : `Añadir ${data.name}`);

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (!res.ok) {
                window.notifManager.showToast(result.error || 'Error al guardar.', 'error');
                return;
            }

            this.closeModal();
            window.notifManager.showToast(result.message || 'Cambios guardados con éxito.', 'success');
            await this.loadSubscriptions();
        } catch (err) {
            window.notifManager.showToast('Error de red al guardar suscripción.', 'error');
        }
    }

    async renewSubscription(subId) {
        // Record undo snapshot before renewing
        const sub = this.subscriptions.find(s => s.id === subId);
        this.pushUndoSnapshot(`Renovar ${sub ? sub.name : 'suscripción'}`);

        try {
            const res = await fetch(`/api/subscriptions/${subId}/renew`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                window.notifManager.showToast(data.message, 'success');
                await this.loadSubscriptions();
                if (window.activeAlarmSub && window.activeAlarmSub.id === subId) {
                    window.notifManager.dismissActiveAlarm();
                }
            } else {
                window.notifManager.showToast(data.error || 'Error al renovar.', 'error');
            }
        } catch (e) {
            window.notifManager.showToast('Error de conexión.', 'error');
        }
    }

    async deleteSubscription(subId, name) {
        if (!confirm(`¿Estás seguro de que deseas eliminar la suscripción "${name}"?`)) {
            return;
        }

        // Record undo snapshot before deleting so it can be restored
        this.pushUndoSnapshot(`Eliminar ${name}`);

        try {
            const res = await fetch(`/api/subscriptions/${subId}`, { method: 'DELETE' });
            if (res.ok) {
                window.notifManager.showToast(`"${name}" eliminada. (Puedes deshacer con el botón Deshacer)`, 'info', 3500);
                await this.loadSubscriptions();
            }
        } catch (e) {
            window.notifManager.showToast('Error al eliminar.', 'error');
        }
    }

    // ---------------- ALARMS & SOUND TESTING ----------------
    testSound(soundName = null) {
        const sound = soundName || document.getElementById('sub-sound')?.value || 'cyber_pulse';
        window.soundEngine.play(sound);
        window.notifManager.showToast(`Reproduciendo tono: "${sound.replace('_', ' ')}"`, 'info', 1800);
    }

    triggerSubscriptionAlarm(subId) {
        const sub = this.subscriptions.find(s => s.id === subId);
        if (sub) {
            window.notifManager.triggerVisualAlarm(sub);
        }
    }

    snoozeActiveAlarm() {
        window.notifManager.dismissActiveAlarm();
        window.notifManager.showToast('Alarma pospuesta por 10 minutos.', 'info');
    }

    renewActiveAlarmSubscription() {
        if (window.activeAlarmSub) {
            this.renewSubscription(window.activeAlarmSub.id);
        }
    }

    // ---------------- USER SETTINGS MODAL ----------------
    openSettingsModal() {
        if (!this.user) return;
        document.getElementById('settings-currency').value = this.user.currency || 'EUR';
        document.getElementById('settings-default-days').value = this.user.default_alert_days || 3;
        document.getElementById('settings-default-type').value = this.user.default_alert_type || 'alarm';
        document.getElementById('settings-sound').value = this.user.alarm_sound || 'cyber_pulse';
        document.getElementById('settings-volume').value = this.user.alarm_volume !== undefined ? this.user.alarm_volume : 0.8;
        document.getElementById('volume-val-display').innerText = `${Math.round((this.user.alarm_volume || 0.8) * 100)}%`;

        document.getElementById('modal-settings').classList.remove('hidden');
    }

    closeSettingsModal() {
        document.getElementById('modal-settings').classList.add('hidden');
    }

    async saveSettings(event) {
        event.preventDefault();
        const settings = {
            currency: document.getElementById('settings-currency').value,
            default_alert_days: parseInt(document.getElementById('settings-default-days').value) || 3,
            default_alert_type: document.getElementById('settings-default-type').value,
            alarm_sound: document.getElementById('settings-sound').value,
            alarm_volume: parseFloat(document.getElementById('settings-volume').value) || 0.8,
            theme: 'dark'
        };

        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (res.ok) {
                this.user = data.user;
                window.soundEngine.setVolume(this.user.alarm_volume);
                this.closeSettingsModal();
                window.notifManager.showToast('Ajustes guardados con éxito.', 'success');
                await this.loadSubscriptions();
            }
        } catch (e) {
            window.notifManager.showToast('Error al guardar ajustes.', 'error');
        }
    }

    async requestDesktopNotifications() {
        await window.notifManager.requestPermission();
    }

    exportCalendarICS() {
        window.open('/api/export/calendar.ics', '_blank');
        window.notifManager.showToast('Descargando archivo de calendario .ICS para Google/Apple/Outlook...', 'info');
    }

    // ---------------- PERIODIC CHECKER ----------------
    startPeriodicChecker() {
        // Runs every 60 seconds while page is open to re-check thresholds
        setInterval(() => {
            if (this.user) {
                this.loadSubscriptions();
            }
        }, 60000);
    }
}

// Start app
window.app = new SubAlertApp();
