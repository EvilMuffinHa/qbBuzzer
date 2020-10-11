from flask import *
from random import randint as rint

app = Flask(__name__)


@app.route('/')
def home():
	version = rint(0, 300000000)
	return render_template('index.html', version=str(version))


if __name__ == "__main__":
	app.run()
