@echo off
title SubAlert - Generador de Alertas de Suscripciones
echo ========================================================
echo    SubAlert - Servidor de Alertas de Suscripciones
echo ========================================================
echo.

set PYTHON_CMD="C:\Users\sergi\AppData\Local\Python\bin\python3.exe"

if exist %PYTHON_CMD% (
    echo Usando Python 3.14 detectado...
    %PYTHON_CMD% app.py
) else (
    echo Usando python de sistema...
    python app.py
)

pause
