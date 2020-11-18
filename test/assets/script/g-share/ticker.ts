import Audio from "./audio"
import { SCENE_NAME } from "../common/cfg";
import { GameId } from "../common/enum";
const { ccclass, property } = cc._decorator;

enum STYLE { Normal, Alert }

@ccclass
export default class Ticker extends cc.Component {
    @property(cc.Node)
    bgAni: cc.Node = undefined

    @property(cc.Label)
    lab: cc.Label = undefined

    @property({ type: cc.Enum(STYLE) })
    private style: STYLE = STYLE.Normal

    private originalPos: cc.Vec2;
    private downLoadCallback: Function;

    onLoad() {
        this.originalPos = <cc.Vec2>this.node.position
    }

    show(time: number, cb?: Function): void {

        if (this.bgAni.getComponent(cc.Label)) {
            this.lab.node.active = true;
        }

        this.downLoadCallback = cb;
        this.node.active = true
        let t = Math.round(time)
        this.lab.string = t.toString()
        this.unschedule(this.cd)
        this.schedule(this.cd, 1, t, 1)
        this.node.stopAllActions()
        if (this.originalPos) {
            this.node.setPosition(this.originalPos)
        }

        this.node.scale = 0
        let actions = cc.sequence(
            cc.moveBy(0, 0, -45),
            cc.spawn(
                cc.scaleTo(0.1, 1, 1),
                cc.moveBy(0.3, 0, 45).easing(cc.easeBackOut()),
                cc.fadeIn(0.3)
            )
        )
        // this.node.runAction(actions)
        cc.tween(this.node).then(actions).start();
    }
    hide(): void {
        this.node.stopAllActions()
        if (this.originalPos) {
            this.node.setPosition(this.originalPos)
        }
        this.node.scale = 1
        let actions = cc.sequence(
            cc.spawn(
                cc.scaleTo(0.1, 0, 0),
                cc.moveBy(0.3, 0, -45).easing(cc.easeBackIn()),
                cc.fadeOut(0.3)
            ),
            cc.callFunc(() => { this.node.active = false })
        )
        // this.node.runAction(actions)
        cc.tween(this.node).then(actions).start();
    }

    private cd() {
        let t = +this.lab.string || 0
        t--
        t = Math.max(t, 0)
        switch (this.style) {
            case STYLE.Normal:
                if (t > 0 && this.node.active) {
                    this.lab.string = t.toString()
                }
                break
            case STYLE.Alert:
                if (t <= 3) {
                    this.bgAni.active = true;
                    this.bgAni.stopAllActions()
                    this.bgAni.opacity = 255
                    this.bgAni.scale = 1;
                    if (t != 0) {
                        Audio.TimeCountDown();
                    }
                    let actionTime = 0.5
                    //this.bgAni.runAction(cc.spawn(cc.scaleTo(actionTime, 2), cc.fadeTo(actionTime, 0)))
                    cc.tween(this.bgAni)
                        .parallel(
                            cc.tween().to(actionTime, { scale: 2 }),
                            cc.tween().to(actionTime, { opacity: 0 })
                        ).start();
                    if (this.bgAni.getComponent(cc.Label)) {
                        this.bgAni.getComponent(cc.Label).string = t.toString();
                        this.lab.node.active = false;
                    }

                }
                this.lab.string = t.toString()
                break
        }
        if (this.downLoadCallback) {
            this.downLoadCallback(t);
        }
    }
}
