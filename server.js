"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = require("net");
var port = 8080;
var clients = new Map();
var names = new Set();
var messages = [];
var getClientId = function (socket) {
    return "".concat(socket.remoteAddress, "-").concat(socket.remotePort);
};
var broadcastMessage = function (senderId, message) {
    clients.forEach(function (client) {
        if (client.id !== senderId) {
            client.socket.write("".concat(message, "\n"));
        }
    });
    messages.push(message);
};
var nameExists = function (name) {
    console.log("passing in ".concat(name));
    var exists = false;
    clients.forEach(function (client) {
        console.log(client.name);
        if (client.name === name) {
            console.log('returning true');
            exists = true;
            ;
        }
    });
    return exists;
};
var getNames = function () {
    var names = [];
    clients.forEach(function (client) {
        names.push(client.name);
    });
    return names;
};
var server = (0, net_1.createServer)(function (socket) {
    socket.write('Welcome to my chat server! What is your nickname?\n');
    var clientId = getClientId(socket);
    console.log(clients.size);
    var setName = true;
    socket.on('data', function (data) {
        var _a;
        var message = data.toString();
        console.log(message);
        if (setName) {
            if (nameExists(message)) {
                socket.write('That name is in use, try another\n');
            }
            else {
                setName = false;
                socket.write("Welcome to the chat!\n");
                console.log(names.size);
                socket.write("You are connected with ".concat(clients.size, " other users: ").concat(getNames(), "\n"));
                clients.set(clientId, { socket: socket, id: clientId, name: message.trim() });
                names.add(message.trim());
                socket.write('Last 10 messages:\n');
                var lastMessages = messages.slice(-10);
                for (var _i = 0, lastMessages_1 = lastMessages; _i < lastMessages_1.length; _i++) {
                    var mess = lastMessages_1[_i];
                    socket.write(mess);
                }
                broadcastMessage(clientId, "".concat(message.trim(), " has joined the chat"));
            }
        }
        else {
            broadcastMessage(clientId, "".concat((_a = clients.get(clientId)) === null || _a === void 0 ? void 0 : _a.name, ": ").concat(message));
        }
    });
    socket.on('close', function () {
        var _a;
        broadcastMessage(clientId, "".concat((_a = clients.get(clientId)) === null || _a === void 0 ? void 0 : _a.name, " has left the chat"));
        clients.delete(clientId);
        console.log('socket is disconnecting');
    });
});
server.listen(port, function () {
    console.log("Server is listening on port ".concat(port));
});
