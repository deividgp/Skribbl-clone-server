import { createServer } from "http";
import { Server } from "socket.io";

const origin = process.env.ORIGIN || "http://localhost:3000";
const port = process.env.PORT || 4000;
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: origin,
        credentials: true
    }
});
const names:string[] = [];
const messages:string[] = [];
let word: string;

io.use((socket: any, next) => {
    socket.username = socket.handshake.auth.username;
    next();
});

io.on("connection", (socket: any) => {
    if (socket.username == undefined)
        return;
    
    names.push(socket.username);
    io.sockets.emit("users", names);

    socket.on('input-change', (data: any) => {
        socket.broadcast.emit('update-input', data)
    });

    socket.on('new_word', (data: any) => {

    });

    socket.on("get_messages", (data: any) => {
        socket.emit("receive_messages", messages);
    });

    socket.on("send_message", (data: any) => {
        socket.broadcast.emit("receive_message", data);
        messages.push(data);
    });

    socket.on("disconnect", () => {
        let index = names.indexOf(socket.username);
        if (index !== -1) {
            names.splice(index, 1);
            io.sockets.emit("users", names);
        }
    });
});

httpServer.listen(port, () => {
    try {
        console.log('Connected')
    }
    catch (error) {
        console.error(`Cannot connect ${error}`)
    }
});

export default io;