const container = document.getElementById("thoughts");
const deleteAllButton = document.getElementById("delete-all");
let thoughts = [];

function saveThoughts(updatedThoughts) {
  chrome.storage.local.set({ thoughts: updatedThoughts }, () => {
    thoughts = updatedThoughts;
    renderThoughts();
  });
}

function deleteThought(index) {
  const updatedThoughts = thoughts.filter((_, i) => i !== index);
  saveThoughts(updatedThoughts);
}

function deleteAllThoughts() {
  if (!confirm("Delete every thought in the vault? This cannot be undone.")) {
    return;
  }
  saveThoughts([]);
}

function openThoughtDetail(thought, index) {
  const modal = document.createElement("div");
  modal.className = "thought-detail-modal";
  modal.innerHTML = `
    <div class="thought-detail-overlay">
      <div class="thought-detail-content">
        <div class="thought-detail-header">
          <h2>Thought Details</h2>
          <button class="thought-detail-close" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="thought-detail-body">
          <div class="detail-section">
            <h3 class="detail-section-title">Original Text</h3>
            <p class="detail-section-content">${thought.original}</p>
          </div>
          
          ${thought.explanation ? `
            <div class="detail-section">
              <h3 class="detail-section-title">Explanation</h3>
              <p class="detail-section-content">${thought.explanation}</p>
            </div>
          ` : ''}
          
          ${thought.translation ? `
            <div class="detail-section">
              <h3 class="detail-section-title">Translation${thought.translationLang ? ' (' + thought.translationLang.replace(/^Translation \(/, '').replace(/\)$/, '') + ')' : ''}</h3>
              <p class="detail-section-content">${thought.translation}</p>
            </div>
          ` : ''}
          
          <div class="detail-section">
            <h3 class="detail-section-title">Your Note</h3>
            <p class="detail-section-content">${thought.note || 'No note added.'}</p>
          </div>
        </div>

        <div class="thought-detail-metadata">
          <small>${thought.date}</small>
          <a href="${thought.url}" target="_blank" rel="noopener noreferrer">View source</a>
        </div>
        
        <div class="thought-detail-footer">
          <button class="thought-detail-edit-btn">Edit</button>
          <button class="thought-detail-read-less">Done</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("show"), 10);

  const closeBtn = modal.querySelector(".thought-detail-close");
  const readLessBtn = modal.querySelector(".thought-detail-read-less");
  const editBtn = modal.querySelector(".thought-detail-edit-btn");
  const overlay = modal.querySelector(".thought-detail-overlay");

  const closeModal = () => {
    modal.classList.remove("show");
    setTimeout(() => modal.remove(), 200);
  };

  closeBtn.addEventListener("click", closeModal);
  readLessBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  editBtn.addEventListener("click", () => {
    closeModal();
    const thoughtCard = document.querySelector(`[data-index="${index}"]`);
    if (thoughtCard) {
      openEditMode(thoughtCard, thought, index);
    }
  });
}

function truncateText(text, lines = 2) {
  const lineArray = text.split('\n').slice(0, lines);
  let truncated = lineArray.join('\n');
  if (truncated.length > 180) {
    truncated = truncated.substring(0, 180).trim() + '...';
  }
  return truncated;
}

function createThoughtElement(thought, index) {
  const thoughtEl = document.createElement("div");
  thoughtEl.className = "thought-card";

  const header = document.createElement("div");
  header.className = "thought-card-header";

  const headerContent = document.createElement("div");
  headerContent.className = "thought-card-title";
  headerContent.textContent = truncateText(thought.original, 2);

  const actions = document.createElement("div");
  actions.className = "thought-card-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "icon-btn edit-btn";
  editBtn.title = "Edit annotation";
  editBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
    </svg>
  `;
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openEditMode(thoughtEl, thought, index);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-btn delete-btn";
  deleteBtn.title = "Delete thought";
  deleteBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  `;
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteThought(index);
  });

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  header.appendChild(headerContent);
  header.appendChild(actions);

  const meta = document.createElement("div");
  meta.className = "thought-card-meta";
  meta.innerHTML = `<small>${thought.date} | <a href="${thought.url}" target="_blank">source</a></small>`;

  const footer = document.createElement("div");
  footer.className = "thought-card-footer";

  const notePreview = document.createElement("p");
  notePreview.className = "thought-note-preview";
  notePreview.textContent = thought.note || "No note added.";

  const features = document.createElement("div");
  features.className = "thought-features-indicator";

  if (thought.explanation) {
    const badge = document.createElement("span");
    badge.className = "feature-badge";
    badge.textContent = "Explained";
    features.appendChild(badge);
  }

  if (thought.translation) {
    const badge = document.createElement("span");
    badge.className = "feature-badge";
    badge.textContent = "Translated";
    features.appendChild(badge);
  }

  const showMoreBtn = document.createElement("button");
  showMoreBtn.className = "show-more-btn";
  showMoreBtn.textContent = "Show more";
  showMoreBtn.addEventListener("click", () => openThoughtDetail(thought, index));

  footer.appendChild(notePreview);
  if (features.children.length > 0) {
    footer.appendChild(features);
  }
  footer.appendChild(showMoreBtn);

  thoughtEl.appendChild(header);
  thoughtEl.appendChild(meta);
  thoughtEl.appendChild(footer);

  return thoughtEl;
}

function openEditMode(thoughtEl, thought, index) {
  const footer = thoughtEl.querySelector(".thought-card-footer");
  const existingEditForm = footer.querySelector(".thought-edit-form");
  
  if (existingEditForm) {
    existingEditForm.remove();
    const showMoreBtn = footer.querySelector(".show-more-btn");
    if (showMoreBtn) showMoreBtn.style.display = "block";
    return;
  }

  const showMoreBtn = footer.querySelector(".show-more-btn");
  if (showMoreBtn) showMoreBtn.style.display = "none";

  const editForm = document.createElement("div");
  editForm.className = "thought-edit-form";

  // Original text (display only)
  const originalBox = document.createElement("div");
  originalBox.className = "thought-feature-box thought-original-box";
  originalBox.innerHTML = `<strong class="thought-feature-label">Original:</strong> ${thought.original}`;
  editForm.appendChild(originalBox);

  // Explanation with delete button (if exists)
  if (thought.explanation) {
    const explainBox = document.createElement("div");
    explainBox.className = "thought-feature-box thought-explain-box";
    
    const explainContent = document.createElement("div");
    explainContent.style.display = "flex";
    explainContent.style.justifyContent = "space-between";
    explainContent.style.alignItems = "flex-start";
    explainContent.style.gap = "8px";
    
    const explainText = document.createElement("span");
    explainText.innerHTML = `<strong class="thought-feature-label">🥹 Explained:</strong> ${thought.explanation}`;
    
    const deleteExplainBtn = document.createElement("button");
    deleteExplainBtn.className = "tiny-delete-btn";
    deleteExplainBtn.title = "Delete explanation";
    deleteExplainBtn.textContent = "✕";
    deleteExplainBtn.style.padding = "2px 6px";
    deleteExplainBtn.style.fontSize = "12px";
    deleteExplainBtn.style.borderRadius = "4px";
    deleteExplainBtn.style.border = "1px solid #ccc";
    deleteExplainBtn.style.background = "#fee2e2";
    deleteExplainBtn.style.color = "#991b1b";
    deleteExplainBtn.style.cursor = "pointer";
    deleteExplainBtn.style.whiteSpace = "nowrap";
    deleteExplainBtn.style.flexShrink = "0";
    deleteExplainBtn.addEventListener("click", () => {
      const updatedThoughts = [...thoughts];
      updatedThoughts[index] = {
        ...updatedThoughts[index],
        explanation: null,
      };
      saveThoughts(updatedThoughts);
    });
    
    explainContent.appendChild(explainText);
    explainContent.appendChild(deleteExplainBtn);
    explainBox.appendChild(explainContent);
    editForm.appendChild(explainBox);
  }

  // Translation with delete button (if exists)
  if (thought.translation) {
    const translateBox = document.createElement("div");
    translateBox.className = "thought-feature-box thought-translate-box";
    
    const translateContent = document.createElement("div");
    translateContent.style.display = "flex";
    translateContent.style.justifyContent = "space-between";
    translateContent.style.alignItems = "flex-start";
    translateContent.style.gap = "8px";
    
    const langLabel = thought.translationLang || "Translation";
    const translateText = document.createElement("span");
    translateText.innerHTML = `<strong class="thought-feature-label">🌍 ${langLabel}:</strong> ${thought.translation}`;
    
    const deleteTranslateBtn = document.createElement("button");
    deleteTranslateBtn.className = "tiny-delete-btn";
    deleteTranslateBtn.title = "Delete translation";
    deleteTranslateBtn.textContent = "✕";
    deleteTranslateBtn.style.padding = "2px 6px";
    deleteTranslateBtn.style.fontSize = "12px";
    deleteTranslateBtn.style.borderRadius = "4px";
    deleteTranslateBtn.style.border = "1px solid #ccc";
    deleteTranslateBtn.style.background = "#fee2e2";
    deleteTranslateBtn.style.color = "#991b1b";
    deleteTranslateBtn.style.cursor = "pointer";
    deleteTranslateBtn.style.whiteSpace = "nowrap";
    deleteTranslateBtn.style.flexShrink = "0";
    deleteTranslateBtn.addEventListener("click", () => {
      const updatedThoughts = [...thoughts];
      updatedThoughts[index] = {
        ...updatedThoughts[index],
        translation: null,
        translationLang: null,
      };
      saveThoughts(updatedThoughts);
    });
    
    translateContent.appendChild(translateText);
    translateContent.appendChild(deleteTranslateBtn);
    translateBox.appendChild(translateContent);
    editForm.appendChild(translateBox);
  }

  // Editable note textarea
  const textarea = document.createElement("textarea");
  textarea.className = "thought-edit-textarea";
  textarea.value = thought.note || "";
  textarea.placeholder = "Edit your annotation...";

  const buttonRow = document.createElement("div");
  buttonRow.className = "edit-button-row";

  const saveButton = document.createElement("button");
  saveButton.className = "save-edit";
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", () => {
    const updatedThoughts = [...thoughts];
    updatedThoughts[index] = {
      ...updatedThoughts[index],
      note: textarea.value.trim(),
    };
    saveThoughts(updatedThoughts);
  });

  const cancelButton = document.createElement("button");
  cancelButton.className = "cancel-edit";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", renderThoughts);

  buttonRow.appendChild(saveButton);
  buttonRow.appendChild(cancelButton);

  editForm.appendChild(textarea);
  editForm.appendChild(buttonRow);
  footer.appendChild(editForm);
  textarea.focus();
}

function renderThoughts() {
  container.innerHTML = "";
  if (thoughts.length === 0) {
    container.textContent = "No thoughts saved yet! :c";
    return;
  }

  thoughts.forEach((thought, index) => {
    const thoughtElement = createThoughtElement(thought, index);
    thoughtElement.dataset.index = index;
    container.appendChild(thoughtElement);
  });
}

chrome.storage.local.get(["thoughts"], (data) => {
  thoughts = data.thoughts || [];
  renderThoughts();
});

deleteAllButton.addEventListener("click", deleteAllThoughts);

