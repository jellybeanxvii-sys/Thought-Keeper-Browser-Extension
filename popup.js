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

function createThoughtElement(thought, index) {
  const thoughtEl = document.createElement("div");
  thoughtEl.className = "thought";

  const header = document.createElement("div");
  header.className = "thought-header";

  const titleGroup = document.createElement("div");
  titleGroup.className = "thought-title-group";

  const original = document.createElement("p");
  original.className = "thought-original";
  original.innerHTML = `<strong>${thought.original}</strong>`;

  const meta = document.createElement("small");
  meta.innerHTML = `${thought.date} | <a href="${thought.url}" target="_blank">source</a>`;

  titleGroup.appendChild(original);
  titleGroup.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "thought-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "icon-btn edit-btn";
  editBtn.title = "Edit annotation";
  editBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
    </svg>
  `;
  editBtn.addEventListener("click", () => openEditMode(thoughtEl, thought, index));

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
  deleteBtn.addEventListener("click", () => deleteThought(index));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  const noteWrapper = document.createElement("div");
  noteWrapper.className = "thought-note";

  const noteText = document.createElement("p");
  noteText.textContent = thought.note || "No note added yet.";
  noteWrapper.appendChild(noteText);

  const divider = document.createElement("hr");

  thoughtEl.appendChild(header);
  header.appendChild(titleGroup);
  header.appendChild(actions);
  thoughtEl.appendChild(noteWrapper);
  thoughtEl.appendChild(divider);

  return thoughtEl;
}

function openEditMode(thoughtEl, thought, index) {
  const noteWrapper = thoughtEl.querySelector(".thought-note");
  noteWrapper.innerHTML = "";

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

  noteWrapper.appendChild(textarea);
  noteWrapper.appendChild(buttonRow);
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
    container.appendChild(thoughtElement);
  });
}

chrome.storage.local.get(["thoughts"], (data) => {
  thoughts = data.thoughts || [];
  renderThoughts();
});

deleteAllButton.addEventListener("click", deleteAllThoughts);

