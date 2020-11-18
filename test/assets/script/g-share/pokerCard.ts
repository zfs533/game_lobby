import { setGray } from "../common/util";

const { ccclass, property } = cc._decorator;

enum TurningState {
    None,
    ToFront,
    ToBack
}

export enum Suit {
    SPADE = 1,
    HEART,
    CLUB,
    DIAMOND,
    JOKER_S,
    JOKER_L
}

export enum Jokers {
    None,
    SMALL,
    LARGE
}

@ccclass
export default class PokerCard extends cc.Component {
    private back: cc.Node;
    protected _front: cc.Node;
    get front() {
        if (!this._front) {
            this._front = this.node.getChildByName("front");
        }
        return this._front;
    }
    private _loaded: boolean;

    private _value: number;
    private _isFaceUp: boolean;
    private _turningState: TurningState;
    private _turningDuration = 0.4;
    get value() {
        return this._value;
    }
    set value(val: number) {
        this._value = val;
    }
    get isFaceUp() {
        return !this.isTurning && this._isFaceUp;
    }
    get isFaceDown() {
        return !this.isTurning && !this._isFaceUp;
    }
    get isTurning() {
        return this._turningState !== TurningState.None;
    }
    get turningDuration() {
        return this._turningDuration;
    }
    private _shouldShowFront: boolean;
    get shouldShowFront() {
        return this._shouldShowFront;
    }
    set shouldShowFront(val) {
        this._shouldShowFront = this._shouldShowFront || val;
    }

    /**
    * 卡牌点数
    */
    get number() {
        return this.value & 0x000000ff
    }
    /**
     * 卡牌花色
     */
    get suit() {
        return this.value >> 8
    }

    onLoad() {
        // init logic
        this._front = this.node.getChildByName("front");
        this.back = this.node.getChildByName("back");

        this._loaded = true;
        this.node.emit("loaded");
    }

    /**
     * 翻牌
     *
     * @param {boolean} [toFront=true] 翻到正面【默认为真】
     * @param {boolean} [doAnim=true] 展示动画【默认为真】
     * @param {Function} [overHandler] 翻完回掉
     * @memberof SuohaCard
     */
    turn(toFront = true, doAnim = true, changeScale = 1) {
        if (!toFront && this.shouldShowFront) {
            return Promise.resolve();
        }
        if (!this._loaded) {
            this.node.once("loaded", () => {
                this.turn(toFront, doAnim);
            });
            return Promise.resolve();
        }
        return new Promise<void>(resolve => {
            this._turningState = toFront ? TurningState.ToFront : TurningState.ToBack;
            if (doAnim) {
                // Sound.dealCard();
                let tweenDuration = this._turningDuration / 2;
                this.node.scaleX = changeScale;
                let actions = cc.sequence(
                    cc.scaleTo(tweenDuration, 0, changeScale),
                    cc.callFunc(() => {
                        this._front.active = toFront;
                        this.back.active = !toFront;
                    }),
                    cc.scaleTo(tweenDuration, changeScale, changeScale),
                    cc.callFunc(() => {
                        this._turningState = TurningState.None;
                        this._isFaceUp = toFront;
                        resolve();
                    })
                )
                // this.node.runAction(actions);
                cc.tween(this.node).then(actions).start();
                // cc.tween(this.node)
                //     .to(tweenDuration, { scaleX: 0, scaleY: changeScale })
                //     .call(
                //         () => {
                //             this._front.active = toFront;
                //             this.back.active = !toFront;
                //         }
                //     )
                //     .to(tweenDuration, { scale: changeScale })
                //     .call(
                //         () => {
                //             this._turningState = TurningState.None;
                //             this._isFaceUp = toFront;
                //             resolve();
                //         }
                //     )
                //     .start();
            } else {
                this.node.scaleX = changeScale;
                this.node.scaleY = changeScale;
                this.back.active = !toFront;
                this._front.active = toFront;
                this._turningState = TurningState.None;
                this._isFaceUp = toFront;
                resolve();
            }
        });
    }

    stopTurn() {
        this.node.stopAllActions();
    }

    discard(doAnim = true) {
        this._shouldShowFront = false;
        this.turn(false, doAnim).then(() => {
            setGray(this.node);
        });
    }
}