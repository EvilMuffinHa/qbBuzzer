from flask import *
from random import randint as rint
from src.config import Config
from src.host import HostForm
from src.sec import gencode, dohash
from logging.config import dictConfig
import logging
from flask_socketio import SocketIO
import json

dictConfig({
	'version': 1,
	'formatters': {'default': {
		'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
	}},
	'handlers': {'wsgi': {
		'class': 'logging.StreamHandler',
		'stream': 'ext://flask.logging.wsgi_errors_stream',
		'formatter': 'default'
	}},
	'root': {
		'level': 'INFO',
		'handlers': ['wsgi']
	}
})

app = Flask(__name__)
app.logger.info("Flask app loaded at " + __name__)
app.config.from_object(Config)

app.logger.setLevel(logging.DEBUG)

version = rint(0, 300000000)
games = {}


@app.route('/')
def home():
	return render_template('index.html', version=str(version))


@app.route("/host", methods=["GET", "POST"])
def host():
	form = HostForm()
	if form.validate_on_submit():
		hostcode = gencode(64)
		hash = dohash(hostcode)
		resp = redirect(url_for("play", hash=hash))
		resp.set_cookie("_gid", str(hostcode), httponly=True, secure=True)
		with open("src/templates/games.json", "r") as f:
			tmp = json.load(f)
		games[hash] = tmp
		games[hash]["hostcode"] = hostcode
		games[hash]["tossup"] = form.tossup.data
		games[hash]["bonus"] = form.bonus.data
		games[hash]["power"] = form.power.data
		games[hash]["negs"] = form.negs.data
		games[hash]["teams"] = form.teams.data
		app.logger.debug("Game host at %s", hostcode)
		app.logger.info("Game created at %s", hash)
		return resp
	default = [10, 20, 15, 5]
	return render_template('host.html', title="Host Game", version=str(version), form=form, default=default)


@app.route("/play/<hash>")
def play(hash):
	if hash in games.keys():
		return render_template('play.html', version=str(version))
	else:
		abort(404)


@app.route("/join")
def join():
	return "In progress!"


@app.errorhandler(404)
def page_not_found(e):
	return render_template('404.html'), 404


socketio = SocketIO(app)


@socketio.on('json')
def handle_json(json):
	print('received message: ' + str(json))


if __name__ == "__main__":
	socketio.run(app)
# app.run(host="127.0.0.1", port=25565)
