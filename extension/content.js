// Bridge between NovelWeaver Web App and Chrome Extension Background Script

// 1. Listen for requests from the Web App (window.postMessage)
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  // Handle Ping to check if extension is active
  if (event.data.type === "NOVEL_WEAVER_EXTENSION_PING") {
    window.postMessage({ type: "NOVEL_WEAVER_EXTENSION_PONG" }, "*");
  }

  // Handle Fetch Request
  if (event.data.type === "NOVEL_WEAVER_FETCH_REQUEST") {
    const { url, requestId } = event.data;
    
    // Forward to Background Script (which has CORS permissions)
    chrome.runtime.sendMessage({ action: "fetchUrl", url: url }, (response) => {
      // Send result back to Web App
      window.postMessage({
          type: "NOVEL_WEAVER_FETCH_RESPONSE",
          requestId: requestId,
          success: response && response.success,
          html: response ? response.data : null,
          error: response ? response.error : "Unknown extension error"
      }, "*");
    });
  }
});

// Notify that extension is ready immediately upon injection
window.postMessage({ type: "NOVEL_WEAVER_EXTENSION_PONG" }, "*");
console.log("NovelWeaver Scraper Extension Loaded");