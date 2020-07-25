var http = require('http');

var app = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', '*');
    res.writeHead(404, {"Content-Type": "text/plain"});
    res.write("404 Not Found\n");
    res.end();
}).listen(8080);

var io = require('socket.io').listen(app);
// interface Message {
//     event: string,
//     roomId: string
//     value: ?
// }
io.sockets.on('connection', (socket) => {
    socket.on('message', (message) => {
        if (message.event) {
            if (message.event === "login") {
                const room = io.sockets.adapter.rooms[message.roomId];
                if (!room || room.length === 0){
                    socket.join(message.roomId);
                    socket.emit('message', {
                        event: 'create',
                        roomId: message.roomId,
                    });
                } else if (room && room.length >= 1) {
                    socket.emit('message', {
                        event: 'join',
                        roomId: message.roomId,
                    });
                    socket.to(message.roomId).emit('message', {
                        event: 'newConnection',
                        roomId: message.roomId,
                        value: {
                            fromSocketId: socket.id
                        }
                    });
                    socket.join(message.roomId);
                }
            }
            else if (message.event === "offer") {
                if (message.value.toSocketId) {
                    const toSocketId = message.value.toSocketId
                    io.to(toSocketId).emit('message', { 
                        event: 'offer',
                        roomId: message.roomId,
                        value: message.value
                    });
                }
            }
            else if (message.event === "answer") {
                if (message.value.toSocketId) {
                    const toSocketId = message.value.toSocketId
                    io.to(toSocketId).emit('message', { 
                        event: 'answer',
                        roomId: message.roomId,
                        value: message.value
                    });
                }
            }
            else if (message.event === "iceCandidate") {
                if (message.value.toSocketId) {
                    const toSocketId = message.value.toSocketId
                    io.to(toSocketId).emit('message', { 
                        event: 'iceCandidate',
                        roomId: message.roomId,
                        value: message.value
                    });
                }
            }
        }
    });
});