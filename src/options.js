document.getElementById('save').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value;
  const systemPrompt = document.getElementById('systemPrompt').value;
  const userPrompt = document.getElementById('userPrompt').value;

  chrome.storage.sync.set(
    { apiKey, systemPrompt, userPrompt },
    () => {
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    }
  );
});

chrome.storage.sync.get(['apiKey', 'systemPrompt', 'userPrompt'], (data) => {
  if (data.apiKey) {
    document.getElementById('apiKey').value = data.apiKey;
  }
  if (data.systemPrompt) {
    document.getElementById('systemPrompt').value = data.systemPrompt;
  }
  if (data.userPrompt) {
    document.getElementById('userPrompt').value = data.userPrompt;
  }
});