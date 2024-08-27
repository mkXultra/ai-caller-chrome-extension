let popup = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showTranslationPopup") {
    showPopup(request.text);
  }
});

function showPopup(text) {
  if (popup) {
    popup.remove();
  }

  popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    padding: 10px;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 10000;
  `;

  popup.innerHTML = `
    <h3>Translation</h3>
    <p id="translatedText">Translating...</p>
    <button id="closePopup">Close</button>
  `;

  document.body.appendChild(popup);

  document.getElementById('closePopup').addEventListener('click', () => {
    popup.remove();
  });

  callOpenAIAPI(text).then(response => {
    console.log("response",response);
    document.getElementById('translatedText').textContent = response;
  });
}
