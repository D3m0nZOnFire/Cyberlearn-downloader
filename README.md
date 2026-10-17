# Cyberlearn Downloader (Moodle PDF Fetcher)

A Chrome extension for [Cyberlearn](https://cyberlearn.hes-so.ch), the HES-SO Moodle. Right-click a course resource link and choose **⬇ Download PDF (Moodle)**: the PDF is saved straight to your Downloads folder instead of opening in a browser tab.

## Install

1. Clone or download this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the repository folder.

Works in Chrome and other Chromium browsers (Brave, Edge).

## Usage

1. Log in to Cyberlearn in the same browser. The extension uses your existing session.
2. Right-click a resource link on a course page → **⬇ Download PDF (Moodle)**.
3. A notification confirms the download. Files go to `Downloads/Moodle PDFs/` by default; change the subfolder from the toolbar popup (leave it empty to save directly in `Downloads`).

## How it works

Moodle resource links (`mod/resource/view.php?id=…`) point to a wrapper page, not to the file. The extension fetches that link with your session cookies, follows the redirect and, if it lands on a page instead of the PDF, finds the real `pluginfile.php` / `.pdf` link in the HTML and hands it to Chrome's download manager. Existing files are never overwritten (Chrome adds a number to the name).

## Permissions

- `contextMenus`: the right-click entry, shown only on `cyberlearn.hes-so.ch` links
- `downloads`: saving the PDF
- `storage`: remembering your subfolder
- `notifications`: progress and error messages

The extension only requests the link you right-clicked and the PDF it points to. There is no analytics and no server of its own.

## License

[MIT](LICENSE)
