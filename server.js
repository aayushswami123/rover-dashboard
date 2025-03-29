const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Simulate real-time sensor data
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  const sendSensorData = () => {
    const sensorData = {
      battery: Math.floor(Math.random() * 50) + 50,
      status: "Nominal",
      temperature: (Math.random() * 10 + 20).toFixed(2),
      humidity: (Math.random() * 20 + 30).toFixed(2),
      pressure: (Math.random() * 50 + 1000).toFixed(2)
    };
    socket.emit('sensorData', sensorData);
  };

  const intervalId = setInterval(sendSensorData, 1000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(intervalId);
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
