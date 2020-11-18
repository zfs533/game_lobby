import BrnnGame from "./brnnGame";
import Player, { PlayerState } from "../g-share/player";
import { getAvatar, getAvatarFrame } from "../common/ui";

const { ccclass, property } = cc._decorator;
let Decimal = window.Decimal;
@ccclass
export default class BrnnPlayer extends Player {
    private animNodeArr: cc.Node[] = [];

    game: BrnnGame;

    private selfPos: cc.Vec2;

    private _areaBetInfos: { [area: number]: string } = {};

    private _isLooker: boolean;
    set isLooker(l: boolean) {
        this._isLooker = l;
    }
    get isLooker() {
        return this._isLooker;
    }

    onLoad() {
        this.animNodeArr.push(this.sAva.node);
        this.animNodeArr.push(this.sAvaFrame.node);
        this.animNodeArr.push(this.lLoc.node);
        this.animNodeArr.push(this.sMoneyIcon.node);
        this.animNodeArr.push(this.lMoney.node);
        this.selfPos = this.node.getPosition();
        super.onLoad();
    }

    changeState(state: PlayerState): void {
    };

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
            // cc.log("--------", this.avatarFrame)
            getAvatarFrame(this.avatarFrame, this.sAvaFrame);
        }
    }

    hide() {
        this.sAva.node.active = true;
        this.sAva.node.setScale(1, 1);
        this.sAva.spriteFrame = getAvatar(this.isMale, -1);
    }
    hideFrame() {
        this.sAvaFrame.node.active = true;
        this.sAvaFrame.node.setScale(1, 1);
        getAvatarFrame(-1, this.sAvaFrame);
    }

    initBets() {
        this._areaBetInfos = {};
    }

    get areaBetInfos() {
        return this._areaBetInfos;
    }

    doBeting(area: number, betPoint: string, isAni = true) {
        if (this.money !== undefined) {
            this.money = new Decimal(this.money).sub(betPoint).toString();
            this.updateMoney();
        }
        if (!this._areaBetInfos[area]) this._areaBetInfos[area] = "0";
        this._areaBetInfos[area] = new Decimal(this._areaBetInfos[area]).add(betPoint).toString();

        if (isAni) {
            this.node.stopAllActions();
            this.node.setPosition(this.selfPos);
            this.node.scaleX = 1;
            this.node.scaleY = 1;

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
    }

    getPlayerPos(): cc.Vec2 {
        return this.node.getPosition();
    }

    convertToNodePos(node: cc.Node): cc.Vec2 {
        let worldPos = this.node.convertToWorldSpaceAR(this.sAva.node.getPosition());
        return node.convertToNodeSpaceAR(worldPos);
    }
}
