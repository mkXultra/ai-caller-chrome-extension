chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openai",
    title: "Send to API",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openai" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "showAIApiResultPopup",
      text: info.selectionText
    });
  }
});
