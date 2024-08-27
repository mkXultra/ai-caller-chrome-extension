chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openai",
    title: "Send to OpenAI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openai" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "showTranslationPopup",
      text: info.selectionText
    });
  }
});

async function callOpenAIAPI(prompt) {
  const apiKey = "YOUR_OPENAI_API_KEY"; // OpenAI APIのキーを設定
  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 100
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].text;
    } else {
      throw new Error("APIからの応答が不正です");
    }
  } catch (error) {
    // console.error("OpenAI API呼び出し中にエラーが発生しました:", error);
    return "エラーが発生しました。もう一度お試しください。";
  }
}
