// Voice recognition state
let isRecognitionActive = false;

// List of supported voice commands
const commands = ['up', 'down', 'top', 'bottom', 'page up', 'page down'];

// Handle messages from the popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.action === 'startRecognition') {
    // Forward to active tab's content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs[0] && tabs[0].id) {
        try {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'startRecognition' }, function(response) {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError.message);
              sendResponse({success: false, error: 'Content script not ready. Please refresh the page.'});
              return;
            }
            
            if (response && response.success) {
              isRecognitionActive = true;
              sendResponse({success: true, status: 'started'});
            } else {
              sendResponse({success: false, error: 'Failed to start recognition'});
            }
          });
        } catch (error) {
          console.error('Error:', error);
          sendResponse({success: false, error: 'Failed to communicate with content script'});
        }
      } else {
        sendResponse({success: false, error: 'No active tab found'});
      }
    });
    return true;
  } 
  else if (message.action === 'stopRecognition') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs[0] && tabs[0].id) {
        try {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'stopRecognition' }, function(response) {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError.message);
              sendResponse({success: false, error: 'Content script not ready. Please refresh the page.'});
              return;
            }
            
            if (response && response.success) {
              isRecognitionActive = false;
              sendResponse({success: true, status: 'stopped'});
            } else {
              sendResponse({success: false, error: 'Failed to stop recognition'});
            }
          });
        } catch (error) {
          console.error('Error:', error);
          sendResponse({success: false, error: 'Failed to communicate with content script'});
        }
      } else {
        sendResponse({success: false, error: 'No active tab found'});
      }
    });
    return true;
  }
  else if (message.action === 'getStatus') {
    sendResponse({isActive: isRecognitionActive});
    return true;
  }
});

// Initialize when the extension is loaded
chrome.runtime.onInstalled.addListener(() => {
  console.log('Voice Scroll Controller extension installed');
  
  // Save default settings
  chrome.storage.local.set({
    autoStart: false,
    sensitivity: 'medium'
  });
});