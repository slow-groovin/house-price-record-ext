export const isDisguise = import.meta.env.MODE === "development" && false;
export const isDebug = import.meta.env.MODE === "development" && true;
export function useDevSetting() {
  return { isDisguise, isDebug };
}

export const curVersionChangeLog = `
## 1.1.1

**2025-04-30**
修复导入租房数据时错误
`;
export const historyChangeLog = `

## 1.1.0

**2025-04-06**

1. 新增: 租房 🆕
2. 新增: 运行二手房小区任务增加成交信息
3. 小区列表导出选中记录到 csv
4. 切换筛选条件后如果当前页没有数据自动跳转到第一页
5. 增加公共反馈入口
6. 功能变更: 之前的分组弃用, 新的分组可以包含不同类型的任务
7. 若干交互体验优化

(更新后的首次运行, 显示的统计数据中近期(当前周)成交数量可能比实际的数量更多)


## 1.0.4
**2025-03-09**

1. 小区默认页面也可以显示任务浮动窗口了
2. 数据结果入库过程/导入过程中如果进行退出,进行确认
3. 时间范围选择增加"近一周","近一月","近半年"便捷操作
4. 本周新增数据概览变更: 价格变更记录 -> 涨价记录,降价记录; 状态变更记录 -> 上架记录,下架记录;
5. 新的页面样式
6. 修复 block rules 初始化时没有生效的 bug
7. 添加对不支持的浏览器的提醒
`;
