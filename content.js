// content.js
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Dongle:wght@400;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// remove excess highlighting
document.addEventListener("mouseup", (event) => {
  if (event.target.id === "thoughtkeeper-btn") return;
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) return;

  // remove old lightbulb
  const oldBtn = document.getElementById("thoughtkeeper-btn");
  if (oldBtn) oldBtn.remove();

  // make lightbulb btn
  const btn = document.createElement("button");
  btn.id = "thoughtkeeper-btn";
  btn.textContent = "💡";
  btn.style.position = "absolute";
  btn.style.top = `${event.pageY}px`;
  btn.style.left = `${event.pageX}px`;
  btn.className = "tk-btn";
  document.body.appendChild(btn);

  // open popup
  btn.addEventListener("click", () => {
    event.stopPropagation();
    openPopup(selectedText);
    btn.remove();
  });
});

function openLanguageMenu(x, y, onSelect) {
  const menu = document.createElement("div");
  menu.className = "tk-lang-menu";
  menu.style.position = "absolute";
  menu.style.top = `${y}px`;
  menu.style.left = `${x}px`;
  menu.style.background = "white";
  menu.style.padding = "6px";
  menu.style.borderRadius = "6px";
  menu.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";
  menu.style.zIndex = "999999";
  menu.style.fontFamily = "Dongle, sans-serif";
  menu.style.fontSize = "20px";

 const languages = {
  ar: "Arabic",
  zh: "Chinese (Simplified)",
  cs: "Czech",
  da: "Danish",
  nl: "Dutch",
  fi: "Finnish",
  fr: "French",
  de: "German",
  el: "Greek",
  he: "Hebrew",
  hi: "Hindi",
  hu: "Hungarian",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  no: "Norwegian",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  ru: "Russian",
  es: "Spanish",
  sv: "Swedish",
  th: "Thai",
  tr: "Turkish",
  uk: "Ukrainian",
  vi: "Vietnamese"
};


  Object.entries(languages).forEach(([code, name]) => {
    const btn = document.createElement("div");
    btn.className = "tk-lang-option";
    btn.textContent = name;
    btn.style.padding = "4px 8px";
    btn.style.cursor = "pointer";

    btn.addEventListener("mouseover", () => (btn.style.background = "#f0f0f0"));
    btn.addEventListener("mouseout", () => (btn.style.background = "white"));

    btn.addEventListener("click", () => {
      onSelect(code);
      menu.remove();
    });

    menu.appendChild(btn);
  });

  document.body.appendChild(menu);

  // close on outside click
  setTimeout(() => {
    document.addEventListener(
      "mousedown",
      (ev) => {
        if (!menu.contains(ev.target)) menu.remove();
      },
      { once: true }
    );
  }, 20);
}

// note modal
function openNoteModal(selectedText) {
  const existingModal = document.querySelector(".tk-note-modal");
  if (existingModal) existingModal.remove();

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "tk-modal-overlay";
  modalOverlay.innerHTML = `
    <div class="tk-note-modal">
      <div class="tk-note-header">
        <span>Add Your Reflection ✏️</span>
        <button class="tk-close-note">×</button>
      </div>
      <p class="tk-note-snippet">${selectedText}</p>
      <textarea class="tk-note-input" placeholder="Write your note here..."></textarea>
      <div class="tk-note-actions">
        <button class="tk-save-note">💾 Save</button>
        <button class="tk-cancel-note">✖ Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  const modal = modalOverlay.querySelector(".tk-note-modal");
  modalOverlay.classList.add("show");

  modal.querySelector(".tk-note-input").focus();

  function closeModal() {
    modalOverlay.classList.remove("show");
    setTimeout(() => modalOverlay.remove(), 200);
  }

  modal.querySelector(".tk-close-note").addEventListener("click", closeModal);
  modal.querySelector(".tk-cancel-note").addEventListener("click", closeModal);

  modal.querySelector(".tk-save-note").addEventListener("click", () => {
    const note = modal.querySelector(".tk-note-input").value.trim();
    if (note) {
      saveThought(selectedText, note);
      closeModal();
      alert("Note saved!");
    } else {
      alert("Please write something before saving!");
    }
  });

  modalOverlay.addEventListener("mousedown", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

// popup
function openPopup(text) {
  const existing = document.querySelector(".tk-card");
  if (existing) existing.remove();

  const card = document.createElement("div");
  card.className = "tk-card";
  card.innerHTML = `
  <div class="tk-header">
    <div class="tk-title-group">
      <img src="${chrome.runtime.getURL("icons/tkLogo1.png")}" class="tk-logo" alt="Thought Keeper logo" />
      <div>
        <h2 class="tk-title">Thought Keeper</h2>
        <p class="tk-subtitle">Smart actions for your selected text</p>
      </div>
    </div>
    <button class="tk-close" aria-label="Close popup">×</button>
  </div>
  <div class="tk-content">
    <p class="tk-snippet">${text}</p>
  </div>
  <div class="tk-actions">
    <button class="tk-action-button" id="explain">
      <span class="button-icon">💡</span>
      <span>Explain Like I'm 5</span>
    </button>
    <button class="tk-action-button" id="translate">
      <span class="button-icon">🌍</span>
      <span>Translate</span>
    </button>
    <button class="tk-action-button" id="reflect">
      <span class="button-icon">📝</span>
      <span>Add Note</span>
    </button>
  </div>
  `;

  const popupOverlay = document.createElement("div");
  popupOverlay.className = "tk-popup-overlay";

  popupOverlay.appendChild(card);
  document.body.appendChild(popupOverlay);

  // initial center positioning without transform so dragging works
  card.style.left = `${Math.max((window.innerWidth - card.offsetWidth) / 2, 16)}px`;
  card.style.top = `${Math.max((window.innerHeight - card.offsetHeight) / 2, 16)}px`;
  card.style.transform = "none";

  const header = card.querySelector(".tk-header");
  header.style.cursor = "grab";

  header.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("button")) return;
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const rect = card.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;

    header.style.cursor = "grabbing";

    function onMouseMove(moveEvent) {
      const nextLeft = moveEvent.clientX - offsetX;
      const nextTop = moveEvent.clientY - offsetY;
      const boundedLeft = Math.min(Math.max(nextLeft, 8), window.innerWidth - card.offsetWidth - 8);
      const boundedTop = Math.min(Math.max(nextTop, 8), window.innerHeight - card.offsetHeight - 8);
      card.style.left = `${boundedLeft}px`;
      card.style.top = `${boundedTop}px`;
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      header.style.cursor = "grab";
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  popupOverlay.addEventListener("mousedown", (e) => {
    if (e.target === popupOverlay) {
      popupOverlay.remove();
      const btn = document.getElementById("thoughtkeeper-btn");
      if (btn) btn.remove();
    }
  });

  document.addEventListener(
    "mouseup",
    (e) => {
      const newText = window.getSelection().toString().trim();
      if (newText && newText !== text) {
        card.remove();
      }
    },
    { once: true }
  );

  card.querySelector(".tk-close").addEventListener("click", () => {
    card.remove();
    const btn = document.getElementById("thoughtkeeper-btn");
    if (btn) btn.remove();
  });

  card.querySelector("#reflect").addEventListener("click", (e) => {
    e.stopPropagation();
    openNoteModal(text);
  });

  // card.querySelector("#explain").addEventListener("click", () => {
  //   alert("This would simplify text (AI feature to add later).");
  // });
  card.querySelector("#explain").addEventListener("click", () => {
    chrome.runtime.sendMessage(
      {
        type: "explain",
        text: text,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Explain sendMessage error:", chrome.runtime.lastError);
          alert("Failed to explain text.");
          return;
        }

        if (response && response.success) {
          alert("Explanation:\n\n" + response.result);
        } else {
          console.error(response?.error || "No response from explain handler");
          alert("Failed to explain text.");
        }
      }
    );
  });


  // UPDATED TRANSLATE BUTTON → Opens language menu
  card.querySelector("#translate").addEventListener("click", (e) => {
    e.stopPropagation();

    openLanguageMenu(e.pageX, e.pageY, (chosenLang) => {
      chrome.runtime.sendMessage(
        {
          type: "TRANSLATE_TEXT",
          text,
          lang: chosenLang,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Translate sendMessage error:", chrome.runtime.lastError);
            alert("Translation failed. Please try again.");
            return;
          }

          if (response && response.success) {
            alert("Translation (" + chosenLang + "):\n\n" + response.translated);
          } else {
            console.error("Translate response error:", response);
            alert("Translation failed. Please try again.");
          }
        }
      );
    });
  });
}


// save thought
function saveThought(original, note) {
  chrome.storage.local.get(["thoughts"], (data) => {
    const thoughts = data.thoughts || [];
    thoughts.push({
      original,
      note,
      url: window.location.href,
      date: new Date().toLocaleString(),
    });
    chrome.storage.local.set({ thoughts });
    alert("Saved to Thought Vault!");
  });
}

// translation API call is handled in background.js via runtime messaging

