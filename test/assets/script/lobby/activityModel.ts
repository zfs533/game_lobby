export enum PopUpType {
    Event = "Event",//活动
    Bulletin = "Bulletin"//公告
}

export enum ActivityPanelType {
    ACTIVITY = 0,
    ANNOUNCEMENT,
}

export interface ActivityBtnData {
    /* 活动还是公告 */
    type: number;
    /* 原始数据结构 */
    originData: any;
    title: string;
    idx: number;
}

export enum EventType {
    /* 充值返利 */
    recharge = "recharge",
    /* 排名活动 */
    rank = "rank",
    /* 抽奖活动 */
    lottery = "lottery",
    /* 累计活动 */
    accumulative = "accumulative",
    /* 流水返利 */
    waterRebate = "waterRebate",
    /* 首冲活动 */
    firstRecharge = 'firstRecharge',
    /* 七日签到活动 */
    signupReward = "signupReward",
    /* 红包活动 */
    redEnvelope = "redEnvelope",
}

export default class ActivityModel {

    /* 活动类型，活动列表 */
    activityDataList: Array<any> = [];

    activityDataMap: any = {};

    /* 弹窗优先展示及排序 */
    popUpData: ps.PopUp[];


    private static _instance: ActivityModel;
    public static instance(): ActivityModel {
        if (!this._instance) {
            this._instance = new ActivityModel();
        }
        return this._instance;
    }
    initData(data: any) {
        data.sort((a, b) => { return a.idx - b.idx });
        this.activityDataList = data;
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            let activitType = element.eventType;
            this.activityDataMap[activitType] = element;
        }
    }

    /**
     * 统一封装一下活动面板左边列表按钮数据结构
     * @param data
     * @param type ActivityPanelType
     */
    getActivityBtnItemData(data: any, type: number): ActivityBtnData {
        let redata: ActivityBtnData = { type: type, originData: data, title: "", idx: 0 }
        redata.originData = data;
        if (data.title) {
            redata.title = data.title;
        }
        else if (data.name) {
            redata.title = data.name;
        }
        if (data.idx) {
            redata.idx = data.idx;
        }
        return redata;
    }

}
