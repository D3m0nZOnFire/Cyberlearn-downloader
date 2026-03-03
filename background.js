// ── Setup context menu on install ────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "moodle-download-pdf",
    title: "⬇ Download PDF (Moodle)",
    contexts: ["link"],
    targetUrlPatterns: ["*://cyberlearn.hes-so.ch/*"],
  });
});

// ── Handle context menu click ─────────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "moodle-download-pdf") return;
  if (info.linkUrl) await resolveAndDownload(info.linkUrl);
});

// ── Core: resolve indirect Moodle URL → real PDF URL ─────────────────────────
async function resolveAndDownload(url) {
  notify("🔍 Resolving…", url.split("?")[0]);

  try {
    const { subfolder } = await chrome.storage.sync.get({ subfolder: "Moodle PDFs" });

    const response = await fetch(url, { credentials: "include", redirect: "follow" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} — are you logged in to Moodle?`);
    }

    const finalUrl = response.url;
    const html = await response.text();

    // If the final URL after redirect IS the PDF
    if (finalUrl.toLowerCase().includes(".pdf")) {
      return await downloadPdf(finalUrl, subfolder);
    }

    // Build base URL for resolving relative paths
    const base = new URL(finalUrl).origin;

    const pdfUrl = extractPdfUrl(html, base);

    if (!pdfUrl) {
      throw new Error("No PDF link found on this page. Is this a Moodle resource link?");
    }

    await downloadPdf(pdfUrl, subfolder);

  } catch (err) {
    notify("❌ Error", err.message);
    console.error("[Moodle PDF Fetcher]", err);
  }
}

// ── Extract PDF URL using regex (no DOMParser in service workers) ─────────────
function extractPdfUrl(html, baseOrigin) {
  // Strategy 1: pluginfile.php absolute URL with .pdf
  let m = html.match(/https?:\/\/[^\s"'<>]+pluginfile\.php[^\s"'<>]*\.pdf[^\s"'<>]*/i);
  if (m) return m[0];

  // Strategy 2: pluginfile.php relative URL — prepend origin
  m = html.match(/["'](\/pluginfile\.php[^"']*\.pdf[^"']*)['"]/i);
  if (m) return baseOrigin + m[1];

  // Strategy 3: any absolute .pdf URL in href or src
  m = html.match(/(?:href|src)=["'](https?:\/\/[^"']*\.pdf[^"']*)['"]/i);
  if (m) return m[1];

  // Strategy 4: any relative .pdf href — prepend origin
  m = html.match(/href=["'](\/[^"']*\.pdf[^"']*)['"]/i);
  if (m) return baseOrigin + m[1];

  // Strategy 5: forcedownload links (Moodle sometimes wraps with ?forcedownload=1)
  m = html.match(/https?:\/\/[^\s"'<>]+forcedownload=1[^\s"'<>]*/i);
  if (m) return m[0];

  // Strategy 6: JS variable / redirect containing a .pdf path
  m = html.match(/["'](https?:\/\/[^"']*\.pdf)['"]/i);
  if (m) return m[1];

  return null;
}

// ── Trigger Chrome download ───────────────────────────────────────────────────
async function downloadPdf(pdfUrl, subfolder) {
  // Clean up URL before extracting filename
  let filename = decodeURIComponent(pdfUrl.split("/").pop().split("?")[0]);
  if (!filename.toLowerCase().endsWith(".pdf")) filename += ".pdf";
  filename = filename.replace(/[<>:"/\\|?*]/g, "_");

  const downloadPath = subfolder ? `${subfolder}/${filename}` : filename;

  await chrome.downloads.download({
    url: pdfUrl,
    filename: downloadPath,
    conflictAction: "uniquify",
  });

  notify("✅ Downloading", filename);
}

// ── Notifications ─────────────────────────────────────────────────────────────
function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.png",
    title,
    message: String(message).slice(0, 200),
  });
}
