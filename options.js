// options.js
document.getElementById('save').addEventListener('click', async () => {
  const apiKey = document.getElementById('groqApiKey').value.trim();
  const status = document.getElementById('status');

  if (!apiKey) {
    status.textContent = 'Please enter an API key.';
    status.style.color = 'red';
    return;
  }

  try {
    await chrome.storage.local.set({ groqApiKey: apiKey });
    status.textContent = 'Settings saved successfully!';
    status.style.color = 'green';

    // Notify background script to reload the key
    chrome.runtime.sendMessage({ type: 'reloadApiKey' });
  } catch (error) {
    status.textContent = 'Error saving settings.';
    status.style.color = 'red';
    console.error(error);
  }
});

// Load existing key on page load
document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.local.get(['groqApiKey']);
  if (result.groqApiKey) {
    document.getElementById('groqApiKey').value = result.groqApiKey;
  }
});