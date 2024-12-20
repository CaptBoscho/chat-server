import { Socket, createServer } from 'net';

const port = 8080;

type Client = {
  socket: Socket;
  name: string;
  id: string;
}

const clients = new Map<string, Client>();
const names = new Set<string>();
const messages: string[] = [];

const getClientId = (socket: Socket) => {
  return `${socket.remoteAddress}-${socket.remotePort}`;
}

const broadcastMessage = (senderId: string, message: string) => {
  clients.forEach((client: Client) => {
    if (client.id !== senderId) {
      client.socket.write(`${message}\n`);
    }
  });

  messages.push(message);
}

const nameExists = (name: string) => {
  console.log(`passing in ${name}`);
  let exists = false;
  clients.forEach((client: Client) => {
    console.log(client.name);
    if (client.name === name) {
      console.log('returning true');
      exists = true;;
    }
  });

  return exists;
}

const getNames = () => {
  const names: string[] = [];
  clients.forEach((client: Client) => {
    names.push(client.name);
  })
  return names;
}

const server = createServer(function (socket) {
  socket.write('Welcome to my chat server! What is your nickname?\n');
  const clientId = getClientId(socket);
  
  console.log(clients.size);
  let setName = true;
  socket.on('data', function (data) {
    const message = data.toString();
    console.log(message);
    if (setName) {
      if (nameExists(message)) {
        socket.write('That name is in use, try another\n');
      } else {
        setName = false;
        socket.write(`Welcome to the chat!\n`);
        console.log(names.size);
        socket.write(`You are connected with ${clients.size} other users: ${getNames()}\n`);
        clients.set(clientId, { socket: socket, id: clientId, name: message.trim() });
        names.add(message.trim());
        socket.write('Last 10 messages:\n');
        const lastMessages = messages.slice(-10);
        for (const mess of lastMessages) {
          socket.write(mess);
        }
        broadcastMessage(clientId, `${message.trim()} has joined the chat`);
      }
    } else {
      broadcastMessage(clientId, `${clients.get(clientId)?.name}: ${message}`);
    }
  });

  socket.on('close', () => {
    broadcastMessage(clientId, `${clients.get(clientId)?.name} has left the chat`);
    clients.delete(clientId);
    console.log('socket is disconnecting');
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
