// Initialize environment variables storage
let envVariables = {};

// Listen for installation
self.addEventListener('install', (event) => {
  event.waitUntil(loadEnv());
});

// Activate event listener
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

async function loadEnv() {
  try {
    const envUrl = chrome.runtime.getURL('.env');
    const response = await fetch(envUrl);
    const envText = await response.text();
    
    const envVars = {};
    envText.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      }
    });

    // Store in chrome.storage
    await chrome.storage.local.set({ envVariables: envVars });
    envVariables = envVars; // Keep a local copy
    console.log('Environment variables loaded successfully');
  } catch (error) {
    console.error('Error loading environment variables:', error);
    throw error; // Propagate error for install event
  }
}

// Handle click events
chrome.action.onClicked.addListener(async (tab) => {
  try {
    const windows = await chrome.windows.getAll({ populate: true });
    let existingPopup = windows.find(window => 
      window.type === 'popup' && 
      window.tabs?.[0]?.url?.includes(envVariables.WEBSITE_URL)
    );

    if (existingPopup) {
      await chrome.windows.update(existingPopup.id, { focused: true });
    } else {
      // Get fresh env variables from storage
      const storage = await chrome.storage.local.get('envVariables');
      const chatUrl = storage.envVariables?.WEBSITE_URL || envVariables.WEBSITE_URL;
      
      if (!chatUrl) {
        throw new Error('Website URL not found in environment variables');
      }

      await chrome.windows.create({
        url: chatUrl,
        type: 'popup',
        width: 400,
        height: 400,
        left: 900,
        top: 50
      });
    }
  } catch (error) {
    console.error('Error handling click event:', error);
  }
});

// Optional: Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_ENV') {
    chrome.storage.local.get('envVariables', (result) => {
      sendResponse(result.envVariables || {});
    });
    return true; // Required for async response
  }
});