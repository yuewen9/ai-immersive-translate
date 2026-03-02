import type { PlasmoConfig } from "plasmo"

const config: PlasmoConfig = {
  src: "src",
  manifest: {
    name: "AI Immersive Translate",
    version: "0.0.1",
    description: "A free, AI-powered bilingual web page translation extension supporting BigModel API",
    permissions: [
      "storage",
      "activeTab",
      "scripting",
      "contextMenus"
    ],
    host_permissions: [
      "https://*/*",
      "https://open.bigmodel.cn/*"
    ],
    action: {
      default_popup: "popup.html",
      default_icon: {
        "16": "icon16.png",
        "32": "icon32.png",
        "48": "icon48.png",
        "128": "icon128.png"
      }
    },
    icons: {
      "16": "icon16.png",
      "32": "icon32.png",
      "48": "icon48.png",
      "128": "icon128.png"
    },
    options_ui: {
      page: "options.html",
      open_in_tab: false
    },
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["content.js"]
      }
    ]
  }
}

export default config
