import Player, { PlayerState } from "../g-share/player";
import LhGame from "./lhGame";
import { getAvatar, getAvatarFrame } from "../common/ui";

const { ccclass, property } = cc._decorator;
let Decimal = window.Decimal;
@ccclass
export default class LhPlayer extends Player {

    private selfPos: cc.Vec2;
    private _areaBetInfos: { [area: number]: string } = {};

    private animNodes: cc.Node[] = [];

    game: LhGame;
    changeState(state: PlayerState): void {
    }

    private _looker: boolean;
    set isLooker(l: boolean) {
        this._looker = l;
    }
    get isLooker() {
        return this._looker;
    }

    get isMe() {
        return this.pos === this.game.plyMgr.getMePos();
    };

    get areaBetInfos() {
        return this._areaBetInfos;
    }

    initBets() {
        this._areaBetInfos = {};
    }

    onLoad() {
        super.onLoad();

        this.animNodes.push(this.sAva.node);
        this.animNodes.push(this.sAvaFrame.node);
        this.animNodes.push(this.lLoc.node);
        this.animNodes.push(this.sMoneyIcon.node);
        this.animNodes.push(this.lMoney.node);
        this.selfPos = this.node.getPosition();
    }

    enterAni(doAnim = true) {
        this.show();
        if (doAnim) {
            let scale = cc.scaleTo(0.1, 1, 1).easing(cc.easeQuadraticActionOut());
            for (const node of this.animNodes) {
                node.stopAllActions();
                node.setScale(0, 0);
                node.opacity = 255;
                // node.runAction(cc.sequence(
                //     scale.clone(),
                //     cc.callFunc(() => {
                //         node.setScale(1, 1);
                //     })
                // ));
                cc.tween(node).then(scale.clone())
                    .call(() => {
                        node.setScale(1, 1);
                    })
                    .start();
            }
        }
    }

    leaveAni() {
        let seq = cc.sequence(cc.scaleTo(0.1, 0, 0), cc.callFunc(this.hide, this));
        let seq1 = cc.sequence(cc.scaleTo(0.1, 0, 0), cc.callFunc(this.hideFrame, this));
        for (const node of this.animNodes) {
            node.stopAllActions();
            node.setScale(1, 1);
            // node.runAction(seq.clone());
            cc.tween(node).then(seq.clone()).start();
            // node.runAction(seq1.clone());
            cc.tween(node).then(seq1.clone()).start();
        }
    }

    show() {
        for (const node of this.animNodes) {
            node.active = true;
        }
        if (this.avatar !== undefined) {
            this.sAva.spriteFrame = getAvatar(this.isMale, this.avatar);
        }
        if (this.avatarFrame !== undefined) {
            getAvatarFrame(this.avatarFrame, this.sAvaFrame);
        }
    }

    hide() {
        for (const node of this.animNodes) {
            node.active = false;
        }
        this.sAva.node.active = true;
        this.sAva.node.setScale(1, 1);
        this.sAva.spriteFrame = getAvatar(this.isMale, -1);
    }
    hideFrame() {
        for (const node of this.animNodes) {
            node.active = false;
        }
        this.sAvaFrame.node.active = true;
        this.sAvaFrame.node.setScale(1, 1);
        getAvatarFrame(-1, this.sAvaFrame);
    }

    doBet(area: number, betPoint: string, isAnim = true) {
        this.syncBets(-betPoint);
        if (!this._areaBetInfos[area]) this._areaBetInfos[area] = "0";
        this._areaBetInfos[area] = new Decimal(this._areaBetInfos[area]).add(betPoint).toString();

        if (this.isMe) return;
        if (!isAnim) return;

        this.node.stopAllActions();
        this.node.setPosition(this.selfPos);

        let worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let moveOff = 20;
        if (worldPos.x > cc.winSize.width * 0.5) {
            moveOff = -moveOff;
        }
        let moveTime = 0.2;
        let actions = cc.sequence(
            cc.moveBy(moveTime, cc.v2(moveOff, 0)).easing(cc.easeBackOut()),
            cc.moveBy(moveTime * 0.5, cc.v2(-moveOff, 0)),
        )
        // this.node.runAction(actions);
        cc.tween(this.node).then(actions).start();
    }

    /**
     * 更新下注额，通过specialPlayer来判断是否重复更新
     * @param bets
     * @param specialPlayer
     */
    updateBets(bets: number, balance: string, specialPlayer: boolean = false) {
        if (this.money !== undefined && !specialPlayer) {
            this.money = new Decimal(balance).add(bets).toString();
            this.updateMoney();
            this.game.plyMgr.updateMoney(this.pos, this.money);
        } else {
            this.money = balance;
            this.updateMoney();
            this.game.plyMgr.updateMoney(this.pos, this.money);
        }
    }

    /**
     * 自己、富豪、赌神的信息要同步
     * @param bets
     */
    syncBets(bets: number) {
        this.updateBets(bets, this.money);
        // 更新富豪、赌神
        let fhPlayer = this.game.fhPlayer;
        if (fhPlayer && fhPlayer.pos === this.pos) {
            fhPlayer.updateBets(bets, this.money, true);
        }
        let dsPlayer = this.game.dsPlayer;
        if (dsPlayer && dsPlayer.pos === this.pos) {
            dsPlayer.updateBets(bets, this.money, true);
        }
    }
}
