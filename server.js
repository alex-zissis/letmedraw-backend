const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = require('socket.io')(server);
const uuidv4 = require('uuid/v4');

server.on('listening', () => {
    console.log(`Server is running on port ${port}`);
});
server.listen(port);

let userCount = 0;

let users = [];

io.on('connection', function (socket) {
    // generate an ID
    // send to the thing that connected their ID
    // store the ID on the server
    // send the ID in the data packet

    const id = uuidv4();
    users.push(id);
    userCount++;
    socket.emit('welcome', { userCount: userCount, id: id });

    socket.on('draw', function (data) {
        console.log(data);
        io.emit('remoteDraw', data);
    });

    socket.on('start', function (data) {
        console.log(data);
        io.emit('remoteStart', data);
    });

    socket.on('end', function (data) {
        console.log(data);
        io.emit('remoteEnd', data);
    });
});




io.on('disconnect', function () {
    console.log('Got disconnect!');
    userCount--;
});

module.exports = server;
