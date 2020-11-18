import DFDCEgg from "./dfdcEgg";
import { randomMinus1To1 } from "../common/util";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DFDCEggItem extends cc.Component {
    @property(cc.Node)
    front: cc.Node = undefined;

    @property(cc.Node)
    wait: cc.Node = undefined;

    @property(cc.Node)
    Reverse: cc.Node = undefined;

    @property(cc.Node)
    motion: cc.Node = undefined;

    @property([cc.Node])
    Click: cc.Node[] = [];

    @property([cc.Node])
    icon: cc.Node[] = [];

    @property([cc.Node])
    quan: cc.Node[] = [];

    gameEgg: DFDCEgg;

    public isFlipEnd = false;
    public itemIdx: number = 0;
    private starpoint: cc.Vec2 = cc.v2(0, 240);
    private Peakpoint: cc.Vec2[] = [cc.v2(-200, 500), cc.v2(200, 500)];
    public iconIdx = 0;
    async init(game: DFDCEgg, idx: number, id?: number) {
        this.gameEgg = game;
        this.itemIdx = idx;
        let random = Math.floor(Math.random() * 10);
        let randoms = 0;
        if (random > 5) {
            randoms = 1;
        }
        await this.mobileAnim(this.itemIdx, randoms);
        if (id) {
            //cc.log("<<<<<<<<<<初始化sfEggItemID    ", id)
            this.gameEgg.openedId.push(id);
            // let sp = this.front.getComponent(cc.Sprite);
            // sp.spriteFrame = this.gameEgg.sfEggItem[id];
            this.isFlipEnd = true;
            // this.front.active = true;
            this.downAnim();
        } else {
            // this.front.active = false;
            this.wait.active = true;
            this.wait.getComponent(cc.Animation).play();
            this.isFlipEnd = false;
            // cc.log("<<<<<<<打开闲置动作");
        }
        // console.log("cccccccccccc");
    }

    public initia() {
        //this.front.active = false;
        this.downAnim();
        this.isFlipEnd = false;
        // console.log("bbbbbbbbb");
    }

    private downAnim() {
        this.wait.active = false;
        // this.Reverse.active = false;
        //this.motion.active = false;
        for (let k = 0; k < this.Click.length; k++) {
            this.Click[k].active = false;
            this.icon[k].active = false;
            this.quan[k].active = false;
        }
    }

    private mobileAnim(moid: number, random: number) {
        return new Promise(resolve => {
            // console.log("金币飞的动画");
            this.node.position = cc.v3(this.starpoint);
            this.node.scale = 0;
            let Mdian1 = this.starpoint
            let Mdian2 = this.Peakpoint[random];
            let Mdian3 = this.gameEgg.endpoint[moid];
            if (moid === 3) {
                // console.log(Mdian3.x);
            }
            let beizier = [Mdian1, Mdian2, Mdian3];
            this.node.active = true;
            this.wait.active = true;
            this.node.angle = -randomMinus1To1() * 90;
            //this.motion.active = true;
            //cc.log('dfdcEggItem--jinbidonghua')
            cc.tween(this.node).sequence(
                cc.spawn(
                    cc.bezierTo(0.7, beizier),
                    cc.scaleTo(0.7, 1),
                    cc.rotateTo(0.5, 0)
                ),
                cc.callFunc(() => {
                    //this.motion.active = false;
                    resolve();
                }),
            ).start();
            // console.log("金币飞的动画11111");
        });
    }

    public onClickItem() {
        let limit = this.gameEgg.flipNum;
        if (!this.gameEgg.canFlip || this.isFlipEnd || this.gameEgg.flipedNum >= limit) return;
        if (this.gameEgg.pand) return;
        let id = this.gameEgg.itemIds.shift();
        this.gameEgg.game.msg.sendDoOpenEgg(id, this.itemIdx);
        this.flip(id, this.itemIdx, true);
        // cc.log("<<<<<<点击金币");

    }
    async flip(icon: number, idx: number, isPlayerOnClick: boolean) {
        this.wait.active = false;
        // this.Reverse.active = true;
        this.isFlipEnd = true;
        //this.Reverse.active = false;
        if (isPlayerOnClick) {
            this.gameEgg.game.audioMgr.playFlipEgg();
            this.playAni(this.icon[icon]);
            this.playAni(this.Click[icon]);
            this.gameEgg.flipedNum++;
            this.gameEgg.openedId.push(icon);
            this.iconIdx = icon;
            this.gameEgg.checkItems(this.gameEgg.openedId, idx);
        }
        // let sp = this.front.getComponent(cc.Sprite);
        // sp.spriteFrame = this.gameEgg.sfEggItem[icon];
        // this.front.active = true;

    }

    //播放动画
    public playAni(nodeAnim: cc.Node) {
        return new Promise(resolve => {
            nodeAnim.active = true;
            let anim = nodeAnim.getComponent(cc.Animation);
            if (!anim) {
                cc.warn("no anim");
                resolve(false);
                return;
            }
            if (anim.defaultClip) {
                anim.play();
            } else {
                let clips = anim.getClips();
                if (!clips || clips.length === 0) {
                    resolve(false);
                    return;
                }
                anim.play(clips[0].name);
            }
            anim.on("finished", function () {
                resolve(true);
            });
        });
    }

}
