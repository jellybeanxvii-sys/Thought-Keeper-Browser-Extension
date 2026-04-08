chrome.storage.local.get(["thoughts"], (data) => {
  const container = document.getElementById("thoughts");
  const thoughts = data.thoughts || [];
  if (thoughts.length === 0) {
    container.textContent = "No thoughts saved yet! :c";
    return;
  }
  thoughts.forEach((t) => {
    const div = document.createElement("div");
    div.className = "thought";
    div.innerHTML = `
      <p><b>${t.original}</b></p>
      <p>${t.note}</p>
      <small>${t.date} | <a href="${t.url}" target="_blank">source</a></small>
      <hr>
    `;
    container.appendChild(div);
  });
});
