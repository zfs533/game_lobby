import PopActionBox from "../lobby/popActionBox";
import ActivityModel, { ActivityPanelType, ActivityBtnData, PopUpType, EventType } from "../lobby/activityModel";
import { showLoading, hideLoading, showTip } from "../common/ui";
import net from "../common/net";
import ActivityBtnItem from "./activityBtnItem";
import AnnouncementActivityPanel from "./announcementActivityPanel";
import Lobby from "../lobby/lobby";
import * as util from "../common/util";
import { ErrCodes } from "../common/code";
import TanabataMgr from "../game-qx/TanabataMgr";
import FestivalBefore from "../game-qx/FestivalBefore";
import RedPag from "./Redpag";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActivityPanel extends PopActionBox {
    @property(cc.Node)
    bgPanel: cc.Node = null;

    /* 顶部活动按钮 */
    @property(cc.Toggle)
    topActivity: cc.Toggle = null;

    /* 顶部公告按钮 */
    @property(cc.Toggle)
    topAnnouncement: cc.Toggle = null;

    /* 左边活动按钮列表 */
    @property(cc.Node)
    leftActivityList: cc.Node = null;
    /* 左边公告按钮列表 */
    @property(cc.Node)
    leftAnnouncementList: cc.Node = null;

    @property(cc.Node)
    activityContent: cc.Node = null;
    @property(cc.Node)
    announcementContent: cc.Node = null;

    /* 左边活动按钮item prefab */
    @property(cc.Prefab)
    activityBtnItem: cc.Prefab = null;

    /* 中间活动面板 */
    @property(cc.Node)
    centerActivityPanel: cc.Node = null;

    /* 中间公告面板 */
    @property(cc.Node)
    centerAnnouncementPanel: cc.Node = null;

    @property(cc.Node)
    actPanelArr: cc.Node[] = [];

    @property(cc.Node)
    gou: cc.Node = null;

    /* 复选框 */
    @property(cc.Toggle)
    toggle: cc.Toggle = null;

    /* 视频VIP界面价格 */
    @property(cc.Label)
    vedioPrice: cc.Label = null;

    private annoBtnArr: cc.Node[] = [];
    private actBtnArr: cc.Node[] = [];
    public lobbyScript: Lobby = null;
    /**加载活动处理 */
    LoadingTimeID: any = undefined;
    start() {
        let activityModel = ActivityModel.instance();
        if (activityModel.popUpData) {
            let list = activityModel.popUpData;
            list.sort((a, b) => { return a.idx - b.idx });
            if (list[0].popType == PopUpType.Event) {
                this.initShowPanel(ActivityPanelType.ACTIVITY);
            }
            else {
                if (util.getTheFirstTime()) {
                    this.initShowPanel(ActivityPanelType.ANNOUNCEMENT);
                } else {
                    this.initShowPanel(ActivityPanelType.ACTIVITY);
                }
            }
        } else {
            if (util.getTheFirstTime()) {
                this.initShowPanel(ActivityPanelType.ANNOUNCEMENT);
            } else {
                this.initShowPanel(ActivityPanelType.ACTIVITY);
            }
        }
        this.initTipToggleState();
    }

    async requestInfo() {
        /* 请求公告列表信息，展示左边公告按钮列表项 */
        await this.requestAnnouncementTitleData();
        /* 初始化公告list */
        await this.initAnnouncementList();
        /* 初始化活动按钮 */
        await this.initActivityList();
    }

    /**
     * 初始化活动按钮列表
     */
    async initActivityList() {
        let actModel = ActivityModel.instance();
        for (let i = 0; i < actModel.activityDataList.length; i++) {
            let data = actModel.activityDataList[i];
            let item: cc.Node = cc.instantiate(this.activityBtnItem);
            this.activityContent.addChild(item);
            let dt: ActivityBtnData = actModel.getActivityBtnItemData(data, ActivityPanelType.ACTIVITY);
            item.getComponent(ActivityBtnItem).setData(dt, this);
            this.actBtnArr.push(item);
        }
        /* 初始化默认展示第一个活动 */
        if (actModel.activityDataList.length > 0) {
            this.onEvtActivityItemChangeStatus(this.actBtnArr[0].getComponent(ActivityBtnItem).data);
        }
    }

    /**
     *  请求公告列表btnlist信息，展示左边公告按钮列表项
     */
    async requestAnnouncementTitleData() {
        showLoading("加载信息");
        let data = await net.request("hall.hallHandler.getBulletinTitle");
        hideLoading();
        if (data.code != 200) {
            showTip("加载活动信息失败");
            return;
        }
        // data.titles.sort((a, b) => { return a.idx - b.idx });
        for (let i = 0; i < data.titles.length; i++) {
            let item: cc.Node = cc.instantiate(this.activityBtnItem);
            this.announcementContent.addChild(item);
            let dt: ActivityBtnData = ActivityModel.instance().getActivityBtnItemData(data.titles[i], ActivityPanelType.ANNOUNCEMENT);
            item.getComponent(ActivityBtnItem).setData(dt, this);
            this.annoBtnArr.push(item);
        }
    }

    /**
     * 初始化公告list
     */
    initAnnouncementList() {
        this.annoBtnArr.forEach((item, index) => {
            let script = item.getComponent(ActivityBtnItem);
            if (index == 0) {
                script.changeStatus(true);
                this.setAnnouncementPanelInfo(script.getIdx());
            }
            else {
                script.changeStatus(false);
            }
        });
    }

    /**
     * 初始化活动/公告展示，根据后台配置来定
     */
    initShowPanel(type: number) {
        if (type == ActivityPanelType.ACTIVITY) {
            this.topActivity.isChecked = true;
        }
        else {
            this.topAnnouncement.isChecked = true;
        }
        this.topToggleClick("", type);
    }

    /**
     * 顶部公告/活动切换
     * @param event
     * @param type 0:活动，1:公告
     */
    topToggleClick(event: any, type: number) {
        this.leftActivityList.active = false;
        this.leftAnnouncementList.active = false;
        this.centerActivityPanel.active = false;
        this.centerAnnouncementPanel.active = false;
        if (type == ActivityPanelType.ACTIVITY) {
            this.leftActivityList.active = true;
            this.centerActivityPanel.active = true;
        }
        else {
            this.leftAnnouncementList.active = true;
            this.centerAnnouncementPanel.active = true;
        }
    }

    /**
     * 左边按钮点击事件
     */
    onEvtActivityItemChangeStatus(data: ActivityBtnData) {
        if (data.type == ActivityPanelType.ACTIVITY) {
            this.actBtnArr.forEach(item => {
                let script = item.getComponent(ActivityBtnItem);
                if (script.getIdx() == data.idx) {
                    script.changeStatus(true);
                    this.requestActivityData(data.originData.eventType, data.originData);
                }
                else {
                    script.changeStatus(false);
                }
            });
            this.changeActView(data);
        }
        else {
            this.annoBtnArr.forEach(item => {
                let script = item.getComponent(ActivityBtnItem);
                if (script.getIdx() == data.idx) {
                    script.changeStatus(true);
                    this.setAnnouncementPanelInfo(data.idx);
                }
                else {
                    script.changeStatus(false);
                }
            });
        }
    }

    changeActView(data: ActivityBtnData) {
        this.actPanelArr.forEach(item => {
            item.active = false;
        });
        this.actPanelArr.forEach(async item => {
            if (item.name == data.originData.eventType) {
                if (data.originData.eventType === EventType.lottery) {
                    showLoading("加载中");
                    if (this.LoadingTimeID) {
                        clearTimeout(this.LoadingTimeID);
                        this.LoadingTimeID = undefined;
                    }
                    this.LoadingTimeID = setTimeout(() => {
                        hideLoading();
                        showTip(ErrCodes.getErrStr(TanabataMgr.Instance.actID, "请求无反应"));
                    }, 5000);
                    let data = await net.request("event.eventHandler.getLotteryEventInfo", { actId: TanabataMgr.Instance.actID })
                    if (this.LoadingTimeID) {
                        clearTimeout(this.LoadingTimeID);
                        this.LoadingTimeID = undefined;
                    }
                    hideLoading();
                    if (data.code === 13006) {
                        item.getComponent(FestivalBefore).WarmUpNode.active = true
                        // item.getComponent(FestivalBefore).setStartTime(data.startDate);
                    } else if (data.code === 200) {
                        item.getComponent(FestivalBefore).WarmUpNode.active = false
                    } else {
                        showTip(ErrCodes.getErrStr(data.code, "获取活动数据失败"));
                    }
                }
                else if (data.originData.eventType === EventType.redEnvelope) {
                    let redPag: RedPag = item.getComponent(RedPag);
                    redPag.idx = data.idx;
                    redPag.requestData();
                }

                item.active = true;
            }
        });
    }

    /**
     * 打开福利袋
     */
    openVedioVipView() {
        this.lobbyScript.onClickWelfare();
        this.onClickClose();
    }

    /**
     * 跳转周返利
     */
    openWaterRebate() {
        this.lobbyScript.clickTheWeeklyRebateButton();
        this.onClickClose();
    }

    /**
     * 跳转国庆
     */
    openNationalDay() {
        this.lobbyScript.onClickNationalDay();
        this.onClickClose();
    }
    /**
     * 请求并设置当前公告信息
     * @param idx
     */
    setAnnouncementPanelInfo(idx: number) {
        this.centerAnnouncementPanel.getComponent(AnnouncementActivityPanel).requestContent(String(idx))
    }

    /**
     * 初始化复选框状态
     */
    initTipToggleState() {
        let today = util.formatTimeStr("d");
        let closeTiptime = localStorage.getItem("closeTip");
        if (today == closeTiptime) {
            this.toggle.isChecked = true;
            this.gou.active = true;
        }
    }

    onCloseAutoOpenView(event: cc.Event) {
        let gou = this.gou;
        if (gou.active) {
            let closeTipTime = util.formatTimeStr("d");
            localStorage.setItem("closeTip", closeTipTime);
        } else {
            localStorage.removeItem("closeTip");
        }
    }

    /**
     * 根据当前选择活动，请求其对应数据
     * @param actName
     */
    requestActivityData(actName: string, data: any) {
        switch (actName) {
            case EventType.accumulative://视频VIP
                this.requestAccumulative(data);
                break;
            default: break;
        }
    }

    /**
     * 请求视频vip活动
     */
    async requestAccumulative(dt: any) {
        let data = await net.request("event.eventHandler.getEventReward", { actId: dt.actId });
        if (data.code === 200 && data.cfgCondition.length > 0) {
            let value = data.cfgCondition[0].recharge;
            if (this.vedioPrice) {
                this.vedioPrice.string = value + "";
            }
        }
    }
}
