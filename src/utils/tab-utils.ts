import { browser, Browser } from "wxt/browser";
import { NoRetryError } from "@/utils/lib/BatchQueueExecutor";
import { defer } from "radash";

export async function openTabAndRun<T>(
  option: Browser.tabs.CreateProperties,
  action: (tab: Browser.tabs.Tab) => Promise<T>
) {
  return defer<T>(async (clean) => {
    const tab = await browser.tabs.create(option);
    clean(() => browser.tabs.remove(tab.id!));

    if (!tab || !tab.id) {
      throw new NoRetryError("tab id is undefined.");
    }
    const rs = await action(tab);

    return rs;
  });
}
