//testing only. delete later

// Load API key from storage (set via options page)
let GROQ_API_KEY = null;

async function loadApiKey() {
  const result = await chrome.storage.local.get(['groqApiKey']);
  GROQ_API_KEY = result.groqApiKey || null;
}

// Initialize on startup
loadApiKey();

// Listen for requests from popup.js and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "reloadApiKey") {
    loadApiKey().then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === "TRANSLATE_TEXT") {
    translateText(message.text, message.lang)
      .then((translated) => {
        sendResponse({ success: true, translated });
      })
      .catch((err) => {
        console.error("Translation error:", err);
        sendResponse({ success: false, error: "Translation failed." });
      });

    return true; // keeps message channel open
  }

  if (message.type === "explain") {
    explainText(message.text)
      .then((result) => sendResponse(result))
      .catch((err) => {
        console.error("Explain handler error:", err);
        sendResponse({ success: false, error: "Error explaining text." });
      });

    return true; // keep message channel open
  }
});

async function translateText(text, lang) {
  try {
    // Using a simple translation approach - for demo purposes
    // In production, you'd want a proper translation API
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    } else {
      throw new Error("Translation API returned no translated text");
    }
  } catch (err) {
    console.error("Translation error:", err);
    // Fallback: return original text with a note
    return `${text} (Translation unavailable - ${err.message})`;
  }
}

async function explainText(text) {
  if (!GROQ_API_KEY) {
    return { success: false, error: "API key not configured. Please set your Groq API key in the extension options." };
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Explain this like I'm 5 in the simplest way possible." },
          { role: "user", content: text }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return { success: false, error: "Error explaining text." };
    }

    const data = await response.json();
    if (!data?.choices?.[0]?.message?.content) {
      console.error("Groq validation error:", data);
      return { success: false, error: "Error explaining text." };
    }

    return { success: true, result: data.choices[0].message.content.trim() };
  } catch (err) {
    console.error("Groq error:", err);
    return { success: false, error: "Error explaining text." };
  }
}
