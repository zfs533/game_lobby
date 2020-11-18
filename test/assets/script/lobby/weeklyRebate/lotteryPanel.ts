import * as ui from "../../common/ui";
import * as util from "../../common/util";
import { WeeklyRebateModel } from "./weeklyRebateModel";
import { ErrCodes } from "../../common/code";
import net from "../../common/net";
import user from "../../common/user";


const { ccclass, property } = cc._decorator;
let Decimal = window.Decimal;

export enum PrizeType {
    none = 0,       // 未中奖
    gold = 1,       // 金币奖励
    hongbao = 2,    // 红包，大额金币
    skin = 3,       // 中一次后，无效（炮台皮肤）
    avatarBox = 4,  // 中一次后，无效（头像框）
    code = 5,       // 激活码
    real = 6,       // 实物奖励
    lottery = 7, // 抽奖次数
    refresh = 8,    // 刷新任务次数
    skinTatter = 9, // 皮肤碎片
    avatarBoxTatter = 10, //头像框碎片
    rebateRate = 11,   // 返利系数
    lotteryRol = 12   // 抽奖卷
}

@ccclass
export default class LotteryPanel extends cc.Component {

    @property({ type: cc.Node, tooltip: "抽奖父节点" })
    conetenNode: cc.Node = null;

    @property({ type: cc.Label, tooltip: "周流水" })
    weekkiyWaterLabel: cc.Label = null;

    @property({ type: cc.Label, tooltip: "返点" })
    rebateLable: cc.Label = null;

    @property({ type: cc.Label, tooltip: "返利" })
    fanLiLabel: cc.Label = null;

    @property({ type: cc.Button, tooltip: "抽奖按钮" })
    lotteryButton: cc.Button = null;

    @property({ type: cc.Node, tooltip: "抽中展示节点" })
    winningNode: cc.Node = null;

    @property({ type: cc.Sprite, tooltip: "抽中的奖品" })
    prizeIcon: cc.Sprite = null;

    @property({ type: cc.Label, tooltip: "抽中的奖品名称" })
    prizeName: cc.Label = null;

    @property({ type: cc.Button, tooltip: "返利领取按钮" })
    receive_butt: cc.Button = null;

    @property({ type: cc.Label, tooltip: "收益" })
    incomeLabel: cc.Label = null;


    @property({ type: cc.Node, tooltip: "拦截事件节点" })
    inputNode: cc.Node = null;

    @property({ type: cc.Button, tooltip: "用来显示抽奖按钮的" })
    showLottButton: cc.Button = null;

    @property({ type: cc.Node, tooltip: "周返利主界面左边显示界面" })
    week_Left: cc.Node = null;

    @property({ type: cc.Prefab, tooltip: "周返利奖品预制资源" })
    rebatePrize: cc.Prefab = null;




    //转动声音
    @property({ type: cc.AudioClip })
    rotate_Audio: cc.AudioClip = undefined;



    turnsNumber: number = 0; //转的圈数
    turnsTimes: number = 0.1;//转的时间

    runanimate: Function;

    /**
     * 点击抽奖按钮调用
     */
    async onCilkeLotteryButtonAction() {
        let weeklyRebateModel = WeeklyRebateModel.instance();
        let lotteryType: number;
        if (weeklyRebateModel.freeLotteryTimes > 0) {//免费抽奖
            lotteryType = 3;
        } else if (weeklyRebateModel.LotteryRoll >= 5) {//奖券抽奖
            lotteryType = 2;
        } else if (weeklyRebateModel.tatterLotteryCnt >= 1) { //碎片抽奖
            lotteryType = 4;
        } else {
            ui.showTip("亲，您没有抽奖次数！先去完成任务吧!");
            return;
        }
        this.inputNode.active = true;//抽奖的时候不能点击页面切换
        this.lotteryButton.interactable = false;
        this.scheduleOnce(() => {
            this.lotteryButton.interactable = true;
        }, 3);
        let data = await net.request("event.eventHandler.doWRLottery", { actId: weeklyRebateModel.actId, lotteryType: lotteryType })
        // console.log("请求抽奖返回===>", data);
        if (data.code !== 200) {
            ui.showTip(ErrCodes.getErrStr(data.code, "点击抽奖请求失败"));
            this.inputNode.active = false;
            return;
        }
        this.lotteryButton.node.active = false;
        if (data.info.freeLotteryTimes != undefined && data.info.freeLotteryTimes != null) weeklyRebateModel.freeLotteryTimes = data.info.freeLotteryTimes;
        if (data.info.lotteryRoll != undefined && data.info.lotteryRoll != null) weeklyRebateModel.LotteryRoll = data.info.lotteryRoll;
        if (data.info.tatterLotteryCnt != undefined && data.info.tatterLotteryCnt != null) weeklyRebateModel.tatterLotteryCnt = data.info.tatterLotteryCnt;
        let rebateRate = +weeklyRebateModel.scoreInfo.rebateRate;
        switch (data.info.prizeType) {
            case PrizeType.rebateRate:
                if (rebateRate < (+data.info.rebateRate)) {
                    weeklyRebateModel.scoreInfo.rebateRate = data.info.rebateRate;
                }
                break;
            case PrizeType.skinTatter:
                weeklyRebateModel.scoreInfo.skinTatterCnt = data.info.skinTatterCnt;
                break;
            case PrizeType.avatarBoxTatter:
                weeklyRebateModel.scoreInfo.avatarBoxTatterCnt = data.info.avatarBoxTatterCnt;
                break;
            default:
                break;
        }
        this.lotteryActionBegins(data);
    }

    async lotteryActionBegins(data: ps.EventEventHandlerDoWRLottery) {
        if (data.info.prizeId > -1) {
            let prizeId: number = await this.theDrawBegins(data.info.prizeId - 1);
            this.prizeDisplay(prizeId, data.info.prizeName);
            let weeklyRebateModel = WeeklyRebateModel.instance();
            let oldRebateRate = weeklyRebateModel.oldRebateRate;
            if (data.info.prizeType === PrizeType.rebateRate && oldRebateRate <= (+data.info.rebateRate)) {
                weeklyRebateModel.oldRebateRate = +data.info.rebateRate;
                this.rebateLable.node.color = cc.Color.BLACK.fromHEX("#FF9E0E");
                let self = this;
                this.scheduleOnce(() => {
                    self.rebateLable.node.color = cc.Color.BLACK.fromHEX("#6893DB");
                }, 2)
            }
            this.showLottButton.node.active = true; //可以点击
        } else {
            ui.showTip("数据返回错误,抽奖失败！");
            this.lotteryButton.node.active = true;
        }
    }

    getrebatePrize(name: number) {
        let rebatePrize: cc.Node
        if (!rebatePrize) {
            rebatePrize = cc.instantiate(this.rebatePrize);
        }
        let def = rebatePrize.getChildByName("icon_" + name);
        if (def) {
            return def.getComponent(cc.Sprite).spriteFrame;
        } else {
            return undefined;
        }
    }

    /**
     * 奖品展示
     */
    async prizeDisplay(prizeId: number, prizeName: string) {
        this.winningNode.scale = 0;
        this.winningNode.active = true;
        let prizSp = this.getrebatePrize(prizeId);
        if (prizSp) this.prizeIcon.spriteFrame = prizSp;
        this.prizeName.string = prizeName;
        // if (prizeName.indexOf("金币") != -1) {
        //     let data = await net.request("hall.bankHandler.enter");
        //     if (data.code === 200) {
        //         user.money = data.money;
        //         user.bankMoney = data.bankMoney;
        //     }
        // }
        //this.winningNode.runAction(cc.scaleTo(0.3, 1, 1));
        cc.tween(this.winningNode).to(0.3, { scale: 1 }).start();
        this.refreshBottomView();
        let self = this;
        this.scheduleOnce(() => {
            let weeklyRebateModel = WeeklyRebateModel.instance();
            let ainmNode = this.winningNode.getChildByName("AinmNode");
            let prizeIcon = ainmNode.getChildByName("prizeIcon");
            if (prizeName.indexOf("碎片") != -1) {
                ainmNode.active = true;
                prizeIcon.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = prizSp;
                let nameLabel = prizeIcon.getChildByName("nameLabel").getComponent(cc.Label);
                nameLabel.fontSize = 12;
                nameLabel.string = prizeName;
                nameLabel.node.color = cc.Color.BLACK.fromHEX("#F3EEC8");
                prizeIcon.position = cc.v3();
                prizeIcon.scale = 1;
                prizeIcon.active = true;
                let self = this;
                // let action = cc.sequence(
                //     cc.spawn(cc.moveTo(0.5, -430, -120), cc.scaleTo(0.5, 0.1, 0.1)), cc.callFunc(function () {
                //         ainmNode.active = false;
                //         let scoreInfo = weeklyRebateModel.scoreInfo;
                //         if ((scoreInfo.skinTatterCnt >= 30 && scoreInfo.hasSkin === 0) || (scoreInfo.avatarBoxTatterCnt >= 30 && scoreInfo.hasAvatarBox === 0)) {
                //             //当前已经可以合成皮肤了
                //             let ts = self.week_Left.getChildByName("synthesis").getChildByName("tiShi");
                //             ts.active = true;
                //         }
                //     })
                // )
                // prizeIcon.runAction(action)
                let tw = cc.tween;
                tw(prizeIcon)
                    .parallel(
                        tw().to(0.5, { position: cc.v2(-430, -120) }),
                        tw().to(0.5, { scale: 0.1 }),
                        tw().call(
                            () => {
                                ainmNode.active = false;
                                let scoreInfo = weeklyRebateModel.scoreInfo;
                                if ((scoreInfo.skinTatterCnt >= 30 && scoreInfo.hasSkin === 0) || (scoreInfo.avatarBoxTatterCnt >= 30 && scoreInfo.hasAvatarBox === 0)) {
                                    //当前已经可以合成皮肤了
                                    let ts = self.week_Left.getChildByName("synthesis").getChildByName("tiShi");
                                    ts.active = true;
                                }
                            }
                        )
                    ).start();

            } else {
                prizeIcon.active = false;
                ainmNode.active = true;
            }
        }, 1)
        this.scheduleOnce(() => {
            // self.winningNode.active = false;
            // self.lotteryButton.node.active = true;
            // self.refreshTheDrawButton();//刷新按钮的显示
            // self.inputNode.active = false; //可以切换界面

            self.showLotteryButton();

        }, 5);

    }


    showLotteryButton() {
        this.showLottButton.node.active = false;
        if (this.lotteryButton.node.active || !this.winningNode.active) return;
        let ainmNode = this.winningNode.getChildByName("AinmNode");
        let prizeIcon = ainmNode.getChildByName("prizeIcon");
        prizeIcon.stopAllActions();
        ainmNode.active = false;
        prizeIcon.active = false;
        this.winningNode.active = false;
        this.lotteryButton.node.active = true;
        this.refreshTheDrawButton();//刷新按钮的显示
        this.inputNode.active = false; //可以切换界面
    }


    onEnable() {
        this.winningNode.active = false;
        this.lotteryButton.node.active = true;
        this.refreshBottomView();
        this.refreshTheDrawButton();
        this.inputNode.active = false;
        this.showLottButton.node.active = false;
        let weeklyRebateModel = WeeklyRebateModel.instance();
        weeklyRebateModel.isChouJiang = false;
    }
    /**
     * 刷新底部视图
     */
    refreshBottomView() {
        let weeklyRebateModel = WeeklyRebateModel.instance();
        if (weeklyRebateModel.scoreInfo === undefined || weeklyRebateModel.scoreInfo === null) return;
        this.weekkiyWaterLabel.string = weeklyRebateModel.scoreInfo.cumulativeWinLose;
        let rebateRate = +weeklyRebateModel.scoreInfo.rebateRate;
        this.rebateLable.string = new Decimal(rebateRate).mul(100) + "%";
        let fali = +new Decimal(+weeklyRebateModel.scoreInfo.cumulativeWinLose).mul(+weeklyRebateModel.scoreInfo.rebateRate);
        this.fanLiLabel.string = this.keepTwoDecimals(fali);
        this.incomeLabel.string = this.keepTwoDecimals(+weeklyRebateModel.scoreInfo.cumulativeAvailable);
        if (+weeklyRebateModel.scoreInfo.cumulativeAvailable <= 0) this.receive_butt.interactable = false;
    }

    /**
     * 刷新抽奖按钮的显示
     */
    refreshTheDrawButton() {
        let weeklyRebateModel = WeeklyRebateModel.instance();
        //当没有抽奖券和免费抽奖次数的时候按钮为不能点击
        let lotteryType = this.lotteryButton.node.getChildByName("lotteryType");
        let shengYu = this.lotteryButton.node.getChildByName("shengYu");
        if (weeklyRebateModel.freeLotteryTimes <= 0 && weeklyRebateModel.LotteryRoll < 5 && weeklyRebateModel.tatterLotteryCnt <= 0) {
            this.lotteryButton.node.getChildByName("font_sp").active = true;
            lotteryType.active = false;
            shengYu.active = false;
            this.lotteryButton.interactable = true;
            return;
        }
        if (weeklyRebateModel.freeLotteryTimes > 0) {
            //当前显示为免费抽奖次数
            this.lotteryButton.node.getChildByName("font_sp").active = false;
            lotteryType.getComponent(cc.Label).string = "免费抽一次";
            lotteryType.active = true;
            shengYu.getComponent(cc.Label).string = "剩余VIP免费次数：" + weeklyRebateModel.freeLotteryTimes;
            shengYu.active = true;
            this.lotteryButton.interactable = true;
            return;
        }
        if (weeklyRebateModel.LotteryRoll >= 5) {
            this.lotteryButton.node.getChildByName("font_sp").active = false;
            lotteryType.getComponent(cc.Label).string = "5奖券抽一次";
            lotteryType.active = true;
            shengYu.getComponent(cc.Label).string = "剩余奖券数：" + weeklyRebateModel.LotteryRoll;
            shengYu.active = true;
            this.lotteryButton.interactable = true;
            return;
        }
        if (weeklyRebateModel.tatterLotteryCnt >= 1) {
            this.lotteryButton.node.getChildByName("font_sp").active = false;
            lotteryType.getComponent(cc.Label).string = "抽一次";
            lotteryType.active = true;
            shengYu.getComponent(cc.Label).string = "额外碎片赠送次数：" + weeklyRebateModel.tatterLotteryCnt;
            shengYu.active = true;
            this.lotteryButton.interactable = true;
            return;
        }
    }

    /**
     * 抽奖开始
     */
    theDrawBegins(index: number): Promise<number> {
        return new Promise(resolve => {
            let num = this.getLotteryItemIndex();
            let self = this;
            let length = this.conetenNode.children.length;
            let cont = num;
            this.turnsNumber = 0;
            this.turnsTimes = 0.01;
            let runanimate = function () {
                cc.audioEngine.play(self.rotate_Audio, false, 1);
                if (self.turnsNumber >= 0.015 && cont == index) {
                    self.unschedule(runanimate);
                    resolve(index);
                    return;
                }
                cont++;
                self.turnsTimes += 0.0025;
                if (cont == length) {
                    cont = 0;
                }
                if (cont == num) {
                    self.turnsNumber += 0.005;
                    self.turnsTimes += self.turnsNumber;
                }
                self.lotteryAction(cont);
                self.unschedule(runanimate);
                self.schedule(runanimate, self.turnsTimes);
            }
            this.schedule(runanimate, this.turnsTimes);
        })
    }


    lotteryAction(num: number) {
        for (let index = 0; index < this.conetenNode.children.length; index++) {
            let element = this.conetenNode.children[index];
            if (index === num) {
                element.getChildByName("mask").active = true;
            } else {
                element.getChildByName("mask").active = false;
            }
        }
    }

    /**
     * 获取当前抽奖框所在的格子所在父视图所在的下标
     * 如果没有显示的选中框则返回 0
     */
    getLotteryItemIndex(): number {
        let isActive: boolean = false;
        for (let index = 0; index < this.conetenNode.children.length; index++) {
            let element = this.conetenNode.children[index];
            if (element.getChildByName("mask").active) {
                isActive = true;
                return index;
            }
        }
        if (!isActive) {
            return 0;
        }
    }

    /**
     * 领取返点奖励
     */
    async receiveRebateRewards() {
        let weeklyRebateModel = WeeklyRebateModel.instance();
        this.receive_butt.interactable = false;
        let data = await net.request("event.eventHandler.receiveRebate", { actId: weeklyRebateModel.actId })
        if (data.code != 200) {
            ui.showTip(ErrCodes.getErrStr(data.code, "领取失败！"));
            this.receive_butt.interactable = true;
            return;
        }
        // util.showTip("领取成功！");
        let wm = WeeklyRebateModel.instance();
        let confirmnode = ui.showConfirm("恭喜获得收益金额：" + wm.scoreInfo.cumulativeAvailable);
        wm.scoreInfo.cumulativeAvailable = "0";
        this.incomeLabel.string = wm.scoreInfo.cumulativeAvailable;
    }

    //截取两位小数
    keepTwoDecimals(num: number): string {
        return num.toFixed(2).toString();
    }





}
