import PdkGame from "./pdkGame";
import DpPlayer from "../g-dp/dpPlayer";
import { CARD_TYPE } from "./pdkCardTools";
import { PlayerState } from "../g-share/player";

export enum pdkPlayerState {
    // 开始游戏
    STARTGAME = 3,
    //结算了
    RESULT,
    //end了
    END,
    //断线了
    OFFLINE
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class PdkPlayer extends DpPlayer {
    @property(cc.Node)
    private firstDiscard: cc.Node = undefined;

    @property(cc.Node)
    private endAnimNode: cc.Node = undefined;               // 被关

    @property(sp.Skeleton)
    private spWarn: sp.Skeleton = undefined;

    private NOR_PLAYER_CARD_NUM = 16;                       // 手牌个数
    private SIREN_NUM = 2;

    game: PdkGame;

    private _firstPos: cc.Vec2 = undefined;


    onLoad() {
        super.onLoad();
        if (this.firstDiscard)
            this._firstPos = this.firstDiscard.getPosition();
    }

    init(game: PdkGame) {
        super.init(game);
    }

    onEnable() {
        this.initUI();
    }

    initUI() {
        super.initUI();

        this.isFirst = false;
        this.endAnimNode.active = false;
    }

    changeState(state: PlayerState | pdkPlayerState): void {
        this.state = state;
        switch (state) {
            case PlayerState.UNREADY:
                this.cleanCards();
                break;
            case PlayerState.READY:
                break;
            case pdkPlayerState.STARTGAME:
                break;
            case pdkPlayerState.END:

                break;
        }
    };

    setCurrCardNum(cardNum?: number) {
        if (cardNum) {
            this.remainNum = cardNum;
        } else {
            this.remainNum = this.NOR_PLAYER_CARD_NUM;
        }
        this.showRemain(0);
    }
    showDiscard(cards: number[], shape?: CARD_TYPE) {
        this.endWaitTime();
        this.hideAllStatus();
        if (!this.isMe && shape) {
            this.showRemain(cards.length);
        }

        this.discardAction(cards, shape);
        if (shape === CARD_TYPE.CT_BOMB) {
            this.playBomb();
        }
        this.lastCards = cards;
    }
    checkBaojing(num: number) {
        // 小于两张时播放警报
        if (num <= this.SIREN_NUM && num > 0) {
            this.setSirenAnim(true);
            this.game.adoMgr.playBaojing(this.isMale, num);
        }
    }

    setSirenAnim(b: boolean) {
        if (!this.spWarn) return;
        this.spWarn.node.active = b;
        if (this.spWarn.node.active) this.spWarn.animation = "animation";
    }

    hideAllStatus(clean: boolean = true) {
        this.setFirst(false);
        this.setNoPlay(false);
        if (clean) {
            this.cleanCards();
        }
    }

    /**
     * 非自己首出时展示首出牌（规定拥有红桃3的人首出，在UI中已经加好了）
     * @param visible
     */
    setFirst(visible: boolean) {
        if (visible) this.isFirst = true;
        if (!this.firstDiscard) return;
        this.firstDiscard.active = visible;
        if (visible) {
            this.firstDiscard.stopAllActions();
            this.firstDiscard.setPosition(this._firstPos);
            this.firstDiscard.scale = 0;
            let remainPos = this.labRemain.node.getParent().getPosition();
            let actions = cc.sequence(
                cc.scaleTo(0.3, 1).easing(cc.easeBounceOut()),
                cc.delayTime(2),
                cc.spawn(cc.scaleTo(0.5, 0), cc.moveTo(0.5, remainPos)),
            )
            // this.firstDiscard.runAction(actions);
            cc.tween(this.firstDiscard).then(actions).start();
        }
    }

    /**
     * 剩余牌数
     * @param discardNum
     */
    showRemain(discardNum: number) {
        super.showRemain(discardNum);
        this.checkBaojing(this.remainNum);
    }

    /**
     * 是否播放被关动画
     * @param isClosed
     */
    playEndAnim(isClosed: boolean) {
        return new Promise((resolve) => {
            if (isClosed) {
                this.endAnimNode.stopAllActions();
                this.endAnimNode.active = true;
                let door = this.endAnimNode.getChildByName("door");
                door.active = true;
                door.scale = 5;
                door.opacity = 0;
                door.angle = 0;
                let lab = this.endAnimNode.getChildByName("lab");
                lab.active = false;
                let scTime = 0.5;
                let actions = cc.sequence(
                    cc.spawn(cc.scaleTo(scTime, 1).easing(cc.easeBounceOut()), cc.fadeIn(scTime), cc.rotateTo(scTime, -45)),
                    cc.callFunc(() => {
                        lab.active = true;
                        // lab.runAction(cc.sequence(
                        //     cc.delayTime(1),
                        //     cc.callFunc(() => {
                        //         this.endAnimNode.active = false;
                        //         resolve();
                        //     }),
                        // ));
                        cc.tween(lab).delay(1)
                            .call(() => {
                                this.endAnimNode.active = false;
                                resolve();
                            })
                            .start();
                    }),
                )
                // door.runAction(actions);
                cc.tween(door).then(actions).start();
                setTimeout(resolve, 1500);
            } else {
                resolve();
            }
        });
    }
}
