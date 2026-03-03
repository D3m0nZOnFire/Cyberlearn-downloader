const DEFAULT = "Moodle PDFs";

const subfolderInput = document.getElementById("subfolder");
const saveBtn        = document.getElementById("save");
const resetBtn       = document.getElementById("reset");
const browseBtn      = document.getElementById("browse");
const statusEl       = document.getElementById("status");

chrome.storage.sync.get({ subfolder: DEFAULT }, ({ subfolder }) => {
  subfolderInput.value = subfolder;
});

browseBtn.addEventListener("click", async () => {
  try {
    const handle = await window.showDirectoryPicker({ mode: "read" });
    subfolderInput.value = handle.name;
    showStatus("📁 " + handle.name + " selected", "success");
    setTimeout(hideStatus, 3000);
  } catch (err) {
    if (err.name !== "AbortError") {
      showStatus("Could not open folder picker", "error");
      setTimeout(hideStatus, 3000);
    }
  }
});

saveBtn.addEventListener("click", () => {
  const subfolder = subfolderInput.value.trim();
  chrome.storage.sync.set({ subfolder }, () => {
    showStatus("✓ Saved!", "success");
    setTimeout(hideStatus, 2500);
  });
});

resetBtn.addEventListener("click", () => {
  subfolderInput.value = DEFAULT;
  chrome.storage.sync.set({ subfolder: DEFAULT }, () => {
    showStatus("↩ Reset to default", "success");
    setTimeout(hideStatus, 2500);
  });
});

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}
function hideStatus() { statusEl.className = "status"; }
