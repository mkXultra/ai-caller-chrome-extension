let popup = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showAIApiResultPopup") {
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
    color: black;
  `;

  popup.innerHTML = `
    <h3>OpenAI API Caller</h3>
    <p id="apiResult">loding...</p>
    <button id="closePopup">Close</button>
  `;

  document.body.appendChild(popup);

  document.getElementById('closePopup').addEventListener('click', () => {
    popup.remove();
  });

  document.getElementById('apiResult').textContent = ""; // Clear previous content
  callOpenAIAPI2(text).then(response => {});
}

async function callOpenAIAPI2(text) {
  try {
    const storageData = await chrome.storage.sync.get(['apiKey','systemPrompt','userPrompt']);
    const systemPrompt = storageData.systemPrompt;
    let userPromptTemplate = storageData.userPrompt;
    const apiKey = storageData.apiKey;
    if (!apiKey) {
      throw new Error('API key is not set. Please set it in the extension options.');
    }

    // Replace {text} with the actual prompt
    userPrompt = userPromptTemplate.replace('{text}', text);

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
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 1000,
        stream: true // Enable streaming
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      
      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          const jsonData = JSON.parse(line.slice(6));
          if (jsonData.choices && jsonData.choices[0].delta.content) {
            const content = jsonData.choices[0].delta.content;
            // Update the UI with the new content
            document.getElementById('apiResult').textContent += content;
          }
        }
      }
      
      buffer = lines[lines.length - 1];
    }

    return document.getElementById('apiResult').textContent;
  } catch (error) {
    console.error("OpenAI API呼び出し中にエラーが発生しました:", error);
    return `エラーが発生しました: ${error.message}`;
  }
}

let selectionIcon = null;

document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('selectionchange', handleTextSelection);

function handleTextSelection(event) {
  // Ignore events triggered by our own icon
  if (event.target === selectionIcon) {
    return;
  }

  const selection = window.getSelection();
  if (selection.toString().length > 0) {
    showSelectionIcon(selection);
  } else if (selectionIcon) {
    selectionIcon.remove();
    selectionIcon = null;
  }
}

function showSelectionIcon(selection) {
  if (selectionIcon) {
    selectionIcon.remove();
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  selectionIcon = document.createElement('div');
  selectionIcon.innerHTML = '🤖'; // You can replace this with an actual icon
  selectionIcon.style.cssText = `
    position: fixed;
    left: ${rect.right + window.scrollX}px;
    top: ${rect.top + window.scrollY}px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 50%;
    padding: 5px;
    cursor: pointer;
    z-index: 10000;
  `;

  selectionIcon.onmousedown = function(event) {
    event.preventDefault();
    event.stopPropagation();
  };

  selectionIcon.onclick = function(event) {
    event.preventDefault();
    event.stopPropagation();
    const text = selection.toString();
    showPopup(text);
  };

  document.body.appendChild(selectionIcon);
}

// Add this new function
function preserveSelection(event) {
  if (event.target === selectionIcon || (popup && popup.contains(event.target))) {
    event.preventDefault();
  }
}

// Add these event listeners
document.addEventListener('mousedown', preserveSelection);
document.addEventListener('selectstart', preserveSelection);