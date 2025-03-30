import { housePageUIInject } from "@/entrypoints/content/ui/house-ui-inject";
import { communityPageUIInject } from "@/entrypoints/content/ui/community-ui-inject";
import {
  isCaptchaPage,
  isCommunityHomePage,
  isCommunityListPage,
  isCommunitySoldListPage,
  isHousePage,
  isHouseSoldPage,
  isLoginPage,
} from "@/utils/lj-url";
import "~/assets/tailwind.css";
import "~/assets/shacn.css";
import { debugUIInject } from "@/entrypoints/content/ui/debug-ui-inject";
import { defineContentScript } from "wxt/sandbox";
import {
  captchaPageOnMessage,
  loginPageOnMessage,
} from "./message/exception-msgs";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import { houseSoldPageOnMessages } from "./message/house-sold-msgs";
import { housePageOnMessages } from "./message/house-page-msgs";
import { communityListPageOnMessages } from "./message/community-list-page-msgs";
import { communitySoldListPageOnMessage } from "./message/community-sold-list-page-msgs";

const matches = () => {
  //this will be exec on build
  return import.meta.env.MODE === "development"
    ? ["*://*.lianjia.com/*", "*://*.example.com/*"]
    : ["*://*.lianjia.com/*"];
};

export default defineContentScript({
  matches: matches(),
  cssInjectionMode: "ui",
  async main(ctx) {
    const { isDebug, isDisguise } = useDevSetting();

    // ctx.block
    console.debug("hit lj page.", window.location.href);

    if (isDisguise) {
      import("~/assets/disguise.css");
    }

    const url = window.location.href;
    if (isHousePage(url)) {
      housePageUIInject(ctx);
      housePageOnMessages();
    } else if (isCommunityHomePage(url)) {
      await communityPageUIInject(ctx);
    } else if (isCommunityListPage(url)) {
      await communityPageUIInject(ctx);
      communityListPageOnMessages();
    } else if (isCommunitySoldListPage(url)) {
      communitySoldListPageOnMessage();
    } else if (isHouseSoldPage(url)) {
      console.log("sold out hit");
      houseSoldPageOnMessages();
    } else if (isLoginPage(url)) {
      loginPageOnMessage();
    } else if (isCaptchaPage(url)) {
      captchaPageOnMessage();
    } else if (
      import.meta.env.MODE === "development" &&
      url.includes("example.com")
    ) {
      debugUIInject(ctx);
    }
  },
});
