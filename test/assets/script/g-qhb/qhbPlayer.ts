import Player, { PlayerState } from "../g-share/player";
import QHBGame from "./qhbGame";
import { getAvatarFrame } from "../common/ui";


let Decimal = window.Decimal;

const { ccclass, property } = cc._decorator;

@ccclass
export default class QHBPlayer extends Player {
    @property(cc.Label)
    lblPos: cc.Label = undefined;

    @property(cc.Sprite)
    spInfoBg: cc.Sprite = undefined;

    @property([cc.SpriteFrame])
    sfBg: cc.SpriteFrame[] = [];

    @property(cc.Node)
    ndMyIcon: cc.Node = undefined;

    @property(cc.Sprite)
    spBoom: cc.Sprite = undefined;

    @property(cc.Sprite)
    spMaxRB: cc.Sprite = undefined;

    @property(cc.Sprite)
    spHeadFrame: cc.Sprite = undefined;

    private selfPos: cc.Vec2;

    posFlag: boolean = undefined;   // 标记玩家出现的方式（左滑（true）右滑（false））
    idx: number = 0;                // 标记玩家位置
    pos: number = 0;                 // 玩家序号
    game: QHBGame;

    onLoad() {
        super.onLoad();
        this.selfPos = this.node.getPosition();
        if (this.spBoom) this.spBoom.node.active = false;
        if (this.spMaxRB) this.spMaxRB.node.active = false;
        // cc.log("player坐标： ", this.selfPos);
    }

    init(game: QHBGame) {
        this.game = game;
        this.money = undefined;
        this.state = PlayerState.UNREADY;
        this.show();
    }

    get isLooker() {
        return false;
    }

    setPlyInfo(head: cc.SpriteFrame, headFrame: number, vipLevel: string, loc: string, money?: string) {
        this.sAva.spriteFrame = head;
        if (headFrame) {
            getAvatarFrame(headFrame, this.sAvaFrame);
        }
        if (vipLevel) {
            this.vip.active = true;
            this.vipLevel.string = vipLevel;
        }
        this.lLoc.string = loc;
        if (money) {
            this.lMoney.string = money;
        } else {
            this.lMoney.string = "暂未公开";
        }
    }

    grabAni() {
        let action1 = cc.moveBy(0.3, 200, 0);
        let action2 = cc.moveBy(0.3, -200, 0);
        if (this.posFlag) {
            this.node.setPosition(this.selfPos.x - 180, 0);
            // this.node.runAction(action1);
            cc.tween(this.node).by(0.3, { position: cc.v2(200, 0) }).start();
        } else {
            this.node.setPosition(this.selfPos.x + 180, 0);
            //this.node.runAction(action2);
            cc.tween(this.node).by(0.3, { position: cc.v2(-200, 0) }).start();
        }
    }

    exitAni() {
        if (this.posFlag) {
            // this.node.runAction(
            //     cc.sequence(
            //         cc.moveBy(0.2, -300, 0),
            //         cc.callFunc(() => {
            //             this.node.destroy();
            //         })
            //     )
            // );
            cc.tween(this.node)
                .by(0.2, { position: cc.v2(-300, 0) })
                .call(() => {
                    this.node.destroy();
                })
                .start();
        } else {
            // this.node.runAction(
            //     cc.sequence(
            //         cc.moveBy(0.2, 300, 0),
            //         cc.callFunc(() => {
            //             this.node.destroy();
            //         })
            //     )
            // );
            cc.tween(this.node)
                .by(0.2, { position: cc.v2(300, 0) })
                .call(() => {
                    this.node.destroy();
                })
                .start();
        }
    }

    changeInfoBg() {
        this.spInfoBg.spriteFrame = this.sfBg[0];
    }

    showMeIcon() {
        this.ndMyIcon.active = true;
    }

    showMaxRB() {
        if (this.spMaxRB) this.spMaxRB.node.active = true;
        if (this.spHeadFrame) this.spHeadFrame.node.active = false;
    }

    playAni() {
        if (this.spBoom) this.spBoom.node.active = true;
        let pool = this.game.boomPool;
        let boomPre = this.game.preOtherBoomAni;
        let boomParent = this.game.ndBoomLayer;
        let boom = this.game.getOnePoolItem(pool, boomPre, boomParent);
        let parentPos = this.node.parent.getPosition();
        let x = parentPos.x;
        let y = parentPos.y;
        if (this.posFlag) {
            x = x - 36;
        } else {
            x = x - 64;
        }
        let firstPos = y - this.node.height / 2;
        y = firstPos - (this.node.height + 14) * this.idx;
        boom.setPosition(x, y);
        if (boom) {
            this.game.playAni(boom);
        }
    }

    refreshMoney(chgMoney: string) {
        // cc.log("refreshMoney", this.money, chgMoney);
        this.money = new Decimal(this.money).add(chgMoney).toString();
        this.updateMoney();
    }

    /**
     * 更新下注额，通过specialPlayer来判断是否重复更新
     * @param bets
     * @param specialPlayer
     */
    updateBets(bets: number, balance: number, specialPlayer: boolean = false) {
        if (this.money !== undefined && !specialPlayer) {
            this.money = new Decimal(balance).add(bets).toString();
            this.updateMoney();
            this.game.plyMgr.updateBalance(this.pos, this.money);
        } else {
            this.money = balance.toString();
            this.updateMoney();
            this.game.plyMgr.updateBalance(this.pos, this.money);
        }
    }

    changeState(state: PlayerState): void { }
}
