const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// InfluxDB configuration – replace these with your actual details.
const influxURL = 'http://localhost:8086'; // or your InfluxDB Cloud URL
const influxToken = 'YOUR_INFLUXDB_TOKEN';
const influxOrg = 'YOUR_ORG';
const influxBucket = 'YOUR_BUCKET';

// Create InfluxDB client and write API.
const influxDB = new InfluxDB({ url: influxURL, token: influxToken });
const writeApi = influxDB.getWriteApi(influxOrg, influxBucket, 'ns'); // 'ns' for nanosecond precision
writeApi.useDefaultTags({ host: 'rover-server' });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Global command log array to store all commands.
let commandLog = [];

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Endpoint for data download (returns simulated sensor data and command log)
app.get('/downloadData', (req, res) => {
  const data = {
    sensorData: [
      { timestamp: Date.now(), battery: 75, temperature: 22.5, humidity: 42 },
      { timestamp: Date.now() - 1000, battery: 74, temperature: 22.6, humidity: 42.2 }
    ],
    commands: commandLog
  };
  res.setHeader('Content-Disposition', 'attachment; filename="sensorData.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data, null, 2));
});

// Simulate real-time sensor data and handle commands
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  const sendSensorData = () => {
    const sensorData = {
      battery: Math.floor(Math.random() * 50) + 50,
      status: "online",
      temperature: (Math.random() * 10 + 20).toFixed(1),
      location: 'Grid A-15',
      humidity: (Math.random() * 20 + 30).toFixed(1),
      pressure: Math.floor(Math.random() * 50 + 1000),
      windSpeed: (Math.random() * 5 + 1).toFixed(1),
      solarRadiation: Math.floor(Math.random() * 200 + 600),
      soilMoisture: Math.floor(Math.random() * 40 + 10),
      uvIndex: (Math.random() * 6 + 2).toFixed(1)
    };
    socket.emit('sensorUpdate', sensorData);
  };

  const intervalId = setInterval(sendSensorData, 1000);

  // Handle camera control commands.
  socket.on('cameraControl', (data) => {
    console.log(`Camera control received: ${data.action}`);
    // Add your camera control code here.
  });
  
  // Handle photo capture requests.
  socket.on('takePhoto', () => {
    console.log('Photo capture requested');
    // Add your photo capture code here.
  });
  
  // Handle emergency stop.
  socket.on('emergencyStop', () => {
    console.log('EMERGENCY STOP ACTIVATED');
    // Add your emergency stop code here.
  });

  // Handle manual command events.
  socket.on('command', (data) => {
    const timestamp = new Date();
    const entry = {
      time: timestamp.toLocaleTimeString(),
      command: data.command,
      status: 'Completed'
    };
    commandLog.push(entry);
    console.log('Received command:', data.command);

    // Write the command to InfluxDB.
    const point = new Point('rover_commands')
      .tag('source', 'dashboard')
      .stringField('command', data.command)
      .stringField('status', 'Completed')
      .timestamp(timestamp);
    writeApi.writePoint(point);

    // Broadcast the updated command log to all clients.
    io.emit('commandLogUpdate', commandLog);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(intervalId);
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
