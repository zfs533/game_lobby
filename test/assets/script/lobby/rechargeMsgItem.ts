import agentUtil from "./agentUtil";
import { toj, loadUrlImg } from "../common/util";
import { rechargeMessageInfo } from "./rechargeMessage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargeMsgItem extends cc.Component {
    @property(cc.Node)
    ndContent: cc.Node = undefined;

    @property(cc.Node)
    ndPage1: cc.Node = undefined;

    @property(cc.Button)
    btnPage2: cc.Button = undefined;

    @property(cc.Sprite)
    spIcon: cc.Sprite = undefined;

    @property(cc.Node)
    ndMess: cc.Node = undefined;

    @property(cc.Button)
    btnPayRebate: cc.Button = undefined;

    @property(cc.Node)
    ndMessBg: cc.Node = undefined;

    @property(cc.Label)
    lblMessNum: cc.Label = undefined;

    @property(cc.Label)
    lblName: cc.Label = undefined;

    @property(cc.Label)
    lblInfo: cc.Label = undefined;

    @property(cc.Label)
    lblTime: cc.Label = undefined;


    async setInfo(data: rechargeMessageInfo) {
        try {
            this.lblName.string = data.aName;
            this.lblInfo.string = data.content;
            if (data.createDate) {
                this.lblTime.string = this.createTimeLabel(data.createDate);
            } else {
                this.lblTime.string = "";
            }
            if (data.messageNum > 0 && data.messageNum < 99) {
                this.ndMess.active = true;
                let str = data.messageNum.toString();
                this.lblMessNum.string = str;
                if (str.length > 1) {
                    this.ndMessBg.width = this.lblMessNum.node.width + (20 * str.length);
                }
            } else if (data.messageNum > 98) {
                this.lblMessNum.string = "99+";
                this.ndMessBg.width = 60;
            } else {
                this.ndMess.active = false;
            }
            if (!agentUtil.platWsUrl) {
                let chatIdhead = data.aUid + "head";
                let head: string = toj(cc.sys.localStorage.getItem(chatIdhead));
                //console.log("<<<<<  开始换头像", head);
                if (head && cc.sys.isNative) {
                    agentUtil.saveBase64ToFile(head);
                    await agentUtil.loadTmpPng(this.spIcon);
                }
            } else {
                if (data.aHead && cc.sys.isNative) loadUrlImg(data.aHead, this.spIcon);
            }
            //console.log("<<<<<  头像已经换好了", iconSp);
            this.btnPayRebate.clickEvents[0].customEventData = data.aUid;
            this.btnPage2.clickEvents[0].customEventData = data.localChatId;
        } catch (error) {
            cc.log("setInfo   ", error);
        }
    }

    /**
     * 消息的时间
     * @param time
     */
    createTimeLabel(time: number) {
        let showTimeString = "";
        let tDate, nDate, showTime;
        if (agentUtil.platWsUrl) time = time * 1000;
        tDate = new Date(time);   // 传入进来的时间
        nDate = new Date(Date.now());    // 当前时间
        showTime = tDate;

        if (nDate.getFullYear() - tDate.getFullYear() > 0) {    // 超过一年
            showTimeString = `${showTime.getFullYear()}年${showTime.getMonth()}月${showTime.getDay()}日`;
        } else if (nDate.getMonth() - tDate.getMonth() > 0 || nDate.getDay() - tDate.getDay() > 1) {
            showTimeString = `${showTime.getMonth()}月${showTime.getDay()}日`;
        } else if (nDate.getDay() - tDate.getDay() > 0) {
            showTimeString = `昨日${showTime.getHours()}:${showTime.getMinutes()}`;
            if (showTime.getMinutes() < 10) showTimeString = `昨日${showTime.getHours()}:0${showTime.getMinutes()}`;
        } else if (nDate.getHours() - tDate.getHours() > 0 || nDate.getMinutes() - tDate.getMinutes() > 0) {
            showTimeString = `${showTime.getHours()}:${showTime.getMinutes()}`;
            if (showTime.getMinutes() < 10) showTimeString = `${showTime.getHours()}:0${showTime.getMinutes()}`;
        } else {
            showTimeString = `${showTime.getHours()}:${showTime.getMinutes()}`;
        }
        return showTimeString;
    }
}
