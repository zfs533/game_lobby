import BYFish from "./byFish"
import BYFishMgr from "./byFishMgr"
import BYFishnetMgr from "./byFishnetMgr"
import BYBulletMgr from "./byBulletMgr"
import BYMsg from "./byMsg"
import BYPlayerMgr from "./byPlayerMgr"
import BYAnimMgr from "./byAnimMgr"
import BYAudio from "./byAudio"
import g from "../g"
import Game from "../g-share/game"
import BYIdleCheck from "./byIdleCheck"
import { QuitShow, GameId } from "../common/enum"
import BYGunHandbook from "./byGunHandbook"
import ScrollViewBox from "../lobby/scrollViewBox"
import GameHelp from "../g-share/gameHelp"
import net from "../common/net"
import { getQuadrantDegree, isFestivalGuns, isRebateGunArr } from "./byUtil"
import { showTip, showConfirm } from "../common/ui"
import { getCommonRatio } from "../common/util";
import { WeeklyRebateModel } from "../lobby/weeklyRebate/weeklyRebateModel"
import ByFishSmart, { optionType } from "./byFishSmart"
import user from "../common/user"
const { ccclass, property } = cc._decorator

@ccclass
export default class BYGame extends Game {

    @property(cc.Prefab)
    fishSmart: cc.Prefab = undefined;

    @property({ type: BYAudio, override: true })
    adoMgr: BYAudio = undefined;

    @property({ type: BYPlayerMgr, override: true })
    plyMgr: BYPlayerMgr = undefined;

    @property(cc.Node)
    nodeBg: cc.Node = undefined;

    @property(cc.Node)
    bulletLayer: cc.Node = undefined;

    @property(cc.Node)
    gunLayer: cc.Node = undefined;

    @property(cc.Node)
    dieLayer: cc.Node = undefined;

    @property(cc.Node)
    fishLayer: cc.Node = undefined;

    @property(cc.Node)
    fishnetLayer: cc.Node = undefined;

    @property(cc.Node)
    effectsLayer: cc.Node = undefined;

    @property(cc.Node)
    uiLayer: cc.Node = undefined;

    @property(cc.Node)
    HLAutoIcon: cc.Node = undefined;  // 高亮的自动图标

    @property(cc.Node)
    HLLockIcon: cc.Node = undefined;

    @property(cc.Node)
    smartButton: cc.Node = undefined;

    @property(cc.Node)
    STLockIcon: cc.Node = undefined;

    @property(cc.Node)
    pot: cc.Node = undefined;

    @property(cc.Node)
    animationAim: cc.Node = undefined;

    @property(cc.Node)
    lockNotice: cc.Node = undefined;

    @property(cc.Node)
    enumLayer: cc.Node = undefined;

    @property(cc.Prefab)
    setting: cc.Prefab = undefined;

    @property(cc.Prefab)
    preFishHandbook: cc.Prefab = undefined;

    @property(cc.Prefab)
    preGunHandbook: cc.Prefab = undefined;

    @property(cc.Prefab)
    preHelp: cc.Prefab = undefined;

    @property(cc.SpriteFrame)
    usingBg: cc.SpriteFrame = undefined;

    @property([cc.Prefab])
    resArr: cc.Prefab[] = [];

    @property(cc.Node)
    nodeSeabed: cc.Node = undefined;

    @property([cc.SpriteFrame])//海底背景图
    seabeds: cc.SpriteFrame[] = []

    public gunCfg: { coin: string, level: number }[] = undefined;
    public amount: string;
    public halfSW: number
    public halfSH: number
    public static STEP_TIME = 1 / 6
    public myMaxGunSp: number = undefined;
    public fishMgr: BYFishMgr = undefined;
    public fishnetMgr: BYFishnetMgr = undefined;
    public bulletMgr: BYBulletMgr = undefined;
    public curTouchPos: cc.Vec2 = undefined;
    public canStart: boolean = false; // 是否可以开始发子弹 （处理gameinfo）
    public roomMaxRatio: number = 1;
    public msg: BYMsg = undefined;
    public byAnimMgr: BYAnimMgr = undefined;
    public byAudio: BYAudio = undefined;
    public clickFirstLockFish = false; // 自己是否 已经点击了 第一个锁定的鱼
    public sendLockFishs: cc.Node[] = [];
    public moenyNotLayerIsShow: boolean = false;
    private byIdleCheck: BYIdleCheck = undefined;
    public tipCanShow: boolean = true;  // 子弹上限的提示 是可以显示
    private byFishHandbook: ScrollViewBox = undefined;
    public byGunHandbook: BYGunHandbook = undefined;
    private gameHelp: GameHelp = undefined
    public endGame: boolean = false;
    private gunResNodeArr: cc.Node[] = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    /**
  * 自己拥有的节日炮台皮肤
  */
    public myFestivalGuns: number[] = [];

    gameName = GameId.BY;
    setGameEnd() { }
    setRoomInfo() { }
    setStarted() { }
    refreshRoomInfo() { }
    hideTicker() { }
    setWaitPrepare() { }
    setWaitStart() { }
    showTicker() { }
    updateUI() { }
    initRound() {
        if (this.plyMgr.seatOffset > 1) {
            this.plyMgr.isRotate = true;
        }
    }
    onLoad() {
        super.onLoad();
        let winSize = cc.winSize;
        this.halfSW = winSize.width / 2
        this.halfSH = winSize.height / 2
        let ratio = getCommonRatio();
        if (ratio - 1 > 0.15) {
            this.uiLayer.setContentSize(1136 * ratio - 132, 640);   // menu空出黑边
        }
        this.smartButton.active = user.vipLevel >= 3 ? true : false;
    }
    start() {
        super.start();
        let yid = +this.yid > 4 ? 3 : +this.yid - 1;
        this.nodeSeabed.getComponent(cc.Sprite).spriteFrame = this.seabeds[yid];
    }

    dealRoomData(data: ps.GameRoomHandlerGetRoomData): void {
        // cc.log('by deal room', data)
        if (data.code === 200) {
            // this.plyMgr.isRotate = data.pos > 1;
            this.plyMgr.handleMyInfo(data.pos);
            this.plyMgr.handleUserInfo(data.users);
            // this.byIdleCheck.kickTime = data.startKickTime / 1000;
            if (data.config) {
                let configx = JSON.parse(data.config);
                // cc.log('configx============', configx)
                //this.gunCfg = configx.bulletStyleDefs
                this.roomMaxRatio = configx.ratio;
            }
        } else {
            cc.log("加载房间信息失败");
        }
    }

    initGame() {
        cc.director.getCollisionManager().enabled = true;
        this.msg = new BYMsg(this);
        this.msg.init();
        this.fishMgr = this.fishLayer.getComponent(BYFishMgr);
        this.fishnetMgr = this.fishnetLayer.getComponent(BYFishnetMgr);
        this.bulletMgr = this.bulletLayer.getComponent(BYBulletMgr);
        this.byAudio = this.node.getChildByName("audio").getComponent(BYAudio);
        this.byAnimMgr = this.effectsLayer.getComponent(BYAnimMgr);
        this.byAnimMgr.initGame(this);
        this.byIdleCheck = this.node.getComponent(BYIdleCheck);

        this.sendLockFishs = [];
        this.schedule(this.startCheck, BYGame.STEP_TIME);
        // this.schedule(this.starCheckLock, BYGame.STEP_TIME);
        this.schedule(this.checkLockFishs, 1);

        this.byAudio.playNormalBgMusic();
        this.plyMgr.playerAimCircleRotate();
    }

    // 初始化 子弹方向
    initMyTouchPos() {
        this.curTouchPos = this.touch2GamePos(cc.v2(this.plyMgr.me.gunPos.x + this.halfSW, this.halfSH));
    }

    /**
     * 开始检测锁定和自动
     */
    public startCheck() {
        for (let i = 0; i < this.plyMgr.playerCount; i++) {
            let p = this.plyMgr.getPlyBySeat(i);
            if (!p) continue;
            if (p.isAuto == 1 && (p.isLock != 1 || (p.isLock == 1 && p.lockFish == undefined))) {
                if (p.isMe) {
                    this.autoShootCallback();
                } else {
                    this.bulletMgr.shoot(i, cc.v2(0, 0), p.autoAngle);
                }
            }
            if (p.isLock == 1) {
                if (p.isMe) {
                    this.lockFishCallback();
                } else {
                    let lockFish = p.lockFish;
                    if (lockFish == undefined || !lockFish.liveInCurScene()) {
                        continue;
                    }
                    this.bulletMgr.changeBulletMove(p.seat);
                    this.bulletMgr.shoot(p.seat, p.aimCircle.getPosition(), 0);
                }
            }
            if (p.isSmart == 1) {
                if (p.isMe) {
                    this.smartFishCallback();
                }
            }
        }
    }

    // public starCheckLock() {
    //     for (let i = 0; i < this.plyMgr.playerCount; i++) {
    //         let p = this.plyMgr.getPlyBySeat(i);
    //         if (!p) {
    //             continue;
    //         }
    //         if (p.isLock == 1 && p.seat != this.plyMgr.mySeat) {
    //             let lockFish = p.lockFish;
    //             if (lockFish == undefined || !lockFish.liveInCurScene()) {
    //                 continue;
    //             }
    //             this.bulletMgr.changeBulletMove(p.seat);
    //             this.bulletMgr.shoot(p.seat, p.aimCircle.position, 0);
    //         }
    //     }
    // }

    public FoundLockFishs() {
        let fishArr = [];
        // 在普通鱼种找 有没有符合要求的
        for (let i = 0; i < this.fishLayer.children.length; i++) {
            let fishNode = this.fishLayer.children[i];
            let fish = fishNode.getComponent(BYFish);

            if (fish.liveInCurScene()) {
                fishArr.push(fishNode);
            }
        }
        if (fishArr != undefined && fishArr != []) {
            fishArr.sort((a, b) => {
                if (b.getComponent(BYFish).typeId == BYFishMgr.bossFishType) {
                    return 100;
                } else if (a.getComponent(BYFish).typeId == BYFishMgr.bossFishType) {
                    return -100;
                } else {
                    return b.getComponent(BYFish).typeId - a.getComponent(BYFish).typeId;
                }
            });

            for (let i = 0; i < fishArr.length; i++) {
                if (this.sendLockFishs == undefined || this.sendLockFishs == [] || this.sendLockFishs.length < 3) {
                    if (this.sendLockFishs == undefined) {
                        this.sendLockFishs = [];
                        this.sendLockFishs.push(fishArr[i]);
                        continue;
                    }
                    let haved = false;
                    for (let j = 0; j < this.sendLockFishs.length; j++) {
                        if (this.sendLockFishs[j] == fishArr[i]) {
                            haved = true;
                        }
                    }
                    if (!haved) {
                        this.sendLockFishs.push(fishArr[i]);
                    }
                }
            }
        }
        if (this.msg && this.sendLockFishs) {
            this.msg.gameBYHandlerrobotFishInfo(this.sendLockFishs);
        }
    }


    public checkLockFishs() {
        let haveChange = false;
        if (this.sendLockFishs != undefined) {
            for (let i = 0; i < this.sendLockFishs.length; i++) {
                let fishNode = this.sendLockFishs[i];
                if (!fishNode.isValid) {
                    haveChange = true;
                    this.sendLockFishs.splice(i, 1);
                    i--;
                    continue;
                }
                let fish = fishNode.getComponent(BYFish);
                let isCan = fish.liveInCurScene();
                if (!isCan) {
                    haveChange = true;
                    this.sendLockFishs.splice(i, 1);
                    i--;
                }
            }
        }
        if (haveChange || this.sendLockFishs == undefined || this.sendLockFishs == [] || this.sendLockFishs.length === 0) {
            this.FoundLockFishs();
        }
    }



    // 锁定按钮
    private OnClickLockShootBullet() {
        this.cancelFishSmart();
        this.byAudio.playButtonClickSound();
        this.hideChangeGunBtn();
        if (this.plyMgr.me.isLock) {
            this.closeLockFish();
        } else {
            this.openLockFish();
        }
    }

    public openClickFirstLockFish() {
        this.animationAim.position = cc.v3(0, 0);
        this.animationAim.scale = 15;
        this.animationAim.opacity = 255;
        this.animationAim.active = true;
        let lockfish1 = this.plyMgr.me.lockFish.node;
        let tmpPos = this.toWroldPos(lockfish1.getPosition(), lockfish1.parent.getPosition());
        let action = cc.spawn(
            cc.moveTo(0.3, tmpPos),
            cc.scaleTo(0.3, 1),
            cc.rotateBy(0.3, 10),
        );
        let callBack = cc.callFunc(this.animationAimHide, this);
        // this.animationAim.runAction(cc.sequence(action, cc.fadeOut(0.05), callBack));
        cc.tween(this.animationAim).then(cc.sequence(action, cc.fadeOut(0.05), callBack)).start();
        this.clickFirstLockFish = true;
    }

    public animationAimHide() {
        this.animationAim.position = cc.v3(-2000, 0);
    }

    // 打开锁定
    public openLockFish() {
        this.HLLockIcon.active = true;
        let me = this.plyMgr.me;
        if (me) {
            me.gunBgRotate(true);
        }
        me.isLock = 2;
        this.fishMgr.ShowOrHideFishButton(true);
        // this.schedule(this.LockShootCallback, BYGame.STEP_TIME);

        if (!this.lockNotice.active) {
            this.lockNotice.opacity = 0;
            this.lockNotice.active = true;
            let endFunc = cc.callFunc(() => { this.lockNotice.active = false });
            // this.lockNotice.runAction(cc.sequence(cc.fadeIn(1), cc.delayTime(4), cc.fadeOut(1), endFunc));
            cc.tween(this.lockNotice).then(cc.sequence(cc.fadeIn(1), cc.delayTime(4), cc.fadeOut(1), endFunc)).start();
        }

    }

    // 关闭锁定
    public closeLockFish() {
        let me = this.plyMgr.me;
        if (me) {
            me.gunBgRotate(false);
        }
        let mySeat = this.plyMgr.mySeat
        this.closeLock(mySeat);
        this.HLLockIcon.active = false;   // 关闭 按钮高亮的显示
        this.clickFirstLockFish = false;
        this.fishMgr.ShowOrHideFishButton(false);  // 鱼上面的点击事件隐藏
        // this.unschedule(this.LockShootCallback);
        this.msg.gameBYHandlerLock(0);  //通知服务器关闭LOCK状态
    }

    // public LockShootCallback() {
    //     this.lockFish();
    // }

    public toWroldPos(sonPos: cc.Vec2, parentPos: cc.Vec2) {
        if (this.plyMgr.isRotate) {
            sonPos.x = - sonPos.x;
            sonPos.y = - sonPos.y;
        }
        return cc.v2(sonPos.x + parentPos.x, sonPos.y + parentPos.y);
    }

    private lockFishCallback() {
        if (!this.clickFirstLockFish) {
            return;
        }
        let me = this.plyMgr.me;
        if (me.lockFish && me.lockFish.liveInCurScene()) {
            let tmpPos = this.toWroldPos(me.lockFish.node.getPosition(), me.lockFish.node.parent.getPosition());
            this.curTouchPos = tmpPos;
            this.bulletMgr.changeBulletMove(this.plyMgr.mySeat);
            this.bulletMgr.shoot(this.plyMgr.mySeat, tmpPos);
        } else {
            if (me.isLock === 1) {
                me.lockFish = undefined;
                me.isLock = 2;
                if (me.isAuto) {
                    let deg = getQuadrantDegree(me.gunPos, this.curTouchPos);
                    this.msg.gameBYHandlerAutoMatic(1, deg);
                }
                this.msg.gameBYHandlerLock(2);
                this.startFishSmart();
            }
        }
    }

    // 自动按钮
    public OnClickAutoShootBullet() {
        this.cancelFishSmart();
        this.hideChangeGunBtn();
        this.byAudio.playButtonClickSound();

        if (this.plyMgr.me.isAuto) {
            this.closeAutoShootBullet();
        } else {
            this.openAutoShootBullet();
        }
    }

    public openAutoShootBullet() {
        this.plyMgr.me.isAuto = 1;
        let deg = getQuadrantDegree(this.plyMgr.me.gunPos, this.curTouchPos);
        this.msg.gameBYHandlerAutoMatic(1, deg);
        this.HLAutoIcon.active = true;
        // this.schedule(this.autoShootCallback, BYGame.STEP_TIME);
    }
    public closeAutoShootBullet() {
        this.plyMgr.me.isAuto = 0;
        this.msg.gameBYHandlerAutoMatic(0);
        this.HLAutoIcon.active = false;
        // this.unschedule(this.autoShootCallback);
    }

    public autoShootCallback() {
        if (this.plyMgr.me.isLock != 1) {
            this.bulletMgr.shoot(this.plyMgr.mySeat, this.curTouchPos);
        }
    }
    // 自己发子弹 并改变炮台的转向
    public shootBullet() {
        var touchPos = this.curTouchPos;
        this.bulletMgr.shoot(this.plyMgr.mySeat, touchPos);
    }

    public changeAutoDegAndPost() {
        let deg = getQuadrantDegree(this.plyMgr.me.gunPos, this.curTouchPos);
        this.msg.gameBYHandlerAutoMatic(1, deg);
    }

    public showButtleCountMoreTip() {
        if (!this.tipCanShow) {
            return;
        }

        this.tipCanShow = false;
        showTip("亲，屏幕中炮弹太多啦，节约点子弹呗～");

        this.scheduleOnce(() => {
            this.tipCanShow = true;
        }, 1);
    }

    public closeLock(location: number) {
        let p = this.plyMgr.getPlyBySeat(location);
        p.isLock = 0;
        p.lockFishId = -1;
        p.lockFishFormationId = -1;
        p.lockFish = undefined;
        p.aimCircle.active = false;
        p.hideLockDotLine();
    }

    touch2GamePos(v: cc.Vec2) {
        return new cc.Vec2(v.x - this.halfSW, v.y - this.halfSH);
    }

    // 接收到服务器消息后  改变本地 GUN的 锁定状态
    public changeGunLockState(seat: number, isLock: number) {
        let p = this.plyMgr.getPlyBySeat(seat);
        if (!p) {
            return;
        }
        p.isLock = isLock;
        if (isLock === 0) {
            this.closeLock(seat);
            p.gunBgRotate(false);
        } else {
            p.gunBgRotate(true);
        }
    }

    // 接收到服务器消息后  改变本地炮台 锁定的鱼的ID
    public changeLockFishId(seat: number, fishId: number, fishFormationId: number = -1) {
        let p = this.plyMgr.getPlyBySeat(seat);
        if (!p) {
            return;
        }
        p.lockFishId = fishId;
        p.lockFishFormationId = fishFormationId;
        this.doBulletFollowFish(seat, fishId, fishFormationId);
    }

    // 让子弹向锁定的鱼移动
    public doBulletFollowFish(seat: number, fishId: number, fishFomationId?: number) {
        let p = this.plyMgr.getPlyBySeat(seat);
        let currentFish = this.fishMgr.getFishById(fishId, fishFomationId);
        if (!currentFish) {
            p.lockFish = undefined;
            cc.log("doBulletFollowFish  currentFish  undefined");
            return;
        }
        p.lockFish = currentFish.getComponent(BYFish);

        this.bulletMgr.changeBulletMove(seat);
    }

    public moenyNotEnough() {
        if (this.moenyNotLayerIsShow) {
            return;
        }
        this.moenyNotLayerIsShow = true;

        let cf = showConfirm("亲，您的金币不足了噢，现在就去补充一点吗？", "去充值", "去银行")
        cf.showClose()
        cf.okFunc = () => {
            g.curQiutShow = QuitShow.SHOWRECHARGE
            leave()
        }
        cf.cancelFunc = () => {
            g.curQiutShow = QuitShow.SHOWBANK
            leave()
        }
        cf.closeFunc = () => {
            this.moenyNotLayerIsShow = false
        }
        let leave = () => {
            this.moenyNotLayerIsShow = false
            this.byAudio.playButtonClickSound()
            g.gameVal.lastGame = ""
            this.endGame = true
            this.leaveGame()
        }
    }

    public backBtClick() {

        this.byAudio.playButtonClickSound();
        let confirmnode = showConfirm("亲，确定不再多玩一会儿了吗？", "确定", "取消");
        confirmnode.okFunc = () => {
            this.backMainGame();
        };
    }

    public backMainGame() {
        this.endGame = true;
        this.leaveGame()
    }

    public enmuLayerhide(elayer: cc.Node) {
        elayer.active = false;
    }

    public enmuBtclick() {
        this.hideChangeGunBtn();
        this.byAudio.playButtonClickSound();
        cc.director.getActionManager().removeAllActionsFromTarget(this.enumLayer, true);

        if (this.enumLayer.active) {
            let callBack1 = cc.callFunc(this.enmuLayerhide, this.enumLayer);
            // this.enumLayer.runAction(cc.sequence(cc.fadeOut(0.2), callBack1));
            cc.tween(this.enumLayer).then(cc.sequence(cc.fadeOut(0.2), callBack1)).start();
        } else {
            this.enumLayer.opacity = 0;
            this.enumLayer.active = true;
            // this.enumLayer.runAction(cc.fadeIn(0.2));
            cc.tween(this.enumLayer).to(0.2, { opacity: 255 }).start();
        }
    }

    public withdrawBtClick(grade: number) {
        this.byAudio.playButtonClickSound();
        let confirmnode;
        if (isFestivalGuns(grade)) {
            if (WeeklyRebateModel.instance().isGoing === 1) {
                confirmnode = showConfirm("亲，赶快去参加周返利抽奖解锁吧，现在就要离开吗？", "确定", "取消");
            } else {
                showTip("活动未开启!");
                return;
            }
        } else {
            confirmnode = showConfirm("亲，充值需要离开渔场才能进行噢，现在就要离开吗？", "确定", "取消");
        }
        confirmnode.okFunc = () => {
            g.gameVal.lastGame = "";
            if (isFestivalGuns(grade)) { //活动
                // if (isRebateGunArr(grade)) {
                //     g.curQiutShow = QuitShow.Rebate;
                // } else {
                g.curQiutShow = QuitShow.Festvial;
                // }
            } else {
                g.curQiutShow = QuitShow.SHOWRECHARGE;
            }
            this.backMainGame();
        };
    }

    public exchangeBtClick() {

        this.byAudio.playButtonClickSound();
        let confirmnode = showConfirm("亲，兑换需要离开渔场才能进行噢，现在就要离开吗？", "确定", "取消");
        confirmnode.okFunc = () => {
            g.gameVal.lastGame = "";
            g.curQiutShow = QuitShow.SHOWBANK;
            this.backMainGame();
        };
    }



    public onClickChgGun() {
        this.byAudio.playButtonClickSound();
        if (!this.byGunHandbook) {
            let ui = cc.instantiate(this.preGunHandbook);
            this.byGunHandbook = ui.getComponent(BYGunHandbook);
            this.byGunHandbook.autoDestroy = false
            this.uiLayer.addChild(ui);
        } else {
            this.byGunHandbook.openAnim();
        }
    }
    public onClickFishHandbook() {
        this.byAudio.playButtonClickSound();
        if (!this.byFishHandbook) {
            let ui = cc.instantiate(this.preFishHandbook);
            this.byFishHandbook = ui.getComponent(ScrollViewBox);
            this.byFishHandbook.autoDestroy = false
            this.uiLayer.addChild(ui);
        } else {
            this.byFishHandbook.openAnim();
        }
    }
    public onClickHelp() {
        if (!this.gameHelp) {
            let ui = cc.instantiate(this.preHelp);
            this.gameHelp = ui.getComponent(GameHelp);
            this.gameHelp.autoDestroy = false
            this.uiLayer.addChild(ui);
            this.gameHelp.openAnim(() => {
                this.gameHelp.showContent(this.helpDesc);
            })
        } else {
            this.gameHelp.openAnim(() => {
                this.gameHelp.showContent(this.helpDesc);
            })
        }
    }



    public setBtClick() {
        this.byAudio.playButtonClickSound();
        let node = cc.instantiate(this.setting);
        node.getChildByName("panel").getChildByName("mid").getChildByName("relogin").active = false;
        this.uiLayer.addChild(node);
        node.active = true;
        node.setPosition(0, 0);
    }
    // 点击炮台后  弹出或隐藏 还炮按钮
    public showHuanPaoBt() {
        this.byAudio.playButtonClickSound();
        let bt = this.plyMgr.me.myHuanPaoBt;
        cc.director.getActionManager().removeAllActionsFromTarget(bt, true);
        if (bt.active) {

            let callBack1 = cc.callFunc(this.enmuLayerhide, bt);
            // bt.runAction(cc.sequence(cc.fadeOut(0.2), callBack1));
            cc.tween(bt)
                .to(0.2, { opacity: 0 })
                .call(() => {
                    this.enmuLayerhide(bt);
                })
                .start();

        } else {
            bt.opacity = 0;
            bt.active = true;
            // bt.runAction(cc.fadeIn(0.2));
            cc.tween(bt).to(0.2, { opacity: 255 }).start();
        }
    }
    public hideChangeGunBtn() {
        let bt = this.plyMgr.me.myHuanPaoBt;
        if (bt) {
            if (!bt.active) {
                return;
            }
            // bt.active = false;
            this.byAudio.playButtonClickSound();
            cc.director.getActionManager().removeAllActionsFromTarget(bt, true);
            let callBack1 = cc.callFunc(this.enmuLayerhide, bt);
            // bt.runAction(cc.sequence(cc.fadeOut(0.2), callBack1));
            cc.tween(bt)
                .to(0.2, { opacity: 0 })
                .call(() => {
                    this.enmuLayerhide(bt);
                })
                .start();
        }
    }




    public bgShake() {
        cc.director.getActionManager().removeAllActionsFromTarget(this.nodeBg, true)
        cc.director.getActionManager().removeAllActionsFromTarget(this.uiLayer, true)
        cc.director.getActionManager().removeAllActionsFromTarget(this.gunLayer, true)
        this.nodeBg.position = cc.v3(0, 0)
        this.uiLayer.position = cc.v3(0, 0)
        this.gunLayer.position = cc.v3(0, 0)
        let t = 0.04
        let t2 = 0.08
        let action = cc.sequence(
            cc.moveBy(t, cc.v2(10, 10)), cc.moveBy(t2, cc.v2(-20, -20)),
            cc.moveBy(t, cc.v2(10, 10)), cc.moveBy(t, cc.v2(0, 10)),
            cc.moveBy(t2, cc.v2(0, -20)), cc.moveBy(t, cc.v2(0, 10)), cc.moveTo(0, cc.v2(0, 0)));
        // this.nodeBg.runAction(action)
        cc.tween(this.nodeBg).then(action).start();
        // this.uiLayer.runAction(action.clone())
        cc.tween(this.uiLayer).then(action.clone()).start();
        // this.gunLayer.runAction(action.clone())
        cc.tween(this.gunLayer).then(action.clone()).start();
    }

    getGunRes(type: number) {
        let resprefab = this.resArr[type]
        if (this.gunResNodeArr[type] != undefined) {
            return this.gunResNodeArr[type];
        }
        let node = cc.instantiate(resprefab);
        this.gunResNodeArr[type] = node;
        return node;
    }

    onDestroy() {
        cc.director.getScheduler().unscheduleAllForTarget(this);
        cc.director.getActionManager().removeAllActionsFromTarget(this.node, true);
        super.onDestroy();
    }

    /*********** 智慧捕鱼 ***********/
    public smartList: { type: number, rate: number }[] = [];
    public attackType: string = "";
    public bulletNum: number = 0;
    public speciallist: number[] = [];

    /**
     * 打开只能捕鱼选鱼界面
     * @param event
     */
    openFishSmart(event: cc.Event) {
        if (!this.plyMgr.me.isSmart) {
            this.smartList.splice(0);
            this.speciallist.splice(0);
            this.STLockIcon.active = true;
            this.plyMgr.me.isSmart = 1;
            let fishSmart = cc.instantiate(this.fishSmart);
            this.node.addChild(fishSmart);
            fishSmart.getComponent(ByFishSmart).openAnim(this);
        }
        else {
            this.cancelFishSmart();
        }
    }

    /**
     * 取消只能捕鱼，切换到锁定捕鱼
     */
    cancelFishSmartOpenLock() {
        if (this.plyMgr.me.isSmart) {
            this.STLockIcon.active = false;
            this.plyMgr.me.isSmart = 0;
            this.plyMgr.me.lockFish = undefined;

            this.openLockFish();
        }
    }

    /**
     * 取消智能捕鱼
     */
    cancelFishSmart() {
        if (this.plyMgr.me.isSmart) {
            this.STLockIcon.active = false;
            this.plyMgr.me.isSmart = 0;
            this.plyMgr.me.lockFish = undefined;
        }
    }

    /**
     * 开始只能捕鱼
     */
    startFishSmart() {
        if (!this.plyMgr.me.isSmart) { return; }
        //1:拿到鱼
        let fish: BYFish = null;
        if (this.attackType == optionType.tesu) {
            for (let i = 0; i < this.speciallist.length; i++) {
                fish = this.fishMgr.getFishByFishType(this.speciallist[i]);
                if (fish) break;
            }
        }
        if (!fish) {
            for (let i = 0; i < this.smartList.length; i++) {
                fish = this.fishMgr.getFishByFishType(this.smartList[i].type);
                if (fish) break;
            }
        }
        if (!fish) return;
        this.fishMgr.ShowOrHideFishButton(true);
        this.fishMgr.setSmartFishTarget(fish);
    }

    /**
     * 只能捕鱼开启是的定时检测
     */
    smartFishCallback() {
        let me = this.plyMgr.me;
        if (me.lockFish && me.lockFish.liveInCurScene()) {
            if (this.bulletNum > 0) {
                this.bulletNum--;
                if (this.bulletNum <= 0) {
                    this.msg.gameBYHandlerLock(0);  //通知服务器关闭LOCK状态
                    this.cancelFishSmart();
                    return;
                }
            }
            let tmpPos = this.toWroldPos(me.lockFish.node.getPosition(), me.lockFish.node.parent.getPosition());
            this.curTouchPos = tmpPos;
            this.bulletMgr.changeBulletMove(this.plyMgr.mySeat);
            this.bulletMgr.shoot(this.plyMgr.mySeat, tmpPos);
            if (this.attackType == optionType.youxian || this.attackType == optionType.tesu) {
                this.startFishSmart();
            }
        } else {
            this.startFishSmart();
        }
    }
}
