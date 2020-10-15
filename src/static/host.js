var socket = io();

code = document.getElementById("copycode").value;
close_url = document.getElementById("close_url").value;

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

gid = readCookie("_gid");

copycode = function() {
	var copyText = document.getElementById("copycode")
	copyText.select();
	copyText.setSelectionRange(0, 99999);
	document.execCommand("copy")
}

function send(data) {
	socket.emit("host", {"room": code, "_gid": gid, "data": data});
}

function removeAllChildren(e) {
	var child = e.lastElementChild;
	while (child) {
		e.removeChild(child);
		child = e.lastElementChild;
	}
}

socket.on("connect", function() {
	socket.emit("join", {"room": code, "_gid": gid});
});
window.onbeforeunload = function leave() {
	socket.emit("leave", {"room": code, "_gid": gid});
}


socket.on("player_join_event", function(datas) {

	data = datas["players"]
	div = document.getElementById("sidebar");
	removeAllChildren(div);
	if (Object.keys(data).length == 0) {
		var keepSidebarOpen = document.createElement("input");
		keepSidebarOpen.setAttribute("type", "hidden");
		div.appendChild(keepSidebarOpen);
		return
	}
	var keys = Object.keys(data);
	for (var key in keys) {
		var playerDisplay = document.createElement("div");
		playerDisplay.setAttribute("id", keys[key]);
		playerDisplay.setAttribute("class", "playertag");
		var playerLink = document.createElement("p");
		playerLink.appendChild(document.createTextNode(keys[key] + ": "));
		var playerPoints = document.createElement("p");
		playerPoints.setAttribute("id", keys[key] + "_points");
		playerPoints.appendChild(document.createTextNode(data[keys[key]].toString()));
		var removeLink = document.createElement("a");
		removeLink.setAttribute("onclick", "removePlayer('" + keys[key] + "');");
		removeLink.appendChild(document.createTextNode("Kick"));
		playerDisplay.appendChild(playerLink);
		playerDisplay.appendChild(playerPoints);
		playerDisplay.appendChild(removeLink);
		playerDisplay.appendChild(document.createElement("br"));
		div.appendChild(playerDisplay);
	}
});

socket.on("player_leave_event", function(data) {
	var element = document.getElementById(data["player"]);
	element.parentNode.removeChild(element);
});

socket.on("player_kick_event", function(data) {
	var element = document.getElementById(data["kick"]);
	element.parentNode.removeChild(element);

})

function removePlayer(playername) {
	send({"kick": playername});
}

function closeGame() {
	send({"close": "game"});

	setTimeout(function(){ window.location = close_url; }, 10);
}

function tossup() {
	send({"tossup": 0});
}
function bonus() {
	send({"bonus": 0});
}

function power() {
	send({"power": 0});
}

function neg() {
	send({"negs": 0});
}

socket.on("buzz_event", function(data) {
	var audio = new Audio('/static/buzz.mp3');
	audio.play();
	var player = data["username"];
	document.getElementById(player).childNodes[0].style.color = "#2c26e2";
	var buzztext = document.createElement("p");
	buzztext.setAttribute("id", player + "_buzz");
	buzztext.innerHTML = "[BUZZ] "
	buzztext.style.color = "#2c26e2";
	document.getElementById(player).insertBefore(buzztext, document.getElementById(player).childNodes[0]);
	document.getElementById(player).childNodes[1].style.color = "#2c26e2";
	game = document.getElementById("game");
	var tossup = document.createElement("a");
	tossup.setAttribute("onclick", "tossup();");
	tossup.setAttribute("id", "tossup");
	tossup.innerHTML = "TOSSUP [T]"
	var bonus = document.createElement("a");
	bonus.setAttribute("onclick", "bonus();");
	bonus.setAttribute("id", "bonus");
	bonus.innerHTML = "BONUS [B]"
	var power = document.createElement("a");
	power.setAttribute("onclick", "power();");
	power.setAttribute("id", "power");
	power.innerHTML = "POWER [P]"
	var negs = document.createElement("a");
	negs.setAttribute("onclick", "neg();");
	negs.setAttribute("id", "negs");
	negs.innerHTML = "NEG [N]"
	game.appendChild(tossup);
	game.appendChild(document.createElement("br"));
	game.appendChild(document.createElement("br"));
	game.appendChild(document.createElement("br"));
	game.appendChild(bonus);
	game.appendChild(document.createElement("br"));
	game.appendChild(document.createElement("br"));
	game.appendChild(document.createElement("br"));
	game.appendChild(power);
	game.appendChild(document.createElement("br"));
	game.appendChild(document.createElement("br"));
	game.appendChild(document.createElement("br"));
	game.appendChild(negs);
	lockBuzzers();

})

socket.on("update_score_event", function(datas) {

	var player = datas["username"];
	document.getElementById(player).childNodes[0].style.color = "";
	document.getElementById(player).childNodes[1].style.color = "";
	var buzztext = document.getElementById(player + "_buzz")
	buzztext.parentNode.removeChild(buzztext);
	data = datas["players"]
	div = document.getElementById("sidebar");
	removeAllChildren(div);
	if (Object.keys(data).length == 0) {
		var keepSidebarOpen = document.createElement("input");
		keepSidebarOpen.setAttribute("type", "hidden");
		div.appendChild(keepSidebarOpen);
		return
	}
	var keys = Object.keys(data);
	for (var key in keys) {
		var playerDisplay = document.createElement("div");
		playerDisplay.setAttribute("id", keys[key]);
		playerDisplay.setAttribute("class", "playertag");
		var playerLink = document.createElement("p");
		playerLink.appendChild(document.createTextNode(keys[key] + ": "));
		var playerPoints = document.createElement("p");
		playerPoints.setAttribute("id", keys[key] + "_points");
		playerPoints.appendChild(document.createTextNode(data[keys[key]].toString()));
		var removeLink = document.createElement("a");
		removeLink.setAttribute("onclick", "removePlayer('" + keys[key] + "');");
		removeLink.appendChild(document.createTextNode("Kick"));
		playerDisplay.appendChild(playerLink);
		playerDisplay.appendChild(playerPoints);
		playerDisplay.appendChild(removeLink);
		playerDisplay.appendChild(document.createElement("br"));
		div.appendChild(playerDisplay);
	}
	document.getElementById("game").innerHTML = "";
	unlockBuzzers();
})

function lockBuzzers() {
	send({"lock": 0});
	var button = document.getElementById("lock_bz");
	button.setAttribute("onclick", "unlockBuzzers();");
	button.innerHTML = "Unlock Buzzers [L]";
}

function unlockBuzzers() {
	send({"unlock": 0});
	var button = document.getElementById("lock_bz");
	button.setAttribute("onclick", "lockBuzzers();");
	button.innerHTML = "Lock Buzzers [L]";
}

$(document).on('keypress', function(e) {
	if (e.key === 'T' || e.key === 't') {
		e.preventDefault();
		tossup();
	} else if (e.key === 'B' || e.key === 'b') {
		e.preventDefault();
		bonus();
	} else if (e.key === 'P' || e.key === 'p') {
		e.preventDefault();
		power();
	} else if (e.key === 'N' || e.key === 'n') {
		e.preventDefault();
		neg();
	} else if (e.key === 'L' || e.key === 'l') {

		var button = document.getElementById("lock_bz");
		if (button.innerHTML === "Unlock Buzzers [L]") {
			unlockBuzzers();
		} else {
			lockBuzzers();
		}
	}
})
