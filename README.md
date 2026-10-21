# SubAlert - Generador de Alertas Visuales y Acústicas de Vencimiento de Suscripciones

**SubAlert** es una aplicación web moderna, limpia y estética diseñada para gestionar y monitorizar el vencimiento de tus suscripciones mensuales (Netflix, Spotify, gimnasio, ChatGPT, Amazon Prime, etc.) con alertas visuales y alarmas sonoras personalizadas.

---

## 🚀 Características Principales

### 1. 🔐 Autenticación de Usuarios
- **Registro e Inicio de Sesión**: Guarda tus suscripciones de forma segura y persistente en SQLite.
- **Acceso Rápido Demo (1 Clic)**: Acceso inmediato con suscripciones de ejemplo preconfiguradas (Netflix, Spotify, Gimnasio, etc.) para probar la aplicación al instante.

### 2. 📋 Gestión Completa de Suscripciones
- **Plantillas Rápidas (1 Clic)**: Completa al instante datos de marcas populares como Netflix, Spotify, Basic-Fit/Gimnasio, ChatGPT Plus, Amazon Prime, Disney+, PlayStation Plus, etc.
- **Campos Detallados**: Nombre, categoría, precio, moneda (€, $, etc.), ciclo de facturación (mensual, anual, etc.), fecha de caducidad/renovación, notas y color de marca.
- **Renovación con 1 Clic**: Botón para avanzar el ciclo automáticamente (+1 mes, +1 año) una vez realizado el pago.
- **Guardar Cambios (`💾`)**: Botón para confirmar y sincronizar todos los datos en la base de datos (atajo `Ctrl+S`).
- **Deshacer Último Cambio (`↶`)**: Pila de historial inteligente que permite revertir cualquier adición, edición, borrado, renovación o reinicio al estado anterior (atajo `Ctrl+Z`).
- **Reiniciar Valores (`↺`)**: Botón con ventana de confirmación para restablecer todas las suscripciones a los valores iniciales de ejemplo (guarda punto de restauración automático para poder deshacer si cambias de idea).

### 3. 🚨 Alertas & Alarmas a Medida
- **Elige Cuándo Avisar**:
  - El mismo día del vencimiento
  - 1 día antes
  - 2 días antes
  - 3 días antes (Recomendado)
  - 5 días antes
  - 7 días antes (1 semana)
  - 14 días antes
  - Hora específica para el aviso (ej: 09:00 AM)
- **Elige entre Notificación o Alarma**:
  - 🔔 **Modo Notificación**: Mensaje visual en pantalla (Toast) y notificación de escritorio nativa del navegador (Web Notifications API).
  - 🚨 **Modo Alarma**: Pantalla completa de emergencia con pulso de neón, campana animada y sonido acústico en bucle continuo generado por sintetizador Web Audio.
- **Sintetizador Acústico Web Audio (Sin archivos externos)**:
  - ⚡ *Cyber Pulse* (Sintetizador electrónico moderno)
  - 🚨 *Radar Alert* (Bips de frecuencia creciente)
  - ⏰ *Digital Beep* (Despertador clásico)
  - 🔔 *Campana Zen* (Armónico relajante)
  - 🎵 *Melodía Ascendente* (Arpegio amigable)
  - Control de volumen en tiempo real y botón de prueba ("▶ Probar tono").
  - Botón "Probar Alarma" en cada tarjeta para simular el vencimiento en vivo.

### 4. 🎨 Diseño Limpio, Estético y Visual
- **Semáforo de Urgencia**:
  - 🔴 **Crítico / Vence Hoy o Mañana**: Tarjetas con pulso luminoso y badges de alerta inmediata.
  - 🟡 **Próximo (3 a 7 días)**: Advertencia clara con barra de progreso del ciclo.
  - 🟢 **Seguro (> 7 días)**: Estado relajado.
- **Métricas de Control Financiero**: Gasto mensual total acumulado, proyección anual y recuento de urgencias.
- **Generador de Alertas Visuales**: Vista en formato póster/tarjeta visual para capturar o copiar el recordatorio con 1 clic.
- **Exportación a Calendario (.ICS)**: Descarga tus fechas de cobro con alarmas integradas para Google Calendar, Apple Calendar o Microsoft Outlook.

---


## 📁 Estructura del Proyecto

```
subtrack-app/
├── app.py                     # Servidor Flask, endpoints REST y control de sesiones
├── database.py                # Base de datos SQLite y consultas de suscripciones
├── run.bat                    # Script para inicio en un clic en Windows
├── test_api.py                # Suite de pruebas automatizadas
├── static/
│   ├── css/
│   │   └── style.css          # Animaciones de pulso neón, semáforo y diseño glassmorphism
│   └── js/
│       ├── app.js             # Lógica del cliente, plantillas y renderizado
│       ├── audio.js           # Sintetizador de tonos con Web Audio API
│       └── notifications.js   # Notificaciones nativas y disparador de alarmas
└── templates/
    └── index.html             # Interfaz web principal estética y responsive
```
