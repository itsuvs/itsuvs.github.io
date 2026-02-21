---
layout: blog
title: "Building Historian: A Journey into Chrome Extension Development"
category: Tech
---

Developing a Chrome extension is a unique way to enhance the browsing experience. For my project **Historian**, I wanted a tool that could smartly group and track browsing history by domain, providing a cleaner overview of online habits while maintaining full local privacy.

In this post, I’ll share how I built Historian, how you can test your extensions locally, and the steps to get them into the Chrome Web Store.

<br>
## **1. How to Write a Chrome Extension (Manifest V3)**
<br>

The heart of every Chrome extension is the `manifest.json` file. It tells the browser everything it needs to know about the extension.

Historian uses **Manifest V3**, the latest standard which focuses on better security and performance.

<br>

### *The Manifest File*

```json
{
  "manifest_version": 3,
  "name": "Historian: Domain History Tracker",
  "version": "1.0.1",
  "permissions": ["history", "storage"],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "src/popup/index.html"
  }
}
```

<br>

### *Key Components*

- **Service Workers**: Since V3, background pages are replaced by service workers (`background.js`). They are ephemeral and only run when needed, saving system resources.
- **Permissions**: Browsing history and local storage access must be explicitly declared.
- **Action/Popup**: This defines the UI that appears when you click the extension icon.

<br>
## **2. Local Testing and Development**
<br>

Historian is built using **Vite** and **TypeScript**, which provides a modern development experience even for extension projects.

<br>

### *Step 1: Build the Project*

Before testing, you need to compile the TypeScript code and bundle the assets.

```bash
npm run build
```

This generates a `dist/` folder containing the finalized extension files.

<br>

### *Step 2: Load into Chrome*

1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top right corner.
3. Click **Load unpacked**.
4. Select the `dist/` directory of your project.

Your extension is now live! You can pin it to your toolbar and start testing the popup and background logic.

<br>
## **3. Uploading to the Chrome Web Store**
<br>

Once your extension is ready for the world, it's time to publish.

<br>

### *Preparation*

Create a zip file of your `dist/` directory (ensure it contains the `manifest.json` at the root).

<br>

### *Publishing Steps*

1. **Join the Developer Dashboard**: You'll need a Google Developer account (requires a one-time fee).
2. **Create a New Item**: Upload your zip file.
3. **Fill in Metadata**: Provide a description, screenshots, and icons (16x16, 48x48, 128x128).
4. **Privacy Policy**: Since Historian accesses history, a clear Privacy Policy is mandatory. You must explain what data you collect (in Historian's case, everything stays local) and how it's used.
5. **Submit for Review**: Google will review your extension to ensure it follows security and policy guidelines.

<br>

Building Historian taught me a lot about the nuances of browser APIs and the importance of performance-conscious background scripts. If you're looking to build your own extension, start small, focus on privacy, and enjoy the process of customizing your browser!

<br>

Happy coding!
