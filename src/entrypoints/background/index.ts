import { defineBackground } from "#imports";
import {
  registerBrowserStorageLocalMessage,
  registerDaoMessage,
} from "@/entrypoints/background/lj-dao-msgs";
import { addRules, clearRules } from "@/entrypoints/reuse/block";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import { onMessage } from "@@/messaging";
import { browser } from "wxt/browser";
import { registerKeRentDaoMessage } from "./ke-rent-dao-msgs";
import { onInstallHook } from "./onInstall";

export default defineBackground(() => {
  console.log(`[${new Date().toLocaleString()}]`, "Load background!", {
    id: browser.runtime.id,
  });

  const { isDebug } = useDevSetting();
  clearRules().then(() => {
    addRules();
  });

  onMessage("openOptionPage", async (msg) => {
    console.debug("[openOptionPage]", msg.data);
    return browser.tabs.create({ url: msg.data });
  });
  registerDaoMessage();
  registerKeRentDaoMessage();
  registerBrowserStorageLocalMessage();
  // registerSimpleMessage()
  browser.runtime.onInstalled.addListener((detail) => {
    onInstallHook(detail);
  });
});
