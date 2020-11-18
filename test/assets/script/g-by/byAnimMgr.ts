import BYGame from "./byGame";
import BYFish from "./byFish";
import { getDegree, getFishKindType } from "./byUtil"
import BYFishMgr from "./byFishMgr";

const { ccclass, property } = cc._decorator;
let Decimal = window.Decimal;
@ccclass
export default class BYAnimMgr extends cc.Component {
    @property(cc.Prefab)
    boltNode: cc.Prefab = undefined;
    @property(cc.Prefab)
    boltBallNode: cc.Prefab = undefined;
    @property(cc.Prefab)
    coinNode: cc.Prefab = undefined;
    @property(cc.Prefab)
    boomFishPre: cc.Prefab = undefined;
    @property(cc.Prefab)
    blueBoomAimPre: cc.Prefab = undefined;
    @property(cc.Node)
    makeMoneyNode: cc.Node = undefined;
    @property(cc.Prefab)
    bossComePre: cc.Prefab = undefined;
    @property(cc.Node)
    wave: cc.Node = undefined;
    @property(cc.Node)
    bg2: cc.Node = undefined;
    @property(cc.Prefab)
    fishMassComePre: cc.Prefab = undefined;
    @property(cc.Node)
    hearts: cc.Node = undefined;
    @property(cc.Prefab)
    coinLable: cc.Prefab = undefined;

    @property([cc.Node])
    cionLableNode: cc.Node[] = [];

    @property([cc.Node])
    hereIsGun: cc.Node[] = [];

    private game: BYGame;
    private boltPool: cc.Node[] = [];
    private coinPool: cc.Node[] = [];
    private boomFishPool: cc.Node[] = [];
    private blueBommAimPool: cc.Node[] = [];
    private coinLablePool: cc.Node[] = [];
    private boltBallPool: cc.Node[] = [];

    private boltCount: number;
    private coinCount: number;
    private boomFishCount: number;
    private blueBommAimCount: number;
    private coinLableCount: number;
    private boltBallCount: number;

    private boltLength: number = 0;  // 闪电图片的长度
    private coinSoundType = 0;


    private makeMoneNumBeatTime = 1.5;

    private boomFishNode: cc.Node = undefined;
    private blueBoomAimNode: cc.Node = undefined;
    private bossComeNode: cc.Node = undefined;
    private fishMassComeNode: cc.Node = undefined;

    onLoad() {

    }

    initGame(game: BYGame) {
        this.game = game;
        this.initPool();
    }
    initPool() {
        this.initPreToNode();
        this.boltCount = 10;
        this.coinCount = 30;
        this.boomFishCount = 5;
        this.blueBommAimCount = 5;
        this.coinLableCount = 10;
        this.boltBallCount = 10;
        this.initBoltPool();
        this.initCoinPool();
        this.initBoomFishPool();
        this.initBlueBoomPool();
        this.initCoinLablePool();
        this.initBoltBallPool();
    }

    initPreToNode() {
        if (!this.boomFishNode) {
            this.boomFishNode = cc.instantiate(this.boomFishPre);
        }

        if (!this.blueBoomAimNode) {
            this.blueBoomAimNode = cc.instantiate(this.blueBoomAimPre);
        }

        if (!this.bossComeNode) {
            this.bossComeNode = cc.instantiate(this.bossComePre);
            this.bossComeNode.active = false;
            this.node.addChild(this.bossComeNode);
        }

        if (!this.fishMassComeNode) {
            this.fishMassComeNode = cc.instantiate(this.fishMassComePre);
            this.fishMassComeNode.active = false;
            this.node.addChild(this.fishMassComeNode);
        }
    }

    onDestroy() {

    }

    initBoltPool() {
        this.boltPool = [];

        for (let i = 0; i < this.boltCount; ++i) {
            let bolt = cc.instantiate(this.boltNode); // 创建节点
            if (this.boltLength == 0) {
                this.boltLength = bolt.width;
            }
            bolt.active = false;
            this.node.addChild(bolt);
            this.boltPool.push(bolt); // 通过 putInPool 接口放入对象池
        }
    }

    initCoinPool() {
        this.coinPool = [];
        for (let i = 0; i < this.coinCount; ++i) {
            let coin = cc.instantiate(this.coinNode); // 创建节点
            this.coinPool.push(coin); // 通过 putInPool 接口放入对象池
            coin.active = false;
            this.node.addChild(coin);
        }
    }

    initBoomFishPool() {
        this.boomFishPool = [];
        for (let i = 0; i < this.boomFishCount; ++i) {
            let boomFish = cc.instantiate(this.boomFishNode); // 创建节点
            this.boomFishPool.push(boomFish); // 通过 putInPool 接口放入对象池

            boomFish.active = false;
            this.node.addChild(boomFish);
        }
    }

    initBlueBoomPool() {
        this.blueBommAimPool = [];
        for (let i = 0; i < this.blueBommAimCount; i++) {
            let blueBoom = cc.instantiate(this.blueBoomAimNode);
            this.blueBommAimPool.push(blueBoom);
            blueBoom.active = false;
            this.node.addChild(blueBoom);
        }
    }

    initCoinLablePool() {
        this.coinLablePool = [];
        for (let i = 0; i < this.coinLableCount; i++) {
            let coinLable = cc.instantiate(this.coinLable);
            this.coinLablePool.push(coinLable);
            coinLable.active = false;
            this.node.addChild(coinLable);
        }
    }

    initBoltBallPool() {
        this.boltBallPool = [];
        for (let i = 0; i < this.boltBallCount; i++) {
            let sdqx = cc.instantiate(this.boltBallNode);
            this.boltBallPool.push(sdqx);
            sdqx.active = false;
            this.node.addChild(sdqx);
        }
    }

    createBolt() {
        let bolt = null;
        for (let i = 1; i < this.boltPool.length; i++) {
            if (!this.boltPool[i].active) {
                bolt = this.boltPool[i];
                bolt.active = true;
                this.boltPool.splice(i, 1);
                break;
            }
        }
        if (!bolt) {
            bolt = cc.instantiate(this.boltNode);
            bolt.active = true;
            this.node.addChild(bolt);
        }
        return bolt;
    }

    cerateCoin() {
        let coin = null;
        for (let i = 1; i < this.coinPool.length; i++) {
            if (!this.coinPool[i].active) {
                coin = this.coinPool[i];
                coin.active = true;
                this.coinPool.splice(i, 1);
                break;
            }
        }
        if (!coin) {
            coin = cc.instantiate(this.coinNode);
            coin.active = true;
            this.node.addChild(coin);
            // this.coinPool.push(coin);
        }
        return coin;
    }

    createBoomFish() {
        let boomFish = null;
        for (let i = 1; i < this.boomFishPool.length; i++) {
            if (!this.boomFishPool[i].active) {
                boomFish = this.boomFishPool[i];
                boomFish.active = true;
                this.boomFishPool.splice(i, 1);
                break;
            }
        }
        if (!boomFish) {
            boomFish = cc.instantiate(this.boomFishNode);
            boomFish.active = true;
            this.node.addChild(boomFish);
        }
        return boomFish;
    }

    createBuleBoom() {
        let blueBoom = null;
        for (let i = 1; i < this.blueBommAimPool.length; i++) {
            if (!this.blueBommAimPool[i].active) {
                blueBoom = this.blueBommAimPool[i];
                blueBoom.active = true;
                this.blueBommAimPool.splice(i, 1);
                break;
            }
        }
        if (!blueBoom) {
            blueBoom = cc.instantiate(this.blueBoomAimNode);
            blueBoom.active = true;
            this.node.addChild(blueBoom);
        }
        return blueBoom;

    }

    createCoinLable() {
        let coinLable = null;
        for (let i = 1; i < this.coinLablePool.length; i++) {
            if (!this.coinLablePool[i].active) {
                coinLable = this.coinLablePool[i];
                coinLable.active = true;
                this.coinLablePool.splice(i, 1);
                break;
            }
        }
        if (!coinLable) {
            coinLable = cc.instantiate(this.coinLable);
            coinLable.active = true;
            this.node.addChild(coinLable);
        }
        return coinLable;
    }


    createBoltBall() {
        let xsdq = null;
        for (let i = 1; i < this.boltBallPool.length; i++) {
            if (!this.boltBallPool[i].active) {
                xsdq = this.boltBallPool[i];
                xsdq.active = true;
                this.boltBallPool.splice(i, 1);
                break;
            }
        }
        if (!xsdq) {
            xsdq = cc.instantiate(this.boltBallNode);
            xsdq.active = true;
            this.node.addChild(xsdq);
        }
        return xsdq;

    }

    hideBolt(bolt: cc.Node) {
        this.scheduleOnce(() => {
            bolt.active = false;
            this.boltPool.push(bolt);
        }, 4);

    }

    hideCoin(coin: cc.Node) {
        coin.active = false;
        this.coinPool.push(coin);
        this.game.byAudio.playCoinSound(this.coinSoundType);
    }

    hideBoomFish(boomFish: cc.Node) {
        this.scheduleOnce(() => {
            boomFish.active = false;
            this.boomFishPool.push(boomFish);
        }, 2);
    }

    hideBlueBoom(blueBoom: cc.Node) {
        this.scheduleOnce(() => {
            blueBoom.active = false;
            this.blueBommAimPool.push(blueBoom);
        }, 3.5);
    }

    hideCoinLable(coinLable: cc.Node) {
        // this.scheduleOnce(() => {
        coinLable.active = false;
        this.coinLablePool.push(coinLable);
        // }, 2);
    }


    hideBoltBall(sdq: cc.Node) {
        this.scheduleOnce(() => {
            sdq.active = false;
            this.boltBallPool.push(sdq);
        }, 4);
    }

    playBlueBoomAinmation(pos: cc.Vec2, palySG?: boolean) {
        let blueBoom = this.createBuleBoom();
        blueBoom.position = pos;

        let aim = blueBoom.getChildByName("aim")
        let par = blueBoom.getChildByName("lizi")
        if (palySG) {
            aim.active = true;
            aim.getComponent(cc.Animation).play();
            par.active = false;
        } else {
            aim.active = false;
            par.active = true;
            let lz = par.getComponent(cc.ParticleSystem);
            lz.resetSystem();
        }
        this.hideBlueBoom(blueBoom);
    }


    playBoltAnimation(fisharr: any, pos: number, gainMoney: string) {

        this.game.byAudio.playBoltSound();
        let arr: cc.Vec2[] = [];
        for (let i = 0; i < this.game.fishLayer.children.length; i++) {
            let fishNode = this.game.fishLayer.children[i];
            if (fishNode.active) {
                for (let j = 0; j < fisharr.length; j++) {
                    let fishInfo = fisharr[j];
                    let fish = fishNode.getComponent(BYFish);
                    if (fish.fishId == fishInfo) {
                        if (this.game.plyMgr.isRotate) {
                            arr.push(cc.v2(-fishNode.x, -fishNode.y));
                        } else {
                            arr.push(cc.v2(fishNode.x, fishNode.y));
                        }
                        fish.shaderSetDefault();
                        cc.director.getActionManager().removeAllActionsFromTarget(fishNode, true);
                        cc.director.getScheduler().unscheduleAllForTarget(fish);
                        if (this.game.plyMgr.me.lockFish === fish) {
                            this.game.plyMgr.me.lockFish = undefined;
                        }
                        fish.isDieing = true;
                        fish.chgColliderState(false);
                        fish.chgSpineState(false);
                        let time = 0.15;
                        let rotation1 = 80;

                        let action = cc.sequence(
                            cc.rotateBy(time / 2, -rotation1 / 2),
                            cc.rotateBy(time, rotation1),
                            cc.rotateBy(time / 2, -rotation1 / 2)
                        ).repeatForever();
                        // fishNode.runAction(action);
                        cc.tween(fishNode).then(action).start();
                        this.scheduleOnce(() => {
                            this.game.fishMgr.fishDieByFishId(fishInfo, "0", pos, -1, fishNode);
                        }, 4);
                    }
                }
            }
        }


        if (arr.length < 2) {
            return;
        }
        for (let i = 0; i < arr.length; i++) {
            let min = i;
            let max = i + 1;
            if (i == arr.length - 1) {
                min = i;
                max = 0;
            }

            let xlength = arr[max].x + arr[min].x;
            let ylength = arr[max].y + arr[min].y;
            let length = arr[min].sub(arr[max]).mag()//求距离
            let BoltDegree = 180 - getDegree(arr[min], arr[max]);
            let xinBolt = this.createBolt();
            let bili = length / this.boltLength;
            xinBolt.scaleX = bili;
            xinBolt.scaleY = 0.57;
            xinBolt.angle = -BoltDegree;
            xinBolt.position = cc.v2(xlength / 2, ylength / 2);
            let anim = xinBolt.getComponent(cc.Animation);
            let time = Math.random() * 10;
            anim.setCurrentTime(time);
            anim.play();
            this.hideBolt(xinBolt);
        }

        for (let i = 0; i < arr.length; i++) {
            let sdq = this.createBoltBall();
            sdq.position = arr[i];
            sdq.active = true;
            sdq.getComponent(cc.Animation).play();
            this.hideBoltBall(sdq);
        }

        let p = this.game.plyMgr.getPlyByPos(pos);
        if (p.isMe) {
            this.scheduleOnce(() => {
                this.showMakeMoneyAnimation(gainMoney);
            }, 5);
        } else {
            p.incCoin(gainMoney);
            return;
        }
    }


    // 播放金币跳动动画    v0:出现金币的点    v1：最后金币要到达的点   money:本次加多少钱
    public playCoinAnim(v0: cc.Vec2, gunId: number, money: string, fishType?: number) {

        let p = this.game.plyMgr.getPlyBySeat(gunId);
        let v1 = p.gunPos;
        let beishu = getFishKindType(fishType) || 1;

        let rand = Math.floor(Math.min(5, beishu) + 1);
        this.coinSoundType = rand > 5 ? 1 : 0;

        for (let i = 0; i < rand; i++) {
            let randx = Math.random() * 0.02;
            this.scheduleOnce(() => {
                let xinCoin = this.cerateCoin();
                let randy = Math.random() * 100 - 50;
                let randx = Math.random() * 100 - 50;
                xinCoin.setPosition(cc.v2(v0.x + randx, v0.y + randy));
                let anim = xinCoin.getComponent(cc.Animation);
                let time = Math.random() * 2;

                anim.play();
                anim.setCurrentTime(time);

                let callBack = cc.callFunc(this.hideCoin, this, xinCoin);
                let action = cc.sequence(cc.moveBy(0.3, cc.v2(0, 150)).easing(cc.easeCubicActionOut()), cc.moveBy(0.5, cc.v2(0, -150)).easing(cc.easeBounceOut()),
                    cc.delayTime(0.4 + i * 0.015), cc.moveTo(0.01, v0), cc.moveTo(0.4, v1), callBack);
                //xinCoin.runAction(action);
                cc.tween(xinCoin).then(action).start();
            }, randx);
        }

        let moneynum = +money;
        if (moneynum > 0 && getFishKindType(fishType) < 3) {
            let coinLable = this.createCoinLable();
            coinLable.position = cc.v2(v0.x, v0.y + 20);
            coinLable.opacity = 255;
            coinLable.getComponent(cc.Label).string = moneynum.toFixed(2).toString();
            let callBack = cc.callFunc(this.hideCoinLable, this, coinLable);
            let actions = cc.sequence(cc.spawn(cc.moveBy(1, cc.v2(0, 40)), cc.scaleTo(1, 1.3)), cc.fadeOut(1), callBack);
            //coinLable.runAction(actions);
            cc.tween(coinLable).then(actions).start();

        }

        if (moneynum > 0) {
            let incCoinLable = this.cionLableNode[gunId];
            this.scheduleOnce(() => {
                let p = this.game.plyMgr.getPlyBySeat(gunId);
                p.incCoin(money);
                incCoinLable.getComponent(cc.Animation).stop();
                incCoinLable.getComponent(cc.Label).string = "+" + moneynum.toFixed(2);
                incCoinLable.getComponent(cc.Animation).play();
            }, 1.6);
        }

    }

    // 播放爆炸鱼特效 随机位置
    public playBoomFish(fishArr: any, pos: number, gainMoney: string) {

        this.game.byAudio.playBoomFishSound();

        for (let i = 0; i < 5; i++) {
            let randomTime = Math.random() * 1;
            this.scheduleOnce(() => {
                let xinBoomFish = this.createBoomFish();
                let randomX = (Math.random() - 0.5) * (this.game.halfSW - 100);
                let randomY = (Math.random() - 0.5) * (this.game.halfSH - 100);
                xinBoomFish.position = cc.v2(randomX, randomY);
                xinBoomFish.active = true;

                let anim = xinBoomFish.getComponent(cc.Animation);
                anim.play();

                this.hideBoomFish(xinBoomFish);
            }, randomTime);
        }

        this.scheduleOnce(() => {
            for (let j = 0; j < fishArr.length; j++) {
                this.game.fishMgr.fishDieByFishId(fishArr[j], "0", pos);
            }
        }, 1);

        let p = this.game.plyMgr.getPlyByPos(pos);
        if (p.isMe) {
            this.scheduleOnce(() => {
                this.showMakeMoneyAnimation(gainMoney);
            }, 2);
        } else {
            p.incCoin(gainMoney);
            return;
        }

    }

    public showMakeMoneyAnimation(gainMoney: string) {
        if (this.makeMoneyNode.active) {
            let p = this.game.plyMgr.me;
            p.incCoin(gainMoney);
            return;
        }
        this.makeMoneyNode.active = true;
        this.game.byAudio.playFacailiSound();
        this.makeMoneyNode.opacity = 255;

        let par = this.makeMoneyNode.getChildByName("lizi")
        par.active = true;
        par.opacity = 255;
        par.getComponent(cc.ParticleSystem).resetSystem();
        this.scheduleOnce(() => {
            par.active = false;
        }, 4);


        let aim = this.makeMoneyNode.getComponent(cc.Animation);
        aim.play();


        let label = this.makeMoneyNode.getChildByName("moneylabel").getComponent(cc.Label);
        label.string = "0";

        let jiange = this.makeMoneNumBeatTime / 100
        let meiciMoney = +gainMoney / 100
        if (meiciMoney < 0.0051) {
            meiciMoney = 0.0051;
        }
        this.schedule(() => {
            let lastMoney = parseFloat(label.string);

            let money = new Decimal(lastMoney).add(meiciMoney).toNumber()
            let gmoney = +gainMoney;
            if (gmoney <= money) {
                label.string = gmoney.toFixed(2).toString();
            } else {
                if (money < 0.01) {
                    label.string = money.toFixed(4);;
                } else {
                    label.string = money.toFixed(2);
                }

            }
        }, jiange, 100)

        this.scheduleOnce(() => {
            this.makeMoneyNode.active = false;
            let incCoinLable = this.cionLableNode[this.game.plyMgr.mySeat];
            incCoinLable.getComponent(cc.Animation).stop();
            incCoinLable.getComponent(cc.Label).string = "+" + (+gainMoney).toFixed(2);
            incCoinLable.getComponent(cc.Animation).play();
            let p = this.game.plyMgr.me;
            p.incCoin(gainMoney);
        }, 5);
    }

    public playBossComing() {

        this.bossComeNode.active = true;
        let aim = this.bossComeNode.getComponent(cc.Animation);
        aim.play();

        this.game.byAudio.playBossComingSound();

        this.scheduleOnce(() => {
            this.game.byAudio.playBossingBgMusic(0);
        }, 3);

        this.scheduleOnce(() => {
            this.bossComeNode.active = false;
        }, 18);
    }

    public hideBg2() {
        this.bg2.opacity = 255;
        //this.bg2.runAction(cc.fadeOut(3));
        cc.tween(this.bg2).to(3, { opacity: 0 }).start();
        this.scheduleOnce(() => {
            this.bg2.active = false;
        }, 3);
    }

    public playWaveAim() {
        this.wave.active = true;
        this.wave.getComponent(cc.Animation).play();
        let action = cc.callFunc(this.resetWave, this);
        let callBack = cc.callFunc(this.playMusicCallBack, this);

        this.fishMassComeNode.active = true;
        this.fishMassComeNode.getComponent(cc.Animation).play();

        this.bg2.active = true;
        this.bg2.opacity = 0;
        //this.bg2.runAction(cc.fadeIn(6.0));
        cc.tween(this.bg2).to(6.0, { opacity: 255 }).start();
        this.game.byAudio.playFishtideSound();
        let actions = cc.sequence(cc.moveTo(4.2, cc.v2(-this.game.halfSW * 2 - 300, 0)), callBack, cc.delayTime(3), action)
        //this.wave.runAction(actions);
        cc.tween(this.wave).then(actions).start();
        // cc.tween(this.wave)
        //     .to(4.2, { position: cc.v2(-this.game.halfSW * 2 - 300, 0) })
        //     .then(callBack)
        //     .delay(3)
        //     .then(action)
        //     .start();
    }

    private playMusicCallBack() {
        this.game.byAudio.playNormalBgMusic();
    }


    private resetWave() {
        this.wave.active = false;
        this.fishMassComeNode.active = false;
        this.wave.setPosition(cc.v2(this.game.halfSW + 150, 0));
    }

    // 播放冰冻特效
    public playFrozenAnimation(time: number) {

        cc.log("冰冻");
        this.game.byAudio.playForzeSound();

        for (let i = 0; i < this.game.fishLayer.children.length; i++) {
            let fishNode = this.game.fishLayer.children[i];
            let fish = fishNode.getComponent(BYFish);
            if (fishNode.active && !fish.isDieing) {

                fish.chgSpineState(false);
                fish.shaderSetDefault();

                cc.director.getScheduler().pauseTarget(fish);
                cc.director.getActionManager().pauseTarget(fishNode);

                fish.chgIceState(true);
                cc.director.getActionManager().removeAllActionsFromTarget(fish.ice, true);
                //fish.ice.runAction(cc.sequence(cc.delayTime(8), cc.fadeOut(2)));
                cc.tween(fish.ice).delay(8).to(2, { opacity: 0 }).start();
                this.scheduleOnce(() => {
                    this.resumeFish(fishNode);
                }, 10);
            }
        }


    }

    public resumeFish(fishNode: cc.Node) {
        let fish = fishNode.getComponent(BYFish);
        if (fishNode.active && !fish.isDieing) {
            fish.chgSpineState(true);
            cc.director.getActionManager().resumeTarget(fishNode);
            cc.director.getScheduler().resumeTarget(fish);
        }
    }

    // 美人鱼
    public playMermaidAnimation(gainMoney: string, pos: number) {

        let currentFish = undefined;
        let location = this.game.plyMgr.toGameLocation(pos);
        for (let i = 0; i < this.game.fishLayer.children.length; i++) {
            let fish = this.game.fishLayer.children[i];
            if (fish.active && fish.getComponent(BYFish).typeId === BYFishMgr.mermaidType) {
                currentFish = fish;
                break;
            }
        }

        if (currentFish == undefined) {
            return;
        }

        // this.hearts.position = currentFish.position;
        this.hearts.position = cc.v3(0, 0);
        this.hearts.active = true;
        for (let j = 0; j < this.hearts.children.length; j++) {
            let heart = this.hearts.children[j];
            heart.position = cc.v3(0, 0);
            heart.active = true;
            let rand1 = Math.random() * 600 - 300;
            let rand2 = Math.random() * 600 - 300;
            let rand3 = Math.random() * 0.5;
            let moveto = cc.moveBy(1.5, cc.v2(rand1, rand2)).easing(cc.easeElasticOut(1.0));
            heart.opacity = 255;

            let time = 0;
            let ss = cc.sequence(moveto, cc.moveBy(0.3 + rand3, cc.v2(-50, 20)), cc.moveBy(0.6 + rand3, cc.v2(100, 40))
                , cc.moveBy(0.6 + rand3, cc.v2(-100, 40)), cc.moveBy(0.6 + rand3, cc.v2(100, 40))
                , cc.moveBy(0.6 + rand3, cc.v2(-100, 40)), cc.fadeOut(2));
            time = 4.7 + rand3 * 5;

            this.heartBoom(heart, time, location);
            //heart.runAction(ss);
            cc.tween(heart).then(ss).start();
        }

        if (location != this.game.plyMgr.mySeat) {
            let p = this.game.plyMgr.getPlyBySeat(location);
            p.incCoin(gainMoney);
            return;
        }

        this.scheduleOnce(() => {
            this.showMakeMoneyAnimation(gainMoney);
        }, 4);
    }


    public heartBoom(heart: cc.Node, time: number, location: number) {
        this.scheduleOnce(() => {

            this.playBlueBoomAinmation(cc.v2(heart.x + heart.parent.x, heart.y + heart.parent.y));
            this.playCoinAnim(cc.v2(heart.x + heart.parent.x, heart.y + heart.parent.y), location, "0");
        }, time);

    }


    public showThisIsGun(location: number) {
        let paotaiAim = this.hereIsGun[location];
        paotaiAim.active = true;
        paotaiAim.getChildByName("zhelishipaot").getComponent(cc.Animation).play();

        this.scheduleOnce(() => {
            paotaiAim.active = false;
        }, 4);
    }


    public delFishDie(fishNode: cc.Node, pos: number, fishType: number, gainMoney: string) {

        let tmpPos = this.game.toWroldPos(fishNode.getPosition(), fishNode.parent.getPosition());
        let tmpType = getFishKindType(fishType);
        if (tmpType > 3 && tmpType < 9 && +gainMoney > 0) {
            let p = this.game.plyMgr.getPlyByPos(pos);
            p.showRoulette(fishType, gainMoney);
        } else if (tmpType > 4) {
            this.playBlueBoomAinmation(tmpPos, true);
        }
    }


}