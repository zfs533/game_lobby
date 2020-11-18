import { ErrCodes } from "../common/code";
import net from "../common/net";
import { showTip } from "../common/ui";

const { ccclass, property } = cc._decorator;

interface ReceiveTime {
    start: string; //领取开始时间
    end: string;//领取结束时间
}

export interface getRedEnvelopeInfo {
    code: number; //code码，200 表示ok
    bReceive: number; // 今日是否已经领取
    times: ReceiveTime[];  //领取时间段
    rechargeLimit?: string;//充值下限
}

export interface receiveRedEnvelope {
    code: number;  //code码，200 表示ok
    money: string; //领取红包金额
}

enum redErr {
    NOT_RECEIVE_TIME = 13020,        // 不在领取时间内
    NO_RECHARGE = 13021,             // 今日无充值
    NOT_ENOUGH_RECHARGE = 13022,     // 今日充值不足
    ALREADY_RECEIVED = 13023,        // 今日已经领取
    NOT_FOUND_GOODS = 13024,         // 找不到奖品
    RECEIVE_MONEY_ILLEGAL = 13025,   // 领取金额非法
}

@ccclass
export default class RedPag extends cc.Component {

    @property(cc.Label)
    valueLimit: cc.Label = undefined;

    @property(cc.Label)
    openTime: cc.Label = undefined;

    @property(cc.Label)
    moneyLabel: cc.Label = undefined;

    @property(cc.Button)
    receiveBtn: cc.Button = undefined;

    @property(cc.Node)
    receivedBtn: cc.Node = undefined;

    @property(cc.Node)
    effectNode: cc.Node = undefined;


    public idx: number;

    async requestData() {
        this.effectNode.active = false;
        let data: getRedEnvelopeInfo = await net.request("event.eventHandler.getRedEnvelopeInfo", { actId: this.idx });
        if (data.code == 200) {
            if (data.bReceive) {
                this.receiveBtn.interactable = false;
                this.receivedBtn.active = true;
            }
            else {
                this.receivedBtn.active = false;
                this.receiveBtn.interactable = true;
            }
            let tStr: string = "";
            for (let i = 0; i < data.times.length; i++) {
                let item = data.times[i];
                tStr += item.start + "-" + item.end + " ";
            }
            tStr += " 准时开抢！";
            this.openTime.string = tStr;
            if (data.rechargeLimit)
                this.valueLimit.string = `当日最低充值${data.rechargeLimit}元，每个ID每日限领取1次。`
        }
        else {
            showTip(`拉取红包数据失败 code: ${data.code}`);
        }
    }

    /**
     * 开红包
     */
    async openRedPag() {
        let data: receiveRedEnvelope = await net.request("event.eventHandler.receiveRedEnvelope", { actId: this.idx });
        switch (data.code) {
            case 200:
                this.moneyLabel.string = data.money;
                this.effectNode.active = true;
                this.receiveBtn.interactable = false;
                break;

            case redErr.NOT_RECEIVE_TIME:
                showTip("不在领取时间内");
                break;

            case redErr.NO_RECHARGE:
                showTip("今日无充值");
                break;

            case redErr.NOT_ENOUGH_RECHARGE:
                showTip("今日充值不足");
                break;

            case redErr.ALREADY_RECEIVED:
                showTip("今日已经领取");
                break;

            case redErr.NOT_FOUND_GOODS:
                showTip("找不到奖品");
                break;

            case redErr.RECEIVE_MONEY_ILLEGAL:
                showTip("领取金额非法");
                break;

            default:
                showTip("code:" + data.code.toString());
                break;
        }
    }


}
