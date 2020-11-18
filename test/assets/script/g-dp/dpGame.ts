import Game from "../g-share/game";
import PokerGame from "../g-share/pokerGame";
import DpTouchMgr from "./dpTouchMgr";
import DpPlayerMgr from "./dpPlayerMgr"
import Dplayer from "./dpPlayer";
import DpPoker from './dpPoker';
import { setInteractable } from "../common/util";

export const enum AutoDesc {
    Auto = "自动出牌",
    Cancel = "取消自动",
}

const { ccclass, property } = cc._decorator;
@ccclass
export default abstract class DpGame extends Game {
    @property({ type: DpPlayerMgr, override: true })
    plyMgr: DpPlayerMgr = undefined;

    @property(DpTouchMgr)
    protected touchMgr: DpTouchMgr<DpPoker> = undefined;

    @property(PokerGame)
    pkrGame: PokerGame = undefined;

    @property(cc.Node)
    protected outCardPanel: cc.Node = undefined;

    @property(cc.Node)
    protected abandonPanel: cc.Node = undefined;

    @property(cc.Node)
    protected autoPanel: cc.Node = undefined;

    @property(cc.Button)
    protected btnOutCard: cc.Button = undefined;

    @property(cc.Node)
    protected btnHosted: cc.Node = undefined;

    @property(cc.Prefab)
    protected preEffBoom: cc.Prefab = undefined;

    protected _lastCardSuit: any;
    protected _lastCardData: number[];
    protected _isFirstWaitOut: boolean; // 在本局游戏中第一个出牌
    protected _isReturnGame: boolean; // 正在回到游戏
    protected _isFirstPlay: boolean; // 在本伦游戏中是否先手

    protected _isHosted: boolean;
    protected _isShowOpt: boolean;

    set returnGame(visible: boolean) {
        this._isReturnGame = visible;
    }

    onLoad() {
        super.onLoad();
    }

    initRound(): void {
        this.hideTicker()

        this.outCardPanel.active = false;
        this.abandonPanel.active = false;

        this.meHosted(false);
        this.btnHosted.active = false;
        this.hideOptPanel();

        this.plyMgr.initEnable();
        this.touchMgr.clearCards();

        this._isFirstWaitOut = true;
        this._isReturnGame = false;
        this._lastCardSuit = undefined;
        this._lastCardData = undefined;
    }

    initGame(): void {
        this.touchMgr.addGame(this);
    }

    initHolds(cards: number[]) {
        this.touchMgr.initCards(cards);
    }

    showNoPlay(player: Dplayer) {
        player.showNoPlay();
        if (player.isMe) {
            this._isShowOpt = undefined;
            this.hideOptPanel();
            if (!this._isHosted)
                this.touchMgr.enableCards(true);
        }
    }

    /**
     * 显示操作按钮
     */
    showOptPanel(isShowOpt: boolean) {
        this._isShowOpt = isShowOpt;
        if (this._isHosted) {
            return;
        }

        if (isShowOpt) {
            this.outCardPanel.active = true;
        } else {
            this.abandonPanel.active = true;
            this.touchMgr.enableCards(false);
        }
    }

    hideOptPanel() {
        this.outCardPanel.active = false;
        this.abandonPanel.active = false;
        this.touchMgr.setHoldsSort();
    }

    setPlayCardBtn(visible: boolean) {
        setInteractable(this.btnOutCard, visible);
    }

    // -------------------------------------------点击事件
    /**
     * 出牌
     */
    abstract onClickOutCard();
    /**
     * 托管
     */
    abstract onClickHosted();
    /**
     * 取消托管
     */
    abstract onClickCancel();

    /**
     * 自动出牌
     */
    abstract onClickAuto();

    /**
     * 不出或要不起
     */
    onClickAbandon() {
        this.hideOptPanel();
    }

    /**
     * 提示
     */
    onClickPrompt() {
        this.touchMgr.setPromptCard();
    }

    abstract playSirenAnim(node: cc.Node);

    meHosted(hosted: boolean) {
        this._isHosted = hosted;

        this.btnHosted.active = !hosted;
        this.autoPanel.active = hosted;
        this.touchMgr.enableCards(!hosted);

        if (hosted) {
            this.hideOptPanel();
        } else if (this._isShowOpt !== undefined) {
            this.showOptPanel(this._isShowOpt);
        }
    }

    onClickNext() {
        this.doPrepare();
        this.plyMgr.clearCards();
        this.touchMgr.clearCards();
        this.plyMgr.initEnable();
    }

    shake() {
        let t = 0.08;
        let action = cc.sequence(cc.moveBy(t / 2, cc.v2(10, 10)), cc.moveBy(t, cc.v2(-20, -20)),
            cc.moveBy(t / 2, cc.v2(10, 10)), cc.moveBy(t / 2, cc.v2(0, 10)), cc.moveBy(t, cc.v2(0, -20)), cc.moveBy(t / 2, cc.v2(0, 10)),
            cc.moveTo(0, cc.v2(0, 0)));
        //this.node.getParent().children[0].children[0].runAction(action);
        cc.tween(this.node.getParent().children[0].children[0]).then(action).start();
    }

    tickerShowAction(node: cc.Node, scale: number) {
        node.stopAllActions();
        node.scale = 0;
        let actions = cc.sequence(
            cc.moveBy(0, 0, -45),
            cc.spawn(
                cc.scaleTo(0.1, scale, scale).easing(cc.easeBackOut()),
                cc.fadeIn(0.3)
            )
        )
        //node.runAction(actions);
        cc.tween(node).then(actions).start();
    }

    tickerHideAction(node: cc.Node) {
        node.stopAllActions();
        let actions = cc.sequence(
            cc.spawn(
                cc.scaleTo(0.1, 0, 0).easing(cc.easeBackIn()),
                cc.fadeOut(0.3)
            ),
            cc.callFunc(() => {
                node.active = false;
            })
        )
        //node.runAction(actions);
        cc.tween(node).then(actions).start();
    }
}