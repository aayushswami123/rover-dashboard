// control.js
let socket;
try {
  socket = io();
  socket.on('connect_error', () => {
    console.log('Connection error');
    showNotification('Socket connection error', 'error');
  });
  // Listen for command log updates from the server
  socket.on('commandLogUpdate', (log) => {
    updateCommandLog(log);
  });
} catch (e) {
  console.error('Socket.io initialization error:', e);
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

function move(direction) {
  console.log(`Move ${direction}`);
  if (socket && socket.connected) {
    socket.emit('command', { command: `MOVE_${direction.toUpperCase()}` });
    showNotification(`Command sent: MOVE_${direction.toUpperCase()}`);
  } else {
    showNotification('Cannot send movement command: offline mode', 'error');
  }
}

function stopMovement() {
  console.log('Stop movement');
  if (socket && socket.connected) {
    socket.emit('command', { command: 'STOP' });
    showNotification('Command sent: STOP');
  } else {
    showNotification('Cannot send stop command: offline mode', 'error');
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
        showNotification('Cannot send command: offline mode', 'error');
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

function updateSpeedValue(value) {
  const speedValue = document.getElementById('speedValue');
  if (speedValue) {
    speedValue.textContent = value;
  }
}

// Update the command log display
function updateCommandLog(log) {
  const logContainer = document.getElementById('commandLog');
  if (!logContainer) return;
  
  // Clear existing log entries
  logContainer.innerHTML = '';
  
  // Add each log entry to the container
  log.forEach(entry => {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'log-time';
    timeSpan.textContent = entry.time;
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'log-message';
    messageSpan.textContent = entry.command;
    
    logEntry.appendChild(timeSpan);
    logEntry.appendChild(messageSpan);
    
    logContainer.appendChild(logEntry);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-open');
    });
  }
  
  const sendCommandBtn = document.getElementById('sendCommand');
  if (sendCommandBtn) {
    sendCommandBtn.addEventListener('click', sendCommand);
  }
  
  const moveForwardBtn = document.getElementById('moveForward');
  const moveBackwardBtn = document.getElementById('moveBackward');
  const moveLeftBtn = document.getElementById('moveLeft');
  const moveRightBtn = document.getElementById('moveRight');
  const stopMovementBtn = document.getElementById('stopMovement');
  
  if (moveForwardBtn) moveForwardBtn.addEventListener('click', () => move('forward'));
  if (moveBackwardBtn) moveBackwardBtn.addEventListener('click', () => move('backward'));
  if (moveLeftBtn) moveLeftBtn.addEventListener('click', () => move('left'));
  if (moveRightBtn) moveRightBtn.addEventListener('click', () => move('right'));
  if (stopMovementBtn) stopMovementBtn.addEventListener('click', stopMovement);
  
  const speedControlSlider = document.getElementById('speedControl');
  if (speedControlSlider) {
    speedControlSlider.addEventListener('input', (e) => {
      updateSpeedValue(e.target.value);
      if (socket && socket.connected) {
        socket.emit('command', { command: `SPEED_${e.target.value}` });
        showNotification(`Speed set to ${e.target.value}`);
      }
    });
  }
  
  const downloadDataBtn = document.getElementById('downloadData');
  if (downloadDataBtn) {
    downloadDataBtn.addEventListener('click', downloadData);
  }
  
  const emergencyStopBtn = document.getElementById('emergencyStop');
  if (emergencyStopBtn) {
    emergencyStopBtn.addEventListener('click', emergencyStop);
  }
});
