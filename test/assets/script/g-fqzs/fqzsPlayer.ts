import Player, { PlayerState } from "../g-share/player";
import FQZSGame from "./fqzsGame";
import { getAvatar, getAvatarFrame } from "../common/ui";

let Decimal = window.Decimal;

const { ccclass, property } = cc._decorator;
@ccclass
export default class FQZSPlayer extends Player {
    game: FQZSGame;

    private selfPos: cc.Vec2;
    private _areaBetInfos: { [area: number]: string } = {};

    specialPlayer: boolean;
    private animNodeArr: cc.Node[] = [];

    changeState(state: PlayerState): void {
    }

    private _looker: boolean = true;
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
        this.selfPos = this.node.getPosition();
        this.animNodeArr.push(this.sAva.node);
        this.animNodeArr.push(this.sAvaFrame.node);
        this.animNodeArr.push(this.lLoc.node);
        this.animNodeArr.push(this.sMoneyIcon.node);
        this.animNodeArr.push(this.lMoney.node);
        super.onLoad();
    }

    enterAni(doAnim = true) {
        this.show();
        if (doAnim) {
            let scale = cc.scaleTo(0.1, 1, 1).easing(cc.easeQuadraticActionOut());
            for (const node of this.animNodeArr) {
                node.stopAllActions();
                node.setScale(0, 0);
                node.opacity = 255;
                let actions = cc.sequence(
                    scale.clone(),
                    cc.callFunc(() => {
                        node.setScale(1, 1);
                    })
                )
                // node.runAction(actions);

                cc.tween(node).then(actions).start();
            }
        }
    }

    leaveAni() {
        let seq = cc.sequence(cc.scaleTo(0.1, 0, 0), cc.callFunc(this.hide, this));
        let seq1 = cc.sequence(cc.scaleTo(0.1, 0, 0), cc.callFunc(this.hideFrame, this));
        for (const node of this.animNodeArr) {
            node.stopAllActions();
            node.setScale(1, 1);
            // node.runAction(seq.clone());
            cc.tween(node).then(seq.clone()).start();
            // node.runAction(seq1.clone());
            cc.tween(node).then(seq1.clone()).start();
        }
    }

    show() {
        for (const node of this.animNodeArr) {
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
        for (const node of this.animNodeArr) {
            node.active = false;
        }
        this.sAva.node.active = true;
        this.sAva.node.setScale(1, 1);
        this.sAva.spriteFrame = getAvatar(this.isMale, -1);
    }
    hideFrame() {
        for (const node of this.animNodeArr) {
            node.active = false;
        }
        this.sAvaFrame.node.active = true;
        this.sAvaFrame.node.setScale(1, 1);
        getAvatarFrame(-1, this.sAvaFrame);
    }

    doBet(betArea: number, betPoint: string, isAnim = true) {
        this.syncBets(-betPoint);
        if (!this._areaBetInfos[betArea]) this._areaBetInfos[betArea] = "0";
        this._areaBetInfos[betArea] = new Decimal(this._areaBetInfos[betArea]).add(betPoint).toString();

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
