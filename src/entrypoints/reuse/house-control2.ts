import { HouseItem, HouseTask, HouseTaskStatus } from "@/types/lj";
import { sendMessage } from "@@/messaging";
import {
  genHousePageUrl,
  isCaptchaPage,
  isHouseSoldPage,
  isLoginPage,
} from "@/utils/lj-url";
import { db } from "@/entrypoints/db/Dexie";
import { NoRetryError, PauseError } from "@/utils/lib/BatchQueueExecutor";
import { openTabAndRun } from "@/utils/tab-utils";
import type {
  HouseNormal,
  HouseSold,
  HouseUpdateBase,
} from "@/types/LjUpdatePreview";
import { retry } from "radash";
import { browser } from "wxt/browser";

const LOG_PREFIX = "[house-control]";

/**
 * 打开运行房源任务的入口页面(会打开一个新的浏览器窗口)
 * @param hidList
 */
export async function goRunHouseTasksStartPage(hidList: string[]) {
  const id = await db.tempBatchHouse.add({ hidList });

  const newWindow = await browser.windows.create({
    url: "/options.html#/h/running/notice",
    state: "maximized",
  });
  await chrome.sidePanel.open({ windowId: newWindow.id as number });
  await chrome.sidePanel.setOptions({
    path: "/sidepanel.html#/h/batch?id=" + id,
  });
}

/**
 * 从background/popup调用, 对一个house进行抓取,更新
 * @param hid
 */
export async function oneHouseEntry(
  hid: string
): Promise<HouseNormal | HouseUpdateBase | HouseSold | undefined> {
  const LOG_PREFIX = `[house-control][hid:${hid}]`;
  console.log(LOG_PREFIX, "begin ");
  /*
   * verify task in db
   */
  let task = await db.houseTasks.where("hid").equals(hid).first();
  if (!task) {
    throw new Error(`${LOG_PREFIX} hid: ${hid} not exist!`);
  }
  const url = genHousePageUrl(task.city, task.hid);
  /*
	verify status
	 */
  const fetchRs = await fetch(url);
  if (fetchRs.status === 404) {
    //update status: miss
    console.log(LOG_PREFIX, "house miss");
    return { hid: hid, type: "miss" } as HouseUpdateBase;
  }

  if (fetchRs.status === 200 && fetchRs.redirected) {
    //redirect
    if (isCaptchaPage(fetchRs.url)) {
      //  captcha
      throw new PauseError(
        "遭遇了验证码, 请打开网页通过验证码后, 确保页面能正常打开后手动恢复运行!"
      );
    }

    if (isLoginPage(fetchRs.url)) {
      //login
      throw new PauseError(
        "需要登录, 请先打开网页登录后, 确保页面能正常打开后手动恢复运行!"
      );
    }

    if (isHouseSoldPage(fetchRs.url)) {
      //sold
      console.log(LOG_PREFIX, "house sold");
      return await openTabAndRun({ url, active: false }, async (tab) => {
        return handleSoldPage(tab.id as number, task);
      });
    }

    throw new NoRetryError(LOG_PREFIX + "unknown redirect!:" + fetchRs.url);
  }

  if (fetchRs.status === 200 && !fetchRs.redirected) {
    // normal, still running
    console.log(LOG_PREFIX, "house status is normal ");

    return await openTabAndRun({ url, active: false }, async (tab) => {
      return handleNormalPage(tab.id as number, task);
    });
  }
}

async function handleSoldPage(
  pageId: number,
  taskInDb: HouseTask
): Promise<HouseSold> {
  //发送message ,让页面进行parse item
  let respParsedItem: { price: number; soldDate?: string } | undefined =
    undefined;
  await retry({ times: 10, delay: 1000 }, async () => {
    respParsedItem = await sendMessage("parseHouseSold", undefined, pageId);
  });

  console.log(LOG_PREFIX, "receive parseHouseSold result:", respParsedItem);

  const houseSoldPreview: HouseSold = {
    type: "sold",
    hid: taskInDb.hid,
    soldDate: respParsedItem!.soldDate as string,
  };
  if (respParsedItem!.price !== taskInDb.totalPrice) {
    houseSoldPreview.newPrice = respParsedItem!.price;
  }
  return houseSoldPreview;
}

/**
 * 开启一次爬取, 向content发送message, 根据页面抓取结果更新任务自身,以及新建changes
 * @param pageTabId
 * @param taskInDb
 */
export async function handleNormalPage(
  pageTabId: number,
  taskInDb: HouseTask
): Promise<HouseNormal> {
  // 发送消息控制 content.js
  // chrome.tabs.sendMessage(pageTabId, { action: "changeBackgroundColor", color: "#FF0000" }, (response) => {
  // 	console.log("Response from content.js:", response);
  // });
  //发送message ,让页面进行parse item
  let respParsedItem: HouseItem | undefined = undefined;
  await retry({ times: 10, delay: 1000 }, async () => {
    respParsedItem = await sendMessage("parseHouse", undefined, pageTabId);
  });
  console.log(
    LOG_PREFIX,
    "[handleNormalPage]receive parseHouse result:",
    respParsedItem
  );
  return generateNormalPageUpdatePreview(respParsedItem!, taskInDb);
}

/**
 * 根据页面parse result和 task in db,对比,生成更新的preview, 抽出来为单独的函数方便content.js中的过程直接调用
 * @param parseItem
 * @param taskInDb
 */
export function generateNormalPageUpdatePreview(
  parseItem: HouseItem,
  taskInDb: HouseTask
): HouseNormal {
  const updatePreview: HouseNormal = {
    type: "normal",
    hid: taskInDb.hid,
    /*
		这些字段根据对比情况设置
		 */
    // newPrice: 0,
    // newStatus: undefined,
    // updateChanges: undefined,
    // commonFieldChanges: [],
  };
  //对比获取更新字段
  const { dexieUpdateChanges, commonFieldChanges } = genTaskUpdateChanges(
    taskInDb,
    parseItem
  );
  //如果普通字段发生更新, 则需要更新
  if (dexieUpdateChanges && Object.keys(dexieUpdateChanges).length > 0) {
    updatePreview.updateChanges = dexieUpdateChanges;
  }
  //如果非价格字段发生更新, 则需要更新commonFieldChanges
  if (commonFieldChanges && commonFieldChanges.length > 0) {
    updatePreview.commonFieldChanges = commonFieldChanges;
  }
  //如果price发生变动, 增加houseChanges记录
  if (parseItem.totalPrice && taskInDb?.totalPrice !== parseItem.totalPrice) {
    updatePreview.newPrice = parseItem.totalPrice;
  }
  //如果之前状态不是normal,则新增 houseStatusChanges
  if (taskInDb.status !== HouseTaskStatus.running) {
    updatePreview.newStatus = HouseTaskStatus.running;
  }
  return updatePreview;
}

/**
 * Prompt: 实现一个函数，用于找出HouseTask中需要更新的字段，生成: 1.适合Dexie.js的更新结构 2.非价格字段(需要记录的变更的通用字段)
 * 简介: 此函数比较两个对象(HouseTask 和 HouseItem)的公共字段，生成需要更新的字段和变更列表。
 *
 * @param houseTask - 当前的HouseTask实例。
 * @param respParsedItem - 新的HouseItem数据，需与当前任务比较。
 * @returns 包含Dexie.js更新所需的字段和字段变更列表的对象。
 */
export function genTaskUpdateChanges(
  houseTask: HouseTask,
  respParsedItem: HouseItem
): {
  dexieUpdateChanges: Record<keyof HouseTask, any>;
  commonFieldChanges: { name: string; newValue: any; oldValue: any }[];
} {
  // 定义需要比较的字段，排除状态字段和不可变字段
  const fieldsToCheck: (keyof HouseItem)[] = [
    "totalPrice",
    "unitPrice",
    "area",
    "name",
    "onSellDate",
    "orientation",
    "buildingType",
    "yearBuilt",
    "roomType",
    "roomSubType",
    "orientation",
    "realArea",
    "realUnitPrice",
  ];
  //记录common change时需要排除的价格字段
  const fieldsExcludeInCommonChange: (keyof HouseItem)[] = [
    "unitPrice",
    "realUnitPrice",
    "totalPrice",
  ];

  const dexieUpdateChanges: Record<string, any> = {}; // Dexie更新结构
  const commonFieldChanges: { name: string; newValue: any; oldValue: any }[] =
    []; // 变更记录列表

  // 遍历需要比较的字段
  fieldsToCheck.forEach((field) => {
    const oldValue = houseTask[field];
    const newValue = respParsedItem[field];

    // 仅在新值和旧值不相等时记录
    if (newValue !== undefined && newValue !== null && oldValue !== newValue) {
      dexieUpdateChanges[field] = newValue; // 添加到更新结构
      if (
        oldValue !== undefined &&
        oldValue != null &&
        !fieldsExcludeInCommonChange.includes(field)
      ) {
        commonFieldChanges.push({ name: field, newValue, oldValue }); // 添加到变更记录
      }
    }
  });

  return { dexieUpdateChanges, commonFieldChanges };
}
