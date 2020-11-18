import Game from "./game"
import { getAvatar, getAvatarFrame } from "../common/ui"
import { parseLocation, toCNMoney } from "../common/util"

const { ccclass, property } = cc._decorator
const riseName = 'rise'//飘字容器
export enum PlayerState { UNREADY, READY, STARTED }

@ccclass
export default abstract class Player extends cc.Component {
    @property(cc.Sprite)
    protected sAva: cc.Sprite = undefined;

    @property(cc.Sprite)
    protected sAvaFrame: cc.Sprite = undefined;

    @property(cc.Label)
    protected vipLevel: cc.Label = undefined;

    @property(cc.Node)
    protected vip: cc.Node = undefined;

    @property(cc.Label)
    protected lLoc: cc.Label = undefined;

    @property(cc.Label)
    protected lMoney: cc.Label = undefined;

    @property(cc.Sprite)
    protected sMoneyIcon: cc.Sprite = undefined;

    @property(cc.Label)
    protected lblBets: cc.Label = undefined;

    @property(cc.Sprite)
    protected sDealer: cc.Sprite = undefined;

    abstract game: Game;
    avatar: number;
    avatarFrame: number;
    money: string;//金币
    seat: number; //布局次序
    pos: number; //服务器次序
    isMale: boolean;
    state: number;//玩家状态
    isDealer?: boolean;//庄家
    loc?: string;//地理位置
    protected x = 0;
    protected y = 0;
    protected scaleX = 1;   // 记录玩家初始缩放值
    protected scaleY = 1;



    get isMe() {
        return this.seat === 0;
    }

    get exist() {
        return this.pos > -1
    }

    // 准备好了
    get isReady() {
        return this.state === PlayerState.READY
    }

    // 旁观者
    get isLooker() {
        return this.state === PlayerState.UNREADY
    }

    abstract changeState(state: PlayerState | number): void

    onLoad() {
        this.x = this.node.x;
        this.y = this.node.y;
        this.scaleX = this.node.scaleX;
        this.scaleY = this.node.scaleY;
    }

    init(game: Game) {
        this.game = game;
        this.deepClear()
        this.hide();
    }

    updatePly(data: ps.User) {
        if (this.vipLevel && data.vipLevel >= 0) this.vipLevel.string = data.vipLevel.toString();
        this.isMale = !!data.gender;
        this.pos = data.pos;
        this.loc = data.location;
        this.updateHead(data.avatar);
        this.updateHeadFrame(data.avatarFrame);
        this.updateLoc(data.location);
        this.updateMoney(data.money ? data.money : '--');
        this.show();
    }

    show() {
        this.node.active = true
    }
    hide() {
        if (!this.sAva) return;
        let c = this.sAva.node.getParent().getChildByName(riseName)
        if (c) c.destroy()
        this.node.active = false
    }
    clear() {
        this.updateHead(-1)
        this.updateMoney('--')
        this.updateLoc('--')
    }
    deepClear() {
        this.pos = -1
        this.clear()
    }
    //入场动画
    enterAni(doAnim = true) {
        this.show();
        this.node.stopAllActions();
        if (doAnim) {
            let destX = 2 * this.x;
            let destY = 2 * this.y;
            this.node.setPosition(destX, destY);
            //this.node.runAction(cc.moveTo(0.3, this.x, this.y).easing(cc.easeQuadraticActionOut()));
            //cc.tween(this.node).to(0.3, { position: cc.v2(this.x, this.y) }, { easing: 'sineInOut' }).start();
            cc.tween(this.node).then(cc.moveTo(0.3, this.x, this.y).easing(cc.easeQuadraticActionOut())).start();
        } else {
            this.node.setPosition(this.x, this.y);
        }
        this.node.setScale(this.scaleX, this.scaleY);
    }

    //离场动画
    leaveAni() {
        let destX = 2 * this.x;
        let destY = 2 * this.y;
        this.node.stopAllActions();

        // this.node.runAction(cc.sequence(
        //     cc.moveTo(0.3, destX, destY),
        //     cc.callFunc(() => {
        //         this.hide();
        //         this.node.setPosition(this.x, this.y);
        //     }),
        // ));
        cc.tween(this.node)
            .to(0.3, { position: cc.v2(destX, destY) })
            .call(
                () => {
                    this.hide();
                    this.node.setPosition(this.x, this.y);
                }
            ).start();
    }

    updateLoc(loc?: string) {
        if (!this.lLoc)
            return
        if (loc === '--' || loc === undefined) {
            this.lLoc.string = '--'
        } else {
            this.lLoc.string = parseLocation(loc)
        }
    }

    updateMoney(money?: string) {
        if (!this.lMoney)
            return
        if (this.sMoneyIcon) {
            this.sMoneyIcon.node.active = true
        }

        if (money === '--') {
            this.lMoney.string = '--'
        } else {
            if (money !== undefined) this.money = money;
            this.lMoney.string = toCNMoney(this.money);
        }
    }

    updateLookerView() {
        this.node.opacity = this.isLooker ? 125 : 255
    }

    updateHead(ava: number): void {
        if (this.avatar === ava || !this.sAva) return
        this.avatar = ava
        let node = this.sAva.node
        node.stopAllActions()
        // node.runAction(cc.sequence(
        //     cc.fadeOut(0.2),
        //     cc.callFunc(() => {
        //         this.sAva.spriteFrame = getAvatar(this.isMale, this.avatar)
        //         let opacity = this.isLooker ? 127 : 255
        //         node.runAction(cc.fadeTo(0.2, opacity))
        //     })
        // ))
        cc.tween(node)
            .to(0.2, { opacity: 0 })
            .call(
                () => {
                    this.sAva.spriteFrame = getAvatar(this.isMale, this.avatar)
                    let opacity = this.isLooker ? 127 : 255
                    cc.tween(node).to(0.2, { opacity: opacity }).start();
                }
            ).start();
    }

    updateHeadFrame(ava: number): void {
        if (this.avatarFrame === ava || !this.sAvaFrame) return
        this.avatarFrame = ava
        let node = this.sAvaFrame.node
        node.stopAllActions()
        // node.runAction(cc.sequence(
        //     cc.fadeOut(0.2),
        //     cc.callFunc(() => {
        //         getAvatarFrame(this.avatarFrame, this.sAvaFrame)
        //         node.runAction(cc.fadeTo(0.2, 255))
        //     })
        // ))
        cc.tween(node)
            .to(0.2, { opacity: 0 })
            .call(
                () => {
                    getAvatarFrame(this.avatarFrame, this.sAvaFrame)
                    cc.tween(node).to(0.2, { opacity: 255 }).start();
                }
            ).start();
    }

    convertToNodePos(node: cc.Node): cc.Vec2 {
        let worldPos = this.convertToWorldPos()
        return node.convertToNodeSpaceAR(worldPos)
    }

    convertToWorldPos(): cc.Vec2 {
        return this.node.convertToWorldSpaceAR(cc.v2(0, 0))
    }
    getPosition() {
        return cc.v2(this.node.position);
    }
    // 向上飘字（输赢）
    showWinOrLost(chgMoney: string) {
        let rise = new cc.Node()
        let toBox = this.sAva.node.getParent()
        let prefab = +chgMoney >= 0 ? this.game.preWin : this.game.preLose
        let node = cc.instantiate(prefab)
        node.getComponentInChildren(cc.Label).string = +chgMoney >= 0 ? "+" + chgMoney : chgMoney
        rise.addChild(node)
        node.x = 0
        toBox.addChild(rise)
        rise.name = riseName
        let actions = cc.sequence(
            cc.moveBy(1.5, 0, 50).easing(cc.easeQuadraticActionOut()),
            cc.fadeOut(1),
            cc.callFunc(rise.destroy.bind(rise))
        )
        // rise.runAction(actions)
        cc.tween(rise).then(actions).start();
        this.updateMoney();
        return new Promise(resolve => {
            this.scheduleOnce(resolve, 0.5)
        })
    }
}