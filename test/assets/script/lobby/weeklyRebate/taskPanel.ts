import { WeeklyRebateModel } from "./weeklyRebateModel";
import TaskItem from "./taskItem";
import * as util from "../../common/util";
import { ErrCodes } from "../../common/code";
import { showTip, showConfirm } from "../../common/ui";
import net from "../../common/net";



const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskPanel extends cc.Component {

    @property({ type: cc.Label, tooltip: "剩余可完成的任务" })
    frequencyLabel: cc.Label = null;

    @property({ type: cc.ProgressBar, tooltip: "活跃度进度条" })
    progressBar: cc.ProgressBar = null;

    @property({ type: cc.Node, tooltip: "任务列表content" })
    content: cc.Node = null;

    @property({ type: cc.Prefab, tooltip: "任务列表预制资源" })
    taskItmePfb: cc.Prefab = null;

    @property({ type: [cc.Button], tooltip: "宝箱按钮数组" })
    treasure: Array<cc.Button> = [];

    @property({ type: cc.Label, tooltip: "刷新倒计时" })
    countdownLable: cc.Label = null;

    @property({ type: cc.Label, tooltip: "刷新次数" })
    refreshContLabel: cc.Label = null;

    @property({ type: cc.Button, tooltip: "刷新按钮" })
    refreshButton: cc.Button = null;


    @property({ type: cc.Node, tooltip: "周返利主界面左边显示界面" })
    week_Left: cc.Node = null;


    @property({ type: [cc.SpriteFrame], tooltip: "宝箱按钮精灵图片数组" })
    treasureSPr: Array<cc.SpriteFrame> = [];

    @property({ type: [cc.Node], tooltip: "宝箱已领取显示对勾" })
    receivedSpr: Array<cc.Node> = [];
    requestInfoCDTime: number = 2 * 60 * 60 * 1000; //单位秒

    prizeType: Array<string> = [
        "未中奖",
        "金币",
        "红包",
        "炮台皮肤",
        "头像框",
        "激活码",
        "实物奖励",
        "抽奖次数",
        "刷新任务次数",
        "皮肤碎片",
        "头像框碎片",
        "返利系数",
        "抽奖卷"
    ];


    onEnable() {
        let weekModel = WeeklyRebateModel.instance();
        weekModel.isGift = false;
        this.refreshTaskProgress();
        this.refreshTaskList();
    }

    /**
     *刷新任务进度
     */
    refreshTaskProgress() {
        let weeklyRebateModel = WeeklyRebateModel.instance();
        if (weeklyRebateModel.scoreInfo == undefined || weeklyRebateModel.scoreInfo == null) return;
        if (weeklyRebateModel.scoreInfo.activeScore <= 15) {
            this.frequencyLabel.string = weeklyRebateModel.scoreInfo.activeScore + "/15";
        }
        let widthdd: number;
        if (weeklyRebateModel.scoreInfo.activeScore > 15) {
            widthdd = 15;
        } else {
            widthdd = weeklyRebateModel.scoreInfo.activeScore;
        }
        let bar = this.progressBar.node.getChildByName("bar");
        bar.width = widthdd * 30;
        for (let index = 0; index < this.treasure.length; index++) {
            let element = this.treasure[index];
            element.interactable = false;
        }
        if (!weeklyRebateModel.cfgConditions) return;
        for (let index = 0; index < weeklyRebateModel.cfgConditions.length; index++) {
            let element = weeklyRebateModel.cfgConditions[index];
            let button = this.treasure[index];
            let receivedSpr = this.receivedSpr[index];
            let ainm = button.node.getChildByName("ainm"); //代领取动画
            let ainm1 = button.node.getChildByName("ainm"); //领取动画
            let lab = button.node.getChildByName("lab");
            ainm1.active = false;
            if (element.get === 0 && +element.activeScore <= weeklyRebateModel.scoreInfo.activeScore) {
                button.interactable = true;
                ainm.active = true;
                button.node.getComponent(cc.Sprite).spriteFrame = this.treasureSPr[0];
                ainm.getComponent(cc.Animation).play();
                receivedSpr.active = false;
                lab.active = true;
            } else if (element.get === 1) {//当前状态宝箱为已领取过
                ainm.getComponent(cc.Animation).stop();
                ainm.active = false;
                button.node.getComponent(cc.Sprite).spriteFrame = this.treasureSPr[1];
                button.enableAutoGrayEffect = false;
                button.interactable = false;
                receivedSpr.active = true;
                lab.active = false;
            } else {
                ainm.getComponent(cc.Animation).stop();
                button.node.getComponent(cc.Sprite).spriteFrame = this.treasureSPr[0];
                ainm.active = false;
                button.enableAutoGrayEffect = true;
                button.interactable = false;
                receivedSpr.active = false;
                lab.active = true;
            }
        }
    }

    /**
     * 刷新任务列表
     */
    refreshTaskList() {
        let weeklyRebateModel = WeeklyRebateModel.instance();
        if (weeklyRebateModel.taskInfo == undefined || weeklyRebateModel.taskInfo == null) return;
        this.refreshContLabel.string = "剩余刷新次数：" + weeklyRebateModel.refreshTimes;
        if (!weeklyRebateModel.theTaskIsAllCompleted()) { //任务没有全部完成才能刷新
            let curTime = (new Date).getTime();
            if (weeklyRebateModel.lastRefreshDate === 0 || curTime - weeklyRebateModel.lastRefreshDate > this.requestInfoCDTime) {
                this.countdownLable.string = "00:00:00";
                this.refreshButton.interactable = true;
            } else {
                this.refreshCountdownImplementation();
                this.refreshButton.interactable = false;
            }
            if (weeklyRebateModel.refreshTimes <= 0) this.refreshButton.interactable = false;
        } else { //任务全部完成之后江不能刷新
            this.countdownLable.string = "00:00:00";
            this.refreshButton.interactable = false;
        }
        this.content.removeAllChildren();
        let taskInfom = weeklyRebateModel.taskInfo;
        for (let index = 0; index < taskInfom.length; index++) {
            let element = taskInfom[index];
            let taskItem = cc.instantiate(this.taskItmePfb);
            let taskitmeSp = taskItem.getComponent(TaskItem);
            taskitmeSp.setData(element);
            taskItem.parent = this.content;
        }
    }

    /**
     * 点击刷新任务按钮调用
     */
    async clickTheRefreshButton() {
        let self = this;
        let weeklyRebateModel = WeeklyRebateModel.instance();
        let data = await net.request("event.eventHandler.refreshEventTask", { actId: weeklyRebateModel.actId })
        // console.log("刷新任务==>", data);
        if (data.code != 200) {
            showTip(ErrCodes.getErrStr(data.code, "刷新失败！"));
            return;
        }
        showTip("刷新成功！");
        // weeklyRebateModel = WeeklyRebateModel.instance();
        weeklyRebateModel.taskInfo = data.info;
        weeklyRebateModel.refreshTimes = data.refreshTimes;
        weeklyRebateModel.lastRefreshDate = data.lastRefreshDate;//最后刷新时间
        if (data.refreshTimes <= 0) weeklyRebateModel.refreshTimes = 0;
        self.refreshTaskList();
        self.refreshButton.interactable = false;
    }

    /**
     * 点击领取宝箱
     * @param event
     * @param info 宝箱编号
     */
    async clickToPickUpTreasureChest(event: cc.Event, info: string) {
        let self = this;
        let weeklyRebateModel = WeeklyRebateModel.instance();
        if ((+info - 1) >= weeklyRebateModel.cfgConditions.length) {
            showTip("领取错误！");
            return;
        }
        let phaseId = weeklyRebateModel.cfgConditions[+info - 1].phaseId;

        let data = await net.request("event.eventHandler.receiveReward", { actId: weeklyRebateModel.actId, phaseId: phaseId })
        // console.log("领取宝箱返回===>", data);
        if (data.code != 200) {
            showTip(ErrCodes.getErrStr(data.code, "领取失败！"));
            return;
        }
        weeklyRebateModel.cfgConditions[+info - 1].get = 1;
        let ainm = self.treasure[+info - 1].node.getChildByName("ainm");
        let lab = self.treasure[+info - 1].node.getChildByName("lab");
        lab.active = false;
        ainm.getComponent(cc.Animation).stop();
        ainm.active = false;
        self.treasure[+info - 1].enableAutoGrayEffect = false;
        self.treasure[+info - 1].interactable = false;
        self.treasure[+info - 1].node.getComponent(cc.Sprite).spriteFrame = this.treasureSPr[1];
        self.receivedSpr[+info - 1].active = true;
        if (data.info.type == 12) {
            let quantity = +data.info.quantity;
            weeklyRebateModel.LotteryRoll += quantity;
            //领了宝箱之后肯定是能抽奖的
            let ts = self.week_Left.getChildByName("lottery").getChildByName("tiShi");
            ts.active = true;
        }
        showConfirm("恭喜您获得:" + data.info.quantity + data.info.name);
    }

    /**
     * 获取奖品类型
     * @param type 奖品类型
     */
    getThePrizeType(type: number): string {
        if (!this.prizeType[type]) {
            return this.prizeType[0];
        }
        return this.prizeType[type];
    }

    /**
     * 调用定时器刷新倒计时
     */
    refreshCountdownImplementation() {
        this.schedule(this.refreshTime, 1, cc.macro.REPEAT_FOREVER)
    }

    /**
     * 刷新时间
     */
    refreshTime() {
        let weeklyRebateModel = WeeklyRebateModel.instance();
        let self = this;
        let curTime = (new Date).getTime();
        let time = self.requestInfoCDTime - (curTime - weeklyRebateModel.lastRefreshDate);
        let aa = self.setTime(time / 1000);
        self.countdownLable.string = aa.hours + ":" + aa.mins + ":" + aa.secs;
        if (self.node.active === false) {
            self.unschedule(this.refreshTime);
        }
        if (self.requestInfoCDTime - (curTime - weeklyRebateModel.lastRefreshDate) <= 0) {
            this.countdownLable.string = "00:00:00";
            if (weeklyRebateModel.refreshTimes > 0) this.refreshButton.interactable = true;
            self.unschedule(this.refreshTime);
        }
    }

    /**
     * 设置时间
     * @param num
     */
    setTime(num: number) {
        //num是秒数    98876秒  有多少天： xx天xx时xx分xx秒
        var sec = this.setDb(Math.round(num % 60)); //06 秒
        var min = this.setDb(Math.floor(num / 60) % 60); //Math.floor(num / 60) % 60     分
        var hour = this.setDb(Math.floor(num / 60 / 60) % 24); //时
        var day = this.setDb(Math.floor(num / 60 / 60 / 24)); //天数
        // var mon = setDb()

        return {
            secs: sec,
            mins: min,
            hours: hour,
            days: day
        }

    }

    /**
     * 补零函数:toDB(num)
 	 * 参数：num数字
     * 返回值：小于10的补零返回
     */
    setDb(num: number) {
        //补零操作
        if (num < 10) {
            return '0' + num;
        } else {
            return '' + num;
        }
    }



}
