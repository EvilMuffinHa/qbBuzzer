var socket = io();

code = document.getElementById("copycode").value;

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
		var removeLink = document.createElement("a");
		removeLink.setAttribute("onclick", "removePlayer('" + keys[key] + "');");
		removeLink.appendChild(document.createTextNode("Kick"));
		playerDisplay.appendChild(playerLink);
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

socket.on("buzz", function(message) {
	var audio = new Audio('/static/buzz.mp3');
	audio.play();
})

