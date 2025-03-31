import { createApp } from "vue";
import "~/assets/tailwind.css";
import "~/assets/shacn.css";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router";
import OptionDebugEntry from "@/entrypoints/options/pages/OptionDebugEntry.vue";
import MainLayout from "@/entrypoints/options/pages/layout/MainLayout.vue";
import HomePage from "@/entrypoints/options/pages/HomePage.vue";

import { VueQueryPlugin } from "@tanstack/vue-query";
import CommunityUpdatePreview from "@/entrypoints/options/pages/community/CommunityUpdatePreview.vue";
import CommunityDetailPage from "@/entrypoints/options/pages/community/CommunityDetailPage.vue";
import CommunityRecordPage from "@/entrypoints/options/pages/community/CommunityRecordPage.vue";
import CommunityTaskList from "@/entrypoints/options/pages/community/CommunityTaskList.vue";
import BatchRunningNotice from "@/entrypoints/options/pages/community/BatchRunningNotice.vue";

import KeRentCommunityUpdatePreview from "@/entrypoints/options/pages/community/ke-rent/KeRentCommunityUpdatePreview.vue";
import KeRentCommunityDetailPage from "@/entrypoints/options/pages/community/ke-rent/KeRentCommunityDetailPage.vue";
import KeRentCommunityRecordPage from "@/entrypoints/options/pages/community/ke-rent/KeRentCommunityRecordPage.vue";
import KeRentCommunityTaskList from "@/entrypoints/options/pages/community/ke-rent/KeRentCommunityTaskList.vue";
import KeRentBatchRunningNotice from "@/entrypoints/options/pages/community/ke-rent/KeRentBatchRunningNotice.vue";

import CommunityGroupList from "@/entrypoints/options/pages/community/CommunityGroupList.vue";

import SettingsPage from "@/entrypoints/options/pages/SettingsPage.vue";
import HouseTaskList from "@/entrypoints/options/pages/house/HouseTaskList.vue";
import HouseChangeList from "@/entrypoints/options/pages/house/HouseChangeList.vue";
import HouseStatusChangeList from "@/entrypoints/options/pages/house/HouseStatusChangeList.vue";
import HouseDetailPage from "@/entrypoints/options/pages/house/HouseDetailPage.vue";
import HouseUpdatePreview from "@/entrypoints/options/pages/house/HouseUpdatePreview.vue";
import TaskGroupDetail from "@/entrypoints/options/pages/TaskGroupDetail.vue";
import HouseGroupList from "@/entrypoints/options/pages/house/HouseGroupList.vue";
import HouseBatchRunningNotice from "@/entrypoints/options/pages/house/BatchRunningNotice.vue";
import BlocksPage from "@/entrypoints/options/pages/BlocksPage.vue";
import IFrameDocSite from "@/entrypoints/options/pages/IFrameDocSite.vue";
import StartupIntro from "@/entrypoints/options/pages/docs/StartupIntro.vue";
import AboutMe from "@/entrypoints/options/pages/docs/AboutMe.vue";
import ExportImport from "@/entrypoints/options/pages/ExportImport.vue";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import StartupIntroDetail from "./pages/docs/StartupIntroDetail.vue";
import NotSupport from "./pages/docs/NotSupport.vue";

const { isDisguise } = useDevSetting();

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: MainLayout,
      children: [
        { path: "/", component: HomePage },
        { path: "/doc", component: IFrameDocSite },
        { path: "/startup", component: StartupIntro },
        { path: "/startup-detail", component: StartupIntroDetail },
        { path: "/not-support", component: NotSupport },
        { path: "/about", component: AboutMe },
        { path: "/debug", component: OptionDebugEntry },
        { path: "/settings", component: SettingsPage },
        { path: "/blocks", component: BlocksPage },
        { path: "/export", component: ExportImport },

        { path: "/h/task/list", component: HouseTaskList },
        { path: "/h/task/change", component: HouseChangeList },
        { path: "/h/task/status/change", component: HouseStatusChangeList },
        { path: "/h/task/detail", component: HouseDetailPage },
        { path: "/h/group/list", component: HouseGroupList },
        { path: "/h/group/detail", component: TaskGroupDetail },

        { path: "/c/task/list", component: CommunityTaskList },
        { path: "/c/group/list", component: CommunityGroupList },
        { path: "/c/task/detail", component: CommunityDetailPage },
        { path: "/c/group/detail", component: TaskGroupDetail },
        { path: "/c/record", component: CommunityRecordPage },

        { path: "h/update/preview", component: HouseUpdatePreview },
        { path: "c/update/preview", component: CommunityUpdatePreview },

        /**
         * ke rent
         */
        { path: "/ke/rent/c/task/list", component: KeRentCommunityTaskList },
        {
          path: "/ke/rent/c/task/detail",
          component: KeRentCommunityDetailPage,
        },
        { path: "/ke/rent/c/record", component: KeRentCommunityRecordPage },
        {
          path: "/ke/rent/c/update/preview",
          component: KeRentCommunityUpdatePreview,
        },
      ],
    },
    { path: "/h/running/notice", component: HouseBatchRunningNotice },
    { path: "/c/running/notice", component: BatchRunningNotice },
    { path: "/ke/rent/c/running/notice", component: KeRentBatchRunningNotice },
  ],
});
console.log("init options vue");

if (isDisguise) {
  import("~/assets/disguise.css");
}

createApp(App).use(router).use(VueQueryPlugin).mount("#app");
