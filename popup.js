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
  editBtn.textContent = "✏️";
  editBtn.addEventListener("click", () => openEditMode(thoughtEl, thought, index));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-btn delete-btn";
  deleteBtn.title = "Delete thought";
  deleteBtn.textContent = "🗑️";
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

