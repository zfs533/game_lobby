import { showTip } from "../common/ui";
import HbslGame from "./hbslGame";
import HbslRedBagInfo from "./hbslRedBagInfo";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HbslAutoGrab extends cc.Component {

    @property(cc.Label)
    public moneySmall: cc.Label = undefined;
    @property(cc.Label)
    moneyMax: cc.Label = undefined;
    @property(cc.Slider)
    slidMoneySmall: cc.Slider = undefined;

    @property(cc.Slider)
    slidMoneyMax: cc.Slider = undefined;

    @property(cc.Node)
    moneyProMin: cc.Node = undefined;
    @property(cc.Node)
    moneyProMax: cc.Node = undefined;
    sendMoneyMax: number = 200
    sendMoneySmall: number = 20
    game: HbslGame
    boomNum: number[] = []
    isAutoGrab: boolean = false;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    }
    start() {
        this.slidMoneySmall.progress = 0
        this.onSliderMoneyMin()
        this.slidMoneyMax.progress = 1
        this.onSliderMoneyMax()
    }

    init(game: HbslGame, sendMoney: number[]) {
        this.game = game
        this.sendMoneyMax = sendMoney[sendMoney.length - 1] ? sendMoney[sendMoney.length - 1] : this.sendMoneyMax
        this.sendMoneySmall = sendMoney[0] ? sendMoney[0] : this.sendMoneySmall
        this.moneyMax.string = this.sendMoneyMax.toString()
        this.moneySmall.string = this.sendMoneySmall.toString()
    }

    /**
   * 加减发红包金额最大
   * @param isAdd  0==减，1==加
   */
    private onAddOrSubMoneyMax(ev: cc.Event.EventTouch, isAdd: string) {
        if (isAdd === "0") {
            let num = 1 / ((this.sendMoneyMax - this.sendMoneySmall) / 10)
            if (this.slidMoneySmall.progress > (this.slidMoneyMax.progress - num) && this.slidMoneyMax.progress != 0) {
                this.slidMoneyMax.progress = this.slidMoneySmall.progress
                showTip("最大值不能小于最小值！")
                isAdd = "2";
            }
        }
        this.addOrSubMoneySlider(isAdd, this.slidMoneyMax, this.moneyProMax, this.moneyMax)
    }
    /**
  * 加减发红包金额最小
  * @param isAdd  0==减，1==加
  */
    private onAddOrSubMoneyMin(ev: cc.Event.EventTouch, isAdd: string) {
        this.game.adoMgr.playClick();
        this.addOrSubMoneySlider(isAdd, this.slidMoneySmall, this.moneyProMin, this.moneySmall)
        if (this.slidMoneySmall.progress > this.slidMoneyMax.progress) {
            this.addOrSubMoneySlider(isAdd, this.slidMoneyMax, this.moneyProMax, this.moneyMax)
        }
    }

    addOrSubMoneySlider(isAdd: string, slider: cc.Slider, pro: cc.Node, sedMoney: cc.Label) {
        let mon = +sedMoney.string
        let num = 1 / ((this.sendMoneyMax - this.sendMoneySmall) / 10)
        if (isAdd === "1") {
            if (slider.progress < 1 && mon < this.sendMoneyMax) {
                slider.progress += num
                if (slider.progress > 1) {
                    slider.progress = 1
                }
            }
        } else if (isAdd === "0") {
            if (slider.progress > 0 && mon > this.sendMoneySmall) {
                slider.progress -= num
                if (slider.progress < 0) {
                    slider.progress = 0
                }
            }
        }
        this.sliderProgress(slider, pro, sedMoney)
    }
    /**
  * 滑动最小金额
  */
    private onSliderMoneyMin() {
        this.sliderProgress(this.slidMoneySmall, this.moneyProMin, this.moneySmall)
        if (this.slidMoneySmall.progress > this.slidMoneyMax.progress) {
            this.slidMoneyMax.progress = this.slidMoneySmall.progress
        }
        this.sliderProgress(this.slidMoneyMax, this.moneyProMax, this.moneyMax)
    }

    /**
  * 滑动最大金额
  */
    private onSliderMoneyMax() {
        if (this.slidMoneySmall.progress > this.slidMoneyMax.progress) {
            this.slidMoneyMax.progress = this.slidMoneySmall.progress
            showTip("最大值不能小于最小值！")
        }
        this.sliderProgress(this.slidMoneyMax, this.moneyProMax, this.moneyMax)
    }

    sliderProgress(slider: cc.Slider, pro: cc.Node, sedMoney: cc.Label) {
        let val: number;
        let proWidth = Math.floor(slider.progress * slider.node.width);
        pro.width = proWidth;
        let moneyMax = this.sendMoneyMax * 0.1
        let moneyMim = this.sendMoneySmall * 0.1
        val = Math.floor(slider.progress * (moneyMax - moneyMim))
        sedMoney.string = ((val + moneyMim) * 10).toString();
    }

    /***
    *选择雷号
    */
    onThunder(ev: cc.Button, Boom: string) {
        this.game.adoMgr.playClick();
        // this.boomNum = -1
        let node = ev.target.getChildByName("light")
        if (node.active) {
            node.active = false
            for (let index = 0; index < this.boomNum.length; index++) {
                if (this.boomNum[index] === +Boom) {
                    this.boomNum.splice(index, 1)
                }
            }
        } else {
            node.active = true
            this.boomNum.push(+Boom)
        }
        cc.log("-------- boomNum", this.boomNum)
    }

    onCilckAutoGrab() {
        this.game.adoMgr.playClick();
        if (+this.game.plyMgr.me.money < +this.moneySmall.string) {
            showTip("亲，金额不足不能抢哦～");
            return;
        }
        this.isAutoGrab = true;
        // this.autoGrab()
        this.node.active = false
        this.game.autoGrabBtn.active = false;
        this.game.sopAutoGrabBtn.active = true;
        // if (this.boomNum.length === 0) {
        //     this.boomNum.push(-1)
        // }
        this.boomNum = Array.from(new Set(this.boomNum))
        cc.log("-------- boomNum", this.boomNum)
        // this.game.msg.sendAutoGrab(this.moneySmall.string, this.moneyMax.string, boomNum)
        this.autoGrab();
    }
    autoGrab() {
        cc.log("------自动抢")
        for (let index = 0; index < this.game.redBags.length; index++) {
            let info = this.game.redBags[index].getComponent(HbslRedBagInfo)
            if (!this.game.checkCanGrab(info.multiple * info.money)) {
                cc.log("-----钱不够", info.multiple * info.money)
                break
            }
            if (!info.isMe && !info.isGrab && info.area !== -1) {
                if (+this.moneySmall.string <= info.money && info.money <= +this.moneyMax.string && this.isBoolSatisfy(info.boom)) {
                    cc.log("------自动抢雷号", info.boom)
                    cc.log("------自动抢钱", info.money)
                    this.game.msg.sendGrabRedBag(info.area);
                }
            }
        }

    }

    /***
     * 是否满足雷号
     * */
    isBoolSatisfy(boolNum: number) {
        if (this.boomNum.length === 0) return true
        return (this.boomNum.indexOf(boolNum) >= 0)
    }
    onHide() {
        this.game.adoMgr.playClick();
        this.node.active = false;
    }
    // update (dt) {}
}
