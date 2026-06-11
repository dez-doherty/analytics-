// Background service worker for extension messaging
// Listens for messages like { type: 'getAttendance' }

self.addEventListener("message", (e) => {
  // service worker messages from pages
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return false;

  if (message.type === "getAttendance") {
    chrome.storage.local.get(["attendance"], (items) => {
      const data = Array.isArray(items?.attendance) ? items.attendance : [];
      sendResponse({ success: true, data });
    });
    return true; // indicate async response
  }

  if (message.type === "refreshAttendance") {
    // Trigger a refresh by sending a runtime message to any listening client.
    // Consumers should call refresh via UI; background can also fetch if needed.
    chrome.storage.local.get(["attendance"], (items) => {
      const data = Array.isArray(items?.attendance) ? items.attendance : [];
      sendResponse({ success: true, data });
    });
    return true;
  }

  return false;
});
