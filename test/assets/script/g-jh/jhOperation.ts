import JHGame from "./jhGame"
import { setInteractable, setGray } from '../common/util';
import { State } from './jhGame';


const Decimal = window.Decimal
const { ccclass, property } = cc._decorator
enum OperationState {
    None, ShowNormal, NormalShowed, HideNormal, ShowRaise, RaiseShowed, HideRaise, ShowOver, OverShowed, HideOver
}

export enum UserOpt {
    FOLD,
    POTS,
    ADD,
    FOLLOW,
    ALLIN,
    CHALLENGE
}

@ccclass
export default class JHOperation extends cc.Component {

    @property(cc.Node)
    private nodeNormal: cc.Node = undefined;

    @property(cc.Node)
    private nodeSelectors: cc.Node = undefined;

    @property(cc.Node)
    private nodeOver: cc.Node = undefined;

    @property(cc.Button)
    private lookCards: cc.Button = undefined;

    @property(cc.Button)
    private discard: cc.Button = undefined;

    @property(cc.Button)
    private allIn: cc.Button = undefined;

    @property(cc.Button)
    private pk: cc.Button = undefined;

    @property(cc.Button)
    private call: cc.Button = undefined;

    @property([cc.Button])
    private raises: cc.Button[] = [];

    @property([cc.Sprite])
    private spPkSelector: cc.Sprite[] = [];

    game: JHGame;
    private state: OperationState;
    roundCanAllIn: boolean;
    private showingPage: cc.Node;
    public forceChanllenge = false;
    private get rates() {
        return this.game && this.game.betsList || [];
    };

    init() {
        this.nodeNormal.active = false;
        this.nodeOver.active = false;
        this.nodeSelectors.active = false;
        this.lookCards.node.active = false;

        let halfHeight = cc.winSize.height / 2;
        this.nodeNormal.setPosition(0, -halfHeight);
        this.nodeOver.setPosition(0, -halfHeight);

        this.state = OperationState.None;
    }

    protected onLoad() {
        this.init();
    }

    /**
     * @description 更新点击看牌按钮状态
     * @param {boolean} [vis]
     * @returns
     * @memberof JHOperation
     */
    updateLookCardsBtn(vis?: boolean) {
        if (!this.lookCards || !this.lookCards.isValid) {
            return;
        }
        let node = this.lookCards.node;
        if (vis === false) {
            node.active = false;
        } else {
            let me = this.game.plyMgr.me;
            if (me.isLooked || me.isLoser || !this.game.canLookCard) {
                node.active = false;
            } else if (!me.isLooker && this.game.canLookCard) {
                node.active = true;
            }
        }
    }

    /**
     * @description 更新可操作按钮状态
     * @returns
     * @memberof JHOperation
     */
    async showTurn() {
        let game = this.game;
        if (!game.amIInGame) {
            return;
        }
        this.updateTurns();
        // Promise.all([this.hideOver()]).then(() => {
        //     this.showNormal();
        // })
        this.showNormal();
    }

    hideTurn() {
        this.updateTurns();
        this.hideNormal();
    }

    private hidePage() {
        return new Promise(resolve => {
            if (!this.showingPage) {
                resolve();
                return;
            }
            let node = this.showingPage;
            node.stopAllActions();
            let actions = cc.sequence(
                cc.moveTo(0.03, cc.v2(0, -cc.winSize.height / 2)).easing(cc.easeCubicActionIn()),
                cc.callFunc(() => {
                    node.active = false;
                    resolve();
                })
            )
            // node.runAction(actions);
            cc.tween(node).then(actions).start();
        });
    }

    private showPage(node: cc.Node, overState: OperationState) {
        return new Promise(resolve => {
            node.active = true;
            node.stopAllActions();
            node.setPosition(0, -cc.winSize.height / 2);
            let actions = cc.sequence(
                cc.moveTo(0.03, cc.v2(0, 0)).easing(cc.easeCubicActionOut()),
                cc.callFunc(() => {
                    this.state = overState;
                    this.showingPage = node;
                    resolve();
                })
            )
            // node.runAction(actions);
            cc.tween(node).then(actions).start();
        });
    }

    updateTurns() {
        let game = this.game;
        let me = game.plyMgr.me;
        let inTurn = me.isTuring;
        if (inTurn) {
            this.allIn.node.active = true;
            this.setEnable(this.allIn, this.roundCanAllIn);
            this.raises.forEach((btn, index) => {
                let amount = game.baseScore * this.rates[index];
                btn.getComponentInChildren(cc.Label).string = amount.toString();
                if (game.canRaise) {
                    if (amount <= game.curSingleBet || +me.money < amount) {
                        this.setEnable(btn, false);
                    } else {
                        this.setEnable(btn, true);
                    }
                } else {
                    this.setEnable(btn, false);
                }
            });

            if (game.lastBetType === UserOpt.ALLIN || +me.money <= 0) {
                if (game.round === game.totalRound) {
                    this.setEnable(this.call, true);
                } else {
                    this.setEnable(this.call, false);
                }
                this.setEnable(this.pk, false);
            } else {
                this.setEnable(this.call, true);
                this.setEnable(this.pk, game.canLookCard);
            }
            this.setEnable(this.discard, !me.isAllIn);
        } else {
            this.allIn.node.active = true;
            this.setEnable(this.allIn, false);
            this.setEnable(this.pk, false);
            this.setEnable(this.call, false);
            this.raises.forEach((btn, index) => {
                let amount = game.baseScore * this.rates[index];
                btn.getComponentInChildren(cc.Label).string = amount.toString();
                this.setEnable(btn, false);
            });
            if (game.lastBetType === UserOpt.ALLIN) {
                this.setEnable(this.discard, false);
            }
        }
    }

    async showNormal() {
        if (this.state === OperationState.ShowNormal || this.state === OperationState.NormalShowed) {
            return;
        }
        this.state = OperationState.ShowNormal;
        return this.showPage(this.nodeNormal, OperationState.NormalShowed);
    }

    async hideNormal() {
        let node = this.nodeNormal;
        if (!node.active) {
            return;
        }
        if (this.state === OperationState.HideNormal) {
            return;
        }
        this.state = OperationState.HideNormal;
        return this.hidePage();
    }

    async showOver() {
        let game = this.game;
        let me = game.plyMgr.me;
        if (!me.isDiscarded || game.gameState >= State.BALANCE) {
            return;
        }
        if (this.state === OperationState.ShowOver || this.state === OperationState.OverShowed) {
            return;
        }
        this.state = OperationState.ShowOver;
        return this.showPage(this.nodeOver, OperationState.OverShowed);
    }

    async hideOver() {
        let node = this.nodeOver;
        if (!node.active) {
            return;
        }
        if (this.state === OperationState.HideOver) {
            return;
        }
        this.state = OperationState.HideOver;
        return this.hidePage();
    }

    private setEnable(btn: cc.Component, enable: boolean) {
        if (btn instanceof cc.Button) {
            setInteractable(btn, enable);
            if (enable) {
                btn.node.opacity = 255;
            } else {
                btn.node.opacity = 170;
            }
            //btn.enableAutoGrayEffect = true;
        }

        // let sp: cc.Sprite | cc.Label = btn.node.getComponentInChildren(cc.Sprite);
        // if (!sp) {
        //     sp = btn.node.getComponentInChildren(cc.Label);
        // }
        // if (enable) {
        //     if (sp instanceof cc.Sprite) {
        //         setGray(sp.node, false);
        //     } else if (sp instanceof cc.Label) {
        //         sp.node.runAction(cc.fadeTo(0.2, 255));
        //     }
        // } else {
        //     if (sp instanceof cc.Sprite) {
        //         setGray(sp.node, true);
        //     } else if (sp instanceof cc.Label) {
        //         sp.node.runAction(cc.fadeTo(0.2, 77));
        //     }
        // }
    }

    private onClickDiscard() {
        this.game.msg.sendDisCard();
    }

    private onClickAllIn() {
        let pMoney = +this.game.plyMgr.me.money; //玩家
        let bets = new Decimal(this.game.maxBets).gt(pMoney) ?
            pMoney : this.game.maxBets;

        this.game.msg.sendDoBet(bets, UserOpt.ALLIN);
    }

    public onClickPK() {
        let gamer = this.game.plyMgr.gamer;
        if (gamer.length === 2) {
            for (let g of gamer) {
                if (!g.isMe) {
                    this.onChoosePKTarget(undefined, g.seat);
                    return;
                }
            }
        }
        this.setEnable(this.pk, false);
        this.nodeSelectors.active = true;
        this.updatePkSelector();
    }

    updatePkSelector() {
        this.spPkSelector.forEach((s, index) => {
            let p = this.game.plyMgr.getPlyBySeat(index + 1);
            let node = s.node;
            let toActive = !!(p && p.exist && !p.isDiscarded && !p.isLoser && !p.isLooker);
            if (node.active !== toActive) {
                node.stopAllActions();
            }
            node.active = toActive;
            node.scale = 1;
            let actions = cc.sequence(
                cc.scaleTo(0.3, 1.5),
                cc.scaleTo(0.3, 1)
            ).repeatForever()
            // node.runAction(actions);
            cc.tween(node).then(actions).start();
        });
    }

    updatePk() {
        this.setEnable(this.pk, true);
    }

    hidePKView() {
        this.nodeSelectors.active = false;
    }

    private onChoosePKTarget(btn: cc.Button, seat: number) {
        this.hidePKView();
        this.game.msg.sendChallenge(seat);
    }

    private doBet(bets: number, optType: UserOpt) {
        this.game.msg.sendDoBet(bets, optType);
    }

    private onClickCall() {
        this.playerDoBet(0, UserOpt.FOLLOW);
    }

    private onClickLookCard() {
        this.game.msg.sendFaceUp();
    }

    private onClickRaiseAmount(btn: cc.Button, index: number) {
        this.playerDoBet(index, UserOpt.ADD);
    }

    private onClickOverShow() {
        this.game.msg.sendShowCard();
        // this.hideOver();
    }

    private playerDoBet(idx: number, type: UserOpt) {
        let balanceEnough = true;
        let me = this.game.plyMgr.me;
        let money = new Decimal(me.money);

        let bet = new Decimal(this.game.curSingleBet);
        if (type === UserOpt.ADD) bet = new Decimal(this.rates[idx - 1]).mul(this.game.baseScore);
        if (me.isLooked) bet = bet.mul(2);

        if (money.cmp(bet) < 0) {
            balanceEnough = false;
        }

        if (balanceEnough) {
            let val = type === UserOpt.FOLLOW ? idx : new Decimal(this.rates[idx - 1]).mul(this.game.baseScore).toNumber();
            this.doBet(val, type);
        } else {
            this.onClickAllIn();
        }
    }
}
