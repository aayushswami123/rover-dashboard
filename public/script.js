// Socket.io connection (ensure you have socket.io-client in your project)
let socket;
try {
  socket = io();
  
  // Listen for sensor updates
  socket.on('sensorUpdate', function(data) {
    updateDashboard(data);
  });
  
  // Handle connection errors
  socket.on('connect_error', function() {
    console.log('Connection error');
    updateSystemStatus('offline');
  });
} catch (e) {
  console.error('Socket.io initialization error:', e);
  // Use mock data if socket connection fails
  simulateSensorData();
}

// DOM elements
const batteryElement = document.getElementById('battery');
const batteryLevelElement = document.getElementById('batteryLevel');
const statusIndicatorElement = document.getElementById('statusIndicator');
const temperatureElement = document.getElementById('temperature');
const locationElement = document.getElementById('location');
const humidityElement = document.getElementById('humidity');
const pressureElement = document.getElementById('pressure');
const windSpeedElement = document.getElementById('windSpeed');
const solarRadiationElement = document.getElementById('solarRadiation');
const soilMoistureElement = document.getElementById('soilMoisture');
const uvIndexElement = document.getElementById('uvIndex');
const cameraFeedPlaceholder = document.getElementById('cameraFeedPlaceholder');
const toggleSidebarBtn = document.getElementById('toggleSidebar');

// Camera control buttons
document.getElementById('panLeft').addEventListener('click', () => cameraControl('panLeft'));
document.getElementById('panRight').addEventListener('click', () => cameraControl('panRight'));
document.getElementById('panUp').addEventListener('click', () => cameraControl('panUp'));
document.getElementById('panDown').addEventListener('click', () => cameraControl('panDown'));
document.getElementById('zoomIn').addEventListener('click', () => cameraControl('zoomIn'));
document.getElementById('zoomOut').addEventListener('click', () => cameraControl('zoomOut'));
document.getElementById('takePhoto').addEventListener('click', () => takePhoto());

// Action buttons
document.getElementById('sendCommand').addEventListener('click', () => sendCommand());
document.getElementById('downloadData').addEventListener('click', () => downloadData());
document.getElementById('emergencyStop').addEventListener('click', () => emergencyStop());

// Toggle sidebar on mobile
toggleSidebarBtn.addEventListener('click', () => {
  document.body.classList.toggle('sidebar-open');
});

// Update dashboard with received data
function updateDashboard(data) {
  if (data.battery) {
    const batteryValue = parseFloat(data.battery);
    batteryElement.textContent = `${batteryValue}%`;
    batteryLevelElement.style.width = `${batteryValue}%`;
    
    // Update battery color based on level
    if (batteryValue < 20) {
      batteryLevelElement.className = 'battery-level low-battery';
    } else if (batteryValue < 50) {
      batteryLevelElement.className = 'battery-level medium-battery';
    } else {
      batteryLevelElement.className = 'battery-level';
    }
  }
  
  if (data.status) {
    updateSystemStatus(data.status);
  }
  
  if (data.temperature) {
    temperatureElement.textContent = `${data.temperature}°C`;
  }
  
  if (data.location) {
    locationElement.textContent = data.location;
  }
  
  if (data.humidity) {
    humidityElement.textContent = `${data.humidity}%`;
  }
  
  if (data.pressure) {
    pressureElement.textContent = `${data.pressure} hPa`;
  }
  
  if (data.windSpeed) {
    windSpeedElement.textContent = `${data.windSpeed} m/s`;
  }
  
  if (data.solarRadiation) {
    solarRadiationElement.textContent = `${data.solarRadiation} W/m²`;
  }
  
  if (data.soilMoisture) {
    soilMoistureElement.textContent = `${data.soilMoisture}%`;
  }
  
  if (data.uvIndex) {
    uvIndexElement.textContent = data.uvIndex;
  }
}

// Update system status indicator
function updateSystemStatus(status) {
  statusIndicatorElement.className = 'system-status-indicator';
  
  switch(status) {
    case 'online':
      statusIndicatorElement.classList.add('status-online');
      statusIndicatorElement.innerHTML = '<i class="fas fa-circle"></i> Online';
      break;
    case 'warning':
      statusIndicatorElement.classList.add('status-warning');
      statusIndicatorElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Warning';
      break;
    case 'offline':
      statusIndicatorElement.classList.add('status-offline');
      statusIndicatorElement.innerHTML = '<i class="fas fa-times-circle"></i> Offline';
      break;
    default:
      statusIndicatorElement.classList.add('status-online');
      statusIndicatorElement.innerHTML = '<i class="fas fa-circle"></i> Online';
  }
}

// Simulate rover camera feed
function initCameraFeed() {
  // Remove placeholder after 2 seconds to simulate camera loading
  setTimeout(() => {
    // Create the video element
    const video = document.createElement('video');
    video.id = 'cameraFeed';
    video.autoplay = true;
    video.muted = true;
    video.playsinline = true;
    
    // Replace placeholder with video
    cameraFeedPlaceholder.parentNode.replaceChild(video, cameraFeedPlaceholder);
    
    // Show a message if no real camera feed is available
    video.innerHTML = '<source src="your_camera_feed_url_here" type="video/mp4">';
    video.poster = '/api/placeholder/640/360';
  }, 2000);
}

// Camera control function
function cameraControl(action) {
  console.log(`Camera control: ${action}`);
  if (socket && socket.connected) {
    socket.emit('cameraControl', { action });
    showNotification(`Camera ${action} command sent`);
  } else {
    showNotification('Cannot control camera: offline mode');
  }
}

// Take photo function
function takePhoto() {
  console.log('Taking photo');
  if (socket && socket.connected) {
    socket.emit('takePhoto', {});
    showNotification('Photo captured successfully');
  } else {
    showNotification('Cannot take photo: offline mode');
  }
}

// Send command function
function sendCommand() {
  // This would open a modal or navigate to the command page
  window.location.href = 'commands.html';
}

// Download data function
function downloadData() {
  showNotification('Downloading sensor data...');
  // This would trigger a download in a real application
  setTimeout(() => {
    showNotification('Data downloaded successfully');
  }, 1500);
}

// Emergency stop function
function emergencyStop() {
  if (confirm('Are you sure you want to trigger an emergency stop?')) {
    if (socket && socket.connected) {
      socket.emit('emergencyStop', {});
      showNotification('EMERGENCY STOP ACTIVATED', 'error');
    } else {
      showNotification('Cannot trigger emergency stop: offline mode', 'error');
    }
  }
}

// Simple notification system
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.right = '20px';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '8px';
  notification.style.backgroundColor = type === 'error' ? '#ef4444' : '#10b981';
  notification.style.color = 'white';
  notification.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
  notification.style.zIndex = '1000';
  notification.textContent = message;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}
// Initialize sensor data state
let sensorData = {
  battery: 75,
  status: 'online',
  temperature: 22.5,
  location: 'Grid A-15',
  humidity: 42,
  pressure: 1013,
  windSpeed: 3.2,
  solarRadiation: 750,
  soilMoisture: 28,
  uvIndex: 5.2
};

// Update dashboard function
function updateDashboard(data) {
  document.getElementById('battery').textContent = data.battery.toFixed(1) + '%';
  document.getElementById('status').textContent = data.status;
  document.getElementById('temperature').textContent = data.temperature.toFixed(1) + '°C';
  document.getElementById('location').textContent = data.location;
  document.getElementById('humidity').textContent = data.humidity.toFixed(1) + '%';
  document.getElementById('pressure').textContent = data.pressure + ' hPa';
  document.getElementById('windSpeed').textContent = data.windSpeed.toFixed(1) + ' m/s';
  document.getElementById('solarRadiation').textContent = data.solarRadiation + ' W/m²';
  document.getElementById('soilMoisture').textContent = data.soilMoisture + '%';
  document.getElementById('uvIndex').textContent = data.uvIndex.toFixed(1);
}

// Simulate realistic sensor data with boundaries
function simulateSensorData() {
  // Initial dashboard update
  updateDashboard(sensorData);

  setInterval(() => {
    // Simulate sensor value changes
    sensorData.battery = Math.max(0, sensorData.battery - 0.1);
    sensorData.temperature = Math.min(50, Math.max(-10, sensorData.temperature + (Math.random() * 0.4 - 0.2)));
    sensorData.humidity = Math.min(100, Math.max(0, sensorData.humidity + (Math.random() * 2 - 1)));
    sensorData.pressure = Math.min(1050, Math.max(950, sensorData.pressure + (Math.random() * 1.5 - 0.75)));
    sensorData.windSpeed = Math.min(20, Math.max(0, sensorData.windSpeed + (Math.random() * 0.5 - 0.25)));
    sensorData.solarRadiation = Math.max(0, sensorData.solarRadiation + (Math.random() * 5 - 2.5));
    sensorData.soilMoisture = Math.min(100, Math.max(0, sensorData.soilMoisture + (Math.random() * 1.5 - 0.75)));
    sensorData.uvIndex = Math.min(11, Math.max(0, sensorData.uvIndex + (Math.random() * 0.3 - 0.15)));

    // Update UI with new data
    updateDashboard(sensorData);

    // Simulate status changes if battery is empty
    if (sensorData.battery <= 0) {
      sensorData.status = 'offline';
    }
  }, 1000); // Update every second
}

// Start simulation
simulateSensorData();
