// Socket.io connection
let socket;
try {
  socket = io();
  socket.on('sensorUpdate', function(data) {
    updateDashboard(data);
  });
  socket.on('connect_error', function() {
    console.log('Connection error');
    updateSystemStatus('offline');
  });
} catch (e) {
  console.error('Socket.io initialization error:', e);
  simulateSensorData();
}

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
const toggleSidebarBtn = document.getElementById('toggleSidebar');

// Event listeners for actions (if present)
if (document.getElementById('sendCommand')) {
  document.getElementById('sendCommand').addEventListener('click', sendCommand);
}
if (document.getElementById('downloadData')) {
  document.getElementById('downloadData').addEventListener('click', downloadData);
}
if (document.getElementById('emergencyStop')) {
  document.getElementById('emergencyStop').addEventListener('click', emergencyStop);
}
if (document.getElementById('goToControl')) {
  document.getElementById('goToControl').addEventListener('click', () => {
    window.location.href = 'control.html';
  });
}
if (toggleSidebarBtn) {
  toggleSidebarBtn.addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });
}

function updateDashboard(data) {
  if (data.battery && batteryElement) {
    const batteryValue = parseFloat(data.battery);
    batteryElement.textContent = `${batteryValue.toFixed(1)}%`;
    if (batteryLevelElement) {
      batteryLevelElement.style.width = `${batteryValue}%`;
      if (batteryValue < 20) {
        batteryLevelElement.className = 'battery-level low-battery';
      } else if (batteryValue < 50) {
        batteryLevelElement.className = 'battery-level medium-battery';
      } else {
        batteryLevelElement.className = 'battery-level';
      }
    }
  }
  if (data.status) {
    updateSystemStatus(data.status);
  }
  if (data.temperature && temperatureElement) {
    temperatureElement.textContent = `${data.temperature.toFixed(1)}°C`;
  }
  if (data.location && locationElement) {
    locationElement.textContent = data.location;
  }
  if (data.humidity && humidityElement) {
    humidityElement.textContent = `${data.humidity.toFixed(1)}%`;
  }
  if (data.pressure && pressureElement) {
    pressureElement.textContent = `${data.pressure} hPa`;
  }
  if (data.windSpeed && windSpeedElement) {
    windSpeedElement.textContent = `${data.windSpeed.toFixed(1)} m/s`;
  }
  if (data.solarRadiation && solarRadiationElement) {
    solarRadiationElement.textContent = `${data.solarRadiation} W/m²`;
  }
  if (data.soilMoisture && soilMoistureElement) {
    soilMoistureElement.textContent = `${data.soilMoisture}%`;
  }
  if (data.uvIndex && uvIndexElement) {
    uvIndexElement.textContent = data.uvIndex.toFixed(1);
  }
}

function updateSystemStatus(status) {
  if (!statusIndicatorElement) return;
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

function sendCommand() {
  const commandInput = document.getElementById('commandInput');
  if (commandInput) {
    const command = commandInput.value.trim();
    if (command) {
      console.log(`Sending command: ${command}`);
      if (socket && socket.connected) {
        socket.emit('command', { command });
        showNotification(`Command sent: ${command}`);
        commandInput.value = '';
      } else {
        showNotification('Cannot send command: offline mode');
      }
    } else {
      showNotification('Please enter a command', 'error');
    }
  }
}

function downloadData() {
  showNotification('Downloading sensor data...');
  fetch('/downloadData')
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sensorData.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showNotification('Data downloaded successfully');
    })
    .catch(err => {
      console.error('Download failed', err);
      showNotification('Download failed', 'error');
    });
}

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

function showNotification(message, type = 'info') {
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
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 3000);
}

// Fallback simulation if socket fails
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

function simulateSensorData() {
  updateDashboard(sensorData);
  setInterval(() => {
    sensorData.battery = Math.max(0, sensorData.battery - 0.1);
    sensorData.temperature = Math.min(50, Math.max(-10, sensorData.temperature + (Math.random() * 0.4 - 0.2)));
    sensorData.humidity = Math.min(100, Math.max(0, sensorData.humidity + (Math.random() * 2 - 1)));
    sensorData.pressure = Math.min(1050, Math.max(950, sensorData.pressure + (Math.random() * 1.5 - 0.75)));
    sensorData.windSpeed = Math.min(20, Math.max(0, sensorData.windSpeed + (Math.random() * 0.5 - 0.25)));
    sensorData.solarRadiation = Math.max(0, sensorData.solarRadiation + (Math.random() * 5 - 2.5));
    sensorData.soilMoisture = Math.min(100, Math.max(0, sensorData.soilMoisture + (Math.random() * 1.5 - 0.75)));
    sensorData.uvIndex = Math.min(11, Math.max(0, sensorData.uvIndex + (Math.random() * 0.3 - 0.15)));
    updateDashboard(sensorData);
    if (sensorData.battery <= 0) {
      sensorData.status = 'offline';
    }
  }, 1000);
}
// Listen for command log updates from the server
if (socket) {
  socket.on('commandLogUpdate', (log) => {
    updateRecentCommands(log);
  });
}

// Function to update the Recent Commands table in index.html
function updateRecentCommands(log) {
  const tableBody = document.getElementById('commandsTableBody');
  if (!tableBody) return;

  // Clear existing rows
  tableBody.innerHTML = '';

  // Loop through the log and create a new row for each command
  log.forEach(entry => {
    const row = document.createElement('tr');
    
    const commandCell = document.createElement('td');
    commandCell.textContent = entry.command;
    
    const timeCell = document.createElement('td');
    timeCell.textContent = entry.time;
    
    const statusCell = document.createElement('td');
    const statusSpan = document.createElement('span');
    // Adjust class based on the status if needed; here we use a default "Completed" style.
    statusSpan.className = 'command-status status-completed';
    statusSpan.textContent = entry.status;
    statusCell.appendChild(statusSpan);
    
    const descriptionCell = document.createElement('td');
    // Optionally, you can customize the description. Here we use a default description.
    descriptionCell.textContent = 'Command sent via dashboard';
    
    row.appendChild(commandCell);
    row.appendChild(timeCell);
    row.appendChild(statusCell);
    row.appendChild(descriptionCell);
    
    tableBody.appendChild(row);
  });
}


simulateSensorData();
