import BYGame from "./byGame";
import BYFishMgr from "./byFishMgr";
import BYFish from "./byFish";
import BYFishRoute from "./byFishRoute";
import { massive } from "./massive";
import GameMsg from "../g-share/gameMsg";
import { resolveFireMsg, dealFireMsg, dealHitMsg } from "./byUtil"
import net from "../common/net";
import { ROUTE } from '../common/route';
import user from "../common/user";


const { ccclass, property } = cc._decorator;

@ccclass

export default class BYMsg extends GameMsg {

    protected game: BYGame;

    protected regMsgHanlder(): void {
        this.onMsg(ROUTE.by_GameAutoMatic, this.byNotifyCurrentGameAutoMatic)
        this.onMsg(ROUTE.by_GameDeathMassive, this.byNotifyCurrentGameDeathMassive)
        this.onMsg(ROUTE.by_GameUserCastSkillMsg, this.byNotifyCurrentGameUserCastSkillMsg)// 技能鱼
        this.onMsg(ROUTE.by_GameLock, this.byNotifyCurrentGameLock)
        this.onMsg(ROUTE.by_GameUserFire, this.byNotifyCurrentGameUserFire)
        this.onMsg(ROUTE.by_GameUserHit, this.byNotifyCurrentGameUserHit)// 打死鱼
        this.onMsg(ROUTE.by_GameMassiveCreate, this.byNotifyCurrentGameMassiveCreate)
        this.onMsg(ROUTE.by_GameCreateFish, this.byNotifyCurrentGameCreateFish)
        this.onMsg(ROUTE.by_GameUserGetRemainPoints, this.byNotifyCurrentGameUserGetRemainPoints)
        this.onMsg(ROUTE.by_BroadcastState, this.byNotifyCurrentBroadCastState)
        this.onMsg(ROUTE.by_ReturnMoney, this.byNotifyCurrentReturnMoney)
        this.onMsg(ROUTE.by_GameDeathFish, this.byNotifyCurrentGameDeathFish)// 游出去死的鱼
        this.onMsg(ROUTE.by_GameUserChgButtleStyle, this.byNotifyCurrentGameUserChaButtleStyle)// 炮台样式
        this.onMsg(ROUTE.by_GameUserBulletRatio, this.byNotifyCurrentGameUserButtletLevel)// 炮台等级

        window.pomelo.once("disconnect", () => {
            if (this.game != undefined) {
                let me = this.game.plyMgr.me;
                if (me.isLock) {
                    this.game.closeLockFish();
                }
                if (me.isAuto) {
                    this.game.closeAutoShootBullet();
                }
                this.game.plyMgr.initPlayerIsAuto();
                this.game.plyMgr.initPlayerIsLock();
            }
        });
    }

    protected handleGameInfo(data: ps.By_GameInfo) {
        super.handleGameInfo(data)
        this.currentGameInfo(data);
        this.game.myMaxGunSp = data.maxBulletStyle;
        if (data.skinList) {
            if (data.skinList.length > 0) {
                this.game.myFestivalGuns = data.skinList;
            }
        }
        let gameInfos = data.gamerInfos;
        for (let i = 0; i < gameInfos.length; i++) {
            let info = gameInfos[i];
            let p = this.game.plyMgr.getPlyByPos(info.pos);
            if (!p.isMe) {
                p.changeGunSp(info.bulletStyle);
            }
            if (p) {
                p.changeLevelLable(info.ratio);
                p.changeCoinLabelById(parseFloat(info.remainPoints));
            }
        }
        let gunstyle = cc.sys.localStorage.getItem(user.uid + "gunStyle");
        if (gunstyle != null && gunstyle != undefined) {
            if (+gunstyle <= data.maxBulletStyle) {
                this.game.plyMgr.me.changeGunSp(+gunstyle);
                this.gameBYHandlerBulletStyle(gunstyle);
            } else {
                if (this.game.myFestivalGuns.indexOf(+gunstyle) >= 0) {
                    this.game.plyMgr.me.changeGunSp(+gunstyle);
                    this.gameBYHandlerBulletStyle(gunstyle);
                } else this.game.plyMgr.me.changeGunSp(0);
            }
        } else {
            this.game.plyMgr.me.changeGunSp(0);
        }
        this.game.amount = data.diffAmount
        this.game.fishMgr.initFishMass(data);
        this.game.canStart = true;
    }

    currentGameInfo(data: ps.By_GameInfo) {
        if (data == undefined) {
            return;
        }
        for (let i = 0; i < data.gamerInfos.length; i++) {
            let userInfo = data.gamerInfos[i];
            let p = this.game.plyMgr.getPlyByPos(userInfo.pos);
            if (!p) {
                continue;
            }
            if (userInfo.ratio != undefined) {
                p.chgGunLevel(userInfo.ratio);
            }
            if (userInfo.bulletStyle != undefined) {
                p.changeGunSp(userInfo.bulletStyle);
            }
            if (userInfo.autoAngle != undefined) {
                p.isAuto = 1;
                p.autoAngle = userInfo.autoAngle;
            }
            if (userInfo.lockTarget) {
                p.isLock = 1;
                p.lockFishId = userInfo.lockTarget.fishId;
                if (userInfo.lockTarget.massId) {
                    p.lockFishFormationId = userInfo.lockTarget.massId;
                }
            }
            p.changeCoinLabelById(parseFloat(userInfo.remainPoints));
        }
        if (data.regularInfos == undefined) {
            return;
        }
        this.game.fishLayer.opacity = 0;
        for (let j = 0; j < data.regularInfos.length; j++) {
            let fish = data.regularInfos[j];
            let rootIdx = 0;
            for (let i = 0; i < BYFishRoute.anchor.length; i++) {
                if (BYFishRoute.anchor[i].id == fish.routeId) {
                    rootIdx = i;
                    break;
                }
            }
            let rootTime = BYFishRoute.anchor[rootIdx].curveTime;
            let aliveTime = fish.aliveTime / 1000 // 剩余存活
            let lineCount = BYFishRoute.anchor[rootIdx].points.length / 2
            let cj = lineCount * rootTime  // 路线总时间
            let liveTime = cj - aliveTime  // 已经存活
            if (aliveTime < 0) {
                aliveTime = 0;
                continue;
            }
            let startNum = liveTime / rootTime  // 已经走过了几段路线
            let intStartNum = Math.floor(startNum);
            let firstTime = 0;
            if (startNum > intStartNum + 0.5) {
                // 向上
                startNum = intStartNum + 1;
                firstTime = rootTime + aliveTime % rootTime;
            } else {
                startNum = intStartNum;
                firstTime = aliveTime % rootTime;
            }
            if (startNum >= 0) {
                this.game.fishMgr.createFish(fish.fishType, fish.routeId, fish.offsetId, fish.fishId, startNum, firstTime);
            }
        }
        // this.game.fishLayer.runAction(cc.fadeIn(1.5));
        cc.tween(this.game.fishLayer).to(1.5, { opacity: 255 }).start();
    }




    private byNotifyCurrentGameUserGetRemainPoints(data: ps.By_GameUserGetRemainPoints) {
        for (let i = 0; i < data.gamerRemainPointsInfo.length; i++) {
            let remainPoint = data.gamerRemainPointsInfo[i];
            let p = this.game.plyMgr.getPlyByPos(remainPoint.pos);
            if (p) {
                p.changeCoinLabelById(parseFloat(remainPoint.remainPoints));
            }
        }
    }

    private byNotifyCurrentGameDeathMassive(data: ps.By_GameDeathMassive) {
        for (let i = 0; i < data.deathMassive.length; i++) {
            let xfishFormationId = data.deathMassive[i];
            for (let j = 0; j < this.game.fishLayer.children.length; j++) {
                let fish = this.game.fishLayer.children[j];
                if (fish.active && !fish.getComponent(BYFish).isDieing && fish.getComponent(BYFish).fishFormationId == xfishFormationId) {
                    this.game.fishMgr.fishHide(fish);
                }
            }
        }
    }

    private byNotifyCurrentGameDeathFish(data: ps.By_GameDeathFish) {
        let arr = data.deathFish;
        for (let i = 0; i < arr.length; i++) {
            let fishId = arr[i];
            let fish = this.game.fishMgr.getFishById(fishId);
            // cc.log('death fish=', fish)
            if (fish) {
                if (fish.getComponent(BYFish).typeId == 65) {
                    this.game.byAudio.playNormalBgMusic();
                }
                this.game.fishMgr.fishHide(fish);
            }
        }
    }

    private byNotifyCurrentGameUserFire(data: ps.By_GameUserFire) {
        let fireInfo = resolveFireMsg(data.fireMsg);
        let gameLocation = this.game.plyMgr.toGameLocation(fireInfo.pos);
        let p = this.game.plyMgr.getPlyByPos(fireInfo.pos);

        if (p.isAuto == 1 || p.isLock == 1) {
            return;
        }
        this.game.bulletMgr.shoot(gameLocation, cc.v2(0, 0), fireInfo.angle);

        if (p) {
            p.chgGunLevel(fireInfo.ratio);
        }

    }

    // 鱼不存在返回的接口
    private byNotifyCurrentReturnMoney(data: ps.By_ReturnMoney) {

        if (data.pos != undefined) {
            let p = this.game.plyMgr.getPlyByPos(data.pos);
            if (p) {
                p.incCoin(data.backMoney);
            }
        }
    }

    private byNotifyCurrentGameLock(data: ps.By_GameLock) {
        let p = this.game.plyMgr.getPlyByPos(data.pos);
        let seat = p.seat;
        p.isLock = data.on;
        if (data.on === 2) {
            return;
        }
        this.game.changeGunLockState(seat, data.on);

        if (data.on === 1 && data.fishId != undefined && data.massId != undefined) {
            this.game.changeLockFishId(seat, data.fishId, data.massId);
        } else if (data.on === 1 && data.fishId != undefined) {
            this.game.changeLockFishId(seat, data.fishId);
        }
    }

    private byNotifyCurrentGameAutoMatic(data: ps.By_GameAutoMatic) {
        let p = this.game.plyMgr.getPlyByPos(data.pos)
        p.isAuto = data.on
        p.autoAngle = data.angle || 0
    }

    private byNotifyCurrentGameUserHit(data: ps.By_GameUserHit) {
        if (data.massId) {
            this.game.fishMgr.fishDieByFishId(data.fishId, data.gainMoney, data.pos, data.massId);
        } else {
            this.game.fishMgr.fishDieByFishId(data.fishId, data.gainMoney, data.pos);
        }
    }

    private byNotifyCurrentGameCreateFish(data: ps.By_GameCreateFish) {
        if (this.game.plyMgr.isRotate == undefined) {
            return;
        }
        if (!this.game.canStart) {
            return;
        }
        for (let index = 0; index < data.fishes.length; index++) {
            let fish = data.fishes[index];
            this.game.fishMgr.createFish(fish.fishType, fish.routeId, fish.offsetId, fish.fishId);
        }
    }

    // 普通鱼 是1  鱼潮来前 是2    鱼潮 是 3
    private byNotifyCurrentBroadCastState(data: ps.By_BroadcastState) {
        cc.log("游戏状态 ：", data);

        if (data.state === 2) {
            this.game.fishMgr.normalFishLeaveByTime(data.time);
        } else if (data.state === 1) {
            this.game.byAnimMgr.hideBg2();
            if (this.game.fishMgr.fishLayerAction) {
                this.game.fishMgr.fishFormationEnd();
            }
        }

    }

    private byNotifyCurrentGameMassiveCreate(data: ps.By_GameMassiveCreate) {
        cc.log("byNotifyCurrentGameMassiveCreate ：", data);
        let xfishFormation = data.fishes[0];

        let index1 = 0;
        for (let n = 0; n < massive.length; n++) {
            let xiaoMassive = massive[n];
            if (xiaoMassive.type == xfishFormation.massiveType) {
                index1 = n;
                break;
            }
        }
        let fishMass = massive[index1];
        cc.log("fishMass.group", fishMass.group);
        if (fishMass.group == 1) {
            // 普通鱼阵
            this.game.fishMgr.createFishFormation(xfishFormation.massiveType, xfishFormation.massiveId, index1);
        } else if (fishMass.group == 2) {
            // 五条路线
            let fishArr = fishMass.routeIntervalFishes;
            for (let i = 0; i < fishArr.length; i++) {
                let arr = fishArr[i];
                this.game.fishMgr.createOneRootFormation(arr.routeId, arr.intervalTime, arr.intervalCount, arr.fishType, xfishFormation.massiveId);
            }
        } else if (fishMass.group == 3 || fishMass.group == 4) {
            // 圆 贝塞尔
            let yuanType = 1;
            if (fishMass.group == 4) {
                yuanType = 2;
                this.game.fishMgr.bezierFormationId = 1;
            } else {
                this.game.fishMgr.cirFormationId = 1;
            }

            let fishArr = fishMass.midIntervalFishes;
            let arr = fishArr.fishTypes;
            let rand = 0;
            let fishId = 1;
            this.game.fishMgr.schedule(() => {
                let tyep = arr[rand];
                this.game.fishMgr.createCircleFishFormation2(tyep, yuanType, xfishFormation.massiveId, fishId);
                rand++;
                if (yuanType == 1) {
                    fishId = fishId + 18
                } else if (yuanType == 2) {
                    fishId = fishId + 5
                }
                if (rand > arr.length) {
                    rand = 0;
                }
            }, fishArr.intervalTime, arr.length - 1);


        }
    }


    // 技能鱼
    private byNotifyCurrentGameUserCastSkillMsg(data: ps.By_GameUserCastSkillMsg) {
        let type = data.skillType;
        if (type == 1) {
            // 闪电
            this.game.byAnimMgr.playBoltAnimation(data.castFishIds, data.pos, data.gainMoney);
        } else if (type == 2) {
            // 爆炸
            this.game.byAnimMgr.playBoomFish(data.castFishIds, data.pos, data.gainMoney);
        } else if (type == 3) {
            // 冰冻
            this.game.byAnimMgr.playFrozenAnimation(data.frozenTime);
        } else if (type == 4) {
            // 美人鱼
            this.game.byAnimMgr.playMermaidAnimation(data.gainMoney, data.pos);
        }
    }


    // 炮台等级
    private byNotifyCurrentGameUserButtletLevel(data: ps.By_GameUserBulletRatio) {
        let p = this.game.plyMgr.getPlyByPos(data.pos);
        if (!p || p.isMe) {
            return;
        }
        p.chgGunLevel(data.ratio);
    }

    private byNotifyCurrentGameUserChaButtleStyle(data: ps.By_GameUserChgButtleStyle) {
        let p = this.game.plyMgr.getPlyByPos(data.pos);
        if (p) {
            p.changeGunSp(data.bulletStyle);
        }
    }

    public gameBYHandlerAutoMatic(xon: number, xangle?: number) {

        if (xangle) {
            net.notify('game.byHandler.automatic', { on: xon, angle: xangle });
        } else {
            net.notify('game.byHandler.automatic', { on: xon });
        }

        this.game.plyMgr.me.isAuto = xon;
        if (xon === 0) {
            this.game.plyMgr.me.autoAngle = 0;
        }
    }

    public gameBYHandlerLock(xon: number, xfishId?: number, xmassId?: number) {


        let me = this.game.plyMgr.me;
        if (!me) {
            cc.log("---gameBYHandlerLock--没有我--");
            return;
        }
        me.isLock = xon;
        if (xmassId && xfishId && xmassId != -1 && xmassId != undefined) {
            me.lockFishId = xfishId;
            me.lockFishFormationId = xmassId;
            net.notify("game.byHandler.lock", { on: xon, fishId: xfishId, massId: xmassId });
        } else if (xfishId) {
            me.lockFishId = xfishId;
            me.lockFishFormationId = -1;
            net.notify("game.byHandler.lock", { on: xon, fishId: xfishId });
        } else {
            net.notify("game.byHandler.lock", { on: xon });
        }

        if (xon === 0) {
            me.lockFishId = -1;
            me.lockFishFormationId = -1;
            this.game.plyMgr.me.lockFish = undefined;
        }

    }
    public gameBYHandlerFire(xangle: number, xGrade: number, xBulletId: number) {
        let data = dealFireMsg(xangle, xGrade, xBulletId);
        net.notify("game.byHandler.fire", { fireInfo: data });
    }

    public gameBYHandlerHit(xfishId: number, xBulletId: number, xmassId?: number) {
        if (!xmassId) {
            xmassId = 0;
        }
        let data = dealHitMsg(xmassId, xfishId, xBulletId);
        net.notify("game.byHandler.hit", { hitInfo: data });
    }

    // 炮台等级
    public GameBYHandlerBulletLevel(xbulletLevel: number) {
        net.notify("game.byHandler.bulletRatio", { ratio: xbulletLevel });
    }


    public gameBYHandlerBulletStyle(xstyleGarde: string) {
        let xbulletStyle = parseInt(xstyleGarde);
        cc.sys.localStorage.setItem(user.uid + "gunStyle", xstyleGarde);
        net.notify("game.byHandler.bulletStyle", { bulletStyle: xbulletStyle });
    }


    public gameBYHandlerrobotFishInfo(data: any) {
        if (data == undefined || data == []) {
            net.notify("game.byHandler.robotFishInfo", { fishInfo: [{ fishId: 0, massId: 0 }] });
            return;
        }
        let arr = [];
        for (let i = 0; i < data.length; i++) {
            let item: any = {}
            let fishItem = data[i].getComponent(BYFish)
            item.fishId = fishItem.fishId;
            item.massId = fishItem.fishFormationId;
            if (fishItem.fishFormationId == -1) {
                item = {
                    fishId: fishItem.fishId,
                }
            }
            arr.push(item);
        }
        net.notify("game.byHandler.lockTargetFishInfo", { fishInfo: arr });
    }
}