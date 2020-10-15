#!/usr/bin/env bash
source venv/bin/activate
gunicorn -b 0.0.0.0:25565 --workers 4 -k eventlet src.app:app