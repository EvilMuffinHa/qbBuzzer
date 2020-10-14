var socket = io();

code = document.getElementById("code").value;
name = document.getElementById("name").value;
kickurl = document.getElementById("kick").value;

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

socket.on("player_join_event", function(data) {
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
		playerLink.appendChild(document.createTextNode(keys[key]));
		playerDisplay.appendChild(playerLink);
		playerDisplay.appendChild(document.createElement("br"));
		div.appendChild(playerDisplay);
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

})

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
	console.log("leave")
	socket.emit("leave", {"username": name, "room": code, "_gid": ""});
}

