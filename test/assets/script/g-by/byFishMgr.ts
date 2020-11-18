import BYFish from "./byFish";
import BYGame from "./byGame";
import BulletMgr from "./byBulletMgr";
import BYFishRoute from "./byFishRoute";
import { massive } from "./massive";

const { ccclass, property } = cc._decorator;
let Decimal = window.Decimal;

@ccclass
export default class BYFishMgr extends cc.Component {

    @property(cc.Prefab)
    fishsPrefab: cc.Prefab = undefined;

    private fishsObj: cc.Node = undefined;
    public game: BYGame = undefined;
    private bulletMgr: BulletMgr = undefined;
    public fishDirPool: { [fishType: number]: Array<cc.Node> } = {};
    public currtClickFishTag = 0;
    public fishFormationLayer: cc.Node = undefined;
    private fishDir: {
        [key: string]: cc.Node;
    } = {};

    public fishLayerAction = false; // fishlayer 是否在进行移动
    public cirFormationId = 1;
    public bezierFormationId = 1;

    static mermaidType = 95;   // 美人鱼Type

    static frozenType = 94;   // 冰冻Type
    static toadType = 66;   // 金蟾Type
    static bossFishType = 65;   // bossType
    static jellyfishType = 21;   // 水母Type
    static seahorseType = 33;   // 海马Type

    static bombType = 92; // 炸弹Type
    onLoad() {


        let game = cc.find("game");
        this.game = game.getComponent(BYGame);
        this.bulletMgr = this.game.bulletMgr;

        this.fishFormationLayer = this.game.dieLayer;


        if (!this.fishsObj) {
            this.fishsObj = cc.instantiate(this.fishsPrefab);
        }

        for (let i = 0; i < this.fishsObj.children.length; i++) {

            let fish = this.fishsObj.children[i];
            let btn = fish.getChildByName("button")
            btn.active = false;
            let button = btn.getComponent(cc.Button);

            let clickEvent = button.clickEvents[0];
            clickEvent.target = this.node;
            clickEvent.component = "byFishMgr";
            clickEvent.handler = "onClickFishButton";

            let nameStr = fish.name;
            this.fishDir[nameStr] = fish;
        }

        this.initFishPool();

    }

    onDestroy() {
        cc.director.getScheduler().unscheduleAllForTarget(this);
        cc.director.getActionManager().removeAllActionsFromTarget(this.node, true);
    }


    // 显示或隐藏  所有鱼的点击按钮   炮台在锁定状态时  显示      不在时  隐藏
    public ShowOrHideFishButton(isShow: boolean) {

        for (let i = 0; i < this.game.fishLayer.children.length; i++) {
            let fish = this.game.fishLayer.children[i];
            fish.getChildByName("button").active = isShow;
        }

        for (let fishType in this.fishDirPool) {
            let fishArr = this.fishDirPool[fishType];
            for (let key in fishArr) {
                let fish = fishArr[key];
                fish.getChildByName("button").active = isShow;
            }
        }

        for (let key in this.fishDir) {
            let fish = this.fishDir[key];
            fish.getChildByName("button").active = isShow;

        }
    }

    // 点击鱼按钮的响应       让被点击的鱼  成为新的锁定目标  并吧消息发给服务器
    private onClickFishButton(event: cc.Event) {
        if (this.game.plyMgr.me.isSmart) {
            this.game.cancelFishSmartOpenLock();
        }
        this.currtClickFishTag = event.target.parent.name;//tag->name
        let me = this.game.plyMgr.me;
        let fish = event.target.parent.getComponent(BYFish);
        if (me.isLock && !fish.isDieing) {
            me.lockFish = fish;
            if (!this.game.clickFirstLockFish) {
                this.game.openClickFirstLockFish();
            }
            me.isLock = 1;

            this.game.msg.gameBYHandlerLock(1, fish.fishId, fish.fishFormationId);
            // 让打出去的子弹 变成现在锁定的目标
            this.game.bulletMgr.changeBulletMove(me.seat);
        }
    }

    // 创建 普通鱼  和 鱼阵中的鱼 和 鱼阵 的 对象池
    private initFishPool() {
        for (let key in this.fishDir) {
            let keyNum = parseInt(key);
            let fishMoxin = this.fishDir[key];
            this.fishDirPool[keyNum] = [undefined];
            let fish = cc.instantiate(fishMoxin)
            this.fishDirPool[keyNum].push(fish);
            fish.active = false;
            this.node.addChild(fish, keyNum);
            this.fishDirPool[keyNum].splice(0, 1);
        }
    }

    // 创建一条普通鱼   类型  路线ID   偏移ID  该鱼的ID
    public createFish(fishType: number, rootIdx: number, offsetID: number, fishId: number, startPosNum?: number, firstTime?: number) {
        for (let i = 0; i < BYFishRoute.anchor.length; i++) {
            if (BYFishRoute.anchor[i].id == rootIdx) {
                rootIdx = i;
                break;
            }
        }
        if (rootIdx == undefined) {
            cc.log("rootIdx  is  undifen");
            return;
        }
        let fish = this.createOneFishByFishType(fishType);
        if (fish === undefined) {
            cc.log("fish =  undefined");
            return;
        }
        let fishNode = fish.node;

        fishNode.name = fishId.toString();//tag->name
        fish.fishFormationId = -1;
        fish.rootIdx = rootIdx;
        fish.typeId = fishType;
        fish.fishId = fishId;

        fishNode.position = cc.v3(BYFishRoute.anchor[rootIdx].points[0][0] + BYFishRoute.offset[offsetID].x,
            BYFishRoute.anchor[rootIdx].points[0][1] + BYFishRoute.offset[offsetID].y);

        if (fishNode.scaleY < 0) {
            fishNode.scaleY = -fishNode.scaleY;
        }
        if (fishNode.scaleY > 0 && (fishNode.position.x > 0 && !this.game.plyMgr.isRotate) || (fishNode.position.x < 0 && this.game.plyMgr.isRotate)) {
            fishNode.scaleY = -fishNode.scaleY;
        }

        if (fishType == BYFishMgr.seahorseType || fishType == BYFishMgr.jellyfishType || fishType == BYFishMgr.bombType) {
            if (fishNode.scaleY < 0) {
                fishNode.scaleY = -fishNode.scaleY;
            }
            if (this.game.plyMgr.isRotate) {
                fishNode.scaleY = -fishNode.scaleY;
            }
        }

        if (fishType == BYFishMgr.bossFishType) {
            this.game.byAnimMgr.playBossComing();
        }

        let point = cc.v2(BYFishRoute.offset[offsetID].x, BYFishRoute.offset[offsetID].y);
        let xstartPosNum = 0;
        let curveTimex = BYFishRoute.anchor[rootIdx].curveTime;
        let xfirstTime = curveTimex;
        if (startPosNum != undefined) {
            xstartPosNum = startPosNum;
            let index11 = xstartPosNum * 2;
            if (BYFishRoute.anchor[rootIdx].points.length > index11) {
                fishNode.position = cc.v3(BYFishRoute.anchor[rootIdx].points[index11][0] + BYFishRoute.offset[offsetID].x,
                    BYFishRoute.anchor[rootIdx].points[index11][1] + BYFishRoute.offset[offsetID].y);
            }
        }
        if (firstTime != undefined) {
            xfirstTime = firstTime;
        }
        fish.move(point, xstartPosNum, xfirstTime);

        let lineCount = BYFishRoute.anchor[rootIdx].points.length / 2 - xstartPosNum;
        if (lineCount < 0) {
            lineCount = 0;
            fishNode.active = false;
        }

        let delayTime = lineCount >= 1 ? ((lineCount - 1) * curveTimex + 2 + xfirstTime) : xfirstTime;
        fish.scheduleOnce(() => {
            fishNode.active = false;
            fish.isDieing = true;
            this.fishBackToPool(fish);
        }, delayTime);

    }


    // 创建一条鱼阵的鱼    鱼类型   在鱼阵中的位置    该鱼阵的ID
    public createFishFormationFish(type: number, points: number[][], formationId: number, pos: cc.Vec2) {

        for (let i = 0; i < points.length; i++) {
            let fish = this.createOneFishByFishType(type);
            if (!fish) {
                cc.log("fish =  undefined, fishType = ", type);
                continue;
            }
            let fishNode = fish.node;
            fish.fishFormationId = formationId;
            fish.fishId = points[i][2];
            fish.typeId = type;
            fish.rootIdx = -1;

            fishNode.position = cc.v3(points[i][0] + pos.x, points[i][1] + pos.y);
            if (fishNode.scaleY < 0) {
                fishNode.scaleY = -fishNode.scaleY;
            }
            if (this.game.plyMgr.isRotate && fishNode.scaleY > 0) {
                fishNode.scaleY = -fishNode.scaleY;
            }
            fishNode.angle = 0;
        }

    }

    // 鱼阵 游完后的回掉
    public fishFormationEnd() {
        cc.director.getActionManager().removeAllActionsFromTarget(this.node, true);
        this.fishLayerAction = false;
        this.node.opacity = 255;
        for (let j = 0; j < this.node.children.length; j++) {
            let child = this.node.children[j];
            if (child.active && !child.getComponent(BYFish).isDieing) {
                child.active = false;
                this.fishBackToPool(child.getComponent(BYFish));
            }
        }
        this.node.position = cc.v3(0, 0);
    }

    // 创建一个鱼阵    鱼阵的类型    鱼阵的ID   在鱼阵数组的Index
    public createFishFormation(formationType: number, formationId: number, index: number, aliveFishs?: number[], liveTime?: number) {
        if (!this.fishLayerAction) {
            this.fishLayerAction = true;
            this.node.position = cc.v3(0, 0);

            if (this.game.plyMgr.isRotate) {
                //this.node.runAction(cc.moveTo(240, cc.v2(-23000, 0)));
                cc.tween(this.node).to(240, { position: cc.v2(-23000, 0) }).start();
            } else {
                //this.node.runAction(cc.moveTo(240, cc.v2(23000, 0)));
                cc.tween(this.node).to(240, { position: cc.v2(23000, 0) }).start();
            }
        }

        if (massive[index]) {
            let lineFishes = massive[index].lineFishes;
            let time = 24;
            let pos = cc.v2(0, 0);
            if (this.game.plyMgr.isRotate) {
                pos = cc.v2(-1000 + this.node.x, 0);
            } else {
                pos = cc.v2(-1000 - this.node.x, 0);
            }
            if (liveTime != undefined) {
                time = time - liveTime / 1000;
                if (time < 0) {
                    return;
                }
                pos = cc.v2(-1000 + 2300 / 24 * (liveTime / 1000) - this.node.x, 0 - this.node.y);
            }
            for (let key in lineFishes) {
                let fish = lineFishes[key];
                let fishType = fish.fishType;
                let points = fish.points;
                let posintsArr = [];
                if (aliveFishs != undefined) {
                    for (let i = 0; i < points.length; i++) {
                        for (let j = 0; j < aliveFishs.length; j++) {
                            if (points[i][2] == aliveFishs[j]) {
                                posintsArr.push(points[i]);
                            }
                        }
                    }
                } else {
                    posintsArr = points;
                }
                this.createFishFormationFish(fishType, posintsArr, formationId, pos);
            }
        }

    }

    update() {

        if (!this.fishLayerAction) {
            return;
        }
        for (let j = 0; j < this.node.children.length; j++) {
            let child = this.node.children[j];
            let posx = this.game.toWroldPos(child.getPosition(), child.parent.getPosition()
            );
            if (((posx.x > 870 && !this.game.plyMgr.isRotate) || (posx.x < -870 && this.game.plyMgr.isRotate))
                && child.active && !child.getComponent(BYFish).isDieing) {
                child.active = false;
                this.fishBackToPool(child.getComponent(BYFish));
            }
        }
    }

    public fishBackToPool(byFish: BYFish) {
        let fishType = byFish.typeId;
        byFish.chgSpineState(false);
        this.fishDirPool[fishType].push(byFish.node);
    }
    public createCircleFishFormation2(type: number, formationType: number, formationId: number, fishId?: number,
        aliveFishs?: number[], liveTime?: number) {
        let startP = cc.v2(0, 0);
        let fishArr = [];
        let fishCount = 18;

        if (formationType == 2) {
            fishCount = 5;
        }
        for (let i = 0; i < fishCount; i++) {
            let fish = this.createOneFishByFishType(type);
            if (fish == undefined) {
                cc.log("fish =  undefined, fishType =", type);
                continue;
            }
            let fishNode = fish.node;
            fishNode.setPosition(startP);
            fish.lastPos = cc.v2(0, 0);
            fish.rootIdx = 0;
            fish.typeId = type;
            fish.fishFormationId = formationId;
            fishArr.push(fishNode);
        }

        if (fishArr != []) {
            if (formationType == 1) {
                let angle = 0;
                for (let i = 0; i < fishArr.length; i++) {
                    let fish = fishArr[i];
                    let x = 620 * Math.cos(angle * Math.PI / 180);
                    let y = 620 * Math.sin(angle * Math.PI / 180);
                    fish.angle = -angle;
                    if (fish.scaleY < 0) {
                        fish.scaleY = -fish.scaleY;
                    }
                    if (angle > 90 && angle <= 270 && fish.scaleY > 0) {
                        fish.scaleY = -fish.scaleY;
                    }
                    if (this.game.plyMgr.isRotate) {
                        fish.scaleY = -fish.scaleY;
                    }
                    angle = angle + 20;
                    let callback = cc.callFunc(this.fishHide, this, fish);
                    //fish.runAction(cc.sequence(cc.moveTo(17, cc.v2(x, y)), callback));
                    //cc.log('byfishMgr-3')
                    cc.tween(fish)
                        .to(17, { position: cc.v2(x, y) })
                        .then(callback)
                        .start();
                    let script = fish.getComponent(BYFish);
                    script.fishId = this.cirFormationId;
                    if (fishId) {
                        script.fishId = fishId;
                        fishId++
                    }
                    this.cirFormationId++
                }
            } else if (formationType == 2) {
                for (let i = 0; i < fishArr.length; i++) {
                    let route = BYFishRoute.fiveBzeirArr[i];
                    let fish = fishArr[i];
                    let bezier = [route[1], route[3], route[2]];
                    let bezierTo = cc.bezierTo(10, bezier);

                    fish.position = route[0];
                    fish.getComponent(BYFish).rootIdx = 1;
                    fish.getComponent(BYFish).lastPos = cc.v2(0, 0);
                    let callback = cc.callFunc(this.fishHide, this, fish);
                    // fish.runAction(cc.sequence(bezierTo, callback));
                    //cc.log('byfishMgr-4')
                    cc.tween(fish).then(bezierTo).then(callback).start();

                    if (fish.scaleY < 0) {
                        fish.scaleY = -fish.scaleY;
                    }

                    let script = fish.getComponent(BYFish);
                    script.fishId = this.bezierFormationId;
                    if (fishId) {
                        script.fishId = fishId;
                        fishId++
                    }
                    this.bezierFormationId++
                }
            }
        }
    }




    // 创建鱼阵  一种鱼  沿一条路线一直刷
    public createOneRootFormation(rootIdx: number, intervalTime: number, intervalCount: number, fishType: number, fromationId: number, xfishId?: number) {
        let count = intervalCount - 1;
        let fishId = 1;
        if (xfishId) {
            fishId = xfishId + 1;
        }
        let zRootId = rootIdx;
        let xfromationId = fromationId;
        for (let i = 0; i < BYFishRoute.anchor.length; i++) {
            if (BYFishRoute.anchor[i].id == rootIdx) {
                rootIdx = i;
                break;
            }
        }
        this.schedule(() => {
            if (rootIdx == undefined) {
                cc.log("rootIdx  is  undifen");
                return;
            }
            let fish = this.createOneFishByFishType(fishType);
            if (fish == undefined) {
                cc.log("fish =  undefined , fishType =   ", fishType);
                return;
            }
            let fishNode = fish.node;
            fishNode.name = fishType.toString()//tag->name
            fishNode.position = cc.v3(BYFishRoute.anchor[rootIdx].points[0][0],
                BYFishRoute.anchor[rootIdx].points[0][1]);
            if (fishNode.scaleY < 0) {
                fishNode.scaleY = -fishNode.scaleY;
            }
            if (fishNode.scaleY > 0 && (fishNode.position.x > 0 && !this.game.plyMgr.isRotate) || (fishNode.position.x < 0 && this.game.plyMgr.isRotate)) {
                fishNode.scaleY = -fishNode.scaleY;
            }
            fish.rootIdx = rootIdx;



            fish.fishId = new Decimal(zRootId).sub(100).mul(100).add(fishId).toNumber();
            fish.typeId = fishType;
            fish.fishFormationId = xfromationId;

            let xstartPosNum = 0;
            let curveTimex = BYFishRoute.anchor[rootIdx].curveTime;
            let xfirstTime = curveTimex;

            fish.move(cc.v2(0, 0), xstartPosNum, xfirstTime);

            let lineCount = BYFishRoute.anchor[rootIdx].points.length / 2 - xstartPosNum;
            if (lineCount < 0) {
                lineCount = 0;
                fishNode.active = false;
            }
            fish.scheduleOnce(() => {
                fishNode.active = false;
                fish.isDieing = true;
                this.fishBackToPool(fish);
            }, lineCount * curveTimex + 2);

            fishId++;

        }, intervalTime, count)
    }

    // 创建鱼
    public createOneFishByFishType(fishType: number) {
        if (this.fishDirPool[fishType]) {
            let haveFish = false;
            let fishNode = undefined;
            for (let j = 1; j < this.fishDirPool[fishType].length; j++) {
                let xfish = this.fishDirPool[fishType][j];
                if (xfish != null && xfish != undefined && !xfish.active) {
                    fishNode = xfish;
                    haveFish = true;
                    this.fishDirPool[fishType].splice(j, 1);
                    break;
                }
            }
            if (!haveFish) {
                let xfish = cc.instantiate(this.fishDir["" + fishType]);
                fishNode = xfish;
                this.node.addChild(fishNode, fishType);
            }

            fishNode.active = true;

            let fish: BYFish = fishNode.getComponent(BYFish);
            cc.director.getActionManager().removeAllActionsFromTarget(fishNode, true);
            cc.director.getScheduler().unscheduleAllForTarget(fish);
            fish.chgColliderState(true);
            fish.fishId = fishType;
            fish.isDieing = false;
            fish.chgIceState(false);
            fish.runBgAnimation();
            fish.chgSpineState(true);

            return fish;
        } else {
            return undefined;
        }


    }


    // 鱼死亡后 的回调
    public fishHide(fish: cc.Node) {

        fish.active = false;
        cc.director.getActionManager().removeAllActionsFromTarget(fish, true);
        cc.director.getScheduler().unscheduleAllForTarget(fish.getComponent(BYFish));

        fish.angle = 0;
        fish.getComponent(BYFish).isDieing = true;

        if (fish.parent == this.game.dieLayer) {
            fish.parent = this.game.fishLayer;
        }

        this.fishBackToPool(fish.getComponent(BYFish));
    }

    public showCoin(self: BYFishMgr, fish: BYFish) {

        let coin = fish.coin;

        if (fish.typeId == BYFishMgr.bossFishType && fish.dieByLoactionGun == this.game.plyMgr.mySeat) {
            this.game.byAnimMgr.showMakeMoneyAnimation(coin);
            return;
        }
        let fishType = fish.typeId;
        let tmpPos = this.game.toWroldPos(fish.node.getPosition(), fish.node.parent.getPosition());
        this.game.byAnimMgr.playCoinAnim(tmpPos, fish.dieByLoactionGun, coin, fishType);
    }

    // 根据鱼ID 通知一个普通鱼的死亡    鱼ID      得到的钱    服务器中谁杀死的     鱼阵ID
    public fishDieByFishId(fishId: number, gainMoney: string, pos: number, massId?: number, fishNode: cc.Node = undefined) {

        if (this.game.plyMgr.toGameLocation(pos) == this.game.plyMgr.mySeat && parseFloat(gainMoney) > 0) {
            this.game.bgShake();
        }

        if (!fishNode) {
            fishNode = this.getFishById(fishId, massId);
        }
        let fish: BYFish = undefined;
        if (!fishNode) {
            cc.log("-----死亡鱼未找到---fishID-" + fishId + "---massID--" + massId);
            return;
        }
        fish = fishNode.getComponent(BYFish);
        if (massId && massId != -1) {
            if (this.fishLayerAction) {
                let tmpPos = this.game.toWroldPos(fishNode.getPosition(), fishNode.parent.getPosition());
                if (this.game.plyMgr.isRotate) {
                    tmpPos.x = -tmpPos.x;
                    tmpPos.y = -tmpPos.y;
                }
                fishNode.parent = this.game.dieLayer;
                fishNode.setPosition(tmpPos);
            }
        }

        fish.dealDie();
        fish.coin = gainMoney;
        fish.dieByLoactionGun = this.game.plyMgr.toGameLocation(pos);

        this.game.plyMgr.playerArr.forEach(el => {
            if (el && fish === el.lockFish) {
                el.lockFish = undefined;
            }
        });

        this.game.byAnimMgr.delFishDie(fishNode, pos, fish.typeId, gainMoney);
        this.game.byAudio.delFishDie(fish.typeId);

        let time = 0.1;
        let rot = 80;
        let callback = cc.callFunc(this.fishHide, this, fishNode);
        let callback1 = cc.callFunc(this.showCoin, this, fish);
        let action = cc.sequence(cc.rotateBy(time / 2, rot / 2), cc.rotateBy(time, -rot), callback1,
            cc.rotateBy(time, rot), cc.rotateBy(time, -rot),
            cc.rotateBy(time, rot), cc.rotateBy(time, -rot),
            cc.rotateBy(time, rot), cc.rotateBy(time, -rot),
            cc.rotateBy(time, rot), cc.rotateBy(time, -rot),
            cc.rotateBy(time, rot), cc.rotateBy(time, -rot), callback);
        //fishNode.runAction(action);
        cc.tween(fishNode).then(action).start();
        fish.scheduleOnce(() => {
            if (fishNode.active) {
                this.fishHide(fishNode);
            }
        }, 1.3);


    }

    // 鱼潮 来之前   普通鱼游走
    public normalFishLeaveByTime(time: number) {
        for (let i = 0; i < this.game.fishLayer.children.length; i++) {
            let fishNode = this.game.fishLayer.children[i];
            let fish = fishNode.getComponent(BYFish);
            if (fishNode.active && !fish.isDieing) {
                fish.leaveCurrtSceen(time);
                fish.isDieing = true;
                this.fishBackToPool(fish);
            }
        }
        this.game.byAnimMgr.playWaveAim();
    }




    initFishMass(data: any) {
        // cc.log("---initFishMass----", data);
        if (data.massInfos != [] && data.massInfos != undefined) {
            for (let m = 0; m < data.massInfos.length; m++) {
                let massInfo = data.massInfos[m];
                let index1 = 0;
                if (massInfo.aliveTime <= 0) {
                    continue;
                }
                for (let n = 0; n < massive.length; n++) {
                    let xiaoMassive = massive[n];
                    if (xiaoMassive.type == massInfo.type) {
                        index1 = n;
                        break;
                    }
                }
                let fishMass = massive[index1];
                // cc.log("---fishMass----", fishMass);
                if (fishMass.group == 1) {
                    this.createFishFormation(massInfo.type, massInfo.massId, index1, massInfo.fishes,
                        massInfo.liveTime);
                } else if (fishMass.group == 3 || fishMass.group == 4) {
                    let xtiem = Math.floor(massInfo.liveTime / 1000);
                    let fishArr = fishMass.midIntervalFishes;
                    let arr = fishArr.fishTypes;
                    let totalTime = arr.length * fishArr.intervalTime;

                    this.cirFormationId = 1;
                    let cishu = (totalTime - xtiem) / fishArr.intervalTime
                    let rand = arr.length - cishu;

                    if (fishMass.group == 3 && xtiem <= totalTime) {
                        let yuanType = 1;
                        let fishId = rand * 24 + 1;
                        if (cishu > 0) {
                            this.game.schedule(() => {
                                let tyep = arr[rand];
                                this.createCircleFishFormation2(tyep, yuanType, massInfo.massId, fishId);
                                rand++;
                                fishId = fishId + 24;
                                if (rand > arr.length) {
                                    rand = 0;
                                }
                            }, fishArr.intervalTime, cishu - 1);
                        }
                    }


                    if (fishMass.group == 4 && xtiem <= totalTime) {
                        let yuanType = 2;
                        if (cishu > 0) {
                            this.game.schedule(() => {
                                let tyep = arr[rand];
                                this.createCircleFishFormation2(tyep, yuanType, massInfo.massId);
                                rand++;
                                if (rand > arr.length) {
                                    rand = 0;
                                }
                            }, fishArr.intervalTime, cishu - 1);
                        }
                    }
                } else if (fishMass.group == 2) {
                    // cc.log("group == 2");
                    let time = massInfo.aliveTime;
                    time = time / 1000;
                    let fishArrs = fishMass.routeIntervalFishes;
                    for (let i = 0; i < fishArrs.length; i++) {
                        let arr = fishArrs[i];
                        let count = Math.floor(time / arr.intervalTime);
                        let fishId = arr.intervalCount - count;
                        this.createOneRootFormation(arr.routeId, arr.intervalTime, count, arr.fishType, massInfo.massId, fishId);
                    }
                }
            }
        }
    }


    getFishById(fishId: number, fishFomationId: number = -1) {
        let currentFish = undefined;
        fishFomationId = fishFomationId === undefined ? - 1 : fishFomationId
        for (let i = 0; i < this.node.children.length; i++) {
            let fishNode = this.node.children[i];
            let fish = fishNode.getComponent(BYFish);
            if (fishNode.active && fish.fishId === fishId && fish.fishFormationId === fishFomationId) {
                currentFish = fishNode;
                break;
            }
        }
        return currentFish;
    }

    /*********** 智慧捕鱼 ***********/
    /**
     * 根据fishType获取BYFish
     * @param fishType
     */
    getFishByFishType(fishType: number): BYFish {
        for (let i = 0; i < this.game.fishLayer.children.length; i++) {
            let fish = this.game.fishLayer.children[i];
            let byFish = fish.getComponent(BYFish);
            if (byFish && byFish.typeId == fishType) {
                if (fish.active && !byFish.isDieing && byFish.liveInCurScene()) {
                    return byFish;
                }
            }
        }
        return null;
    }

    /**
     * 绑定智慧捕鱼的鱼
     * @param byFish
     */
    setSmartFishTarget(byFish: BYFish) {
        let me = this.game.plyMgr.me;
        let fish = byFish;
        if (me.isSmart && !fish.isDieing) {
            me.lockFish = fish;
            if (!this.game.clickFirstLockFish) {
                this.game.openClickFirstLockFish();
            }
            this.game.msg.gameBYHandlerLock(1, fish.fishId, fish.fishFormationId);
            // 让打出去的子弹 变成现在锁定的目标
            this.game.bulletMgr.changeBulletMove(me.seat);
        }
    }
}