import DDZGame, { ScoreStatus } from "./ddzGame";
import DpPlayer from "../g-dp/dpPlayer";
import { CARD_TYPE } from "./ddzCardTools";
import { PlayerState } from "../g-share/player";

export enum ddzPlayerState {
    //叫分
    CALLSCORE = 3,
    CALLSCORE_END,
    //加倍
    DOUBLE,
    DOUBLE_END,
    // 开始游戏
    STARTGAME,
    //结算了
    RESULT,
    //end了
    END,
    //断线了
    OFFLINE
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class DdzPlayer extends DpPlayer {
    @property(cc.Node)
    private nodeMul: cc.Node = undefined;

    @property(cc.Node)
    private nodeStatus: cc.Node = undefined;

    @property(sp.Skeleton)
    private spWarn: sp.Skeleton = undefined;

    @property([cc.Node])
    private nodeDoubleArr: cc.Node[] = [];

    @property([cc.SpriteFrame])
    private sfHeadArr: cc.SpriteFrame[] = [];
    private NOR_PLAYER_CARD_NUM = 17;                       // 手牌个数
    private DEALER_CARD_NUM = 20;
    private SIREN_NUM = 2;

    private nodeScoreArr: cc.Node[] = [];

    game: DDZGame;

    onLoad() {
        super.onLoad();
        // 显示状态分为分数、不出、加倍
        for (let i = ScoreStatus.ZERO; i <= ScoreStatus.THREE; i++) {
            let node = this.nodeStatus.getChildByName(i.toString());
            this.nodeScoreArr[i] = node;
        }
    }

    initUI() {
        super.initUI();
        this.setSirenAnim(false);
        this.nodeMul.active = false;
        this.nodeStatus.active = true;

        this.setDealer(false);

        this.addMul = 0;
    }

    changeState(state: PlayerState | ddzPlayerState): void {
        this.state = state;
        switch (state) {
            case PlayerState.UNREADY:
                this.cleanCards();
                break;
            case PlayerState.READY:
                break;
            case ddzPlayerState.CALLSCORE:
                break;
            case ddzPlayerState.CALLSCORE_END:
                this.nodeScoreArr.forEach(node => {
                    node.active = false;
                })
                break;
            case ddzPlayerState.DOUBLE:
                break;
            case ddzPlayerState.DOUBLE_END:
                this.hideAllStatus();
                break;
            case ddzPlayerState.STARTGAME:
                break;
            case ddzPlayerState.END:

                break;
        }
    };

    setCurrCardNum(cardNum?: number) {
        if (cardNum) {
            this.remainNum = cardNum;
        } else if (this.isDealer) {
            this.remainNum = this.DEALER_CARD_NUM;
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
        this.nodeScoreArr.forEach(node => {
            node.active = false;
        })
        this.nodeDoubleArr.forEach(node => {
            node.active = false;
        })
        this.setNoPlay(false);
        if (clean) {
            this.cleanCards();
        }
    }

    setDealerHead(visible: boolean) {
        let headIdx = visible ? 1 : 0;
        this.sAva.spriteFrame = this.sfHeadArr[headIdx];
        let node = this.sAva.node
        node.stopAllActions()
        // node.runAction(cc.sequence(
        //     cc.fadeOut(0.3),
        //     cc.callFunc(() => {
        //         this.sAva.spriteFrame = this.sfHeadArr[headIdx];
        //         node.runAction(cc.fadeTo(0.2, 255))
        //     })
        // ))
        cc.tween(node)
            .to(0.3, { opacity: 0 })
            .call(() => {
                this.sAva.spriteFrame = this.sfHeadArr[headIdx];
                cc.tween(node).to(0.2, { opacity: 255 }).start();
            })
            .start();
    }

    setDealer(visible: boolean, action = true) {
        this.isDealer = visible;
        this.sDealer.node.active = visible;
        if (visible) {
            let scale = 0.4;
            let oldPos = this.sDealer.node.getPosition();
            if (action) {
                this.sDealer.node.scale = 0.4;
                let centerPos = this.node.convertToNodeSpaceAR(cc.v2(cc.winSize.width * 0.5, cc.winSize.height * 0.5));
                this.sDealer.node.setPosition(centerPos);
                let moveTime = 0.3;
                return new Promise(resolve => {
                    let actions = cc.sequence(
                        cc.spawn(cc.scaleTo(moveTime, scale, scale), cc.moveTo(moveTime, oldPos).easing(cc.easeSineOut())),
                        cc.callFunc(() => {
                            this.setCurrCardNum();
                            this.setDealerHead(true);
                            resolve(true);
                        })
                    )
                    //this.sDealer.node.runAction(actions);
                    cc.tween(this.sDealer.node).then(actions).start();
                });
            } else {
                this.sDealer.node.scale = scale;
                this.sDealer.node.setPosition(oldPos);
                this.setDealerHead(true);
            }
        }
    }

    turnJiaoFen(left: number) {
        this.setWaitTime(left);
    }

    /**
     * 叫分
     * @param score
     */
    showScoreStatus(score: number) {
        this.endWaitTime();
        this.nodeScoreArr.forEach((node, i) => {
            node.active = false;
            if (i === score) {
                node.active = true;
            }
        });
    }

    /**
     * 是否加倍
     */
    showMulStatus(mul: number) {
        this.endWaitTime();
        this.nodeDoubleArr[mul - 1].active = true;
        if (mul > 1) {
            this.nodeMul.active = true;
        }
        this.addMul = mul;
    }

    /**
     * 剩余牌数
     * @param discardNum
     */
    showRemain(discardNum: number) {
        super.showRemain(discardNum);
        this.checkBaojing(this.remainNum);
    }
}
