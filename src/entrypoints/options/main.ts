import { createApp } from "vue";
import "~/assets/tailwind.css";
import "~/assets/shacn.css";
import App from "./App.vue";
import { createRouter, createWebHashHistory } from "vue-router";
import OptionDebugEntry from "@/entrypoints/options/pages/OptionDebugEntry.vue";
import MainLayout from "@/entrypoints/options/components/layout/MainLayout.vue";
import HomePage from "@/entrypoints/options/pages/sell/HomePage.vue";

import { VueQueryPlugin } from "@tanstack/vue-query";
import CommunityUpdatePreview from "@/entrypoints/options/pages/sell/community/CommunityUpdatePreview.vue";
import CommunityDetailPage from "@/entrypoints/options/pages/sell/community/CommunityDetailPage.vue";
import CommunityRecordPage from "@/entrypoints/options/pages/sell/community/CommunityRecordPage.vue";
import CommunityTaskList from "@/entrypoints/options/pages/sell/community/CommunityTaskList.vue";
import BatchRunningNotice from "@/entrypoints/options/pages/sell/community/BatchRunningNotice.vue";

import RentCommunityUpdatePreview from "@/entrypoints/options/pages/rent/community/RentCommunityUpdatePreview.vue";
import RentCommunityDetailPage from "@/entrypoints/options/pages/rent/community/RentCommunityDetailPage.vue";
import RentCommunityRecordPage from "@/entrypoints/options/pages/rent/community/RentCommunityRecordPage.vue";
import RentCommunityTaskList from "@/entrypoints/options/pages/rent/community/RentCommunityTaskList.vue";

import SettingsPage from "@/entrypoints/options/pages/SettingsPage.vue";
import HouseTaskList from "@/entrypoints/options/pages/sell/house/HouseTaskList.vue";
import HouseChangeList from "@/entrypoints/options/pages/sell/house/HouseChangeList.vue";
import HouseStatusChangeList from "@/entrypoints/options/pages/sell/house/HouseStatusChangeList.vue";
import HouseDetailPage from "@/entrypoints/options/pages/sell/house/HouseDetailPage.vue";
import HouseUpdatePreview from "@/entrypoints/options/pages/sell/house/HouseUpdatePreview.vue";
import TaskGroupDetail from "@/entrypoints/options/pages/TaskGroupDetail.vue";
import HouseBatchRunningNotice from "@/entrypoints/options/pages/sell/house/BatchRunningNotice.vue";
import BlocksPage from "@/entrypoints/options/pages/BlocksPage.vue";
import IFrameDocSite from "@/entrypoints/options/pages/IFrameDocSite.vue";
import StartupIntro from "@/entrypoints/options/pages/docs/StartupIntro.vue";
import AboutMe from "@/entrypoints/options/pages/docs/AboutMe.vue";
import Feedback from "@/entrypoints/options/pages/docs/Feedback.vue";
import CHANGELOG from "@/entrypoints/options/pages/docs/CHANGELOG.vue";
import ExportImport from "@/entrypoints/options/pages/ExportImport.vue";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import NotSupport from "./pages/docs/NotSupport.vue";
import RentHousePriceChangeList from "@/entrypoints/options/pages/rent/house/RentHousePriceChangeList.vue";
import RentHouseStatusChangeList from "@/entrypoints/options/pages/rent/house/RentHouseStatusChangeList.vue";
import RentHouseTaskList from "@/entrypoints/options/pages/rent/house/RentHouseTaskList.vue";
import RentHouseDetailPage from "./pages/rent/house/RentHouseDetailPage.vue";

import Index from "./pages/Index.vue";
import RunningRentNotice from "./pages/rent/community/RunningRentNotice.vue";
import GroupList from "./pages/GroupList.vue";

const { isDisguise } = useDevSetting();

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: MainLayout,
      children: [
        { path: "/", component: Index },
        { path: "/doc", component: IFrameDocSite },
        { path: "/startup", component: StartupIntro },
        { path: "/not-support", component: NotSupport },
        { path: "/about", component: AboutMe },
        { path: "/feedback", component: Feedback },
        { path: "/CHANGELOG", component: CHANGELOG },
        { path: "/debug", component: OptionDebugEntry },
        { path: "/settings", component: SettingsPage },
        { path: "/blocks", component: BlocksPage },
        { path: "/export", component: ExportImport },

        { path: "/h/task/list", component: HouseTaskList },
        { path: "/h/task/change", component: HouseChangeList },
        { path: "/h/task/status/change", component: HouseStatusChangeList },
        { path: "/h/task/detail", component: HouseDetailPage },

        { path: "/c/task/list", component: CommunityTaskList },
        { path: "/c/task/detail", component: CommunityDetailPage },
        { path: "/c/record", component: CommunityRecordPage },

        { path: "h/update/preview", component: HouseUpdatePreview },
        { path: "c/update/preview", component: CommunityUpdatePreview },

        /**
         * group
         */
        { path: "/group/list", component: GroupList },
        { path: "/group/detail", component: TaskGroupDetail },

        /**
         * ke rent
         */
        { path: "/rent/c/task/list", component: RentCommunityTaskList },
        { path: "/rent/c/task/detail", component: RentCommunityDetailPage },
        { path: "/rent/c/record", component: RentCommunityRecordPage },
        {
          path: "/rent/c/update/preview",
          component: RentCommunityUpdatePreview,
        },
        { path: "/rent/h/task/list", component: RentHouseTaskList },
        { path: "/rent/h/task/detail", component: RentHouseDetailPage },
        {
          path: "/rent/h/task/price/change",
          component: RentHousePriceChangeList,
        },
        {
          path: "/rent/h/task/status/change",
          component: RentHouseStatusChangeList,
        },
      ],
    },
    { path: "/h/running/notice", component: HouseBatchRunningNotice },
    { path: "/c/running/notice", component: BatchRunningNotice },
    { path: "/rent/c/running/notice", component: RunningRentNotice },
  ],
});
console.log("init options vue");

if (isDisguise) {
  import("~/assets/disguise.css");
}

createApp(App).use(router).use(VueQueryPlugin).mount("#app");
