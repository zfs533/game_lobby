import { setClipboard, loadUrlImg } from "../../common/util";
import AgentRechargePlat, { PayMethodMsg } from "./agentRechargePlat";

const { ccclass, property } = cc._decorator;
const VIEW_TURN_INTERVAL = 5;
@ccclass
export default class AgentRechargePayInfo extends cc.Component {
    @property(cc.Node)
    ndBg: cc.Node = undefined;

    @property(cc.Node)
    ndScale: cc.Node = undefined;

    @property(cc.Sprite)
    spScale: cc.Sprite = undefined;

    @property(cc.Label)
    lblCodeFeeRate: cc.Label = undefined;    // 二维码费率

    @property(cc.Label)
    lblTxtFeeRate: cc.Label = undefined;    // 文字  费率

    @property(cc.Node)
    ndImg: cc.Node = undefined;

    @property(cc.Label)
    lblImgTitle: cc.Label = undefined;

    @property(cc.Sprite)
    spImg: cc.Sprite = undefined;

    @property(cc.Node)
    ndTextPay: cc.Node = undefined;

    @property(cc.Label)
    lblAct: cc.Label = undefined;

    @property(cc.Label)
    lblName: cc.Label = undefined;

    @property(cc.Label)
    lblAgentId: cc.Label = undefined;

    @property(cc.Node)
    ndInfoBox: cc.Node = undefined;     // 需要进行屏幕适配的，支付详情里上方的节点

    @property(cc.Node)
    ndTransferTip: cc.Node = undefined; // 转账时的提示

    @property(cc.Node)
    ndContactTip: cc.Node = undefined;  // 联系方式时的提示

    @property(cc.Label)
    lblInfoTitle: cc.Label = undefined;

    @property(cc.Node)
    ndInfoMaskBg: cc.Node = undefined;
    @property(cc.PageView)
    private pageView: cc.PageView = undefined;

    @property(cc.Label)
    private bank: cc.Label = undefined;


    private _agentRechargePlat: AgentRechargePlat = undefined;
    private canMove: boolean = true;    //  支付信息能否可以移动
    private touchBeginPos: cc.Vec2 = undefined;  // 起始位置

    private _turnView: boolean = true;
    private _turnTime: number = 0;

    init(data: AgentRechargePlat) {
        this.ndScale.active = false;
        this._agentRechargePlat = data;
        this.initPayInfoTouchEvent();
    }

    initUI() {
        this.ndImg.active = false;
        this.ndTextPay.active = false;
        // this.lblAgentId.string = "如果充值不到账，请将服务号提交给客服，我们会第一时间为您处理！本次服务号：" + this._agentRechargePlat.agentId;
        this.lblInfoTitle.string = "收款";
    }

    /**
     * 展示联系方式
     * @param isShowimg
     * @param data
     * @param type
     * @param payName
     * @param reportQQ
     */
    async chgPayInfoToContact(isShowimg: boolean, data: PayMethodMsg, type: string, payName: string, reportQQ: string) {
        this.lblInfoTitle.string = "联系方式";
        if (isShowimg) {
            this.ndTextPay.active = false;
            this.ndImg.active = true;
            this.lblImgTitle.string = "【" + type + "二维码" + "】";
            this.ndImg.getChildByName("tip").getComponent(cc.Label).string = "截图保存二维码到相册，扫一扫添加好友";
            this.showQrCodeImg(data.qrCode, payName);
        } else {
            this.ndTextPay.getChildByName("title").getComponent(cc.Label).string = "【" + type + "账号" + "】";
            this.ndTextPay.getChildByName("tip").getComponent(cc.Label).string = "复制账号，添加好友";
            this.ndTextPay.getChildByName("name").getComponent(cc.Label).string = "联系方式";
            this.ndImg.active = false;
            this.ndTextPay.active = true;
            this.lblAct.string = data.account;
            this.lblName.string = type;
            if (data.bank) {
                this.bank.node.parent.active = true
                this.bank.string = data.bank
            } else this.bank.node.parent.active = false
            this.showPayActInfo(data.account, data.name, payName);
        }
        if (reportQQ) {
            this.ndContactTip.getChildByName("reportinfo").getComponent(cc.Label).string = "举报专用" + ":" + reportQQ;
            this.ndContactTip.getChildByName("reportinfo").active = true;
        } else {
            this.ndContactTip.getChildByName("reportinfo").active = false;
        }
        // this.ndTransferTip.active = false;
        this.ndContactTip.active = true;
    }

    async showQrCodeImg(data: string, payName: string) {
        this.ndImg.active = true;
        // this.lblCodeFeeRate.string = "手续费率：" + (data.feeRate ? +data.feeRate * 100 + "%" : "0");

        await loadUrlImg(data, this.spImg);

        // this.imageSriteFrame.push(this.spImg.spriteFrame);
        // this.spImg.node.getComponent(cc.Button).clickEvents[0].customEventData = "" + (this._agentRechargePlat.imageSriteFrame.length - 1);
        this.changeImgSize(this.spImg.node, 300);
        this.lblImgTitle.string = "【" + payName + "二维码付款" + "】";
    }

    showPayActInfo(act: string, actName: string, payName: string) {
        // this.lblTxtFeeRate.string = "手续费率：" + (data.feeRate ? +data.feeRate * 100 + "%" : "0");
        this.ndTextPay.active = true;
        this.lblAct.string = act;
        this.lblName.string = actName;
        this.ndTextPay.getChildByName("title").getComponent(cc.Label).string = "【" + payName + "转账付款" + "】";
    }

    chgBgColor(color: cc.Color) {
        this.ndBg.color = color;
    }

    setShowUI() {
        this.node.x = 0;
        this.node.active = true;
        this.ndInfoMaskBg.opacity = 255;
        this.ndInfoMaskBg.active = true;

        this.pageView.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart);
        this.pageView.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd);
        this.pageView.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd);
        this.showAds();
    }

    onTouchStart = (event: cc.Event.EventTouch) => {
        this._turnView = false;
    }

    onTouchEnd = (event: cc.Event.EventTouch) => {
        this._turnView = true;
    }
    hideView() {
        this.node.active = false;
        this.ndInfoMaskBg.active = false;
    }

    onDisable() {
        this.spImg.spriteFrame = null;
    }

    onClickClosePayInfo() {
        this.hideView();
    }

    onClickCopyAct() {
        setClipboard(this.lblAct.string);
        this._agentRechargePlat.showAgentTip("内容已拷贝到剪切板!");
    }

    onClickCopyName() {
        setClipboard(this.lblName.string);
        this._agentRechargePlat.showAgentTip("内容已拷贝到剪切板!");
    }

    onClickSaveImage() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                JsClass.saveImage();
            } else {
                jsb.reflection.callStaticMethod("NativeUtil", "saveImage");
            }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "saveImage", "()V");
        }
        this._agentRechargePlat.showAgentTip("保存完成");
    }

    onClickScaleBt(event: cc.Event, customData: string) {
        // this.spScale.spriteFrame = this._agentRechargePlat.imageSriteFrame[+customData];
        this.changeImgSize(this.spScale.node, 350);
        this.ndScale.active = true;
    }

    onClickScaleCloseBt() {
        this.ndScale.active = false;
    }

    changeImgSize(imgNode: cc.Node, toSize: number = 400) {
        imgNode.active = false;
        let nheight = imgNode.height;
        let nwidth = imgNode.width;
        imgNode.angle = 0;
        imgNode.scale = 1;
        if (imgNode.height > imgNode.width) {
            imgNode.scale = toSize / nheight;
        } else if (imgNode.width >= imgNode.height) {
            imgNode.scale = toSize / nwidth;
        }
        imgNode.active = true;
    }

    /**
     * 切换下一个支付方式
     */
    switchNextPayInfo() {
        if (this.ndImg.active) {
            this.ndImg.active = false;
            this.ndTextPay.active = true;
        } else {
            this.ndImg.active = true;
            this.ndTextPay.active = false;
        }
    }

    /**
     * 点击账户异常
     */
    onClickActException() {
        this._agentRechargePlat.sendActException()
        this.hideView();
        this._agentRechargePlat.exceptionAct();
    }

    /**
     * payInfo触摸事件
     */
    initPayInfoTouchEvent() {
        let self = this;
        let time = 0.2;
        this.ndInfoMaskBg.on(cc.Node.EventType.TOUCH_START, function (event: cc.Event.EventTouch) {
            if (!self.canMove) return;
            let touchPos = event.getLocation();
            self.touchBeginPos = touchPos;
        });

        this.ndInfoMaskBg.on(cc.Node.EventType.TOUCH_END, function (event: cc.Event.EventTouch) {
            if (!self.touchBeginPos) return;
            let touchPos = event.getLocation();
            let nx = touchPos.x - self.touchBeginPos.x;
            self.touchBeginPos = undefined;
            self.canMove = false;
            if (nx > 130) {
                // self.node.runAction(cc.sequence(cc.moveTo(time, cc.v2(640, 0)),
                //     cc.callFunc(() => {
                //         self.canMove = true;
                //         self.node.active = false;
                //     })));
                cc.tween(self.node)
                    .to(time, { position: cc.v2(640, 0) })
                    .call(
                        () => {
                            self.canMove = true;
                            self.node.active = false;
                        }
                    ).start();
                //self.ndInfoMaskBg.runAction(cc.sequence(cc.fadeTo(time, 0), cc.callFunc(() => { self.ndInfoMaskBg.active = false })));
                cc.tween(self.ndInfoMaskBg)
                    .to(time, { opacity: 0 })
                    .call(
                        () => {
                            self.ndInfoMaskBg.active = false
                        }
                    ).start();
            } else {
                //self.node.runAction(cc.sequence(cc.moveTo(time, cc.v2(0, 0)), cc.callFunc(() => { self.canMove = true })));
                cc.tween(self.node)
                    .to(time, { position: cc.v2(0, 0) })
                    .call(
                        () => { self.canMove = true }
                    ).start();
                //self.ndInfoMaskBg.runAction(cc.fadeTo(time, 255));
                cc.tween(self.ndInfoMaskBg).to(time, { opacity: 255 }).start();
            }

        });

        this.ndInfoMaskBg.on(cc.Node.EventType.TOUCH_MOVE, function (event: cc.Event.EventTouch) {
            if (!self.touchBeginPos) return;
            let touchPos = event.getLocation();
            let nx = touchPos.x - self.touchBeginPos.x;
            if (nx < 0) {
                self.node.x = 0;
                return;
            }
            self.node.x = nx;
            self.ndInfoMaskBg.opacity = 255 + 255 * -self.node.x / 640;
        });

        this.ndInfoMaskBg.on(cc.Node.EventType.TOUCH_CANCEL, function (event: cc.Event.EventTouch) {
            if (!self.touchBeginPos) return;
            let touchPos = event.getLocation();
            let nx = touchPos.x - self.touchBeginPos.x;
            self.touchBeginPos = undefined;
            self.canMove = false;
            if (nx > 130) {
                // self.node.runAction(cc.sequence(cc.moveTo(time, cc.v2(640, 0)),
                //     cc.callFunc(() => {
                //         self.canMove = true;
                //         self.node.active = false;
                //     })));
                cc.tween(self.node)
                    .to(time, { position: cc.v2(640, 0) })
                    .call(
                        () => {
                            self.canMove = true;
                            self.node.active = false;
                        }
                    ).start();
                //self.ndInfoMaskBg.runAction(cc.sequence(cc.fadeTo(time, 0), cc.callFunc(() => { self.ndInfoMaskBg.active = false })));
                cc.tween(self.ndInfoMaskBg)
                    .to(time, { opacity: 0 })
                    .call(
                        () => {
                            self.ndInfoMaskBg.active = false
                        }
                    ).start();
            } else {
                //self.node.runAction(cc.sequence(cc.moveTo(time, cc.v2(0, 0)), cc.callFunc(() => { self.canMove = true })));
                cc.tween(self.node)
                    .to(time, { position: cc.v2(0, 0) })
                    .call(
                        () => { self.canMove = true }
                    ).start();
                //self.ndInfoMaskBg.runAction(cc.fadeTo(time, 255));
                cc.tween(self.ndInfoMaskBg).to(time, { opacity: 255 }).start();
            }
        });
    }

    /**
   * 广告图轮播
   */
    private showAds() {
        this.unschedule(this.adsSchedule);
        this.schedule(this.adsSchedule, 2);
    }
    /**
     * 轮播定时器
     */
    private adsSchedule() {
        if (!this._turnView) {
            this._turnTime = 0;
            return;
        };
        let nodePages = this.pageView.getPages();
        this._turnTime += 1;
        if (this._turnTime % VIEW_TURN_INTERVAL === 0) {
            let nextPageIdx = this.pageView.getCurrentPageIndex() + 1;
            if (nextPageIdx >= nodePages.length) {
                nextPageIdx = 0;
            }
            this.pageView.scrollToPage(nextPageIdx, 2);
            // this._scrollToIndex = nextPageIdx;
        }
    }
}
