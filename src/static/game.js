var socket = io();

code = document.getElementById("code").value;
name = document.getElementById("name").value;
kickurl = document.getElementById("kick").value;
hostleave = document.getElementById("hostleave").value;

function removeAllChildren(e) {
	var child = e.lastElementChild;
	while (child) {
		e.removeChild(child);
		child = e.lastElementChild;
	}
}

socket.on("connect", function() {
	// when client first connects to a game
	socket.emit("join", {"username": name, "room": code, "_gid": ""});
})

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
		playerDisplay.appendChild(playerLink);
		playerDisplay.appendChild(playerPoints);
		playerDisplay.appendChild(document.createElement("br"));
		div.appendChild(playerDisplay);
	}
	locked = datas["locked"]
	if (locked) {
		lock();
	}

});

socket.on("player_leave_event", function(data) {
	var element = document.getElementById(data["player"]);
	element.parentNode.removeChild(element);
});

socket.on("player_kick_event", function(data) {
	if (data["kick"] == name) {
		window.location = kickurl;
	} else {
		var element = document.getElementById(data["kick"]);
		element.parentNode.removeChild(element);
	}

});

socket.on("host_leave_event", function(data) {
	window.location = hostleave;
})

socket.on("buzz_event", function(data) {
	var audio = new Audio('/static/buzz.mp3');
	audio.play();
	var player = data["username"];
	document.getElementById(player).childNodes[0].style.color = "#2c26e2";
	document.getElementById(player).childNodes[1].style.color = "#2c26e2";
	document.getElementById(player).childNodes[0].style.color = "#2c26e2";
	var buzztext = document.createElement("p");
	buzztext.setAttribute("id", player + "_buzz");
	buzztext.innerHTML = "[BUZZ] "
	buzztext.style.color = "#2c26e2";
	document.getElementById(player).insertBefore(buzztext, document.getElementById(player).childNodes[0]);
	document.getElementById(player).childNodes[1].style.color = "#2c26e2";
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
		playerDisplay.appendChild(playerLink);
		playerDisplay.appendChild(playerPoints);
		playerDisplay.appendChild(document.createElement("br"));
		div.appendChild(playerDisplay);
	}
})

socket.on("locked_event", function(data) {
	lock();
})
socket.on("unlocked_event", function(data) {
	unlock();
})

function lock() {
	var button = document.getElementById("b_buzzer");
	button.innerHTML = "LOCKED";
}

function unlock() {
	var button = document.getElementById("b_buzzer");
	button.innerHTML = "BUZZ! [SPACE]";
}

function buzz() {
	// when client hits buzz
	socket.emit("buzz", {"username": name, "room": code, "_gid": ""});
}

$(document).on('keypress', function(e) {
	if (e.key === ' ' || e.key === 'Spacebar') {
		e.preventDefault();
		buzz();
	}
})

window.onbeforeunload = function leave() {
	// when client leaves
	socket.emit("leave", {"username": name, "room": code, "_gid": ""});
}

