from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv()


class Config(object):
	SECRET_KEY = os.getenv('SECRET_KEY') or "debug-secret-key-for-testing-only"
	PERMANENT_SESSION_LIFETIME = timedelta(days=31)
