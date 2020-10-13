var socket = io();
test = function() {
	console.log("h");
	socket.emit('json', {data: 'I\'m connected!'});
}

// div id = game (that's where the game goes)