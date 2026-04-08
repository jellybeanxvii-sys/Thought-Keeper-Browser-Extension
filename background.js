//testing only. delete later

// Load API key from storage (set via options page)
let GROQ_API_KEY = null;

async function loadApiKey() {
  const result = await chrome.storage.local.get(['groqApiKey']);
  GROQ_API_KEY = result.groqApiKey || null;
  console.log("Loaded API key:", GROQ_API_KEY ? "present" : "not set");
}

// Initialize on startup
loadApiKey();

console.log("Thought Keeper background script loaded");

// Listen for requests from popup.js and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background received message:", message.type);

  if (message.type === "reloadApiKey") {
    loadApiKey().then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === "TRANSLATE_TEXT") {
    console.log("Processing translate request for:", message.lang);
    translateText(message.text, message.lang)
      .then((translated) => {
        console.log("Translation successful");
        sendResponse({ success: true, translated });
      })
      .catch((err) => {
        console.error("Translation error:", err);
        sendResponse({ success: false, error: "Translation failed." });
      });

    return true; // keeps message channel open
  }

  if (message.type === "explain") {
    console.log("Processing explain request");
    explainText(message.text)
      .then((result) => {
        console.log("Explain successful");
        sendResponse(result);
      })
      .catch((err) => {
        console.error("Explain handler error:", err);
        sendResponse({ success: false, error: "Error explaining text." });
      });

    return true; // keep message channel open
  }
});

async function translateText(text, lang) {
  const response = await fetch("https://libretranslate.de/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: text,
      source: "auto",
      target: lang,
      format: "text",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Translate API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  if (!data.translatedText) {
    throw new Error("Translate API returned no translatedText");
  }

  return data.translatedText;
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
        model: "llama3-70b-8192",
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
