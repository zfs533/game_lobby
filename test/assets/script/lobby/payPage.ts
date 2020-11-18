import { ErrCodes } from "../common/code";
import { addSingleEvent, getMoneyStr, getSupportGame, setInteractable } from '../common/util';
import { showLoading, hideLoading, showTip, goToUrl, showConfirm } from "../common/ui";
import Pay from "./pay"
import net from "../common/net";
import PayPageItem from "./payPageItem";
import g from "../g";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RechargePage extends cc.Component {

    @property(cc.Node)

    usdtSurePanel: cc.Node = undefined;
    @property(cc.Node)

    usdtNode: cc.Node = undefined;
    @property(cc.Node)

    usdtHelpNode: cc.Node = undefined;

    @property(cc.Label)
    usdtRate: cc.Label = undefined;
    @property(cc.Label)
    resultUsdt: cc.Label = undefined;

    @property(cc.Label)
    private lblRange: cc.Label = undefined;

    @property(cc.EditBox)
    private ebAmount: cc.EditBox = undefined;

    @property(cc.Button)
    private btnRecharge: cc.Button = undefined;

    @property(cc.Sprite)
    private spCenter: cc.Sprite = undefined;

    @property(cc.Sprite)
    private spRight: cc.Sprite = undefined;

    @property(cc.Label)
    private lblTip: cc.Label = undefined;

    @property(cc.Sprite)
    private spBg: cc.Sprite = undefined;

    @property(cc.Node)
    private ndInput: cc.Node = undefined;

    @property(cc.Node)
    private ndLargeMoneys: cc.Node = undefined;

    @property(cc.Node)
    private ndSmallMoneys: cc.Node = undefined;

    @property(cc.Label)
    private SSSTips: cc.Label = undefined;

    @property(cc.Node)
    private yunPayBt: cc.Node = undefined;

    public mPay: Pay = undefined;

    private payment: string = "";

    private largeBtCount: number = 8;
    private smallBtCount: number = 8;
    limitOtherChannelMaxMoney: number = undefined;
    private channel: string = "";           // 充值渠道
    private pType: string = "";             // 充值类型
    private largeAmtList: number[] = [];    // 大额数值
    private smallAmtList: number[] = [];    // 小额数值
    private isLargeFix: number = 1;         // 大额是否为固定通道
    private isSelectSmall: number = 0;      // 是否选择了小额固定（小额必定是固定）
    private callback: Function = undefined;
    private exchangeRt: number = 0;

    init(payment: string, bg: cc.SpriteFrame, bg2: cc.SpriteFrame, tip: string, bgColor: cc.SpriteFrame) {
        this.payment = payment;
        this.spCenter.spriteFrame = bg;
        if (bg2) this.spRight.spriteFrame = bg2;
        this.lblTip.string = tip;
        this.spBg.spriteFrame = bgColor;
        // if (payment === "yun_pay") {
        //     this.yunPayBt.active = true;
        // } else {
        //     this.yunPayBt.active = false;
        // }
    }

    protected onLoad() {
        let handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = cc.js.getClassName(this);
        handler.handler = "pay";
        addSingleEvent(this.btnRecharge, handler);

        handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = cc.js.getClassName(this);
        handler.handler = "onEditAmount";
        this.ebAmount.textChanged.push(handler);

        this.btnRecharge.enableAutoGrayEffect = true;

        this.ebAmount.maxLength = 6;
        this.usdtNode.active = false;
        this.usdtSurePanel.active = false;
    }
    onEnable() {
        // net.on("billHandlerRecharge", this.payInfo.bind(this))

    }
    onDisable() {
        net.off("hall.billHandler.recharge")
    }
    public openhandlerRecharge() {
        net.off("hall.billHandler.recharge")
        net.on("hall.billHandler.recharge", this.payInfo.bind(this))
    }
    private _min: number;
    private _max: number;

    async getCfg() {
        this.ebAmount.string = "";
        this.channel = "";
        this.pType = "";
        this.isSelectSmall = 0;
        let data = await net.request("hall.billHandler.getPayInfoByType", { type: this.payment });
        if (data.code === 200) {
            if (data.largeAmt) {
                let largeData = data.largeAmt;
                this.pType = largeData.payType;
                this.setUsdtCny(data.largeAmt);
                this.usdtNode.active = largeData.payType == "usdt_pay" ? true : false;
                this.channel = largeData.channel;
                this.largeAmtList = largeData.moneyRange;
                this.setType(this.ndLargeMoneys, this.largeAmtList, largeData.channel, largeData.payType, largeData.isSmallAmt, largeData.isFix);
            } else {
                this.largeAmtList = [];
                this.setType(this.ndLargeMoneys, this.largeAmtList);
            }
            if (data.smallAmt) {
                let samllData = data.smallAmt;
                this.smallAmtList = samllData.moneyRange;
                this.setType(this.ndSmallMoneys, this.smallAmtList, samllData.channel, samllData.payType, samllData.isSmallAmt, samllData.isFix);
            } else {
                this.smallAmtList = [];
                this.setType(this.ndSmallMoneys, this.smallAmtList);
            }
            let max: number;
            let min: number;
            if (data.largeAmt) {
                this.isLargeFix = data.largeAmt.isFix;
                max = +data.largeAmt.maxMoney;
                min = +data.largeAmt.minMoney;
            } else if (data.smallAmt) {
                this.isLargeFix = 1;
            } else {
                this.isLargeFix = 0;
            }
            if (this.pType === "ali_sdk_pay") {
                this.isLargeFix = 1;
            }
            if (!!this.limitOtherChannelMaxMoney) {
                max = Math.min(max, this.limitOtherChannelMaxMoney);
            }

            this.setRange(min, max);
            this.setFix();
        } else {
            showTip(ErrCodes.getErrStr(data.code, "请求配置失败"));
            this.largeAmtList = [];
            this.smallAmtList = [];
            // if (data.code === 11005) {   // 测试项目不存在该错误码，其他部存在
            //     this.mPay.resetCheck(this.payment);
            // }
            this.setType(this.ndLargeMoneys, this.largeAmtList);
            this.setType(this.ndSmallMoneys, this.smallAmtList);
        }
        hideLoading();
    }

    setUsdtCny(data: ps.HallBillHandlerGetPayInfoByType_Info) {
        if (this.pType == "usdt_pay") {
            if (data.floatExchangeRate) {
                this.exchangeRt = Number(g.cny) - Number(data.floatExchangeRate);
            }
            else {
                this.exchangeRt = Number(g.cny);
            }
            this.usdtRate.string = this.exchangeRt.toFixed(2);
        }
    }

    onclickUsdtHelp() {
        this.usdtHelpNode.active = true;
    }

    setType(btParent: cc.Node, moneyRange: number[], channel?: string, payType?: string, isSmall?: number, isSmallFix?: number) {
        let btCount = this.largeBtCount;
        if (isSmall) {
            btCount = this.smallBtCount;
        } else {
            btCount = this.largeBtCount;
        }

        for (let i = 0; i < btParent.childrenCount && i < btCount; i++) {
            let money = btParent.children[i];
            let ppItem: PayPageItem = money.getComponent(PayPageItem);
            ppItem.init(moneyRange[i], channel, payType, isSmall, isSmallFix);
            money.active = !!moneyRange[i];
        }
    }


    public payInfo(data: ps.HallBillHandlerRecharge) {
        hideLoading();
        this.unschedule(this.callback);
        if (data.code !== 200) {
            showTip(ErrCodes.getErrStr(data.code, "充值失败"));
            // if (data.code === 11004) {   // 测试项目没有该错误码，其他部门存在
            //     self.getCfg();
            // } else if (data.code === 11005) {
            //     self.mPay.resetCheck(self.payment);
            // }
            return;
        }
        if (data.url) {
            if (data.mode && data.mode === "sdk") {
                if (getSupportGame("haveAliPaySDK")) {
                    this.aliPayDaBaiSha(data.url)
                    return
                } else {
                    this.requestColdUpdateAction()
                    return
                }
            }
            goToUrl(data.url);
        }
        else if (data.errorCode) showTip("充值失败，第三方错误");

    }

    setFix() {
        let name = this.payment;
        if (name === "ali_pay") {
            this.SSSTips.node.active = true;
        } else {
            this.SSSTips.node.active = false;
        }

        if (this.isLargeFix) {
            this.ndInput.active = false;
        } else {
            this.ndInput.active = true;
        }
    }

    setRange(min: number, max: number) {
        this._min = min;
        this._max = max;
        // this.lblRange.string = '' + max;
        if (this.pType == "usdt_pay") {
            this.ebAmount.placeholder = '限额:' + min + "~" + max + 'USDT';
        }
        else {
            this.ebAmount.placeholder = '限额:' + min + "~" + max + '元';
        }

        for (let index = this.ndLargeMoneys.childrenCount - 1; index > -1; index--) {
            if (this.largeAmtList[index] > max || this.largeAmtList[index] < min) {
                let money = this.ndLargeMoneys.children[index];
                setInteractable(money.getComponent(cc.Button), false);
                money.getComponentInChildren(cc.LabelOutline).color = (new cc.Color).fromHEX("#7B7E86");
            }
        }
    }

    private onEditAmount(str: string) {
        let money = parseFloat(getMoneyStr(str));
        if (isNaN(money)) {
            return;
        }
        this.ebAmount.string = money.toString();
    }

    private onClickClear() {
        this.ebAmount.string = ''
    }

    private onClickMoney(ev: cc.Event.EventTouch) {
        let nd = ev.target;
        let item: PayPageItem = nd.getComponent(PayPageItem);
        this.resetBtnSf(this.ndLargeMoneys);
        this.resetBtnSf(this.ndSmallMoneys);
        item.changeBtnSF();
        this.channel = item.channel;
        this.pType = item.payType;
        this.ebAmount.string = item.money;
        this.isSelectSmall = item.isSmall;
    }

    resetBtnSf(parent: cc.Node) {
        parent.children.forEach(child => {
            if (child.active) {
                child.getComponent(PayPageItem).resetBtnSF();
            }
        });
    }

    showUsdtSurePanel() {
        this.usdtSurePanel.active = true
        let gold: string = (Number(this.ebAmount.string) * this.exchangeRt).toFixed(2);
        this.resultUsdt.string = `您将充值${this.ebAmount.string}USDT，根据目前汇率，可获得约${gold}金币`;
    }
    private async pay() {
        let type = this.pType;

        let edit = this.ebAmount;
        let channel = this.channel;
        let isSmallAmt = this.isSelectSmall;
        if (!this.isSelectSmall) {   // 如果选择小额，不用判断
            if (!this._checkVal(edit.string)) {
                return;
            }
        }
        if (type == "usdt_pay" && !this.usdtSurePanel.active) {
            this.showUsdtSurePanel();
            return;
        }
        this.usdtSurePanel.active = false;
        showLoading("请稍等");
        let deviceType = cc.sys.os === cc.sys.OS_IOS ? "ios" : "android";
        this.openhandlerRecharge();
        let data = await net.request("hall.billHandler.recharge", {
            billPrice: edit.string,
            payType: type,
            deviceType: deviceType,
            channel: channel,
            useAsync: 1,
            isSmallAmt: isSmallAmt
        });

        if (data.code !== 200) {
            hideLoading();
            showTip(ErrCodes.getErrStr(data.code, "充值失败"));
            // if (data.code === 11004) {   // 测试项目没有该错误码，其他部门存在
            //     self.getCfg();
            // } else if (data.code === 11005) {
            //     self.mPay.resetCheck(self.payment);
            // }
            return;
        }
        if (data.reqId) {
            this.callback = function () {
                hideLoading();
                showTip("请求超时,请您稍后尝试.");
            }
            this.scheduleOnce(this.callback, 45);
            return;
        } else if (data.url) {
            hideLoading();
            if (data.mode && data.mode === "sdk") {
                if (getSupportGame("haveAliPaySDK")) {
                    this.aliPayDaBaiSha(data.url)
                    return
                } else {
                    this.requestColdUpdateAction()
                    return
                }
            }
            goToUrl(data.url);
        } else if (data.errorCode) {
            hideLoading();
            showTip("充值失败，第三方错误");
        }
    }

    private _checkVal(val: string) {
        console.log(val)
        let money = parseFloat(getMoneyStr(val));
        if (!money && money !== 0) {
            showTip("充值金额不能为空");
            return false;
        }
        if (money < this._min) {
            showTip("充值金额不得小于" + this._min + "元");
            return false;
        }

        if (money > this._max) {
            showTip("充值金额不得大于" + this._max + "元");
            return false;
        }

        if (money.toString().indexOf(".") >= 0) {
            showTip("充值金额需为整数");
            return false;
        }
        return val && !isNaN(+val) && +val >= 1 && val.indexOf(".") === -1;
    }

    openYunPayDownloadUrl() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            cc.sys.openURL("https://itunes.apple.com/cn/app/id600273928?mt=8");
        } else {
            cc.sys.openURL("https://youhui.95516.com/hybrid_v3/html/help/download.html");
        }
    }

    /**
     * 大白鲨支付宝支付
     * @param orderInfo 支付参数加签字符串（由服务器传递）
     */
    aliPayDaBaiSha(orderInfo: string) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            // if (window.jsclass !== undefined) {
            //     // JsClass.aliPayDaBaiSha(orderInfo);
            // } else {
            jsb.reflection.callStaticMethod("NativeUtil", "aliPayDaBaiSha:", orderInfo);
            // }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "aliPayDaBaiSha", "(Ljava/lang/String;)V", orderInfo);
        }
    }
    async requestColdUpdateAction() {
        let coldUpdateUrl;
        let data = await net.request("hall.hallHandler.getWeb");
        if (data.code != 200 || !data.web) {
            coldUpdateUrl = g.serviceCfg.web;
        } else {
            coldUpdateUrl = data.web;
        }
        this.openColdUpeateUrl(coldUpdateUrl);
    }
    openColdUpeateUrl(coldUpdateUrl: string) {
        let s = showConfirm(`当前游戏需要升级最新版本，是否更新？`, "确定");
        s.okFunc = async () => {
            cc.sys.openURL(coldUpdateUrl);
            cc.game.end();
        }
    }

}
