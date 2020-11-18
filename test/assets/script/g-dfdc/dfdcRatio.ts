import DFDCGame from "./dfdcGame";
const { ccclass, property } = cc._decorator;
import { random, setGray } from "../common/util";
@ccclass
export default class dfdcRatio extends cc.Component {

    private game: DFDCGame;

    @property(cc.Node)
    RatioEffect: cc.Node = undefined;

    @property(cc.Node)
    proceed: cc.Node = undefined;

    @property(cc.Node)
    tips: cc.Node = undefined;
    @property(cc.Label)
    tipslab: cc.Label = undefined;

    @property(cc.Node)
    historyPan: cc.Node = undefined;

    private historyItemId: cc.Node[] = [];

    @property(cc.SpriteFrame)
    private historyItem: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    private historyItemD: cc.SpriteFrame[] = [];

    @property(cc.Button)
    private btn: cc.Button[] = [];

    @property(cc.Node)
    private poker: cc.Node = undefined;

    @property(cc.Sprite)
    private winBg: cc.Sprite = undefined;

    @property(cc.SpriteFrame)
    private winBgItme: cc.SpriteFrame[] = [];

    /**
    * 走势图界面
    **/
    showHistory(id: number) {
        for (let index = 0; index < this.historyItemId.length; index++) {
            let action1 = cc.moveBy(0.2, 53, 0);
            let action2 = cc.moveTo(0, 114, 0);
            //this.historyItemId[index].runAction(action1);
            cc.tween(this.historyItemId[index]).by(0.2, { position: cc.v2(53, 0) }).start();
            if (this.historyItemId[this.historyItemId.length - 1] === this.historyItemId[index]) {
                let itemId = this.historyItemId[index];
                let actions = cc.sequence(cc.delayTime(0.2), action2,
                    cc.callFunc(() => {
                        itemId.getComponent(cc.Sprite).spriteFrame = this.historyItem[id];
                        this.historyItemId.splice(0, 0, itemId);
                        this.historyItemId.pop();
                    })
                )
                // itemId.runAction(actions);
                cc.tween(itemId).then(actions).start();
            }
        }
    }

    //比倍结果
    async ratioBalance(result: number, doubleScore: number, doubleCount: number) {
        let self = this;
        let lblWinGold = doubleScore.toFixed(2);
        await self.cardTurnAnim(result - 2);
        if (doubleScore < 0) {
            self.tips.active = true;
            self.tipslab.string = lblWinGold;
            self.winBg.spriteFrame = this.winBgItme[1];
            this.setBtnGray(false);
            self.game.playerMgr.me.resetWinGold();
            let actions = cc.sequence(cc.delayTime(3), cc.callFunc(() => {
                self.node.active = false;
                self.game.isDouble = false;
                self.tips.active = false;
                this.game.playerMgr.me.isRatio = false;
            }))
            // self.node.runAction(actions);
            cc.tween(self.node).then(actions).start();

        } else {
            self.node.stopAllActions();
            if (doubleCount !== 5) {
                self.cancelAllBtnEven(true);
            }
            self.tips.active = true;
            self.tipslab.string = `+${lblWinGold}`;
            self.winBg.spriteFrame = this.winBgItme[0];
            self.proceed.active = true;
            self.game.playerMgr.me.lblWinGold.string = lblWinGold.toString();
            let actions = cc.sequence(cc.delayTime(3), cc.callFunc(() => {
                self.tips.active = false;
                if (doubleCount === 5) {
                    self.node.active = false;
                    this.game.playerMgr.me.isRatio = false;
                }
            }))
            //self.node.runAction(actions);
            cc.tween(self.node).then(actions).start();
        }
        self.showHistory(result - 2);
        this.game.freebtnTip.string = `请继续玩，祝您好运!`;
        self.game.isRatio();
    }

    //比倍动画
    public ratioAnim(isplay: boolean) {
        if (isplay) {
            this.RatioEffect.getComponent(cc.Animation).play();
            this.RatioEffect.active = true;
        }
        else {
            this.RatioEffect.getComponent(cc.Animation).stop();
            this.RatioEffect.active = false;
        }
    }

    private cardTurnAnim(id: number) {
        let turnTime = 0.3;
        let scale1 = 1;
        let scale2 = scale1;
        return new Promise(resolve => {
            let actions = cc.sequence(
                cc.scaleTo(turnTime * 0.5, 0, scale1),
                cc.callFunc(() => {
                    this.flopPoker(id);
                }),
                cc.scaleTo(turnTime * 0.5, scale2, scale2),
                cc.callFunc(() => {
                    resolve();
                })
            )
            // this.poker.parent.runAction(actions);
            cc.tween(this.poker.parent).then(actions).start();
        })
    }

    /**
     * 翻牌
     */
    flopPoker(id: number) {
        this.poker.active = true;
        for (let index = 1; index < this.poker.childrenCount; index++) {
            this.poker.children[index].getComponent(cc.Sprite).spriteFrame = this.historyItemD[id];
        }
    }

    /**
     * 点击选择
     */
    public onClick(ev: cc.Event.EventTouch, index: string) {
        this.game.audioMgr.playButtonClickSound();
        this.cancelAllBtnEven(false);
        this.cancelAllBtn();
        this.btn[+index].node.getChildByName("bg").active = true;
        this.game.msg.sendDoOperate(2, this.game.gearPos_List[this.game.gearPosIdx].toString(), this.game.multiple_list[this.game.multipleIdx].toString(), +index);
        this.game.isDouble = false;
    }

    /**
     * 取消点击
     */
    public cancelAllBtnEven(is: boolean) {
        for (let index = 0; index < this.btn.length; index++) {
            this.btn[index].getComponent(cc.Button).interactable = is;
        }
    }

    /**
     * 取消选择框
     * @param is
     */
    public cancelAllBtn() {
        for (let index = 0; index < this.btn.length; index++) {
            this.btn[index].node.getChildByName("bg").active = false;
        }
    }

    public openRatioPanle(game: DFDCGame) {
        this.game = game;
        this.setBtnGray(true);
        this.game.playerMgr.me.isRatio = true;
        this.game.playerGold.zIndex = 50;
        this.game.bet.zIndex = 10;
        this.poker.active = false;
        this.cancelAllBtn();
        this.game.audioMgr.playButtonClickSound();
        this.node.active = true;
        let lbl = this.game.playerMgr.me.lblWinGold;
        if (this.game.freeRatioEarnMoney != 0) {
            lbl.string = (this.game.freeRatioEarnMoney + this.game.ratioEarnMoney).toFixed(2).toString();
        } else {
            lbl.string = this.game.ratioEarnMoney.toFixed(2).toString();
        }
        this.game.isDouble = false;
        this.game.isRatio();
        this.initHistory();
        this.cancelAllBtnEven(true);
        this.game.audioMgr.stopWinContinue();
    }

    /**
    * 初始化走势图界面
    **/
    initHistory() {
        let childCount = this.historyPan.childrenCount
        if (this.historyItemId.length <= 0) {
            for (let index = 0; index < childCount; index++) {
                let item = this.historyPan.children[index];
                let sprite = random(0, 3);
                item.getComponent(cc.Sprite).spriteFrame = this.historyItem[sprite];
                this.historyItemId.push(this.historyPan.children[index]);
            }
        }
    }

    setBtnGray(is: boolean) {
        this.proceed.getComponent(cc.Button).interactable = is;
        setGray(this.proceed, !is);
    }

    //关闭比倍面板
    public hideRatioPanle() {
        this.game.audioMgr.playButtonClickSound();
        this.node.active = false;
        this.game.isDouble = false;
        this.game.playerMgr.me.isRatio = false;
        this.game.freebtnTip.string = `请继续玩，祝您好运!`;
        this.tips.active = false;
        this.node.stopAllActions();
        this.game.isRatio();
        this.game.updatePlayerGold();
        this.game.playerMgr.me.lblWinGold.string = "0.00";
    }

    //继续比倍
    public proceedRatio() {
        this.game.audioMgr.playButtonClickSound();
        this.tips.active = false;
        this.game.playerMgr.me.isRatio = false;
        this.game.msg.sendDoOperate(2, this.game.gearPos_List[this.game.gearPosIdx].toString(), this.game.multiple_list[this.game.multipleIdx].toString(), 0);
        this.game.audioMgr.playRatioaudio(true);
    }
}
