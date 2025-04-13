import { Browser, browser } from "wxt/browser";
import { storage } from "wxt/utils/storage";
import { createTables } from "../db/sqlite";

export function onInstallHook(detail: Browser.runtime.InstalledDetails) {
  onFirstInstall();
  tryInitDB();
  console.log("detail.previousVersion", detail.previousVersion, detail.reason);
}

async function onFirstInstall() {
  const flag = await storage.getItem("local:is-first-install");
  const isFirstInstall = !flag;
  if (isFirstInstall) {
    storage.setItem("local:is-first-install", true);
    detectSidepanelAvailability();
  }
}
function detectSidepanelAvailability() {
  browser.runtime.onInstalled.addListener(() => {
    if (typeof chrome === "undefined" || !chrome.sidePanel) {
      console.error("Side Panel API not supported in this browser.");
      browser.tabs.create({ url: "/options.html#/not-support" });
    }
  });
}

async function tryInitDB() {
  console.log("tryInitDB");
  await createTables();
}
