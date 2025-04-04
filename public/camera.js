// camera.js
let socket;
try {
  socket = io();
  socket.on('connect_error', () => {
    console.log('Connection error');
    showNotification('Socket connection error', 'error');
  });
} catch(e) {
  console.error('Socket.io initialization error:', e);
}

function initCameraFeed() {
  const cameraFeedPlaceholder = document.getElementById('cameraFeedPlaceholder');
  if (!cameraFeedPlaceholder) return;
  setTimeout(() => {
    const video = document.createElement('video');
    video.id = 'cameraFeed';
    video.autoplay = true;
    video.muted = true;
    video.playsinline = true;
    cameraFeedPlaceholder.parentNode.replaceChild(video, cameraFeedPlaceholder);
    video.innerHTML = '<source src="your_camera_feed_url_here" type="video/mp4">';
    video.poster = '/api/placeholder/640/360';
  }, 2000);
}

function cameraControl(action) {
  console.log(`Camera control: ${action}`);
  if (socket && socket.connected) {
    socket.emit('cameraControl', { action });
    showNotification(`Camera ${action} command sent`);
  } else {
    showNotification('Cannot control camera: offline mode', 'error');
  }
}

function takePhoto() {
  console.log('Taking photo');
  if (socket && socket.connected) {
    socket.emit('takePhoto', {});
    showNotification('Photo captured successfully');
  } else {
    showNotification('Cannot take photo: offline mode', 'error');
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

document.addEventListener('DOMContentLoaded', () => {
  initCameraFeed();
  const panLeftBtn = document.getElementById('panLeft');
  const panRightBtn = document.getElementById('panRight');
  const panUpBtn = document.getElementById('panUp');
  const panDownBtn = document.getElementById('panDown');
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const takePhotoBtn = document.getElementById('takePhoto');
  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  
  if (panLeftBtn) panLeftBtn.addEventListener('click', () => cameraControl('panLeft'));
  if (panRightBtn) panRightBtn.addEventListener('click', () => cameraControl('panRight'));
  if (panUpBtn) panUpBtn.addEventListener('click', () => cameraControl('panUp'));
  if (panDownBtn) panDownBtn.addEventListener('click', () => cameraControl('panDown'));
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => cameraControl('zoomIn'));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => cameraControl('zoomOut'));
  if (takePhotoBtn) takePhotoBtn.addEventListener('click', () => takePhoto());
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-open');
    });
  }
});
