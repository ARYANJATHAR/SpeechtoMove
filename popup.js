// DOM elements
let toggleButton;
let statusIndicator;
let statusText;
let autoStartCheckbox;
let sensitivitySelect;
let isRecognitionActive = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  toggleButton = document.getElementById('toggle-recognition');
  statusIndicator = document.getElementById('status-indicator');
  statusText = document.getElementById('status-text');
  autoStartCheckbox = document.getElementById('auto-start');
  sensitivitySelect = document.getElementById('sensitivity');

  // Update UI based on recognition status
  function updateUI(active) {
    isRecognitionActive = active;
    toggleButton.textContent = active ? 'Stop Listening' : 'Start Listening';
    toggleButton.className = `primary-button ${active ? 'active' : ''}`;
    statusIndicator.className = `status-indicator ${active ? 'active' : ''}`;
    statusText.textContent = active ? 'Listening...' : 'Not listening';
  }

  // Show error message
  function showError(message) {
    statusText.textContent = message;
    statusIndicator.className = 'status-indicator error';
    
    // Reset after 3 seconds
    setTimeout(() => {
      statusText.textContent = isRecognitionActive ? 'Listening...' : 'Not listening';
      statusIndicator.className = `status-indicator ${isRecognitionActive ? 'active' : ''}`;
    }, 3000);
  }

  // Handle toggle button click
  toggleButton.addEventListener('click', function() {
    const action = isRecognitionActive ? 'stopRecognition' : 'startRecognition';
    
    chrome.runtime.sendMessage({ action: action }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
        showError('Error: ' + chrome.runtime.lastError.message);
        return;
      }
      
      if (response && response.success) {
        updateUI(!isRecognitionActive);
      } else {
        showError('Error: ' + (response?.error || 'Failed to start/stop recognition'));
      }
    });
  });

  // Save settings when changed
  autoStartCheckbox.addEventListener('change', function() {
    chrome.storage.local.set({ autoStart: this.checked });
  });

  sensitivitySelect.addEventListener('change', function() {
    chrome.storage.local.set({ sensitivity: this.value });
  });

  // Load saved settings
  chrome.storage.local.get(['autoStart', 'sensitivity'], function(result) {
    autoStartCheckbox.checked = result.autoStart || false;
    sensitivitySelect.value = result.sensitivity || 'medium';
  });

  // Check initial status
  chrome.runtime.sendMessage({ action: 'getStatus' }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('Error sending message:', chrome.runtime.lastError);
      showError('Error: ' + chrome.runtime.lastError.message);
      return;
    }
    
    if (response) {
      updateUI(response.isActive);
    }
  });

  // Listen for status updates from background script
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.action === 'showStatus') {
      statusText.textContent = message.message;
      statusIndicator.className = 'status-indicator error';
      
      // Reset after 3 seconds
      setTimeout(() => {
        statusText.textContent = isRecognitionActive ? 'Listening...' : 'Not listening';
        statusIndicator.className = `status-indicator ${isRecognitionActive ? 'active' : ''}`;
      }, 3000);
    }
  });
});

// Start voice recognition
function startRecognition() {
  chrome.runtime.sendMessage({action: 'startRecognition'}, function(response) {
    if (response && response.success) {
      updateStatus(true);
    } else {
      showError('Failed to start recognition');
    }
  });
}

// Stop voice recognition
function stopRecognition() {
  chrome.runtime.sendMessage({action: 'stopRecognition'}, function(response) {
    if (response && response.success) {
      updateStatus(false);
    } else {
      showError('Failed to stop recognition');
    }
  });
}

// Update UI based on recognition status
function updateStatus(active) {
  isRecognitionActive = active;
  
  if (active) {
    toggleButton.textContent = 'Stop Listening';
    toggleButton.className = 'primary-button active';
    statusIndicator.className = 'status-indicator active';
    statusText.textContent = 'Listening...';
  } else {
    toggleButton.textContent = 'Start Listening';
    toggleButton.className = 'primary-button';
    statusIndicator.className = 'status-indicator inactive';
    statusText.textContent = 'Not listening';
  }
}

// Show error message in status
function showError(message) {
  statusText.textContent = message;
  statusIndicator.className = 'status-indicator error';
  
  setTimeout(() => {
    updateStatus(isRecognitionActive);
  }, 3000);
}