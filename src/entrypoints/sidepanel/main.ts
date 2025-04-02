import { createApp } from "vue";
import "~/assets/tailwind.css";
import "~/assets/shacn.css";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router";
import Index from "@/entrypoints/sidepanel/pages/Index.vue";
import BatchHouseStart from "@/entrypoints/sidepanel/pages/BatchHouseStart.vue";
import BatchCommunityStartPage from "@/entrypoints/sidepanel/pages/BatchCommunityStartPage.vue";
import BatchRentCommunityStartPage from "./pages/BatchRentCommunityStartPage.vue";
import { useDevSetting } from "../reuse/global-variables";
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: Index },
    {
      path: "/debug",
      component: () => import("@/components/debug/DebugEntryTabs.vue"),
    },
    { path: "/h/batch", component: BatchHouseStart },
    { path: "/c/batch", component: BatchCommunityStartPage },
    { path: "/rent/c/batch", component: BatchRentCommunityStartPage },
  ],
});
const { isDisguise } = useDevSetting();
if (isDisguise) {
  import("~/assets/disguise.css");
}
createApp(App).use(router).mount("#app");
