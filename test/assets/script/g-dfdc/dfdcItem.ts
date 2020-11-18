import DFDCGame from "./dfdcGame";
import { random } from "../common/util";

const { ccclass, property } = cc._decorator;

export enum ItemId {
    nine = 1,
    ten,
    jack,
    queen,
    king,
    AAA,
    fuXiJie,            //伏羲戒
    shenNongYu,         //神农玉
    shenNongYu_J,       //金色神农玉
    tianFeng,           //天凤
    tianFeng_J,         //金色天凤
    xianLi,             //仙鲤
    xianLi_J,           //金色仙鲤
    qingLong,           //青龙
    qingLong_J,         //金色青龙
    scatter,            //免费
    wild,               //百搭
    diamond,            //钻石
}


@ccclass
export default class DFDCItem extends cc.Component {
    @property(cc.Sprite)
    spBg: cc.Sprite = undefined;

    @property(cc.Sprite)
    spItem: cc.Sprite = undefined;

    @property(cc.Node)
    ndWinLight: cc.Node = undefined;
    private game: DFDCGame;
    private maxY = 0;
    private minY = 0;
    public id: number = 0;
    public isSpin: boolean = false;
    public spinSpeed: number = 1;
    public stopDelayTime = 0.2;
    public startDelayTime = 0.1;
    init(game: DFDCGame, id: number, speed: number, maxY: number, minY: number, startDelayTime: number, stopDelayTime: number) {
        this.game = game;
        this.ndWinLight.active = false;
        this.setBg(id);
        this.setId(id);
        this.setSpeed(speed);
        this.setPosYLimit(maxY, minY);
        this.setDealyTime(startDelayTime, stopDelayTime);
    }

    private setBg(id: number) {
        if (id < ItemId.shenNongYu) {
            this.spBg.node.active = false;
        } else {
            this.spBg.node.active = true;
            if (id < ItemId.tianFeng) {
                this.spBg.spriteFrame = this.game.sfSlotsItemBgs[0];
            } else if (id < ItemId.xianLi) {
                this.spBg.spriteFrame = this.game.sfSlotsItemBgs[1];
            } else if (id < ItemId.qingLong) {
                this.spBg.spriteFrame = this.game.sfSlotsItemBgs[2];
            } else if (id < ItemId.scatter) {
                this.spBg.spriteFrame = this.game.sfSlotsItemBgs[3];
            }
            if (id === ItemId.shenNongYu || id === ItemId.tianFeng || id === ItemId.xianLi || id === ItemId.qingLong) {
                this.spBg.spriteFrame = this.game.sfSlotsItemBgs[4];
            }
        }
    }

    private setId(id: number) {
        this.id = id;
        this.setSprite(id);
    }

    private setSprite(id: number) {
        this.spItem.node.active = false;
        this.spItem.node.active = true;
        this.ndWinLight.active = false;
        let idx = id - 1;
        let sf = this.game.sfSlotsItems[idx];
        this.spItem.spriteFrame = sf;
        if (id === ItemId.diamond) {
            this.ndWinLight.active = true;
            this.ndWinLight.getComponent(cc.Sprite).spriteFrame = this.game.diamondItem[this.game.diamondDoudle - 1];
        }
    }

    private setSpeed(speed: number) {
        this.spinSpeed = speed;
    }

    private setPosYLimit(maxY: number, minY: number) {
        this.maxY = maxY;
        this.minY = minY;
    }

    private setDealyTime(start: number, stop: number) {
        this.startDelayTime = start;
        this.stopDelayTime = stop;
    }

    update() {
        if (this.isSpin) {
            this.spin();
        }
    }

    private spin() {
        let offsetY = this.node.y;
        offsetY += this.spinSpeed;
        this.node.setPosition(this.node.x, offsetY);
        if (offsetY <= this.minY) {
            let rand = 0;
            if (this.game.isFree) {
                rand = random(0, 6);
            }
            else {
                rand = random(0, this.game.randomSlots.length - 1);
            }
            this.setBg(rand);
            this.setId(this.game.randomSlots[rand]);
            this.node.setPosition(this.node.x, this.maxY);
        }
    }

    private startSpin() {
        this.isSpin = true;
    }

    stopSpin() {
        this.isSpin = false;
        this.stopAction();
    }

    startAction() {
        //let action1 = cc.moveBy(this.startDelayTime, 0, 40);
        //this.node.runAction(action1);
        cc.tween(this.node).by(this.startDelayTime, { position: cc.v2(0, 40) }).start();
        this.scheduleOnce(this.startSpin, this.startDelayTime);
    }

    private stopAction() {
        // let moveDown1 = cc.moveBy(0.2, 0, -150);
        // let moveDown2 = cc.moveBy(0.1, 0, -40);
        // let moveUp2 = cc.moveBy(0.05, 0, 40);
        // this.node.runAction(cc.sequence(moveDown1, moveDown2, moveUp2));
        cc.tween(this.node)
            .by(0.2, { position: cc.v2(0, -150) })
            .by(0.1, { position: cc.v2(0, -40) })
            .by(0.05, { position: cc.v2(0, 40) })
            .start();
    }

    setResult(id: number, y: number) {
        this.setBg(id);
        this.setId(id);
        this.node.setPosition(this.node.x, y);
    }

    //闪烁效果
    private winAction() {
        let winAction = cc.fadeTo(0.1, 0);
        let winAction1 = cc.fadeTo(0.1, 255);
        let winAction2 = cc.sequence(winAction1, cc.delayTime(0.4), winAction, cc.delayTime(0.4)).repeatForever();
        this.spItem.node.opacity = 255;
        //this.spItem.node.runAction(winAction2);
        //cc.log("dfdcitem-winaction")
        cc.tween(this.spItem.node).then(winAction2).start();
    }


    showWinEffect() {

        this.winAction();
    }

    hideWinEffect() {
        this.spItem.node.stopAllActions();
        this.spItem.node.scale = 1;
        this.spItem.node.angle = 0;
        this.spItem.node.opacity = 255;
        //cc.log("<<<<<<<<<关闭特效111", this.spItem.node.active);

    }
}
