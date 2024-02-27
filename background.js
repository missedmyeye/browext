let envVariables; // Declare envVariables outside the function

async function loadEnv() {
  const envUrl = chrome.runtime.getURL('.env');
  const response = await fetch(envUrl);
  const envText = await response.text();
  
  envVariables = {};
  envText.split('\n').forEach(line => {
    const [key, value] = line.split('= ');
    envVariables[key.trim()] = value.trim();
  });

  // Now you can use envVariables.MY_VARIABLE
  console.log(envVariables.WEBSITE_URL);
}

loadEnv();
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.windows.getAll({ populate: true }, function(windows) {
    var isPopupOpen = false;

    var extensionWindow = windows.find(function(window) {
      if (window.type === 'popup' && window.tabs && window.tabs.length > 0) {
        tabUrl = chrome.tabs.query({
          active: true,
          currentWindow: true
        }, function(tabs) {
          var tabUrl = tabs[0].url;
          return tabUrl
        });
        // var tabUrl = window.tabs[0].url;
        console.log(tabUrl); // Print tabUrl to the console
        return true; 
        // .includes('chat.openai.com');
      }
      return false
    });

    if (extensionWindow) {
      chrome.windows.update(extensionWindow.id, { focused: true });
      isPopupOpen = true;
    } else {
      // Replace chatUrl with desired URL instead of ChatGPT
      const chatUrl = envVariables.WEBSITE_URL;
      chrome.windows.create({ url: chatUrl, type: 'popup', width: 400, height: 400, left: 900, top: 50 }, function(popupWindow) {
        chrome.windows.update(popupWindow.id, { focused: true,});
      });
    };
  });
});