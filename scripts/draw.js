var App = {};
App.sendNick = function(nick) {
    App.socket.emit("nick", nick);
}
App.init = function() {
    // create a canvas element
    App.canvas = document.createElement("canvas");
    App.canvas.height = 400;
    App.canvas.width = 400;
    
    // append canvas element to article
    document.getElementById("drawing").appendChild(App.canvas);

    // drawing settings
    App.ctx = App.canvas.getContext("2d");
    App.ctx.fillstyle = "solid";
    App.ctx.strokeStyle = "#0078ff";
    App.ctx.lineWidth = 5;
    App.ctx.lineCap = "round";

    // whether or not the mouse is pressed
    App.drawing = false;

    // add event listeners
    if (document.addEventListener) {
	App.canvas.addEventListener("mousedown", mouseDown);
	App.canvas.addEventListener("mouseup", mouseUp);
	App.canvas.addEventListener("mousemove", mouseMove);
    }
    else if (document.attachEvent) {
	// for cross-browser support IE8-
	App.canvas.attachEvent("mousedown", mouseDown);
	App.canvas.attachEvent("mouseup", mouseUp);
	App.canvas.attachEvent("mousemove", mouseMove);
    }

    // loads the socket.io-client and connects
    var socket = io();
    App.socket = socket;
    socket.emit("msg", "Hello world!");

    // handle any errors that occur.
    socket.onerror = function(error) {
	console.log('WebSocket Error: ' + error);
    };

    // log whatever message sent by server (this far unused?)
    socket.onmessage = function(e) {
	console.log(e);
    };

    // listen for msg
    socket.on("msg", function(msg) {
	console.log(msg);

	// append message to chat-area	
	var paragraph = document.createElement("p");
	paragraph.appendChild(document.createTextNode(msg));
	document.getElementById("chat-area")
	    .appendChild(paragraph);
    });

    // listen for drawing
    socket.on("draw", function(data) {
	data = JSON.parse(data);

	if (data.type == "mousemove")
	    drawMove(data);
	else if (data.type == "mouseup")
	    drawUp(data);
	else if (data.type == "mousedown")
	    drawDown(data);
	else {
	    // TODO: REMOVE
	    console.log("FAILED DRAW");
	    console.log(data);
	}
    });

    function sendMessage() {
	// send message
	socket.emit("msg", document.getElementById("message").value);
	
	// clear box
	document.getElementById("message").value = "";
    };

    function mouseDown(event) {
	App.drawing = true;

	// start line and emit to other clients
	drawDown(event);
	socket.emit("draw", JSON.stringify({
	    "type": event.type,
	    "clientX": event.clientX,
	    "clientY": event.clientY
	}));
    };

    function mouseUp(event){
	App.drawing = false;
       
	// stop drawing and send to server
	drawUp(event); 
	socket.emit("draw", JSON.stringify({
	    "type": event.type
	}));
    };

    function mouseMove(event) {

	// only draw if the mouse is down
	if (!App.drawing)
	    return;

	// draw the move and emit object to other clients
	drawMove(event);
	socket.emit("draw", JSON.stringify({
	    "type": event.type,
	    "clientX": event.clientX,
	    "clientY": event.clientY
	}));
    };

    function drawUp(event) {
	// close path
	App.ctx.closePath();
    };

    function drawDown(event) {
	// start line
	App.ctx.moveTo(event.clientX, event.clientY);
	App.ctx.beginPath();
    };

    function drawMove(event) {
	// draw the line
	App.ctx.lineTo(event.clientX, event.clientY);
	App.ctx.stroke();
    };

    // send message when enter is pressed
    document.getElementById("message")
	.addEventListener("keyup", function(event) {
	event.preventDefault();
	if (event.which == 13) {
	    sendMessage();
	}
    });
};

// create App on window load
window.onload = App.init;
