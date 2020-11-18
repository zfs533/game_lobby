import DZPKGame from "./dzpkGame";
import { setNodeGray, setInteractable } from '../common/util';
import { PlayerStates } from "./dzpkPlayer"
import net from "../common/net";

let Decimal = window.Decimal
const { ccclass, property } = cc._decorator;

enum OperationState {
    None,
    ShowNormal,
    NormalShowed,
    HideNormal,
    ShowRaise,
    RaiseShowed,
    HideRaise
}

export enum AutoState {
    None,
    CheckOrFold,
    AutoCheck,
    AlwaysFollow
}

@ccclass
export default class DZPKOperation extends cc.Component {

    @property(cc.Node)
    private nodeRaise: cc.Node = undefined;   // 点击加注后 所展示的节点

    @property(cc.Node)
    private nodeNormal: cc.Node = undefined;

    @property(cc.Node)
    private nodeOther: cc.Node = undefined;  // 让或弃  自动让  跟任何  的父节点

    @property(cc.Node)
    private nodeDefaultRaise: cc.Node = undefined;    // 默认加注的父节点

    @property([cc.Button])
    private arrayDefaultRaiseButton: cc.Button[] = [];     // 默认展示的加注button

    @property([cc.Node])
    private arrayRaiseNodeOne: cc.Node[] = [];     // 第一轮展示加注的Butto上的 数值Lable

    @property([cc.Node])
    private arrayRaiseNodeTwo: cc.Node[] = [];    // 第二轮及以后展示加注的Butto上的 数值Lable

    @property([cc.Sprite])
    private arrayCheck: cc.Sprite[] = [];     // 让或弃  自动让  跟任何  的选中状态的

    @property(cc.Button)
    private discard: cc.Button = undefined;

    @property(cc.Button)
    private call: cc.Button = undefined;

    @property(cc.Button)
    private allIn: cc.Button = undefined;

    @property(cc.Button)
    private raise: cc.Button = undefined;

    @property(cc.Button)
    private check: cc.Button = undefined;    // 让牌Button

    @property([cc.Button])
    private arrayRaise: cc.Button[] = [];

    @property(cc.Slider)
    private sliderRaise: cc.Slider = undefined;

    @property(cc.Sprite)
    private sliderProgress: cc.Sprite = undefined;

    @property(cc.Label)
    private sliderAmount: cc.Label = undefined;

    @property(cc.Label)
    private raiseAny: cc.Label = undefined;

    private state: OperationState;

    private defultWidth: number = 568;

    private curDefultRaise: boolean = true;  // 当前默认显示的加注按钮lable  true 最初的  3大盲，4大盲，1底池  false为 第二圈后变成的 1/2底池，2/3底池，1底池

    game: DZPKGame;

    private get rates() {
        return this.game && this.game.raiseRates || [];
    };

    onLoad() {
        // init logic
        this.nodeNormal.active = false;
        this.nodeRaise.active = false;

        let winHeight = cc.winSize.height;
        this.nodeNormal.setPosition(this.defultWidth, -winHeight / 2);
        this.nodeRaise.setPosition(this.defultWidth, -winHeight / 2);

        this.state = OperationState.None;

        this.showDefultRiseLeblOne(true);
    }

    private setEnable(btn: cc.Component, enable: boolean) {
        if (btn instanceof cc.Toggle) {
            btn.enableAutoGrayEffect = false;
            if (!enable) {
                btn.uncheck();
            }
            setInteractable(btn, enable);
        } else if (btn instanceof cc.Button) {
            setInteractable(btn, enable);
            btn.enableAutoGrayEffect = false;
        }
        if (enable) {
            // btn.node.runAction(cc.fadeTo(0.2, 255));
            cc.tween(btn.node).to(0.2, { opacity: 255 }).start();
        } else {
            // btn.node.runAction(cc.fadeTo(0.2, 170));
            cc.tween(btn.node).to(0.2, { opacity: 170 }).start();
        }
    }
    /**
     * 展示默认加注按钮的第一批label
     * @param showOne 是否展示
     */
    showDefultRiseLeblOne(showOne: boolean) {
        this.arrayRaiseNodeOne.forEach(el => {
            el.active = showOne;
        });
        this.arrayRaiseNodeTwo.forEach(el => {
            el.active = !showOne;
        });
        this.curDefultRaise = showOne;
    }

    /**
     * 展示 让或弃 自动让牌  跟任何注  按钮
     */
    showOther() {
        let game = this.game;
        let me = game.plyMgr.me;
        if (!game.amIInGame || me.state < PlayerStates.STARTED || me.state === PlayerStates.DISCARDED || me.isLooker) {
            return;
        }
        let node = this.nodeOther;
        node.active = true;
        node.stopAllActions();
        // node.runAction(
        //     cc.moveTo(0.15, cc.v2(this.defultWidth, 0)).easing(cc.easeCubicActionOut()),
        // );
        cc.tween(node).then(cc.moveTo(0.15, cc.v2(this.defultWidth, 0)).easing(cc.easeCubicActionOut())).start();
    }

    hideOther() {
        let node = this.nodeOther;
        node.stopAllActions();
        let actions = cc.sequence(
            cc.moveTo(0.15, cc.v2(this.defultWidth, -cc.winSize.height / 2)).easing(cc.easeCubicActionIn()),
            cc.callFunc(() => {
                node.active = false;
            })
        )
        // node.runAction(actions);
        cc.tween(node).then(actions).start();
    }

    showDefultRaise() {
        let game = this.game;
        let me = game.plyMgr.me;
        if (!game.amIInGame || !me.isBetting) {
            return;
        }
        let node = this.nodeDefaultRaise;
        node.active = true;
        this.updateDefaultRaiseState();

        node.stopAllActions();
        // node.runAction(
        //     cc.moveTo(0.15, cc.v2(-this.defultWidth, 0)).easing(cc.easeCubicActionOut()),
        // );
        cc.tween(node).then(cc.moveTo(0.15, cc.v2(-this.defultWidth, 0)).easing(cc.easeCubicActionOut())).start();
    }

    hideDefultRaise() {
        let node = this.nodeDefaultRaise;
        node.stopAllActions();
        let actions = cc.sequence(
            cc.moveTo(0.15, cc.v2(-this.defultWidth, -cc.winSize.height / 2)).easing(cc.easeCubicActionIn()),
            cc.callFunc(() => {
                node.active = false;
            })
        )
        // node.runAction(actions);
        cc.tween(node).then(actions).start();
    }

    // 点击跟任何注
    onClickAlwayFollow() {
        this.arrayCheck[0].node.active = false;
        this.arrayCheck[1].node.active = false;
        this.arrayCheck[2].node.active = !this.arrayCheck[2].node.active;
        this.game.autoState = this.arrayCheck[2].node.active ? AutoState.AlwaysFollow : AutoState.None;
    }

    // 点击自动让牌
    onClickAutoCheck() {
        this.arrayCheck[0].node.active = false;
        this.arrayCheck[2].node.active = false;
        this.arrayCheck[1].node.active = !this.arrayCheck[1].node.active;
        this.game.autoState = this.arrayCheck[1].node.active ? AutoState.AutoCheck : AutoState.None;
    }

    // 点击让或弃
    onClickFoldCheck() {
        this.arrayCheck[1].node.active = false;
        this.arrayCheck[2].node.active = false;
        this.arrayCheck[0].node.active = !this.arrayCheck[0].node.active;
        this.game.autoState = this.arrayCheck[0].node.active ? AutoState.CheckOrFold : AutoState.None;
    }

    resetAutoState() {
        this.arrayCheck[0].node.active = false;
        this.arrayCheck[1].node.active = false;
        this.arrayCheck[2].node.active = false;
        this.game.autoState = AutoState.None;
    }


    showNormal() {
        let game = this.game;
        let me = game.plyMgr.me;
        this.setEnable(this.raise, true);
        this.setEnable(this.allIn, true);
        if (!game.amIInGame || !me.isBetting) {
            return Promise.resolve({});
        }
        if (this.state === OperationState.ShowNormal || this.state === OperationState.NormalShowed) {
            return Promise.resolve({});
        }
        return new Promise((resolve) => {
            let node = this.nodeNormal;
            node.active = true;
            this.state = OperationState.ShowNormal;
            node.stopAllActions();
            let actions = cc.sequence(
                cc.moveTo(0.15, cc.v2(this.defultWidth, 0)).easing(cc.easeCubicActionOut()),
                cc.callFunc(() => {
                    this.state = OperationState.NormalShowed;
                    resolve();
                })
            )
            // node.runAction(actions);
            cc.tween(node).then(actions).start();
        });
    }
    hideNormal() {
        return new Promise((resolve) => {
            let node = this.nodeNormal;
            if (!node.active) {
                resolve();
                return;
            }
            if (this.state === OperationState.HideNormal) {
                resolve();
                return;
            }
            this.state = OperationState.HideNormal;
            node.stopAllActions();
            let actions = cc.sequence(
                cc.moveTo(0.15, cc.v2(this.defultWidth, -cc.winSize.height / 2)).easing(cc.easeCubicActionIn()),
                cc.callFunc(() => {
                    node.active = false;
                    resolve();
                })
            )
            // node.runAction(actions);
            cc.tween(node).then(actions).start();
        });
    }


    showRaise() {
        let game = this.game;
        let me = game.plyMgr.me;
        if (!game.amIInGame || !me.isBetting) {
            return Promise.resolve({});
        }
        if (this.state === OperationState.ShowRaise || this.state === OperationState.RaiseShowed) {
            return Promise.resolve({});
        }
        return new Promise((resolve) => {
            let node = this.nodeRaise;

            node.position = cc.v3(0, 0);
            node.active = true;
            this.state = OperationState.ShowRaise;
            node.stopAllActions();
            let actions = cc.sequence(
                cc.moveTo(0.15, cc.v2(0, 89)).easing(cc.easeCubicActionOut()),
                cc.callFunc(() => {
                    this.state = OperationState.RaiseShowed;
                    resolve();
                })
            )
            // node.runAction(actions);
            cc.tween(node).then(actions).start();
        });
    }
    hideRaise() {
        return new Promise((resolve) => {
            let node = this.nodeRaise;
            if (!node.active) {
                resolve();
                return;
            }
            if (this.state === OperationState.HideRaise) {
                resolve();
                return;
            }
            this.state = OperationState.HideRaise;
            node.stopAllActions();
            let actions = cc.sequence(
                cc.moveTo(0.15, cc.v2(0, -cc.winSize.height / 2)).easing(cc.easeCubicActionIn()),
                cc.callFunc(() => {
                    node.active = false;
                    resolve();
                })
            )
            // node.runAction(actions);
            cc.tween(node).then(actions).start();
        });
    }
    /**
     * 当选中 跟任何 让或弃 自动让牌  时，轮到自己操作 调用该方法
     */
    autoPlay() {
        this.scheduleOnce(() => {
            let me = this.game.plyMgr.me;
            if (this.game.autoState === AutoState.CheckOrFold) {
                if (this.game.roundBets <= me.roundBets) {
                    this.onClickCheck();
                } else {
                    this.onClickDiscard();
                }
            } else if (this.game.autoState === AutoState.AutoCheck) {
                if (this.game.roundBets <= me.roundBets) {
                    this.onClickCheck();
                } else {
                    this.game.autoState = AutoState.None;
                    this.showTurn();
                    this.arrayCheck[0].node.active = false;
                    this.arrayCheck[1].node.active = false;
                    this.arrayCheck[2].node.active = false;
                }
            } else if (this.game.autoState === AutoState.AlwaysFollow) {
                let needCallMoney = new Decimal(this.game.roundBets).sub(me.roundBets);
                if (needCallMoney.gte(me.takeMoney)) {
                    this.onClickAllIn();
                } else if (this.game.roundBets <= me.roundBets) {
                    this.onClickCheck();
                } else {
                    this.onClickCall();
                }
            } else {
                this.showTurn();
            }
        }, 1);

    }

    /**
     * 根据加注次数  隐藏加注按钮
     */
    checkMyCurRoundAddBetCnt() {
        let me = this.game.plyMgr.me;
        if (me.curRoundAddBetCnt >= this.game.maxAddBetCnt) {
            this.arrayDefaultRaiseButton.forEach(el => {
                this.setEnable(el, false);
            });
            this.setEnable(this.raise, false);
            // this.setEnable(this.allIn, false);
        }
    }

    /**
     * 显示当前回合可用的按钮
     */
    showTurn() {
        let game = this.game;
        if (!game.amIInGame) {
            return;
        }

        if (game.autoState != AutoState.None) {
            this.autoPlay();
            return;
        }

        this.hideOther();
        this.hideRaise().then(() => {
            this.showNormal();
            this.showDefultRaise();
            this.checkMyCurRoundAddBetCnt();
        });

        this.updateNormalButtonsState();
    }

    updateNormalButtonsState() {
        let game = this.game;
        let me = game.plyMgr.me;
        if (me) {
            let callLabel = this.call.getComponentInChildren(cc.Label);
            if (game.roundBets === me.roundBets) {
                this.check.node.active = true;
                this.call.node.active = false;
                this.raise.node.active = true;
                callLabel.string = "跟注";
            } else if (game.roundBets > me.roundBets) {
                this.check.node.active = false;
                this.call.node.active = true;
                this.raise.node.active = true;

                let needCallMoney = new Decimal(game.roundBets).sub(me.roundBets);
                if (needCallMoney.lt(me.takeMoney)) {
                    callLabel.string = "跟注 " + needCallMoney;
                } else {
                    // callLabel.string = "全押";
                    this.call.node.active = false;
                    this.allIn.node.active = true;
                    this.raise.node.active = false;
                }
            }
        } else {
            cc.warn("没有我？假的");
        }
    }

    hideTurn() {
        this.hideNormal();
        this.hideRaise();
        this.hideDefultRaise();
        this.showOther();
    }

    reset() {
        this.hideNormal();
        this.hideRaise();
        this.hideDefultRaise();
        this.hideOther();
        this.showDefultRiseLeblOne(true);
        this.resetAutoState();
    }


    /**
     * 点击加注按钮
     *
     * @returns
     * @memberof GameDZPK
     */
    private onClickShowRaise() {
        let game = this.game;
        let me = game.plyMgr.me;
        this.hideDefultRaise();
        this.hideNormal().then(() => {
            this.showRaise();
        })

        let startBet = game.roundBets === 0 ? new Decimal(game.baseScore)
            .mul(2) : new Decimal(game.roundBets).mul(2).sub(me.roundBets);
        let finallyStartBet = startBet.lt(me.takeMoney) ? startBet.toNumber() : me.takeMoney;
        this.raiseAny.string = finallyStartBet.toString();
        this.sliderAmount.string = finallyStartBet.toString();
        this.sliderProgress.fillRange = 0;
        this.sliderRaise.progress = 0;

        this.arrayRaise.forEach((btn, index) => {

            // let amount = game.baseScore * this.rates[index];
            let amount = this.rates[index];

            btn.getComponentInChildren(cc.Label).string = amount.toString();

            if (+me.takeMoney < amount || amount < finallyStartBet) {
                this.setEnable(btn, false);
            } else {
                this.setEnable(btn, true);
            }
        });
    }

    /**
     * 点击加注界面之外的区域
     *
     * @memberof GameDZPK
     */
    private onCLickRaise() {
        this.hideRaise().then(() => {
            this.showNormal();
            this.showDefultRaise();
        });
    }

    private isTurning() {
        let game = this.game;
        let me = game.plyMgr.me;
        if (!game.amIInGame || !me.isBetting) {
            return false;
        }
        return true;
    }

    private onClickCheck() {
        if (!this.isTurning()) {
            return;
        }
        net.notify("game.dzpkHandler.userCheck", {});
    }
    private onClickDiscard() {
        if (!this.isTurning()) {
            return;
        }
        net.notify("game.dzpkHandler.userFold", {});
    }
    private onClickCall() {
        if (!this.isTurning()) {
            return;
        }
        net.notify("game.dzpkHandler.userFollow", {});
    }
    private onClickAllIn() {
        if (!this.isTurning()) {
            return;
        }
        net.notify("game.dzpkHandler.userAllIn", {});
    }
    /**
     * 点击加注界面的按钮
     *
     * @param {cc.Event.EventTouch} ev
     * @returns
     * @memberof GameDZPK
     */
    private onCLickRaiseBtn(ev: cc.Event.EventTouch) {
        if (!(ev.target instanceof cc.Node)) {
            return
        }
        let game = this.game;
        let me = game.plyMgr.me;
        if (!me || !me.exist) {
            return;
        }
        let label = ev.target.getComponentInChildren(cc.Label);
        if (!label) {
            return;
        }
        let amount = +label.string;
        if (isNaN(amount)) {
            return;
        }

        if (amount === +this.game.plyMgr.me.takeMoney) {
            this.onClickAllIn();
            return;
        }
        let bet = amount.toString();
        net.notify("game.dzpkHandler.userRaise", { bets: bet });

    }

    private onSlideRaise(slider: cc.Slider) {
        let game = this.game;
        let max = game.roundMaxBets < +game.plyMgr.me.takeMoney ? game.roundMaxBets : game.plyMgr.me.takeMoney;
        let min = game.roundBets === 0 ? new Decimal(game.baseScore).mul(2) : new Decimal(game.roundBets).mul(2).sub(game.plyMgr.me.roundBets);
        let finallyMin = min.lt(game.plyMgr.me.takeMoney) ? min.toNumber() : game.plyMgr.me.takeMoney;

        let availableRaise = new Decimal(max).sub(finallyMin);
        let val = availableRaise.mul(slider.progress).toFixed(0);

        let result = new Decimal(val).add(finallyMin).toString();
        if (slider.progress === 1) {
            result = game.plyMgr.me.takeMoney.toString();
        }
        this.sliderAmount.string = result;
        this.raiseAny.string = result;
        this.sliderProgress.fillRange = slider.progress;
    }

    private onClickDefaultRaise(ev: cc.Event.EventTouch, customData: string) {
        let bets;
        if (customData === "1") {
            if (this.curDefultRaise) {
                bets = new Decimal(this.game.baseScore).mul(2).mul(3);
            } else {
                bets = Math.floor(new Decimal(this.game.totalBets).div(2).toNumber())
            }
        } else if (customData === "2") {
            if (this.curDefultRaise) {
                bets = new Decimal(this.game.baseScore).mul(2).mul(4);
            } else {
                bets = Math.floor(new Decimal(this.game.totalBets).mul(2).div(3).toNumber())
            }
        } else if (customData === "3") {
            bets = this.game.totalBets;
        }
        bets = bets.toString();
        net.notify("game.dzpkHandler.userRaise", { bets: bets });
    }

    /**
     * 更新默认加注按钮的显隐状态
     */
    private updateDefaultRaiseState() {
        let me = this.game.plyMgr.me;
        let game = this.game;
        if (this.curDefultRaise) {
            if (new Decimal(this.game.totalBets).mul(2).mul(3).gte(me.takeMoney) || new Decimal(this.game.baseScore).mul(2).mul(3).lt(new Decimal(game.roundBets).mul(2))) {
                this.setEnable(this.arrayDefaultRaiseButton[0], false);
            } else {
                this.setEnable(this.arrayDefaultRaiseButton[0], true);
            }
            if (new Decimal(this.game.baseScore).mul(2).mul(4).gte(me.takeMoney) || new Decimal(this.game.baseScore).mul(2).mul(4).lt(new Decimal(game.roundBets).mul(2))) {
                this.setEnable(this.arrayDefaultRaiseButton[1], false);
            } else {
                this.setEnable(this.arrayDefaultRaiseButton[1], true);
            }
            if (+me.takeMoney < this.game.totalBets || this.game.totalBets < new Decimal(game.roundBets).mul(2).toNumber()) {
                this.setEnable(this.arrayDefaultRaiseButton[2], false);
            } else {
                this.setEnable(this.arrayDefaultRaiseButton[2], true);
            }
        } else {
            let score1 = Math.floor(new Decimal(this.game.totalBets).div(2).toNumber());

            if (+me.takeMoney < score1
                || score1 < new Decimal(game.roundBets).mul(2).toNumber()) {
                this.setEnable(this.arrayDefaultRaiseButton[0], false);
            } else {
                this.setEnable(this.arrayDefaultRaiseButton[0], true);
            }
            let score2 = Math.floor(new Decimal(this.game.totalBets).mul(2).div(3).toNumber());

            if (+me.takeMoney < score2
                || score2 < new Decimal(game.roundBets).mul(2).toNumber()) {
                this.setEnable(this.arrayDefaultRaiseButton[1], false);
            } else {
                this.setEnable(this.arrayDefaultRaiseButton[1], true);
            }

            if (+me.takeMoney < this.game.totalBets || this.game.totalBets < new Decimal(game.roundBets).mul(2).toNumber()) {
                this.setEnable(this.arrayDefaultRaiseButton[2], false);
            } else {
                this.setEnable(this.arrayDefaultRaiseButton[2], true);
            }
        }

    }
}
