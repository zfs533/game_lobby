import BYGame from "./byGame";
import { random } from "../common/util";
const { ccclass, property } = cc._decorator;
@ccclass
export default class BYFishnetMgr extends cc.Component {

    public game: BYGame = undefined;

    private netPool: cc.Node[][] = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];


    onLoad() {
        let game = cc.find("game");
        this.game = game.getComponent(BYGame);
    }

    onDestroy() {
    }

    getOneFishNet(seat: number) {
        let p = this.game.plyMgr.getPlyBySeat(seat);
        let oneNetPool = this.netPool[p.gunSpType];
        let fishNet = undefined;
        for (let i = 0; i < oneNetPool.length; i++) {
            fishNet = oneNetPool[i];
            if (!fishNet.active) {
                return fishNet;
            }
        }
        fishNet = cc.instantiate(p.fishNetNode);
        oneNetPool.push(fishNet);
        this.node.addChild(fishNet);
        return fishNet;
    }
    public createFishNet(seat: number, pos: cc.Vec2) {
        let p = this.game.plyMgr.getPlyBySeat(seat);
        let net = this.getOneFishNet(seat);
        net.active = true;
        net.opacity = 0;
        net.scale = 1;
        //net.runAction(cc.fadeIn(0.1));
        cc.tween(net).to(0.1, { opacity: 255 }).start();
        let random3 = random(-30, 30);
        let random4 = random(-30, 30);
        net.position = cc.v2(pos.x + random3, pos.y + random4);
        let time = 0.3;
        if (p.gunSpType > 1) {
            //net.runAction(cc.rotateBy(0.55, 239));
            cc.tween(net).by(0.55, { angle: -239 }).start();
            time = 0.3;
        }

        this.scheduleOnce(() => {
            let callBack = cc.callFunc(() => {
                net.active = false;
            });
            //net.runAction(cc.sequence(cc.scaleTo(0.15, 0.39), callBack));
            //cc.log('byfishnetMgr-3')
            cc.tween(net).then(cc.scaleTo(0.15, 0.39)).then(callBack).start();
        }, time);

        return;
    }

}
