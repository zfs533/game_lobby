import Player from "../g-share/player";
import BYGame from './byGame';
import BYFish from "./byFish";
import User from "../common/user";
import Game from "../g-share/game";
import { isIphoneX } from "../common/util";
import BYFishRoute from "./byFishRoute";
import { getQuadrantDegree, hideDotLine, createDotLine, drawDotLine, isFestivalGuns } from "./byUtil"
import { showTip } from "../common/ui";

const { ccclass, property } = cc._decorator;
let Decimal = window.Decimal;

@ccclass
export default class BYPlayer extends Player {
    game: BYGame;

    @property(cc.Node)
    gun: cc.Node = undefined;

    @property(cc.Node)
    lizi: cc.Node = undefined;

    @property(cc.Node)
    emptySeat: cc.Node = undefined;

    @property(cc.Sprite)
    gunsp: cc.Sprite = undefined;

    @property(cc.Sprite)
    flame: cc.Sprite = undefined;

    @property(cc.Node)
    beishuLabel: cc.Node = undefined;
    @property(cc.Node)
    beishuSp: cc.Node = undefined;

    @property(cc.Node)
    pochan: cc.Node = undefined;

    @property(cc.Node)
    paotai_xuanzhuan: cc.Node = undefined;

    @property(cc.Node)
    pot: cc.Node = undefined;
    @property(cc.Node)
    aimCircle: cc.Node = undefined;

    @property(cc.Node)
    gunbg: cc.Node = undefined;

    @property(cc.Node)
    roulette: cc.Node = undefined;

    @property(cc.Node)
    scaleGun: cc.Node = undefined;

    public myHuanPaoBt: cc.Node;
    myGunLevel: number = 1;

    gunSpType: number = -1;  // 子弹精灵的类型
    isLock: number = 0;  // 锁定
    isSmart: number = 0;//智慧捕鱼
    isAuto: number = 0;  // 自动
    gunPos: cc.Vec2 = cc.v2(0, 0);  // 炮台位置
    lockFishId: number = 0;  // 锁定鱼的ID
    lockFishFormationId: number = -1;
    lockFish: BYFish = undefined;
    autoAngle: number = 0;
    linPotArr: cc.Node[] = [];


    bulletNode: cc.Node = undefined;
    fishNetNode: cc.Node = undefined;

    private rouletteName: cc.Node = undefined;

    private rouletteCoin: cc.Node = undefined;
    private rouletteBg: cc.Node = undefined;
    private gunBg1: cc.Node = undefined;  // 锁定时 炮台下 转动的bg
    private gunBg2: cc.Node = undefined;  // 锁定时 炮台下 转动的bg
    private originalGunSpPos: cc.Vec2 = undefined;

    public bulletCount: number = 0; // 在屏幕中的子弹数量
    public spineGuan: cc.Node = undefined;
    public spineGuanAaim: sp.Skeleton = undefined;
    init(game: Game) {
        super.init(game);
        // if (isIphoneX() && this.seat < 2) {
        //     if (this.beishuSp) this.beishuSp.y = -12;
        //     if (this.beishuLabel) this.beishuLabel.y = -6;
        // }
        let p = this.gunsp.node.convertToWorldSpaceAR(cc.Vec2.ZERO)
        let p2 = this.node.parent.convertToNodeSpaceAR(p)
        this.gunPos = p2;
        createDotLine(this.pot, this.linPotArr);
        this.originalGunSpPos = this.gunsp.node.getPosition();
        this.flame.node.active = false;
        this.gunbg.active = false;
        this.initRoulette();
    }

    initRoulette() {
        this.rouletteName = this.roulette.getChildByName("name");
        this.rouletteCoin = this.roulette.getChildByName("coin");
        this.rouletteBg = this.roulette.getChildByName("bg");
    }
    hideLockDotLine() {
        this.aimCircle.active = false;
        hideDotLine(this.linPotArr);
    }

    changeState() { }

    get isMe() {
        return this.seat === this.game.plyMgr.mySeat;
    }

    /**
     * 展示炮台的加减按钮 和 屏蔽按钮
     */
    showMyGunBt() {
        let jian = this.gun.getChildByName("jian");
        let jia = this.gun.getChildByName("jia");
        let button = this.gun.getChildByName("button");
        this.myHuanPaoBt = this.gun.getChildByName("huanpao");
        this.myHuanPaoBt.active = true;
        jian.active = true;
        jia.active = true;
        button.active = true;
    }

    /**
     * 显示鱼名字的轮盘
     * @param fishType
     * @param coin
     */
    public showRoulette(fishType: number, coin: string) {
        let name = BYFishRoute.fishName[fishType];
        if (this.roulette.active) {
            cc.director.getActionManager().removeAllActionsFromTarget(this.rouletteBg, true);
            cc.director.getActionManager().removeAllActionsFromTarget(this.rouletteCoin, true);
        }
        this.roulette.active = true;
        this.rouletteName.getComponent(cc.Label).string = name;
        let coinnum = +coin;
        this.rouletteCoin.getComponent(cc.Label).string = coinnum.toFixed(2).toString();
        this.rouletteCoin.angle = 0;
        let callback = cc.callFunc(this.hideRoulette, this);
        let roAc = cc.sequence(cc.rotateBy(0.25, -20), cc.rotateBy(0.5, 40), cc.rotateBy(0.5, -40), cc.rotateBy(0.25, 20));
        // this.rouletteCoin.runAction(roAc);
        cc.tween(this.rouletteCoin).then(roAc).start();
        // this.rouletteBg.runAction(cc.sequence(cc.rotateBy(2, 1020), callback));
        cc.tween(this.rouletteBg).then(cc.sequence(cc.rotateBy(2, 1020), callback)).start();
    }
    private hideRoulette() {
        this.roulette.active = false;
    }

    aimCircleRotate() {
        this.aimCircle.active = true;
        // this.aimCircle.runAction(cc.rotateBy(8, 360).repeatForever());
        cc.tween(this.aimCircle)
            .by(8, { angle: -360 })
            .repeatForever()
            .start();

        this.aimCircle.active = false;
    }

    /**
     * 在resArr获取对应炮台的index
     */
    getGunSpineIndex(type: number): number {
        let index;
        switch (type) {
            case 170:
                index = 12
                break;
            case 174:
                index = 13
                break;
            case 178:
                index = 14
                break;
            case 186:
                index = 15
                break;
            case 128:
                index = 16
                break;
            case 182:
                index = 17
                break;
            case 146:
                index = 18
                break;
            case 150:
                index = 19
                break;
            case 154:
                index = 20
                break;
            case 158:
                index = 21
                break;
            case 162:
                index = 22
                break;
            case 166:
                index = 23
                break;
            default:
                break;
        }
        return index

    }




    changeGunSp(type: number) {
        //cc.log("------- this.type", type)
        if (this.gunSpType === type || this.gunSpType === this.getGunSpineIndex(type)) {
            return;
        }
        this.gunSpType = type;
        if (type > 12 && isFestivalGuns(type)) {
            this.gunSpType = this.getGunSpineIndex(type);
            //cc.log("------- this.gunSpType", this.getGunSpineIndex(type))
        }
        let resnode: cc.Node = this.game.getGunRes(this.gunSpType);
        //cc.log("------- this.resnode", resnode)
        let gun = resnode.getChildByName("gun");
        let flame = resnode.getChildByName("flame");
        let bullet = resnode.getChildByName("bullet");
        this.bulletNode = bullet;
        let net = resnode.getChildByName("net");
        this.fishNetNode = net;
        let gunbg = resnode.getChildByName("gunbg");
        if (gunbg) {
            let gunbgres = cc.instantiate(gunbg);
            this.gunBg1 = gunbgres.getChildByName("bg1");
            this.gunBg2 = gunbgres.getChildByName("bg2");
            gunbgres.position = cc.v3(0, 0);
            this.gunbg.addChild(gunbgres);
        } else {
            if (this.gunbg) {
                this.gunbg.removeAllChildren();
            }
            this.gunBg1 = undefined;
            this.gunBg2 = undefined;
        }
        this.spineGuan = undefined;
        this.spineGuanAaim = undefined;
        for (let index = 0; index < this.gunsp.node.childrenCount; index++) {
            if (this.gunsp.node.children[index].name !== "firesp") {
                this.gunsp.node.children[index].active = false;
            }
        }
        if (isFestivalGuns(type)) {
            let gun1 = resnode.getChildByName(type.toString())
            this.spineGuan = this.gunsp.node.getChildByName(type.toString())
            if (!this.spineGuan) {
                this.spineGuan = cc.instantiate(gun1)
                this.gunsp.node.addChild(this.spineGuan);
                this.spineGuan.position = cc.v3(0, 18);
                this.spineGuan.scale = 1
                this.scheduleOnce(function () {
                    this.spineGuanAaim.paused = true;
                    this.spineGuanAaim.setToSetupPose()
                }, 0.2)

            }
            this.spineGuanAaim = this.spineGuan.getComponent(sp.Skeleton);
            if (!this.spineGuanAaim) this.spineGuanAaim = this.spineGuan.getChildByName("pao").getComponent(sp.Skeleton)
            this.spineGuan.active = true
            this.gunsp.enabled = false
        } else {
            this.gunsp.enabled = true;
            this.gunsp.spriteFrame = gun.getComponent(cc.Sprite).spriteFrame;
        }
        this.flame.spriteFrame = flame.getComponent(cc.Sprite).spriteFrame;
    }

    gunShake(point: cc.Vec2) {
        this.gunsp.node.stopAllActions();
        this.gunsp.node.setPosition(this.originalGunSpPos);
        // this.gunsp.node.runAction(cc.sequence(cc.moveBy(0.1, cc.v2(-point.x / 7, -point.y / 7)), cc.moveBy(0.15, cc.v2(point.x / 7, point.y / 7))));
        cc.tween(this.gunsp.node)
            .by(0.1, { position: cc.v2(-point.x / 7, -point.y / 7) })
            .by(0.15, { position: cc.v2(point.x / 7, point.y / 7) })
            .start()

    }

    gunSpineAmin() {
        if (this.spineGuanAaim) {
            cc.director.getActionManager().removeAllActionsFromTarget(this.spineGuan, true);
            this.spineGuanAaim.paused = false;
            let el = this;
            // let finished = cc.callFunc(function () {
            //     el.spineGuanAaim.paused = true
            //     el.spineGuanAaim.setToSetupPose()
            // });
            // this.spineGuan.runAction(cc.sequence(cc.delayTime(0.25), finished));
            cc.tween(this.spineGuan)
                .delay(0.25)
                .call(
                    () => {
                        el.spineGuanAaim.paused = true
                        el.spineGuanAaim.setToSetupPose()
                    }
                ).start();
        }
    }
    showFlame() {
        this.flame.node.active = true;
        cc.director.getActionManager().removeAllActionsFromTarget(this.flame.node, true);
        // let callback = cc.callFunc((flame: cc.Node) => { flame.active = false; });
        // this.flame.node.runAction(cc.sequence(cc.delayTime(0.05), callback));
        cc.tween(this.flame.node)
            .delay(0.05)
            .call((flame: cc.Node) => { flame.active = false; })
            .start()
    }

    changeGunRotation(pos: cc.Vec2) {
        let deg = getQuadrantDegree(this.gunPos, pos);
        let xrotation = 0;
        if (this.seat > 1) {
            xrotation = deg - 90;
        } else {
            xrotation = deg + 90;
        }
        this.gunsp.node.angle = -xrotation;
    }

    // 展示或隐藏本地位置的炮台
    showOrHideGun(toshow: boolean) {
        // cc.log('showOrHideGun seat=', this.seat)
        this.gun.active = toshow;
        this.lizi.active = toshow;
        this.emptySeat.active = !toshow;
    }
    // 展示自己炮台的 加减按钮
    chgGunGardeAinmation() {
        if (!this.isMe) {
            return;
        }
        this.paotai_xuanzhuan.active = true;
        this.paotai_xuanzhuan.getComponent(cc.Animation).play();
        // this.gunsp.node.runAction(cc.sequence(cc.scaleTo(0.15, 0.7), cc.scaleTo(0.2, 1)));
        // this.scaleGun.runAction(cc.sequence(cc.scaleTo(0.15, 0.7), cc.scaleTo(0.2, 1)));
        cc.tween(this.scaleGun)
            .to(0.15, { scale: 0.7 })
            .to(0.2, { scale: 1 })
            .start()

        this.game.byAudio.playChangeRatioSound();
    }

    showWaitJoin() {
        this.emptySeat.active = true;
        // this.emptySeat.runAction(cc.sequence(cc.fadeOut(3), cc.fadeIn(2), cc.fadeOut(3), cc.fadeIn(2)));
        cc.tween(this.emptySeat)
            .to(3, { opacity: 0 })
            .to(2, { opacity: 255 })
            .to(3, { opacity: 0 })
            .to(2, { opacity: 255 })
            .start();

        this.scheduleOnce(() => {
            this.emptySeat.active = false;
        }, 130);
    }

    leaveAni() {
        // cc.log('leave ani', this.seat)
        this.gun.active = false;
    }
    enterAni() {
        // cc.warn('enter ani', this.seat)
        this.gun.active = true;
        this.gunsp.node.angle = 0;
    }
    leaveHideOthers() {
        this.resettingGunInfo();
        this.emptySeat.active = true;
        this.lizi.active = false;
        this.emptySeat.opacity = 255;
        // this.emptySeat.runAction(cc.sequence(cc.fadeOut(3), cc.fadeIn(2), cc.fadeOut(3), cc.fadeIn(2)));
        cc.tween(this.emptySeat)
            .to(3, { opacity: 0 })
            .to(2, { opacity: 255 })
            .to(3, { opacity: 0 })
            .to(2, { opacity: 255 })
            .start();
        this.scheduleOnce(() => {
            this.emptySeat.active = false;
        }, 130);
    }

    // 加炮台等级按钮的回调
    onClickIncreaseGunLevel(event: cc.Event) {
        if (!this.isMe) {
            return;
        }
        if (this.game.roomMaxRatio === 1) {
            showTip("该渔场无法切换倍数哦～快去高级场吧");
            return;
        }

        let tmpLevel = this.myGunLevel + 1;
        if (tmpLevel > this.game.roomMaxRatio) {
            tmpLevel = 1;
        }
        this.game.msg.GameBYHandlerBulletLevel(tmpLevel);
        this.chgGunLevel(tmpLevel);

    }

    // 减炮台等级按钮的回调
    onClickReduceGunLevel(event: cc.Event, customData: number) {
        if (customData != this.game.plyMgr.mySeat) {
            return;
        }
        if (this.game.roomMaxRatio === 1) {
            showTip("该渔场无法切换倍数哦～快去高级场吧");
            return;
        }
        let tmpLevel = this.myGunLevel - 1;
        if (tmpLevel < 1) {
            tmpLevel = this.game.roomMaxRatio;
        }
        this.game.msg.GameBYHandlerBulletLevel(tmpLevel);
        this.chgGunLevel(tmpLevel);
    }

    changeLevelLable(grade: number) {
        if (!this.game || !this.game.baseScore) {
            return;
        }
        this.beishuLabel.getComponent(cc.Label).string = new Decimal(grade).mul(this.game.baseScore).toString()
    }

    // 改变该gunid的炮台的倍数
    chgGunLevel(grade: number) {
        if (grade == undefined) {
            return;
        }
        this.changeLevelLable(grade);
        this.myGunLevel = grade;
        if (this.isMe) {
            this.chgGunGardeAinmation();
        }
    }

    // 改变game 中储存的 炮台类型
    changeBulletType(grade: number) {
        this.gunSpType = grade - 1;
        let isshow = true;
        if (this.isLock == 0) {
            isshow = false;
        }
        this.gunBgRotate(isshow);
    }

    public gunBgRotate(isshow: boolean) {

        if (isshow && this.gunBg1 && this.gunBg2) {
            this.gunbg.active = true;
            // this.gunBg1.runAction(cc.rotateBy(2, 360).repeatForever());
            cc.tween(this.gunBg1)
                .by(2, { angle: -360 })
                .repeatForever()
                .start();
            // this.gunBg2.runAction(cc.rotateBy(2, -360).repeatForever());
            cc.tween(this.gunBg2)
                .by(2, { angle: 360 })
                .repeatForever()
                .start();
        } else {
            if (this.gunBg1 && this.gunBg2) {
                this.gunBg1.stopAllActions();
                this.gunBg2.stopAllActions();
            }
            if (this.gunbg) {
                this.gunbg.active = false;
            }
        }
    }

    // 改变玩家的 jinbi信息
    changeCoinLabelById(coin: number) {
        this.money = coin.toString();
        if (this.isMe) {
            User.money = coin.toString();
        }
        if (coin < this.game.baseScore && !this.pochan.active) {
            this.pochan.active = true;
        } else if (coin >= this.game.baseScore && this.pochan.active) {
            this.pochan.active = false;
        }
        this.lMoney.getComponent(cc.Label).string = coin.toFixed(2);
        if (coin < 0) {
            this.lMoney.getComponent(cc.Label).string = "0";
        }
    }

    incCoin(incCoin: string) {
        let str = this.lMoney.getComponent(cc.Label).string
        let coin = new Decimal(str).add(incCoin).toNumber()
        this.changeCoinLabelById(coin)
    }

    decCoin(decCoin: string) {
        let str = this.lMoney.getComponent(cc.Label).string
        let coin = new Decimal(decCoin).mul(this.game.baseScore).sub(str).neg().toNumber()
        this.changeCoinLabelById(coin)
    }

    resettingGunInfo() {

        this.isLock = 0;
        this.lockFishFormationId = -1;
        this.lockFishId = -1;
        this.lockFish = undefined;
        this.isAuto = 0;
        this.changeLevelLable(1);
        this.changeBulletType(1);
        this.aimCircle.active = false;
        this.hideLockDotLine();

    }
    update() {
        this.drawLockLine();
    }

    drawLockLine() {
        // 如果是锁定状态
        if (this.isLock === 1) {
            if (this.lockFish) {
                let fish = this.lockFish.node;
                if (!this.lockFish.liveInCurScene()) {
                    this.lockFish = undefined;
                    this.hideLockDotLine();
                    return;
                }
                let tmpPos = this.game.toWroldPos(fish.getPosition(), fish.parent.getPosition());
                let x = tmpPos.x;
                let y = tmpPos.y;
                this.aimCircle.position = cc.v3(x, y);
                this.aimCircle.active = true;
                drawDotLine(this.gunPos, cc.v2(x, y), this.linPotArr);
            } else {
                let fishId = this.lockFishId;
                let massId = this.lockFishFormationId;
                let fish = this.game.fishMgr.getFishById(fishId, massId);
                if (fish == undefined) {
                    this.hideLockDotLine();
                } else {
                    this.lockFish = fish.getComponent(BYFish);
                }
            }
        } else {
            this.hideLockDotLine();
        }
    }

}
