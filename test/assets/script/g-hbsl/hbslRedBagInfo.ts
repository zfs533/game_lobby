import HbslGame from "./hbslGame";
import { showTip } from "../common/ui";
import HbslPlayer from "./hbslPlayer";
let Decimal = window.Decimal;
const riseName = 'rise'//飘字容器
const { ccclass, property } = cc._decorator;

@ccclass
export default class HbslRedBagInfo extends cc.Component {

    @property(cc.Label)
    moneyLab: cc.Label = undefined;

    @property(cc.Label)
    boomLab: cc.Label = undefined;

    @property(cc.Label)
    last: cc.Label = undefined;

    @property(cc.Prefab)
    preCoin: cc.Prefab = undefined;

    @property(cc.Prefab)
    preBoom: cc.Prefab = undefined;

    @property(cc.Node)
    gray: cc.Node = undefined;

    @property(cc.Label)
    winMoney: cc.Label = undefined;

    @property(cc.Node)
    ndClockTimer: cc.Node = undefined;

    @property(cc.Sprite)
    spWinBG: cc.Sprite = undefined;

    @property([cc.SpriteFrame])
    sfWinBG: cc.SpriteFrame[] = [];

    @property(cc.Sprite)
    winBG: cc.Sprite = undefined;
    @property([cc.Font])
    winFont: cc.Font[] = [];
    // onLoad () {}
    game: HbslGame
    area: number = -1;       //红包区域
    hongBaoIndex: number = -1;   //红包编号
    idleBg: cc.Sprite         //空闲BG
    totalCount: number = 0
    isMe: boolean = false   //自己发的红包
    isGrab: boolean = false
    money: number = -1
    boom: number = -1
    multiple: number = -1
    boomedPly: number = 0;
    hongBaoLeftTime: number = 0                     // 倒计时时间
    countDown: Function = undefined;        // 倒计时函数
    timePos: cc.Vec2                    // 倒计位置

    start() {
        this.idleBg = this.gray.getChildByName("bg").getComponent(cc.Sprite)
        this.winMoney.node.parent.active = false
        this.timePos = this.ndClockTimer.parent.getPosition()
    }
    /**
     * 初始化
     */
    init(game: HbslGame, hongBaoLeftTime?: number) {
        this.game = game;
        this.isGrab = false
        this.isMe = false
        this.moneyLab.string = "¥ --"
        this.boomLab.string = "雷号:--"
        this.last.string = "--/--"
        this.area = -1;
        this.money = -1
        this.boom = -1
        this.hongBaoIndex = 0
        this.gray.active = true
        this.idleBg.node.active = true
        this.idleBg.spriteFrame = this.sfWinBG[4]
        this.winMoney.node.parent.active = false
        if (hongBaoLeftTime) {
            this.hongBaoLeftTime = hongBaoLeftTime
        }
        this.ndClockTimer.parent.position = this.timePos
        this.node.getComponent(cc.Sprite).enabled = true
    }
    /**
    * 更新红包
    */
    updateRedBagsInfo(data: ps.Hbsl_ChangeHongBao_hbInfo) {
        if (data.totalCount < 0) {
            this.init(this.game)
            return
        }
        this.isMe = false
        if (data.hongBaoIndex !== this.hongBaoIndex) {
            this.gray.active = false
            this.boomedPly = 0
            this.winMoney.node.parent.active = false
            this.zoomAnim();
            this.isGrab = false
            this.ndClockTimer.parent.position = this.timePos
            this.node.getComponent(cc.Sprite).enabled = true
        }
        let payers = this.game.plyMgr.getPlyByPos(data.whoSend)
        if (payers && payers.isMe) {
            cc.log("------自己的包", data.whoSend)
            this.gray.active = true
            this.idleBg.node.active = true
            this.idleBg.spriteFrame = this.sfWinBG[5]
            this.isMe = true
        }
        if (this.hongBaoLeftTime > 0) {
            if (this.countDown) this.unschedule(this.countDown);
            this.setTimer(this.hongBaoLeftTime)
        }
        this.area = data.area;
        this.money = +data.money
        this.boom = data.boomNo
        this.moneyLab.string = "¥ " + data.money
        this.boomLab.string = "雷号:" + data.boomNo
        this.last.string = data.leftCount + "/" + data.totalCount
        this.totalCount = data.totalCount;
        this.hongBaoIndex = data.hongBaoIndex
        this.multipleSelect(data.totalCount)
        if (this.game.hbslAutoGrab.isAutoGrab) {
            this.autoGrab();
        }
        if (!this.game.hbslPackRedBag.sendRedBagListInfo.length) return
        for (let index = 0; index < this.game.hbslPackRedBag.sendRedBagListInfo.length; index++) {
            if (this.game.hbslPackRedBag.sendRedBagListInfo[index].hongBaoIndex === data.hongBaoIndex) {
                this.game.hbslPackRedBag.sendRedBagListInfo.splice(index, 1)
                break
            }
        }
        this.game.hbslPackRedBag.sendRedBagList(this.game.hbslPackRedBag.sendRedBagListInfo)

    }
    /**
     *缩放动画
     */
    zoomAnim() {
        this.node.scale = 0
        cc.tween(this.node).to(0.2, { scale: 1 }).start();
    }
    /***
     *结算
     */
    balance(data: ps.Hbsl_GrabBalance) {
        let payNode: cc.Node
        let payers = this.game.plyMgr.getPlyByPos(data.graberInfo.pos)
        if (payers && payers.isMe) this.isGrab = true;
        if (this.hongBaoLeftTime > 0) {
            if (this.countDown) this.unschedule(this.countDown);
            this.setTimer(this.hongBaoLeftTime)
        }
        if (payers) {
            if (payers.isMe) payNode = payers.node;
            else payNode = payers.node;
        } else payNode = this.game.otherPayer;
        if (data.isBoom) {
            this.flyBoomAnim(payNode, payers, data, this.isGrab, this.isMe)
            if (this.isMe) {
                this.boomedPly++;
                cc.log("----- 有人抢到雷雷", this.boomedPly)
            }
        } else {
            this.flyCionAnim(payNode, payers, data, this.isGrab)
        }
        this.last.string = data.leftCount + "/" + this.totalCount
        if (this.isMe && data.leftCount <= 0) {
            cc.log("----- 自己发的包已经抢完了", this.boomedPly)
            this.game.saveSendRecord(this.boomedPly, this.money.toString())
        }
    }

    /**
     *自己抢红包的表现
     */
    myGrabWinOrLose(isBoom: boolean, money: string, boomNum: number, grabMoney: string) {
        this.idleBg.node.active = false
        // this.gray.active = false;
        // this.game.gaming = true
        this.winMoney.node.parent.active = true
        // this.winMoney.font = isBoom === true ? this.winFont[1] : this.winFont[0]
        this.winMoney.font = this.winFont[0]
        // this.winMoney.string = isBoom === true ? "-" + money : "+" + money
        this.winMoney.string = "+" + money
        this.winBG.spriteFrame = isBoom ? this.sfWinBG[3] : this.sfWinBG[2]
        this.spWinBG.spriteFrame = isBoom ? this.sfWinBG[1] : this.sfWinBG[0]
        this.node.getComponent(cc.Sprite).enabled = false
        this.ndClockTimer.parent.position = cc.v3(this.ndClockTimer.parent.position.x, (this.timePos.y - 39))
        this.game.saveGrabRecord(grabMoney, boomNum, this.boom, this.money.toString())
    }

    /***
     * 飞金币
     */
    flyCionAnim(pos: cc.Node, payer: HbslPlayer, data: ps.Hbsl_GrabBalance, isGrab: boolean, isBoom: Boolean = false) {
        if (payer && payer.isMe) {
            if (isBoom) {//自己发包别人中雷的赔付的钱
                // updateMoney = new Decimal(payer.money).add(data.payMoney).toString();
            } else {
                cc.log("-----我自己抢多少钱", data.grabMoney)
                this.myGrabWinOrLose(false, data.grabMoney, data.isBoom, data.grabMoney)
                // updateMoney = new Decimal(payer.money).add(data.grabMoney).toString();
            }
        }
        let posAbs = Math.abs(this.node.x - pos.x) / 100
        let coin = cc.instantiate(this.preCoin)
        coin.setParent(pos);
        coin.setPosition(cc.v2(0, 0))
        this.game.adoMgr.playBigWin()
        for (let index = 0; index < coin.childrenCount; index++) {
            // coin.children[index].scale = 0.1;
            let fromPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0))
            fromPos = pos.convertToNodeSpaceAR(fromPos)
            coin.children[index].setPosition(fromPos.x, fromPos.y);
            cc.tween(coin.children[index]).delay(0.01 * index * posAbs).to(0.5, { scale: 0.6, position: cc.v2(0, 0) }, { easing: 'quadIn' }).delay(0.2).call(() => {
                if (index === 4) {
                    if (coin.isValid) coin.destroy()
                    let boo = pos.getChildByName("hbslWinAnim")
                    boo.active = true
                    let anim = boo.getComponent(cc.Animation)
                    if (!anim.getAnimationState(anim.defaultClip.name).isPlaying) {
                        boo.getComponent(cc.Animation).play();
                    }
                    if (payer && payer.isMe && isGrab) {
                        if (isBoom) {
                            this.showWinOrLost(data.masterInfo.chgMoney, pos);
                            payer.money = data.masterInfo.money
                            cc.log("-------中雷赔付")
                        } else {
                            payer.showWinOrLost(data.graberInfo.chgMoney)
                            payer.money = data.graberInfo.money
                        }
                        this.game.adoMgr.playGrabed()
                        cc.log("-----自己更新玩家金币", payer.money);
                        payer.updateMoney()
                    }

                }
            }).start();
        }
    }

    /**
     *飞炸弹
     * @param pos
     */
    flyBoomAnim(pos: cc.Node, payer: HbslPlayer, data: ps.Hbsl_GrabBalance, isGrab: boolean, isMe: boolean) {
        if (payer && payer.isMe) {
            this.myGrabWinOrLose(true, data.grabMoney, data.isBoom, data.grabMoney)
            // cc.log("-----我自己中雷赔付", data.payMoney)
            // updateMoney = new Decimal(payer.money).sub(data.payMoney).toString();
            // updateMoney = new Decimal(updateMoney).add(data.grabMoney).toString();
        }
        let boomLab = cc.instantiate(this.preBoom)
        boomLab.scale = 0.5
        boomLab.setParent(pos);
        let fromPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0))
        fromPos = pos.convertToNodeSpaceAR(fromPos)
        boomLab.setPosition(fromPos.x, fromPos.y);
        this.game.adoMgr.playBoom()
        cc.tween(boomLab).to(0.5, { position: cc.v2(0, 0) }).call(() => {
            if (boomLab.isValid) boomLab.destroy();
            let boo = pos.getChildByName("Boom")
            boo.active = true
            let anim = boo.getComponent(cc.Animation)
            if (!anim.getAnimationState(anim.defaultClip.name).isPlaying) {
                boo.getComponent(cc.Animation).play();
            }
            if (payer && payer.isMe && isGrab) {
                payer.showWinOrLost("-" + data.hbMoney)
                // payer.money = new Decimal(payer.money).sub(data.payMoney).toString();
                payer.money = data.graberInfo.money
                cc.log("-----自己中雷更新玩家金币", payer.money);
                payer.updateMoney()
                if (this.game.hbslAutoGrab.isAutoGrab && +this.game.plyMgr.me.money < +this.game.hbslAutoGrab.moneySmall.string) {
                    showTip("亲，你的余额已经不足自动抢最低金额，自动抢已取消～");
                    this.game.onSopAutoGrab()
                    return;
                }
            }
            if (isMe) {
                this.flyCionAnim(this.game.plyMgr.me.node, this.game.plyMgr.me, data, true, true)
            }
        }).start();

    }

    /**
     * 点击抢红包
     */
    onGrabRedBag() {
        this.game.adoMgr.playClickGrabBtn();
        if (!this.game.checkCanGrab(this.multiple * this.money)) {
            showTip("亲，金额不足不能抢哦～");
            return;
        }
        if (this.game.hbslAutoGrab.isAutoGrab) {
            showTip("亲，你已经开启了自动抢红包功能，不能手动抢欧！～");
            return;
        }
        // this.gray.active = true;
        // this.idleBg.active = false
        // cc.log("------  ", this.node.name);
        this.game.msg.sendGrabRedBag(this.area);
    }

    autoGrab() {
        cc.log("------自动抢",)
        if (!this.game.checkCanGrab(this.multiple * this.money)) {
            cc.log("-----钱不够", this.multiple * this.money)
            return
        }
        if (!this.isMe && !this.isGrab && this.area !== -1) {
            if (+this.game.hbslAutoGrab.moneySmall.string <= this.money && this.money <= +this.game.hbslAutoGrab.moneyMax.string && this.game.hbslAutoGrab.isBoolSatisfy(this.boom)) {
                cc.log("------自动抢", this.boom)
                cc.log("------自动钱钱", this.money)
                this.game.msg.sendGrabRedBag(this.area);
            }
        }
    }

    /**
     * 抢失败
     */
    public onGrabLose(unm: number) {
        // this.gray.active = false;
        let sty = "抢红包失败，请重新点击"
        switch (unm) {
            case 0:
                break;
            case 1:
                sty = "金币不足,请充值！"
                if (this.game.hbslAutoGrab.isAutoGrab) {
                    this.game.hbslAutoGrab.onCilckAutoGrab()
                }
                break;
            case 2:
                sty = "所抢的红包不存在！请重试"
            case 5:
                sty = "亲，红包列表已经达到上线，等一下才可以发呦。"
                break;
            default:
                break;
        }
        showTip(sty)
    }

    multipleSelect(num: number) {
        let multiple = 0
        switch (num) {
            case 5:
                multiple = 2
                break;
            case 7:
                multiple = 1.5
                break;
            case 10:
                multiple = 1
                break;
            default:
                break;
        }
        this.multiple = multiple;
    }

    /**
     * 倒计时
     * @param time
     */
    setTimer(time: number) {
        let totalTime = time;
        let timer = this.ndClockTimer.getComponentInChildren(cc.Label);
        // timer.string = `${Math.floor(totalTime)}`;
        // let countDown: Function = undefined;        // 倒计时函数
        let self = this;
        if (time !== 0) {
            timer.string = `${Math.floor(totalTime)}`;
            this.ndClockTimer.active = true;
            this.ndClockTimer.opacity = 255;
            this.schedule(self.countDown = function (dt: number) {
                totalTime -= dt;
                if (totalTime <= 0) {
                    //timer.string = "0";
                    self.unschedule(self.countDown);
                    return;
                }
                timer.string = `${Math.floor(totalTime)}`;
            }, 0.95);
        } else {
            if (self.countDown !== undefined) self.unschedule(self.countDown);
            // this.ndClockTimer.runAction(cc.fadeOut(0.3));
            cc.tween(this.ndClockTimer).to(0.3, { opacity: 0 }).start();
        }
    }
    // 向上飘字（输赢）
    showWinOrLost(chgMoney: string, pos: cc.Node) {
        let rise = new cc.Node()
        let toBox = pos.getParent()
        let prefab = +chgMoney >= 0 ? this.game.preWinBool : this.game.preLose
        let node = cc.instantiate(prefab)
        node.getComponentInChildren(cc.Label).string = +chgMoney >= 0 ? "+" + chgMoney : chgMoney
        rise.addChild(node)
        node.x = 0
        toBox.addChild(rise)
        rise.name = riseName
        let actions = cc.sequence(
            cc.moveBy(1.5, 0, 50).easing(cc.easeQuadraticActionOut()),
            cc.fadeOut(1),
            cc.callFunc(rise.destroy.bind(rise))
        )
        // rise.runAction(actions)
        cc.tween(rise).then(actions).start();
        // this.updateMoney();
        return new Promise(resolve => {
            this.scheduleOnce(resolve, 0.5)
        })
    }

}