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

  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  popup = document.createElement('div');
  popup.style.cssText = `
    position: absolute;
    left: ${rect.left}px;
    top: ${rect.bottom + window.scrollY}px;
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

  callOpenAIAPI2(text).then(response => {
    console.log("response",response);
    document.getElementById('translatedText').textContent = response;
  });
}

async function callOpenAIAPI2(prompt) {
  try {
    const storageData = await chrome.storage.sync.get('apiKey');
    const apiKey = storageData.apiKey;
    if (!apiKey) {
      throw new Error('API key is not set. Please set it in the extension options.');
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      console.log("data",data);
      return data.choices[0].message.content;
    } else {
      throw new Error("APIからの応答が不正です");
    }
  } catch (error) {
    console.error("OpenAI API呼び出し中にエラーが発生しました:", error);
    return `エラーが発生しました: ${error.message}`;
  }
}
