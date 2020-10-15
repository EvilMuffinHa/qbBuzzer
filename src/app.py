from flask import *
from random import randint as rint
from src.config import Config
from src.host import HostForm
from src.join import JoinForm
from src.sec import gencode, dohash, whitelist
from logging.config import dictConfig
from flask_socketio import SocketIO, emit, join_room, leave_room
import json
from dotenv import load_dotenv

load_dotenv()

# Loading logging preferences
with open("src/logger.json", "r") as f:
	dconf = json.load(f)

# Establishing logger
dictConfig(dconf)

# Loading flask app
app = Flask(__name__)
app.logger.info("Flask app loaded at " + __name__)
app.config.from_object(Config)


# Version allows css / js to load instead of taking hours to update even on run smh
version = rint(0, 300000000)

# games
games = {}


# home
@app.route('/')
def home():
	return render_template('index.html', version=str(version))


# creating a room for players to join
@app.route("/host", methods=["GET", "POST"])
def host():
	form = HostForm()
	if form.validate_on_submit():
		hostcode = gencode(64)
		hash = dohash(hostcode)
		resp = redirect(url_for("play", hash=hash))
		resp.set_cookie("_gid", str(hostcode))
		with open("src/templates/games.json", "r") as f:
			tmp = json.load(f)
		games[hash] = tmp
		games[hash]["hostcode"] = hostcode
		games[hash]["tossup"] = form.tossup.data
		games[hash]["bonus"] = form.bonus.data
		games[hash]["power"] = form.power.data
		games[hash]["negs"] = form.negs.data
		app.logger.debug("Game host at %s", hostcode)
		app.logger.info("Game created at %s", hash)
		session.permanent = True
		return resp

	with open("src/templates/games.json", "r") as f:
		tmp = json.load(f)
	default = [tmp["tossup"], tmp["bonus"], tmp["power"], tmp["negs"]]
	return render_template('host.html', title="Host Game", version=str(version), form=form, default=default)


# Inside the room itself
@app.route("/play/<hash>")
def play(hash):
	if hash in games.keys():
		if dohash(request.cookies.get('_gid')) == hash:
			return render_template('gamehost.html', version=str(version), gamecode=hash)
		else:
			if "name" in request.cookies:
				name = request.cookies.get("name")
				return render_template('play.html', version=str(version), gamecode=hash, username=name)
			else:
				return render_template('please.html', version=str(version))
	else:
		abort(404)


@app.route("/kick")
def kick():
	return render_template('kick.html', version=str(version))


# When players attempt to join a room
@app.route("/join", methods=["GET", "POST"])
def join():
	form = JoinForm()
	if form.validate_on_submit():
		wlist = whitelist()
		if (not all([a in wlist for a in form.name.data])) or (len(form.name.data) > 12):
			return render_template('badname.html', title='Join Game', version=str(version))
		hash = form.roomcode.data
		if hash in games.keys():
			if form.name.data in games[hash]["players"].keys():
				return render_template('nametaken.html', title='Join Game', version=str(version))
			games[hash]["players"][form.name.data] = 0
			resp = redirect(url_for("play", hash=hash))
			resp.set_cookie("_gid", "")
			resp.set_cookie("name", form.name.data)
			return resp
		else:
			return render_template('gamenotfound.html', title="Join Game", version=str(version))
	session.permanent = True
	return render_template('join.html', title="Join Game", version=str(version), form=form)


# If someone visits somethin stupid
@app.errorhandler(404)
def page_not_found(e):
	return render_template('404.html'), 404


# Connecting socketio for all socketio functions below
socketio = SocketIO(app)


#    |
#    V





# Checks when a player / host joins the room
@socketio.on('join')
def on_join(data):
	room = data['room']
	if room not in games.keys():
		return render_template('gamenotfound.html', title="Join Game", version=str(version))
	username = ""
	if "username" in data.keys():
		username = data['username']
	else:
		gid = data["_gid"]
		if dohash(gid) == room:
			username = "host"
	join_room(str(room))
	msg = {"locked": games[room]["locked"], "players": games[room]["players"]}
	emit('player_join_event', msg, room=room)


# When the host sends data to server
@socketio.on('host')
def host_msg(data):
	room = data["room"]
	gid = data["_gid"]
	if room not in games.keys():
		return render_template('gamenotfound.html', title="Join Game", version=str(version))
	if dohash(gid) != room:  # Check if the host is really the host
		return
	msg = data["data"]
	if "lock" in msg.keys():
		games[room]["locked"] = True
		emit("locked_event", msg, room=room)
	elif "unlock" in msg.keys():
		games[room]["locked"] = False
		emit("unlocked_event", msg, room=room)
	elif "kick" in msg.keys():
		msg["url"] = url_for('kick')
		username = msg["kick"]
		del games[room]["players"][username]
		emit("player_kick_event", msg, room=room)
	elif "close" in msg.keys():
		emit("host_leave_event", {"host": 0}, room=room)
	elif "tossup" in msg.keys():
		if games[room]["buzzed"] == "":
			return
		games[room]["players"][games[room]["buzzed"]] += games[room]["tossup"]
		username = games[room]["buzzed"]
		games[room]["buzzed"] = ""
		emit("update_score_event", {"username":username, "players": games[room]["players"]}, room=room)
		emit("unlocked_event", {}, room=room)
	elif "bonus" in msg.keys():
		if games[room]["buzzed"] == "":
			return
		games[room]["players"][games[room]["buzzed"]] += games[room]["bonus"]
		username = games[room]["buzzed"]
		games[room]["buzzed"] = ""
		emit("update_score_event", {"username":username, "players": games[room]["players"]}, room=room)
		emit("unlocked_event", {}, room=room)
	elif "power" in msg.keys():
		if games[room]["buzzed"] == "":
			return
		games[room]["players"][games[room]["buzzed"]] += games[room]["power"]
		username = games[room]["buzzed"]
		games[room]["buzzed"] = ""
		emit("update_score_event", {"username":username, "players": games[room]["players"]}, room=room)
		emit("unlocked_event", {}, room=room)
	elif "negs" in msg.keys():
		if games[room]["buzzed"] == "":
			return
		games[room]["players"][games[room]["buzzed"]] -= games[room]["negs"]
		username = games[room]["buzzed"]
		games[room]["buzzed"] = ""
		emit("update_score_event", {"username":username, "players": games[room]["players"]}, room=room)
		emit("unlocked_event", {}, room=room)

# When the player buzzes
@socketio.on('buzz')
def buzz(data):
	room = data["room"]
	if room not in games.keys():
		return render_template('gamenotfound.html', title="Join Game", version=str(version))
	if not games[room]["locked"]:
		games[room]["buzzed"] = data["username"]
		emit("buzz_event", data, room=room)  # Just send it back
		emit("locked_event", {}, room=room)


# When a player / host leaves
@socketio.on('leave')
def on_leave(data):
	room = data['room']
	if room not in games.keys():
		return render_template('gamenotfound.html', title="Join Game", version=str(version))
	username = ""
	if "username" in data.keys():
		username = data['username']
	else:
		gid = data["_gid"]
		if dohash(gid) == room:
			leave_room(str(room))
			emit('host_leave_event', {'host': 0}, room=room)
			return
	del games[room]["players"][username]
	leave_room(str(room))
	emit('player_leave_event', {"player": username}, room=room)


# Run the thing lol
if __name__ == "__main__":
	socketio.run(app, host="0.0.0.0", port=25565)
# app.run(host="127.0.0.1", port=25565)
