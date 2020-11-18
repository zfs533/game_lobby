import QHBGame from "./qhbGame";

import { parseLocation } from "../common/util"
import { getAvatar, getAvatarFrame, } from "../common/ui";
import { Gender } from "../common/enum";

const { ccclass, property } = cc._decorator;


@ccclass
export default class QHBRedBag extends cc.Component {
    @property(cc.Node)
    ndNormal: cc.Node = undefined;

    @property(cc.Node)
    ndResult: cc.Node = undefined;

    @property(cc.Sprite)
    spNormalAvatar: cc.Sprite = undefined;

    @property(cc.Sprite)
    spNormalAvatarFrame: cc.Sprite = undefined;

    @property(cc.Label)
    lblNormalLoc: cc.Label = undefined;

    @property(cc.Label)
    lblRedBagGold: cc.Label = undefined;

    @property(cc.Label)
    lblRedBagNum: cc.Label = undefined;

    @property(cc.Label)
    lblNormalBoomNo: cc.Label = undefined;

    @property(cc.Node)
    ndGrabAni: cc.Node = undefined;

    @property(cc.Sprite)
    spResultPanel: cc.Sprite = undefined;

    @property(cc.Sprite)
    spMyResultPanel: cc.Sprite = undefined;

    @property(cc.Sprite)
    spResultAvatar: cc.Sprite = undefined;

    @property(cc.Sprite)
    spResultAvatarFrame: cc.Sprite = undefined;

    @property(cc.Label)
    lblResultLoc: cc.Label = undefined;

    @property(cc.Label)
    lblMyGrabedMoney: cc.Label = undefined;

    @property(cc.Label)
    lblResultChgMoney: cc.Label = undefined;

    @property(cc.Label)
    lblResultBoomNo: cc.Label = undefined;

    @property([cc.SpriteFrame])
    sfRedBagBgs: cc.SpriteFrame[] = [];

    @property([cc.Font])
    ftResult: cc.Font[] = [];

    // @property([cc.Font])
    // ftPlaye: cc.Font[] = [];

    /**福字 */
    @property(cc.Node)
    bliss: cc.Node = undefined;
    @property(cc.Node)
    kuang: cc.Node = undefined;
    @property(cc.Node)
    redHb2: cc.Node = undefined;
    @property(cc.Node)
    hB2: cc.Node = undefined;
    game: QHBGame;
    order: number;


    private actionIsEnd: boolean = true;  // 避免再动画过程中，改变了当前红包信息
    private redBagPos: cc.Vec2[] = [];
    private redBagScale: number[] = [];
    private redBagOpacity: number[] = [];

    init(game: QHBGame, order: number) {
        this.game = game;
        this.redBagPos = this.game.redBagPos;
        this.redBagScale = this.game.redBagScale;
        this.redBagOpacity = this.game.redBagOpacity;
        // this.goodBg.active = false;
        // this.lblRedBagGold.node.parent.parent.active = false;
        this.setOrder(order)
    }

    setOrder(order: number) {
        this.order = order;
        if (order === 0) {
            this.grabParticialCtr(true);
            this.game.playAni(this.ndGrabAni, true);
            this.ndGrabAni.opacity = 255;
            this.ndGrabAni.getChildByName("qiang_ic2").getComponent(cc.Button).interactable = true;
        } else {
            this.grabParticialCtr(false);
            this.ndGrabAni.opacity = 0;
            this.ndGrabAni.getChildByName("qiang_ic2").getComponent(cc.Button).interactable = false;
        }
    }

    /**
     * 设置红包信息
     * @param p
     * @param rb
     */
    setRedBagInfo(p: gameIface.brPlayerInfo, rb: string, pos: number) {
        if (!this.actionIsEnd || !p) return;
        this.showMyRedBag(p, pos);
        let avatar = getAvatar((p.gender === Gender.MALE), p.avatar);
        // let avatarFrame = getAvatarFrame()
        let loc = parseLocation(p.location);
        this.spNormalAvatar.spriteFrame = avatar;
        // this.spNormalAvatarFrame.spriteFrame = avatarFrame;
        getAvatarFrame(p.avatarFrame, this.spNormalAvatarFrame)
        this.lblNormalLoc.string = loc;
        this.lblRedBagNum.string = this.game.REDBAG_COUNT.toString();
        this.lblRedBagGold.string = rb;
        if (pos === 0) {
            this.spResultAvatar.spriteFrame = avatar;
            // this.spResultAvatarFrame.spriteFrame = avatarFrame;
            getAvatarFrame(p.avatarFrame, this.spResultAvatarFrame)
            this.lblResultLoc.string = loc;
            // this.goodBg.active = true;
            // this.lblRedBagGold.node.parent.parent.active = true;
        } else {
            // this.goodBg.active = false;
            // this.lblRedBagGold.node.parent.parent.active = false;
        }
        this.lblResultBoomNo.node.parent.active = false;
        this.ndResult.active = false;

        this.ndNormal.active = true;
        this.lblRedBagGold.node.parent.active = true;
    }

    /**
     * 展示自己的红包
     * @param p
     */
    showMyRedBag(p: gameIface.brPlayerInfo, pos: number) {
        if (p.pos === this.game.plyMgr.me.pos) {
            this.ndNormal.getComponent(cc.Sprite).spriteFrame = this.sfRedBagBgs[3];
            this.kuang.active = true;
            // cc.log("<<<<<<<<<<<<<  ", p.pos, "  ", this.game.plyMgr.me.pos)
            if (pos === 0) {
                this.redHb2.active = false
                this.hB2.active = true
                //this.spMyResultPanel.spriteFrame = this.sfRedBagBgs[5];
            }
        } else {
            this.ndNormal.getComponent(cc.Sprite).spriteFrame = this.sfRedBagBgs[2];
            // this.spMyResultPanel.spriteFrame = this.sfRedBagBgs[4];
            this.redHb2.active = true
            this.hB2.active = false
        }
    }

    /**
     * 展示玩家自己抢到的金币
     * @param grabMoney
     */
    showMyGrabedMoney(grabMoney: string) {
        this.ndNormal.active = false;
        this.ndResult.active = true;
        // this.goodBg.active = false;
        // this.lblRedBagGold.node.parent.parent.active = false;
        this.bliss.active = true;
        this.kuang.active = false;
        // this.unschedule(this.blissAime);
        // this.schedule(this.blissAime, 0.8);
        // this.spMyResultPanel.spriteFrame = this.sfRedBagBgs[5];
        this.ndResult.zIndex = 3;
        this.spResultPanel.spriteFrame = this.sfRedBagBgs[0];
        if (+grabMoney >= 0) {
            this.lblMyGrabedMoney.string = "+" + grabMoney;
            this.lblMyGrabedMoney.font = this.ftResult[0];
        } else {
            this.lblMyGrabedMoney.string = grabMoney;
            this.lblMyGrabedMoney.font = this.ftResult[1];
        }
        this.lblMyGrabedMoney.node.parent.active = true;
    }

    /**
     * 展示庄家输赢
     * @param chgMoney  庄家输赢
     * @param isMyResult 玩家自己是否有抢
     */
    showBankerChgMoney(chgMoney: string, isMyResult: boolean, pos?: number) {
        this.ndNormal.active = false;
        this.ndResult.active = true;
        this.ndResult.zIndex = 3;
        this.kuang.active = false;
        this.lblResultChgMoney.node.parent.opacity = 0;
        this.lblResultChgMoney.node.active = true;
        // this.goodBg.active = false;
        // this.lblRedBagGold.node.parent.parent.active = false;
        if (!isMyResult) {
            this.lblMyGrabedMoney.node.parent.active = false;
            this.spResultPanel.spriteFrame = this.sfRedBagBgs[1];
        }
        if (+chgMoney >= 0) {
            chgMoney = "+" + chgMoney;
            this.lblResultChgMoney.font = this.ftResult[0];
        } else {
            this.lblResultChgMoney.font = this.ftResult[1];
        }
        this.lblResultChgMoney.string = chgMoney;
        // this.lblResultChgMoney.node.parent.runAction(cc.fadeIn(0.4));
        cc.tween(this.lblResultChgMoney.node.parent).to(0.4, { opacity: 255 }).start();
    }

    /**
     * 切换动画
     */
    switchAni() {
        this.actionIsEnd = false;
        this.ndGrabAni.getComponent(cc.Animation).stop();

        let a1 = cc.sequence(
            cc.callFunc(() => {
                this.winEffectCtr(false);
            }),
            cc.spawn(
                cc.scaleBy(0.5, 2),
                cc.fadeOut(0.5),
            ),
            cc.callFunc(() => {
                this.actionIsEnd = true;
                this.ndResult.active = false;
                this.ndNormal.active = true;
                this.node.setPosition(this.redBagPos[2]);
                this.node.scale = this.redBagScale[2];
                this.node.opacity = this.redBagOpacity[2];
                this.node.zIndex = 0;
                this.lblResultChgMoney.node.parent.opacity = 0;
                this.setOrder(2);
                this.winEffectCtr(true);    // 解决引擎自身特效残留的bug
                this.winEffectCtr(false);
            }),
        );

        let a2 = cc.sequence(
            cc.spawn(
                cc.scaleTo(0.5, this.redBagScale[0]),
                cc.fadeIn(0.5),
                cc.moveTo(0.5, this.redBagPos[0]),
            ),
            cc.callFunc(() => {
                this.actionIsEnd = true;
                this.node.setPosition(this.redBagPos[0]);
                //this.goodBg.active = true;
                //this.lblRedBagGold.node.parent.parent.active = true;
                this.node.zIndex = 2;
                this.grabParticialCtr(false);
                this.setOrder(0);
            }),
        );

        let a3 = cc.sequence(
            cc.spawn(
                cc.scaleTo(0.5, this.redBagScale[1]),
                cc.fadeTo(0.5, this.redBagOpacity[1]),
                cc.moveTo(0.5, this.redBagPos[1]),
            ),
            cc.callFunc(() => {
                this.actionIsEnd = true;
                this.node.setPosition(this.redBagPos[1]);
                this.node.zIndex = 1;
                this.setOrder(1);
            }),
        );
        if (this.order === 0) {
            // this.ndGrabAni.runAction(cc.fadeOut(0.4));
            cc.tween(this.ndGrabAni).to(0.4, { opacity: 255 }).start();
            //this.node.runAction(a1);
            cc.tween(this.node).then(a1).start();
            this.ndNormal.getComponent(cc.Sprite).spriteFrame = this.sfRedBagBgs[2];
        } else if (this.order === 1) {
            // this.ndGrabAni.runAction(cc.sequence(
            //     cc.fadeIn(2),
            //     cc.callFunc(() => {
            //         this.grabParticialCtr(true);
            //     }),
            // ));
            cc.tween(this.ndGrabAni).to(2, { opacity: 255 })
                .call(() => {
                    this.grabParticialCtr(true);
                }).start();
            // this.node.runAction(a2);
            cc.tween(this.node).then(a2).start();
        } else {
            // this.node.runAction(a3);
            cc.tween(this.node).then(a3).start();
        }
    }

    /**
     * 动态设置红包数量
     */
    setRedBagNum(num: number) {
        this.lblRedBagNum.string = num.toString();
    }

    /**
     * 抢特效控制
     * @param active
     */
    private grabParticialCtr(active: boolean) {
        let par1 = this.ndGrabAni.getChildByName("particle");
        let parChild = par1.getComponentsInChildren(cc.ParticleSystem);
        parChild.forEach((p) => {
            if (active) {
                p.resetSystem();
            } else {
                p.stopSystem();
            }
        });

        let par2 = this.ndGrabAni.getChildByName("Quan").getComponent(cc.ParticleSystem);
        if (active) {
            par2.resetSystem();
        } else {
            par2.stopSystem();
        }
    }

    /**
     * 金币喷射特效动画控制
     */
    winEffectCtr(active: boolean) {
        let star = this.ndResult.getChildByName("Star");
        let starEff = star.getComponent(cc.ParticleSystem);
        let gold = this.ndResult.getChildByName("Gold");
        let goldEff = gold.getComponent(cc.ParticleSystem);
        let lights = this.ndResult.getChildByName("lights");
        // let ani = this.ndResult.getComponent(cc.Animation);
        lights.active = active;
        if (active) {
            starEff.resetSystem();
            goldEff.resetSystem();
            // ani.play();
        } else {
            starEff.stopSystem();
            goldEff.stopSystem();
            // ani.stop();
        }
    }


    /**
     * 福字动画
     */
    public blissAime() {
        // this.bliss.runAction(cc.sequence(
        //     cc.scaleTo(0.1, 1.2, 1.2),
        //     cc.scaleTo(0.5, 0.7, 0.7),
        // ));
        cc.tween(this.bliss)
            .to(0.1, { scale: 1.2 })
            .to(0.5, { scale: 0.7 })
            .start();
    }
}
