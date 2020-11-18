import Player from "../g-share/player"
import DpGame from './dpGame';
import { GameId } from "../common/enum";

const { ccclass, property } = cc._decorator

@ccclass
export default abstract class Dplayer extends Player {
    @property(cc.Label)
    protected labRemain: cc.Label = undefined;

    @property(cc.Node)
    protected nAuto: cc.Node = undefined;

    @property(cc.Node)
    protected nSiren: cc.Node = undefined;

    @property(cc.Node)
    protected nBomb: cc.Node = undefined;

    @property(cc.Node)
    protected nDiscard: cc.Node = undefined

    @property(cc.Node)
    protected nNoPlay: cc.Node = undefined

    @property(cc.Label)
    protected labTicker: cc.Label = undefined

    protected discardPos: cc.Vec2 = undefined
    protected tickerPos: cc.Vec2 = undefined
    protected bombPos: cc.Vec2 = undefined

    private _lastCards: number[] = [];
    private _leftTime: number
    private _remainNum: number;
    private _addMul: number;
    private _isFirst: boolean;

    game: DpGame

    get isRightPlayer() {
        return this.seat === 1
    }

    set lastCards(ns: number[]) {
        this._lastCards = ns;
    }
    get lastCards() {
        return this._lastCards;
    }

    set remainNum(n: number) {
        this._remainNum = n;
    }
    get remainNum() {
        return this._remainNum;
    }

    set isFirst(i: boolean) {
        this._isFirst = i;
    }
    get isFirst() {
        return this._isFirst;
    }

    set addMul(n: number) {
        this._addMul = n;
    }
    get addMul() {
        return this._addMul;
    }

    onLoad() {
        super.onLoad()
        this.discardPos = this.nDiscard.getPosition();
        this.tickerPos = this.labTicker.node.getParent().getPosition();
        this.bombPos = this.nBomb.getPosition();
    }

    initUI() {
        this.nBomb.active = false;
        if (this.labRemain) {
            this.labRemain.node.getParent().active = false;
        }
        this.setAuto(false);
        this.setSirenAnim(false);
        this.hideAllStatus();
    }

    enterAni(doAnim = true) {
        this.show();
        this.node.stopAllActions();
        if (doAnim) {
            this.node.scaleX = 0;
            this.node.scaleY = 0;
            //this.node.runAction(cc.scaleTo(0.3, this.scaleX, this.scaleY).easing(cc.easeBackIn()));
            cc.tween(this.node).then(cc.scaleTo(0.3, this.scaleX, this.scaleY).easing(cc.easeBackIn())).start();

        } else {
            this.node.setScale(this.scaleX, this.scaleY);
            this.node.setPosition(this.x, this.y);
        }
    }

    leaveAni() {
        this.node.stopAllActions();
        //this.node.runAction(cc.sequence(cc.scaleTo(0.3, 0, 0), cc.callFunc(this.hide, this)));
        cc.tween(this.node)
            .to(0.3, { scale: 0 })
            .call(() => {
                this.hide()
            })
            .start();
    }

    /**
    * 设置当前的牌个数
    */
    abstract setCurrCardNum(cardNum?: number);
    /**
     * 显示打出的牌
     * @param cards
     */
    abstract showDiscard(cards: number[], shape?: number);
    abstract checkBaojing(num: number);
    abstract hideAllStatus();

    /**
     * 叫分
     * @param score
     */
    showScoreStatus(score: number) { }
    /**
     * 是否加倍
     */
    showMulStatus(mul: number) { }
    setDealerHead(visible: boolean) { }
    setDealer(visible: boolean, action = true) { }
    turnJiaoFen(left: number) { }
    setFirst(visible: boolean) { };
    playEndAnim(isClosed: boolean) { return new Promise((resolve) => { resolve() }) };

    /**
     * 开始游戏
     */
    startGame() {
        this.hideAllStatus();
    }

    /**
    * 剩余牌数
    * @param num
    */
    showRemain(num: number) {
        if (!this._remainNum || !this.labRemain) {
            return;
        }
        this._remainNum -= num;
        this.labRemain.string = this._remainNum.toString();

        let nPar = this.labRemain.node.getParent();
        nPar.active = true;

        if (this._remainNum <= 0) {
            nPar.active = false;
        }
    }

    hideRemain() {
        this.labRemain.node.getParent().active = false;
    }

    /**
     * 设置警告
     * @param visible
     */
    setSirenAnim(visible: boolean) {
        if (!this.nSiren) {
            return;
        }
        this.nSiren.active = visible;
        if (visible) {
            // 播放动画
            this.game.playSirenAnim(this.nSiren);
        }
    }

    /**
     * 托管
     * @param visible
     */
    setAuto(visible: boolean) {
        if (!this.nAuto) {
            return;
        }
        this.nAuto.active = visible;
    }

    /**
     * 丢出炸弹
     */
    playBomb() {
        this.nBomb.active = true;
        this.nBomb.setPosition(this.bombPos);
        this.nBomb.setScale(0.5, 0.5);

        let centerPos = this.node.convertToNodeSpaceAR(cc.v2(cc.winSize.width * 0.5, cc.winSize.height * 0.6));
        let time = 0.5;// 炸弹特效等待时间
        let actions = cc.sequence(
            cc.spawn(cc.jumpTo(time, centerPos, 80, 1), cc.scaleTo(time, 1), cc.rotateBy(time, 270)),
            cc.callFunc(() => {
                this.nBomb.active = false;
            })
        )
        cc.log('twst')
        //this.nBomb.runAction(actions);
        cc.tween(this.nBomb).then(actions).start();
    }

    /**
     * 轮到谁操作
     */
    turnPlay(leftTime: number) {
        this.hideAllStatus();
        this.setWaitTime(leftTime);
    }

    /**
     * 出牌动画
     * @param cards
     */
    discardAction(cards: number[], shape?: number) {
        this.nDiscard.active = true
        this.nDiscard.removeAllChildren()

        if (shape) {
            cards = this.discardSort(cards)
        } else {
            cards.sort(this.pointSort)
        }

        this.nDiscard.setPosition(this.discardPos)
        let layout = this.nDiscard.getComponent(cc.Layout)
        this.nDiscard.removeAllChildren()
        let childNum = cards.length
        if (this.isMe) {
            layout.spacingX = -90
        } else {
            layout.spacingX = -95 - childNum / 1.5 // 牌越多间隔越小
        }

        for (let idx = 0; idx < childNum; idx++) {
            let cardData = cards[idx]
            let card = this.addDiscardCard(cardData)
            this.nDiscard.addChild(card)
        }

        this.discardCardAnimation()
    }

    /**
     * 弃牌
     * @param cardData
     */
    private addDiscardCard(cardData: number) {
        let card: cc.Node = undefined;

        if (this.game.gameName === GameId.DDZ) {
            card = this.game.pkrGame.getDdzCard(cardData);
        } else {
            card = this.game.pkrGame.getPoker(cardData);
        }
        card.y = 0
        if (this.isMe) {
            card.scale = 0.8
        } else {
            card.scale = 0.5
        }
        return card
    }

    private discardCardAnimation() {
        this.nDiscard.children.forEach((card, i) => {
            card.y += 30
            card.opacity = 0
            let actions = cc.sequence(
                cc.delayTime(i * .05),
                cc.spawn(
                    cc.moveBy(.1, 0, - 30), cc.fadeIn(.1)
                ),
            )
            //cc.log("dpplayer--discardCardAnimation----");
            //card.runAction(actions)
            cc.tween(card).then(actions).start();
        })
    }

    // 打出的牌排序
    private discardSort(cards: number[]) {
        let dataArr: number[][] = []
        for (let idx = 0; idx < cards.length; idx++) {
            let point = cards[idx] & 0xff
            if (!dataArr[point]) {
                dataArr[point] = []
            }
            dataArr[point].push(cards[idx])
        }
        // 按重复数降序、再按点数升序
        dataArr.sort((a, b) => {
            if (b.length === a.length) {
                let aPoint = a[0] & 0xff
                let bPoint = b[0] & 0xff
                return bPoint - aPoint
            } else {
                return b.length - a.length
            }
        })
        // 取出整理后的数据
        let newData: number[] = []
        for (let i = 0; i < dataArr.length; i++) {
            let data = dataArr[i]
            if (data) {
                for (let j = 0; j < data.length; j++) {
                    let d = data[j]
                    newData.push(d)
                }
            }
        }
        return newData
    }

    // 最后剩余的牌排序
    private pointSort(aData: number, bData: number) {
        let aPoint = aData & 0xff
        let bPoint = bData & 0xff
        let aSuit = aData >> 8
        let bSuit = bData >> 8
        if (aPoint === bPoint) {
            return bSuit - aSuit
        } else {
            return bPoint - aPoint
        }
    }

    /**
     * 设置展示牌布局
     * @param normal
     */
    setCardsLayout(normal: boolean) {
        if (!this.nDiscard || !this.discardPos) {
            return
        }
        let layout = this.nDiscard.getComponent(cc.Layout)
        if (normal) {
            layout.type = cc.Layout.Type.HORIZONTAL
            this.nDiscard.height = 80
            this.nDiscard.x = this.discardPos.x
        } else {
            layout.type = cc.Layout.Type.GRID
            layout.paddingTop = -80
            layout.spacingY = -100
            this.nDiscard.width = 260
            if (this.isRightPlayer) {
                this.nDiscard.x = this.discardPos.x + 60
            }
        }
    }

    /**
     * 清除展示牌
    */
    cleanCards() {
        if (this.nDiscard) {
            this.nDiscard.removeAllChildren();
            this.nDiscard.active = false;
        }
    }

    /**
     * 不出
     */
    showNoPlay() {
        this.setNoPlay(true)

        this.endWaitTime()
        this.cleanCards()
    }

    setNoPlay(visible: boolean) {
        this.nNoPlay.active = visible
    }

    //---------------------倒计时
    setWaitTime(leftTime: number) {
        if (!leftTime) return;
        this._leftTime = leftTime;
        this.labTicker.node.parent.active = true;
        this.labTicker.string = this._leftTime.toString();
        this.unschedule(this.timeSchedule);
        this.schedule(this.timeSchedule, 1);

        this.labTicker.node.parent.y = this.tickerPos.y + 45;
        this.game.tickerShowAction(this.labTicker.node.parent, 1);
    }

    endWaitTime() {
        this.unschedule(this.timeSchedule);

        this.game.tickerHideAction(this.labTicker.node.parent);
    }

    private timeSchedule() {
        this._leftTime -= 1;
        if (this._leftTime < 0) {
            this._leftTime = 0;
            this.endWaitTime();
        }
        this.labTicker.string = this._leftTime.toString();

        if (this._leftTime <= 3) {
            let animClock = this.labTicker.node.parent.getChildByName('ticker');
            this.game.adoMgr.playClock();
            animClock.stopAllActions();
            animClock.scale = 1;
            animClock.opacity = 255;
            let actionTime = 0.5;
            //animClock.runAction(cc.spawn(cc.scaleTo(actionTime, 2), cc.fadeTo(actionTime, 0)));
            let tw = cc.tween
            tw(animClock)
                .parallel(
                    tw().to(actionTime, { scale: 2 }),
                    tw().to(actionTime, { opacity: 0 })
                )
                .start();
        }
    }
}
