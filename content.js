// content.js
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Dongle:wght@400;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// remove excess highlighting
function isExtensionUI(element) {
  return !!element?.closest(
    '.tk-card, .tk-popup-overlay, .tk-modal-overlay, .tk-note-modal, .tk-lang-menu, #thoughtkeeper-btn'
  );
}

document.addEventListener("mouseup", (event) => {
  if (isExtensionUI(event.target)) return;
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  if (!selectedText) return;

  const oldBtn = document.getElementById("thoughtkeeper-btn");
  if (oldBtn) oldBtn.remove();

  const btn = document.createElement("button");
  btn.id = "thoughtkeeper-btn";
  btn.textContent = "💡";
  btn.className = "tk-btn";
  btn.style.position = "absolute";
  btn.style.zIndex = "999999";
  btn.style.pointerEvents = "auto";

  const range = selection.rangeCount ? selection.getRangeAt(0) : null;
  if (range) {
    const rects = range.getClientRects();
    const rect = rects.length ? rects[rects.length - 1] : range.getBoundingClientRect();
    const buttonSize = 46;
    const offset = 8;
    const pageRight = window.scrollX + rect.right;
    const pageBottom = window.scrollY + rect.bottom;
    const viewportRight = window.scrollX + window.innerWidth - buttonSize - offset;
    const viewportLeft = window.scrollX + offset;
    const viewportTop = window.scrollY + offset;
    const viewportBottom = window.scrollY + window.innerHeight - buttonSize - offset;

    let top = pageBottom - buttonSize - offset;
    let left = pageRight + offset;

    if (left > viewportRight) {
      left = pageRight - buttonSize - offset;
    }
    if (left < viewportLeft) {
      left = viewportLeft;
    }
    if (top < viewportTop) {
      top = pageBottom + offset;
    }
    if (top > viewportBottom) {
      top = viewportBottom;
    }

    btn.style.top = `${top}px`;
    btn.style.left = `${left}px`;
  } else {
    btn.style.top = `${event.pageY}px`;
    btn.style.left = `${event.pageX}px`;
  }

  document.body.appendChild(btn);

  btn.addEventListener("click", (clickEvent) => {
    clickEvent.stopPropagation();
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

function centerFloatingElement(element) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  element.style.left = `${Math.max((window.innerWidth - width) / 2, 16)}px`;
  element.style.top = `${Math.max((window.innerHeight - height) / 2, 16)}px`;
}

function setModalWidthForText(modal, text) {
  const length = text.length;
  let targetWidth = 360;
  if (length > 300) targetWidth = 520;
  if (length > 700) targetWidth = 620;
  if (length > 1100) targetWidth = 720;
  modal.style.width = `${Math.min(targetWidth, window.innerWidth - 32)}px`;
}

function setupResizableWindow(element, options = {}) {
  const minWidth = options.minWidth || 320;
  const minHeight = options.minHeight || 220;
  const maxWidth = options.maxWidth || window.innerWidth - 32;
  const maxHeight = options.maxHeight || window.innerHeight - 32;

  element.style.position = element.style.position || "fixed";
  element.style.minWidth = `${minWidth}px`;
  element.style.minHeight = `${minHeight}px`;
  element.style.maxWidth = `${maxWidth}px`;
  element.style.maxHeight = `${maxHeight}px`;
  element.style.overflow = element.classList.contains("tk-note-modal") ? "auto" : "hidden";
  element.style.resize = "none";

  const directions = [
    "top",
    "right",
    "bottom",
    "left",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ];

  directions.forEach((direction) => {
    const handle = document.createElement("div");
    handle.className = `tk-resize-handle tk-resize-handle--${direction}`;
    element.appendChild(handle);
    handle.addEventListener("mousedown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      initResize(event, element, direction, { minWidth, minHeight, maxWidth, maxHeight });
    });
  });
}

function initResize(event, element, direction, limits) {
  const startX = event.clientX;
  const startY = event.clientY;
  const rect = element.getBoundingClientRect();
  const startWidth = rect.width;
  const startHeight = rect.height;
  const startLeft = rect.left;
  const startTop = rect.top;

  function onMouseMove(moveEvent) {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;

    let width = startWidth;
    let height = startHeight;
    let left = startLeft;
    let top = startTop;

    if (direction.includes("right")) {
      width = startWidth + dx;
    }
    if (direction.includes("left")) {
      width = startWidth - dx;
      left = startLeft + dx;
    }
    if (direction.includes("bottom")) {
      height = startHeight + dy;
    }
    if (direction.includes("top")) {
      height = startHeight - dy;
      top = startTop + dy;
    }

    width = Math.max(limits.minWidth, Math.min(width, Math.min(limits.maxWidth, window.innerWidth - 16)));
    height = Math.max(limits.minHeight, Math.min(height, Math.min(limits.maxHeight, window.innerHeight - 16)));
    left = Math.min(Math.max(left, 8), window.innerWidth - width - 8);
    top = Math.min(Math.max(top, 8), window.innerHeight - height - 8);

    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
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
  setModalWidthForText(modal, selectedText);
  setupResizableWindow(modal, {
    minWidth: 360,
    minHeight: 280,
    maxWidth: window.innerWidth - 32,
    maxHeight: window.innerHeight - 32,
  });
  centerFloatingElement(modal);
  modalOverlay.classList.add("show");

  const noteHeader = modal.querySelector(".tk-note-header");
  noteHeader.style.cursor = "grab";
  noteHeader.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("button")) return;
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const rect = modal.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;
    noteHeader.style.cursor = "grabbing";

    function onMouseMove(moveEvent) {
      const nextLeft = moveEvent.clientX - offsetX;
      const nextTop = moveEvent.clientY - offsetY;
      const boundedLeft = Math.min(Math.max(nextLeft, 8), window.innerWidth - modal.offsetWidth - 8);
      const boundedTop = Math.min(Math.max(nextTop, 8), window.innerHeight - modal.offsetHeight - 8);
      modal.style.left = `${boundedLeft}px`;
      modal.style.top = `${boundedTop}px`;
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      noteHeader.style.cursor = "grab";
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

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
    <div class="tk-results"></div>
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

  setupResizableWindow(card, {
    minWidth: 420,
    minHeight: 420,
    maxWidth: window.innerWidth - 32,
    maxHeight: window.innerHeight - 32,
  });

  centerFloatingElement(card);
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

  const resultsContainer = card.querySelector(".tk-results");

  function setPopupResult(type, title, content) {
    let section = resultsContainer.querySelector(`.tk-result[data-type="${type}"]`);
    if (!section) {
      section = document.createElement("div");
      section.className = `tk-result tk-result-${type}`;
      section.dataset.type = type;
      section.innerHTML = `
        <div class="tk-result-title">${title}</div>
        <div class="tk-result-body"></div>
      `;
      resultsContainer.appendChild(section);
    } else {
      const titleEl = section.querySelector(".tk-result-title");
      if (titleEl) titleEl.textContent = title;
    }
    const body = section.querySelector(".tk-result-body");
    body.textContent = content;
  }

  card.querySelector("#reflect").addEventListener("click", (e) => {
    e.stopPropagation();
    openNoteModal(text);
  });

  card.querySelector("#explain").addEventListener("click", () => {
    chrome.runtime.sendMessage(
      {
        type: "explain",
        text: text,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Explain sendMessage error:", chrome.runtime.lastError);
          setPopupResult("explain", "Explain Like I'm 5", "Failed to explain text. Please try again.");
          return;
        }

        if (response && response.success) {
          setPopupResult("explain", "Explain Like I'm 5", response.result);
        } else {
          console.error(response?.error || "No response from explain handler");
          setPopupResult("explain", "Explain Like I'm 5", "Failed to explain text. Please try again.");
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
            setPopupResult("translate", "Translation", "Translation failed. Please try again.");
            return;
          }

          if (response && response.success) {
            setPopupResult("translate", `Translation (${chosenLang})`, response.translated);
          } else {
            console.error("Translate response error:", response);
            setPopupResult("translate", "Translation", "Translation failed. Please try again.");
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

