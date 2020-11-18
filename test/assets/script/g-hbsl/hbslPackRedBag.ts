import HbslGame from "./hbslGame";
import { showTip } from "../common/ui";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HbslPackRedBag extends cc.Component {

    @property(cc.Label)
    money: cc.Label = undefined;

    @property(cc.Node)
    moneyPro: cc.Node = undefined;

    @property(cc.Slider)
    sldMoney: cc.Slider = undefined;

    @property(cc.Label)
    senRedBagNum: cc.Label = undefined;

    @property(cc.Node)
    bagNumPro: cc.Node = undefined;

    @property(cc.Slider)
    sldBagNum: cc.Slider = undefined;

    @property(cc.Node)
    redBagItme: cc.Node = undefined;

    @property(cc.Node)
    content: cc.Node = undefined;
    sendMoneyMax: number = 200
    sendMoneySmall: number = 20
    // selectMultiple: number[] = [3, 5, 7, 10]
    selectMultiple: string[] = ["5/2", "7/1.4", "10/1"]
    sendBagMax: number = 10
    sendBagSmall: number = 1
    boomNum: number = -1
    multiple: number = 1;
    grabCount: number = 10
    game: HbslGame = undefined
    sendRedBagCount: number = 0
    sendRedBagListInfo: ps.Hbsl_BaoHongBao_hbSendInfo[] = []  //红包列表信息

    // onLoad () {}
    start() {

    }
    init(game: HbslGame, sendMoney: number[], sendBagMax?: number) {
        this.game = game
        this.sendMoneyMax = sendMoney[sendMoney.length - 1] ? sendMoney[sendMoney.length - 1] : this.sendMoneyMax
        this.sendMoneySmall = sendMoney[0] ? sendMoney[0] : this.sendMoneySmall
        this.sendBagMax = sendBagMax
        this.money.string = this.sendMoneySmall.toString()
    }
    /**
     * 滑动红包金额
     */
    private onSliderMoney() {
        let val: number;
        this.sliderProgress(this.sldMoney, this.moneyPro)
        let moneyMax = this.sendMoneyMax * 0.1
        let moneySmall = this.sendMoneySmall * 0.1
        val = Math.floor(this.sldMoney.progress * (moneyMax - moneySmall))
        this.money.string = ((val + moneySmall) * 10).toString();
    }
    /**
     * 加减发红包金额
     * @param isAdd  0==减，1==加
     */
    private onAddOrSubMoney(ev: cc.Event.EventTouch, isAdd: string) {
        this.game.adoMgr.playClick();
        let mon = +this.money.string
        let num = 1 / ((this.sendMoneyMax - this.sendMoneySmall) / 10)
        if (isAdd === "1") {
            mon += 10
            if (mon <= this.sendMoneyMax) {
                this.money.string = mon.toString();
                this.sldMoney.progress += num
            }
            if (mon >= this.sendMoneyMax) {
                this.sldMoney.progress = 1
            }
        } else {
            mon -= 10
            if (mon >= this.sendMoneySmall) {
                this.money.string = mon.toString();
                this.sldMoney.progress -= num

            }
            if (mon <= this.sendMoneySmall) {
                this.sldMoney.progress = 0
            }
        }
        this.sliderProgress(this.sldMoney, this.moneyPro)
    }

    sliderProgress(slider: cc.Slider, pro: cc.Node) {
        let proWidth = Math.floor(slider.progress * slider.node.width);
        pro.width = proWidth;
    }

    /**
     * 选择倍数和红包的数量
     * @param ev
     * @param num
     */
    onMultiple(ev: any, num: string) {
        this.game.adoMgr.playClick();
        let bagNum = this.selectMultiple[+num].split("/");
        this.grabCount = +bagNum[0];
        this.multiple = +bagNum[1];
    }

    /**
   * 滑动发红包数量
   */
    private onSliderRedBagNum() {
        let val: number;
        this.sliderProgress(this.sldBagNum, this.bagNumPro)
        val = Math.floor(this.sldBagNum.progress * (this.sendBagMax - this.sendBagSmall))
        this.senRedBagNum.string = (val + this.sendBagSmall).toString();
    }
    /**
     * 加减发红包数量
     * @param isAdd  0==减，1==加
     */
    private onAddOrSubRedBagNum(ev: any, isAdd: string) {
        this.game.adoMgr.playClick();
        let mon = +this.senRedBagNum.string
        let num = 1 / (this.sendBagMax - this.sendBagSmall)
        if (isAdd === "1") {
            mon += 1
            if (mon <= this.sendBagMax) {
                this.senRedBagNum.string = mon.toString();
                this.sldBagNum.progress = this.sldBagNum.progress + num
            }
            if (mon >= this.sendBagMax) {
                this.sldBagNum.progress = 1
            }
        } else {
            mon -= 1
            if (mon >= this.sendBagSmall) {
                this.senRedBagNum.string = mon.toString();
                this.sldBagNum.progress = this.sldBagNum.progress - num
            }
            if (mon <= this.sendBagSmall) {
                this.sldBagNum.progress = 0
            }
        }
        this.sliderProgress(this.sldBagNum, this.bagNumPro)
    }

    /***
     *选择雷号
     */
    onThunder(ev: cc.Button, Boom: string) {
        this.game.adoMgr.playClick();
        this.boomNum = -1
        let isChecked = ev.target.getComponent(cc.Toggle).isChecked
        if (isChecked) this.boomNum = (+Boom)
    }

    /**
     * 确认发红包
     */
    onSendRedBag() {
        this.game.adoMgr.playClick();
        if (this.sendRedBagCount > 0) {
            showTip("发的红包抢完之后才可以再发红包呦！")
            return
        }
        if (+this.game.plyMgr.me.money < +this.money.string || + this.game.plyMgr.me.money < (+this.senRedBagNum.string * (+this.money.string))) {
            showTip("亲，金额不足不能发红包呦～")
            return
        }
        this.game.msg.sendPackRedBag(this.money.string, this.boomNum, this.grabCount, +this.senRedBagNum.string)
    }

    /**
     * 发红包列表
     */
    sendRedBagList(data: ps.Hbsl_GameInfo_hbSendInfo[]) {
        this.sendRedBagListInfo = data
        this.sendRedBagCount = data.length
        if (this.content.childrenCount > 0) {
            this.content.removeAllChildren()
        }
        for (let index = 0; index < data.length; index++) {
            let item = cc.instantiate(this.redBagItme)
            item.active = true;
            this.content.addChild(item);
            let mon = item.getChildByName("mon").getComponent(cc.Label)
            let boom = item.getChildByName("boom").getComponent(cc.Label)
            let bag = item.getChildByName("bag").getComponent(cc.Label)
            let num = item.getChildByName("multiple").getComponent(cc.Label)
            mon.string = "¥ " + data[index].money
            boom.string = "雷号[" + data[index].boomNo + "]"
            bag.string = data[index].totalCount + "包";
            num.string = data[index].odds + "倍"
        }
    }
    onDestroyItem(ev: cc.Button) {
        ev.target.parent.destroy();
    }
    onHide() {
        this.game.adoMgr.playClick();
        this.node.active = false;
    }

    // update (dt) {}
}
