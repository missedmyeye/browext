// Function to check if popup window exists
async function checkPopupStatus() {
  try {
    const windows = await chrome.windows.getAll({ populate: true });
    const websiteUrl = await getWebsiteUrl();
    
    const existingPopup = windows.find(window => 
      window.type === 'popup' && 
      window.tabs?.[0]?.url?.includes(websiteUrl)
    );

    if (existingPopup) {
      const statusMessage = document.getElementById('status-message');
      if (statusMessage) {
        statusMessage.textContent = 'The pop-up is already open.';
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking popup status:', error);
    return false;
  }
}

// Function to get website URL from environment variables
async function getWebsiteUrl() {
  try {
    const result = await chrome.storage.local.get('envVariables');
    return result.envVariables?.WEBSITE_URL || '';
  } catch (error) {
    console.error('Error getting website URL:', error);
    return '';
  }
}

// Function to open chat window
async function openChatWindow() {
  try {
    const isOpen = await checkPopupStatus();
    
    if (!isOpen) {
      const websiteUrl = await getWebsiteUrl();
      if (!websiteUrl) {
        throw new Error('Website URL not found in environment variables');
      }

      await chrome.windows.create({
        url: websiteUrl,
        type: 'popup',
        width: 400,
        height: 400,
        left: 900,
        top: 50
      });
    } else {
      // Focus the existing window
      const windows = await chrome.windows.getAll({ populate: true });
      const websiteUrl = await getWebsiteUrl();
      const existingPopup = windows.find(window => 
        window.type === 'popup' && 
        window.tabs?.[0]?.url?.includes(websiteUrl)
      );
      
      if (existingPopup) {
        await chrome.windows.update(existingPopup.id, { focused: true });
      }
    }
  } catch (error) {
    console.error('Error opening chat window:', error);
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
      statusMessage.textContent = 'Error opening chat window. Please try again.';
    }
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  const openChatButton = document.getElementById('openChatButton');
  if (openChatButton) {
    openChatButton.addEventListener('click', openChatWindow);
  }

  // Check initial popup status
  checkPopupStatus().catch(error => {
    console.error('Error during initialization:', error);
  });
});