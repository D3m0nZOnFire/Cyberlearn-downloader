const DEFAULT = "Moodle PDFs";
const subfolderInput = document.getElementById("subfolder");
const saveBtn        = document.getElementById("save");
const statusEl       = document.getElementById("status");

chrome.storage.sync.get({ subfolder: DEFAULT }, ({ subfolder }) => {
  subfolderInput.value = subfolder;
});

subfolderInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") save();
});

saveBtn.addEventListener("click", save);

function save() {
  const subfolder = subfolderInput.value.trim();
  chrome.storage.sync.set({ subfolder }, () => {
    statusEl.textContent = "✓ Saved!";
    statusEl.className = "status success";
    setTimeout(() => { statusEl.className = "status"; }, 2000);
  });
}
