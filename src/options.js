document.getElementById('save').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value;
  chrome.storage.sync.set({ apiKey: apiKey }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 750);
  });
});

chrome.storage.sync.get('apiKey', (data) => {
  if (data.apiKey) {
    document.getElementById('apiKey').value = data.apiKey;
  }
});