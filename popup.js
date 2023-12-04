document.addEventListener('DOMContentLoaded', function() {
    var openChatButton = document.getElementById('openChatButton');
    openChatButton.addEventListener('click', function() {
      chrome.extension.getBackgroundPage().chrome.browserAction.onClicked.dispatch();
    });
    
    // Check if the extension pop-up is already open
    chrome.runtime.getBackgroundPage(function(backgroundPage) {
      if (backgroundPage.isPopupOpen) {
        var statusMessage = document.getElementById('status-message');
        statusMessage.textContent = 'The pop-up is already open.';
      }
    });
  });
  