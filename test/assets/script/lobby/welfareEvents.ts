import PopActionBox from "./popActionBox"
import { showLoading, hideLoading, showConfirm, showTip } from "../common/ui";
import Lobby from "./lobby";
import net from "../common/net";

const { ccclass, property } = cc._decorator;

export interface WelfareResult {
    idx: number;
    actId: number;
    name: string;
    onGoing: number;
    eventType: string;
    rechargeChannels?: string[];
}

@ccclass
export class WelfareEvents extends PopActionBox {
    @property(cc.Button)
    private btnReceive: cc.Button = undefined;

    @property([cc.SpriteFrame])
    private btnSpriteFrame: cc.SpriteFrame[] = [];

    private _lobby: Lobby = undefined

    private cfgConditionRecharge: string = "0"; //充值配置
    private cfgConditionChgMoney: string = "0"; //流水配置
    private curConditionRecharge = "0"; //当前充值金额
    private curConditionChgMoney = "0"; //当前流水金额

    private cfgConditionTaxMoney: string = "0"; //税收配置
    private cfgConditionBetMoney: string = "0"; //下注配置
    private curConditionTaxMoney = "0"; //当前充值金额
    private curConditionBetMoney = "0"; //当前流水金额
    private receiveState = 0; // 当前领取状态
    private btnState = -1; // 领取按钮状态： -2: 充值条件未达成， -1: 流水条件未达成， 0： 可领取， 1: 已领取

    onLoad() {
        super.onLoad();
    }

    start() {
        this.openAnim();
    }

    init(lobby: Lobby) {
        this._lobby = lobby;

        let data = {
            cfgCondition: this._lobby.welfareCfgCondition,
            curCondition: this._lobby.welfareCurCondition
        }

        if (data.cfgCondition && data.cfgCondition.length > 0) {
            let cfgCondition = data.cfgCondition[0];
            if (!!cfgCondition.chgMoney) this.cfgConditionChgMoney = cfgCondition.chgMoney;
            if (!!cfgCondition.betMoney) this.cfgConditionBetMoney = cfgCondition.betMoney;
            if (!!cfgCondition.recharge) this.cfgConditionRecharge = cfgCondition.recharge;
            if (!!cfgCondition.taxMoney) this.cfgConditionTaxMoney = cfgCondition.taxMoney;
            this.btnState = data.cfgCondition[0].get;
        }

        if (data.curCondition != undefined && data.curCondition != {}) {
            let curCondition = data.curCondition;
            if (!!curCondition.chgMoney) this.curConditionChgMoney = curCondition.chgMoney;
            if (!!curCondition.betMoney) this.curConditionBetMoney = curCondition.betMoney;
            if (!!curCondition.recharge) this.curConditionRecharge = curCondition.recharge;
            if (!!curCondition.taxMoney) this.curConditionTaxMoney = curCondition.taxMoney;
        }

        if (this._lobby.welfareGetState) this.receiveState = this._lobby.welfareGetState;

        if (data.cfgCondition[0].get === 1) {
            this.changeBtnState(this.btnState);
        } else {
            this.changeBtnState(this.getButtonType());
        }
        this.setBtnState();
    }

    private setBtnState() {
        if (this.curConditionRecharge === undefined || +this.curConditionRecharge < +this.cfgConditionRecharge) {
            this.btnState = -2;
            return;
        }
        if (this.curConditionChgMoney === undefined || +this.curConditionChgMoney < +this.cfgConditionChgMoney) {
            this.btnState = -1;
            return;
        }
        if (this.receiveState === 0) {
            this.btnState = 0;
        } else if (this.receiveState === 1) {
            this.btnState = 1;
        }
        this.changeBtnState(this.btnState);
    }

    private changeBtnState(state: number) {
        let sp = this.btnReceive.getComponent(cc.Sprite);
        let lab = this.btnReceive.getComponentInChildren(cc.Label);
        let outline = this.btnReceive.getComponentInChildren(cc.LabelOutline);
        if (state === -2 || state === -1) {
            sp.spriteFrame = this.btnSpriteFrame[0];
            lab.node.color = (new cc.Color).fromHEX("#0B5A01") // green
            lab.string = "参与活动";
            outline.enabled = false;
        } else if (state === 0) {
            sp.spriteFrame = this.btnSpriteFrame[1];
            lab.node.color = (new cc.Color).fromHEX("#9C3912"); // yellow
            lab.string = "可领取";
            outline.enabled = false;
        } else if (state === 1) {
            this.btnReceive.interactable = false;
            sp.spriteFrame = this.btnSpriteFrame[2];
            lab.node.color = (new cc.Color).fromHEX("#FFFFFF"); // white
            lab.string = "已领取";
            outline.enabled = true;
        }
    }

    onClickReceive() {
        if (!this._lobby) {
            cc.log("活动id不存在");
            return
        }
        if (this.btnState === -2 || this.btnState === -1) {
            this.cantGetWelfare(this.btnState);
        } else if (this.btnState === 0) {
            this.canGetWelfare();
        }
    }

    private cantGetWelfare(state: number) {
        if (state === -2) {
            showTip("充值金额不足，请满足充值条件后领取~");
            this.closeAction(() => {
                this._lobby.onClickRecharge();
            });
        } else if (state === -1) {
            showTip("流水不足20元，请您再多玩一下游戏哦");
        }
    }

    private canGetWelfare() {
        showLoading("福利领取中...");
        this.checkWelfare();
    }

    async checkWelfare() {
        let id = this._lobby.welfareEventID;
        let data = await net.request("event.eventHandler.getPrize", { actId: id, phaseId: 1 });
        if (data.code === 200) {
            showConfirm("恭喜您，会员码领取成功，快去邮件中查收吧～");
            this.btnState = 1;
            this.changeBtnState(this.btnState);
        } else {
            let errCode = data.code;
            if (errCode === 13001) {
                showConfirm("活动期间您的充值金额未满" + this.cfgConditionRecharge + "元，快去充值吧！");
            } else if (errCode === 13002) {
                showConfirm("活动期间您的游戏流水未满" + this.cfgConditionChgMoney + "元，快去游戏吧！");
            } else if (errCode === 13003) {
                showConfirm("您已领取会员码，欢迎下次再参与！");
            } else if (errCode === 13004) {
                showConfirm("会员码已发放完毕，请稍后再试！");
            }
        }
        hideLoading();
    }

    getButtonType() {
        if ((+this.curConditionBetMoney < +this.cfgConditionBetMoney) ||
            (+this.curConditionChgMoney < +this.cfgConditionChgMoney) ||
            (+this.curConditionRecharge < +this.cfgConditionRecharge) ||
            (+this.curConditionTaxMoney < +this.cfgConditionTaxMoney)) return -1;
        return 0;
    }
}
