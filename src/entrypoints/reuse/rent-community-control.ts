import { db } from "@/entrypoints/db/Dexie";
import {
  ParsedRentCommunity,
  RentCommunityRecord,
  RentCommunityTask,
} from "@/types/rent";
import { removeRepeat } from "@/utils/array";
import { genKeRentCommunityPageUrl } from "@/utils/lj-url";
import { stabilizeFields } from "@/utils/variable";
import { sendMessage } from "@@/messaging";
import { list, retry, sleep } from "radash";
import { browser } from "wxt/browser";

const PREFIX = "[oneRentCommunityEntry]";

/**
 * 打开单独窗口和side panel的start page作为开始
 */
export async function goRunRentCommunityTasksStartPage(
  communityList: RentCommunityTask[]
) {
  let item = { communityList };
  const id = await db.tempBatchRentCommunity.add(item);
  const newWindow = await browser.windows.create({
    url: "/options.html#/rent/c/running/notice",
    state: "maximized",
  });
  await chrome.sidePanel.open({ windowId: newWindow.id as number });
  await chrome.sidePanel.setOptions({
    path: "/sidepanel.html#/rent/c/batch?id=" + id,
    // tabId: newWindow?.tabs?.[0]?.id,
  });
}

/**
 * 开始进行单个小区任务
 * @param communityTask
 * @returns
 */

export async function oneRentCommunityEntry(communityTask: RentCommunityTask, opts: { interval: number }) {
  const { cid, city, lastRunningAt } = communityTask;
  /**
   * step 1. 获取页面页数
   */
  const url = genKeRentCommunityPageUrl(city as string, cid, 1);
  const tab = await browser.tabs.create({ url, active: false });
  console.debug(PREFIX, "start url: ", url, tab.id);

  let pageItem: ParsedRentCommunity | undefined = undefined;
  try {
    //重试多次
    await retry({ times: 10, delay: 1000 }, async () => {
      //首先爬取总页数等信息
      pageItem = await sendMessage(
        "parseKeCommunityListOnePage",
        undefined,
        tab.id
      );
      if (!pageItem.maxPageNo || !pageItem.city) {
        throw new Error("pageItem.maxPageNo|city not exist! " + pageItem);
      }
    });
    //pageItem必不为空, 因为retry失败会抛出异常
    console.log("pageItem", pageItem);
    let oneRecord = await crawlOneCommunityListPages({
      cid: pageItem!.cid!,
      city: pageItem!.city!,
      maxPage: pageItem!.maxPageNo,
    }, opts);

    return oneRecord;
  } finally {
    console.debug("exit oneRentCommunityEntry", communityTask.cid);
    await browser.tabs.remove([tab.id as number]);
  }
}

/**
 * 访问单个小区的所有list页面
 * @param input
 * @returns
 */
export async function crawlOneCommunityListPages(input: {
  city: string;
  cid: string;
  maxPage: number;
}, opts: { interval: number }) {
  const { city, cid, maxPage } = input;
  const urlList = list(1, maxPage).map((page) =>
    genKeRentCommunityPageUrl(city, cid, page)
  );

  const parsedResultOfAllPage: ParsedRentCommunity[] = [];
  //依次打开所有参数中的所有url
  for (const url of urlList) {
    //打开之后, 通过message发送命令, 让页面进行页面信息解析并返回解析结果, 等待爬取结果
    await retry({ times: 5, delay: opts.interval }, async () => {
      const tab = await browser.tabs.create({ url, active: false });
      let parsedPageItem: ParsedRentCommunity | undefined = undefined;

      try {
        console.debug("[rent][page]open:", url, tab.id, tab.status);
        parsedPageItem = await retry({ times: 10, delay: 1000 }, () =>
          sendMessage("parseKeCommunityListOnePage", undefined, tab.id)
        );
      } finally {
        console.debug("[rent][page]close:", url, tab.id, tab.status);
        await browser.tabs.remove([tab.id as number]);
      }
      console.debug(
        `[execOneCommunity] one tab[${url}] record resp:`,
        parsedPageItem
      );
      parsedResultOfAllPage.push(parsedPageItem!);
    });
    await sleep(opts.interval)
  }

  verifyDiffPagesItem(parsedResultOfAllPage);

  const record = pageItemResults2Record(parsedResultOfAllPage);
  return record;
}

/**
 * pageItem[] -> record存储
 */
function pageItemResults2Record(
  recordsOfAllPage: ParsedRentCommunity[]
): RentCommunityRecord {
  //创建record对象
  const houseList = [];
  for (let item of recordsOfAllPage) {
    houseList.push(...item.list);
  }

  const {
    result: mergeResult,
    diff,
    hasDiff,
  } = stabilizeFields(recordsOfAllPage, { excludeFields: ["pageNo"] });
  if (hasDiff) {
    console.warn("pages crawl results has diff fields:", diff);
  }

  const listWithoutRepeat = removeRepeat(houseList, (h) => h.rid);
  const record: RentCommunityRecord = {
    ...mergeResult,
    at: Date.now(),
    count: listWithoutRepeat.length,
    avgPrice: Math.floor(
      listWithoutRepeat.reduce((acc, cur) => acc + cur.price, 0) /
      listWithoutRepeat.length
    ),
    list: listWithoutRepeat,

    /*
     * 这四个不能nullish, 所以初始化为空
     */
    added: [],
    removed: [],
    priceDownList: [],
    priceUpList: [],
  };
  return record;
}

/**
 * 校验不同页的结果是否valid
 * @param pagesItem
 */
function verifyDiffPagesItem(pagesItem: ParsedRentCommunity[]) {
  /**
   * hid repeat
   */
  const hidSet = new Map<string, number[]>();
  pagesItem.forEach((item) => {
    item.list.forEach((house) => {
      if (!hidSet.has(house.rid)) {
        hidSet.set(house.rid, []);
      }
      hidSet.get(house.rid)?.push(item.pageNo);
    });
  });

  const repeatResult = hidSet
    .entries()
    .filter((v, k) => {
      return v[1].length > 1;
    })
    .toArray();

  if (repeatResult.length > 0) {
    console.warn(
      `Diff page's data has repeat hid: ${JSON.stringify(repeatResult)}`
    );
  }
}
