import Player from "../g-share/player";
import HbslGame from "./hbslGame";
import { getAvatar, getAvatarFrame } from "../common/ui";
let Decimal = window.Decimal;
const { ccclass, property } = cc._decorator;

@ccclass
export default class HbslPlayer extends Player {
    game: HbslGame;
    private selfPos: cc.Vec2;
    private _areaBetInfos: { [area: number]: string } = {};
    specialPlayer: boolean;
    private animNodeArr: cc.Node[] = [];
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
    onLoad() {
        this.selfPos = this.node.getPosition();
        this.animNodeArr.push(this.sAva.node);
        this.animNodeArr.push(this.sAvaFrame.node);
        // this.animNodeArr.push(this.lLoc.node);
        // this.animNodeArr.push(this.sMoneyIcon.node);
        // this.animNodeArr.push(this.lMoney.node);
        super.onLoad();
    }
    changeState(state: number): void {
    }
    enterAni(doAnim = true) {
        this.show();
        if (doAnim) {
            if (this.lMoney) return
            let scale = cc.scaleTo(0.1, 0.5, 0.5).easing(cc.easeQuadraticActionOut());
            for (const node of this.animNodeArr) {
                node.stopAllActions();
                node.setScale(0, 0);
                node.opacity = 255;
                let actions = cc.sequence(
                    scale.clone(),
                    cc.callFunc(() => {
                        if (this.sAva.node.name === node.name) {
                            node.setScale(0.5, 0.5);
                        } else {
                            node.setScale(0.6, 0.6);
                        }
                    })
                )
                cc.tween(node).then(actions).start();
            }
        }
    }

    leaveAni() {
        if (this.lMoney) return
        let seq = cc.sequence(cc.scaleTo(0.1, 0, 0), cc.callFunc(this.hide, this));
        let seq1 = cc.sequence(cc.scaleTo(0.1, 0, 0), cc.callFunc(this.hideFrame, this));
        for (const node of this.animNodeArr) {
            node.stopAllActions();
            // node.setScale(0.5, 0.5);
            if (this.sAva.node.name === node.name) {
                node.setScale(0.5, 0.5);
            } else {
                node.setScale(0.6, 0.6);
            }
            cc.tween(node).then(seq.clone()).start();
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
        if (!this.lMoney) {
            this.sAva.node.setScale(0.5, 0.5);
        }
        this.sAva.spriteFrame = getAvatar(this.isMale, -1);
    }
    hideFrame() {
        for (const node of this.animNodeArr) {
            node.active = false;
        }
        this.sAvaFrame.node.active = true;
        if (!this.lMoney) {
            this.sAvaFrame.node.setScale(0.6, 0.6);
        }
        getAvatarFrame(-1, this.sAvaFrame);
    }

    /**
    //  *更新金币
    //  * @param chgMoney
    //  */
    // refreshMoney(chgMoney: string) {
    //     // cc.log("refreshMoney", this.money, chgMoney);
    //     // this.money = new Decimal(this.money).add(chgMoney).toString();
    //     this.money = chgMoney
    //     this.updateMoney();
    // }
    // update (dt) {}
}
