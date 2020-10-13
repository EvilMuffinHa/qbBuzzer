from dotenv import load_dotenv
import os

load_dotenv()


class Config(object):
	SECRET_KEY = os.getenv('SECRET_KEY') or "debug-secret-key-for-testing-only"
