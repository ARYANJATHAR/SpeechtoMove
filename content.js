// Configuration values
let scrollAmount = 300; // Default scroll amount (pixels)
let recognition = null;
let isRecognitionActive = false;
let retryCount = 0;
const MAX_RETRIES = 3;

// List of supported voice commands
const commands = ['up', 'down', 'top', 'bottom', 'page up', 'page down'];

// Initialize status indicator
function initializeStatusIndicator() {
  const statusDiv = document.createElement('div');
  statusDiv.id = 'voice-scroll-status';
  statusDiv.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    z-index: 10000;
    display: none;
    transition: opacity 0.3s ease-in-out;
  `;
  document.body.appendChild(statusDiv);
  return statusDiv;
}

// Show status message with auto-hide
function showStatus(message, duration = 2000) {
  const statusDiv = document.getElementById('voice-scroll-status') || initializeStatusIndicator();
  statusDiv.textContent = message;
  statusDiv.style.display = 'block';
  statusDiv.style.opacity = '1';
  
  // Hide after duration
  setTimeout(() => {
    statusDiv.style.opacity = '0';
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 300);
  }, duration);
}

// Initialize speech recognition
function initializeRecognition() {
  if (!recognition) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return false;
    }

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.trim().toLowerCase();
      
      console.log('Voice command detected:', command);
      handleScroll(command);
    };

    recognition.onerror = function(event) {
      console.error('Recognition error:', event.error);
      handleRecognitionError(event.error);
    };

    recognition.onend = function() {
      console.log('Recognition ended');
      if (isRecognitionActive) {
        setTimeout(() => {
          startRecognition();
        }, 1000);
      }
    };
  }
  return true;
}

// Handle recognition errors
function handleRecognitionError(error) {
  switch (error) {
    case 'network':
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(() => {
          if (isRecognitionActive) {
            startRecognition();
          }
        }, 2000 * retryCount);
      } else {
        stopRecognition();
        showStatus('Network error. Please check your connection.');
      }
      break;
    case 'audio-capture':
      stopRecognition();
      showStatus('Microphone access error. Please check your microphone settings.');
      break;
    case 'not-allowed':
      stopRecognition();
      showStatus('Microphone access denied. Please allow microphone access.');
      break;
    default:
      stopRecognition();
      showStatus('An error occurred. Please try again.');
  }
}

// Start recognition
function startRecognition() {
  if (initializeRecognition()) {
    try {
      recognition.start();
      isRecognitionActive = true;
      retryCount = 0;
      showStatus('Voice recognition started');
      return true;
    } catch (e) {
      console.error('Start recognition error:', e);
      showStatus('Failed to start recognition');
      return false;
    }
  }
  return false;
}

// Stop recognition
function stopRecognition() {
  if (recognition) {
    try {
      recognition.stop();
      isRecognitionActive = false;
      retryCount = 0;
      showStatus('Voice recognition stopped');
      return true;
    } catch (e) {
      console.error('Stop recognition error:', e);
      return false;
    }
  }
  return false;
}

// Check if we're in a PDF viewer
function isPdfViewer() {
  // Check for various PDF viewer elements
  return (
    document.querySelector('embed[type="application/pdf"]') || 
    document.querySelector('object[type="application/pdf"]') ||
    document.querySelector('iframe[type="application/pdf"]') ||
    document.querySelector('.pdfViewer') ||
    document.querySelector('#viewer') ||
    document.querySelector('#viewerContainer') ||
    document.querySelector('.pdf-page') ||
    window.location.href.toLowerCase().includes('.pdf') ||
    document.querySelector('iframe[src*=".pdf"]') ||
    document.querySelector('iframe[src*="pdfjs"]') ||
    document.querySelector('iframe[src*="chrome-extension"]') ||
    document.querySelector('iframe[src*="moz-extension"]')
  );
}

// Get the scrollable element for the current page
function getScrollableElement() {
  // Check if we're in a PDF viewer
  if (isPdfViewer()) {
    console.log('PDF viewer detected, finding scrollable element');
    
    // Try to find the PDF viewer container
    const pdfViewer = document.querySelector('.pdfViewer') || 
                      document.querySelector('#viewer') || 
                      document.querySelector('#viewerContainer') ||
                      document.querySelector('.pdf-page');
    
    if (pdfViewer) {
      console.log('Found PDF viewer container');
      return pdfViewer;
    }
    
    // Try to find the iframe that might contain the PDF
    const pdfIframe = document.querySelector('iframe[type="application/pdf"]') ||
                      document.querySelector('iframe[src*=".pdf"]') ||
                      document.querySelector('iframe[src*="pdfjs"]') ||
                      document.querySelector('iframe[src*="chrome-extension"]') ||
                      document.querySelector('iframe[src*="moz-extension"]');
    
    if (pdfIframe) {
      console.log('Found PDF iframe');
      try {
        // Try to access the iframe content
        if (pdfIframe.contentDocument) {
          return pdfIframe.contentDocument.documentElement || pdfIframe.contentDocument.body;
        } else if (pdfIframe.contentWindow && pdfIframe.contentWindow.document) {
          return pdfIframe.contentWindow.document.documentElement || pdfIframe.contentWindow.document.body;
        }
      } catch (e) {
        console.error('Error accessing iframe content:', e);
      }
    }
    
    // Try to find the main content area
    const mainContent = document.querySelector('main') || 
                        document.querySelector('#content') || 
                        document.querySelector('.content') ||
                        document.querySelector('article');
    
    if (mainContent) {
      console.log('Found main content area');
      return mainContent;
    }
  }
  
  // Default to window for regular pages
  console.log('Using window as scrollable element');
  return window;
}

// Handle scrolling based on voice commands
function handleScroll(command) {
  console.log('Executing scroll command:', command);
  showStatus(`Command: ${command}`);
  
  const scrollableElement = getScrollableElement();
  const isPdf = isPdfViewer();
  
  // Execute the appropriate scroll action
  switch (command.toLowerCase()) {
    case 'up':
      console.log('Scrolling up');
      try {
        if (isPdf) {
          // For PDFs, try to scroll the PDF viewer
          scrollableElement.scrollBy({
            top: -scrollAmount,
            behavior: 'smooth'
          });
        } else {
          // For regular pages
          window.scrollBy({
            top: -scrollAmount,
            behavior: 'smooth'
          });
        }
      } catch (e) {
        console.error('Scroll error:', e);
        // Fallback to window scroll
        window.scrollBy({
          top: -scrollAmount,
          behavior: 'smooth'
        });
      }
      break;
      
    case 'down':
      console.log('Scrolling down');
      try {
        if (isPdf) {
          // For PDFs, try to scroll the PDF viewer
          scrollableElement.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
        } else {
          // For regular pages
          window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
        }
      } catch (e) {
        console.error('Scroll error:', e);
        // Fallback to window scroll
        window.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        });
      }
      break;
      
    case 'page up':
      console.log('Scrolling page up');
      try {
        if (isPdf) {
          // For PDFs, try to scroll the PDF viewer
          scrollableElement.scrollBy({
            top: -scrollableElement.clientHeight * 0.9,
            behavior: 'smooth'
          });
        } else {
          // For regular pages
          window.scrollBy({
            top: -window.innerHeight * 0.9,
            behavior: 'smooth'
          });
        }
      } catch (e) {
        console.error('Scroll error:', e);
        // Fallback to window scroll
        window.scrollBy({
          top: -window.innerHeight * 0.9,
          behavior: 'smooth'
        });
      }
      break;
      
    case 'page down':
      console.log('Scrolling page down');
      try {
        if (isPdf) {
          // For PDFs, try to scroll the PDF viewer
          scrollableElement.scrollBy({
            top: scrollableElement.clientHeight * 0.9,
            behavior: 'smooth'
          });
        } else {
          // For regular pages
          window.scrollBy({
            top: window.innerHeight * 0.9,
            behavior: 'smooth'
          });
        }
      } catch (e) {
        console.error('Scroll error:', e);
        // Fallback to window scroll
        window.scrollBy({
          top: window.innerHeight * 0.9,
          behavior: 'smooth'
        });
      }
      break;
      
    case 'top':
      console.log('Scrolling to top');
      try {
        if (isPdf) {
          // For PDFs, try to scroll the PDF viewer
          scrollableElement.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        } else {
          // For regular pages
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      } catch (e) {
        console.error('Scroll error:', e);
        // Fallback to window scroll
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      break;
      
    case 'bottom':
      console.log('Scrolling to bottom');
      try {
        if (isPdf) {
          // For PDFs, try to scroll the PDF viewer
          scrollableElement.scrollTo({
            top: scrollableElement.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          // For regular pages
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        }
      } catch (e) {
        console.error('Scroll error:', e);
        // Fallback to window scroll
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }
      break;
      
    default:
      console.log('Unknown command:', command);
      showStatus('Unknown command');
      break;
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === 'startRecognition') {
    const result = startRecognition();
    sendResponse({success: result});
  } else if (request.action === 'stopRecognition') {
    const result = stopRecognition();
    sendResponse({success: result});
  } else if (request.action === 'scroll' && request.command) {
    handleScroll(request.command);
    sendResponse({success: true});
  } else if (request.action === 'showStatus') {
    showStatus(request.message);
    sendResponse({success: true});
  }
  
  return true;
});

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('Voice Scroll content script initialized');
  
  // Load settings
  chrome.storage.local.get(['sensitivity'], (result) => {
    if (result.sensitivity === 'high') {
      scrollAmount = 200;
    } else if (result.sensitivity === 'low') {
      scrollAmount = 400;
    }
  });
  
  // Check if we're in a PDF viewer
  if (isPdfViewer()) {
    console.log('PDF viewer detected on page load');
  }
});