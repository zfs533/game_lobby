import LobbyUser from "./lobbyUser";
import { showLoading, hideLoading } from "../common/ui";
import { addSingleEvent } from "../common/util";
import Audio from "../g-share/audio";
const { ccclass, property } = cc._decorator;

@ccclass
export default class PopActionBox extends cc.Component {
    @property(cc.Node)
    protected nodeBg: cc.Node = undefined;

    @property(cc.Node)
    protected nodeBox: cc.Node = undefined;

    @property(cc.Button)
    protected btnClose?: cc.Button = undefined

    private bgOpacity: number;
    private _user: LobbyUser;
    public autoDestroy = true;
    public scaleNormal: number = 1;
    get user() {
        if (!this._user) {
            let topNode = cc.find("Canvas/top");
            this._user = topNode.getComponent(LobbyUser);
        }
        return this._user;
    }
    protected onLoad() {
        this.nodeBg.width = 1400;
        this.nodeBg.active = false;
        this.nodeBox.active = false;
        this.bgOpacity = this.nodeBg.opacity;
        if (this.btnClose) {
            let handler = new cc.Component.EventHandler()
            handler.target = this.node
            handler.component = cc.js.getClassName(this)
            handler.handler = 'onClickClose'
            addSingleEvent(this.btnClose, handler)
        }
    }

    protected start() {
        this.openAnim();
    }

    openAction(parent: cc.Node, child: cc.Prefab) {
        showLoading("");
        let ui = cc.instantiate(child);
        parent.addChild(ui);
        hideLoading();
        return ui;
    }
    openAnim(cb?: Function) {
        this.node.active = true;
        this.node.position = cc.v3()
        this.nodeBg.active = true;
        this.nodeBox.active = true;
        let animTime = 0.3;
        this.nodeBg.opacity = 0;
        //this.nodeBg.runAction(cc.fadeTo(animTime, this.bgOpacity));
        cc.tween(this.nodeBg).to(animTime, { opacity: this.bgOpacity }).start();
        this.nodeBox.scale = 0;
        let actions = cc.sequence(
            cc.scaleTo(animTime, this.scaleNormal, this.scaleNormal).easing(cc.easeBackOut()),
            cc.callFunc(() => {
                this.node.emit("open");
                if (cb) cb();
            }),
        )
        // this.nodeBox.runAction(actions);
        cc.tween(this.nodeBox).then(actions).start();

    }
    protected onClickClose() {
        Audio.PlayClick()
        this.closeAction()
    }
    protected closeAction(cb?: Function) {
        let animTime = 0.3;
        //this.nodeBg.runAction(cc.fadeTo(animTime, 0));
        cc.tween(this.nodeBg).to(animTime, { opacity: 0 }).start();
        let actions = cc.sequence(
            cc.scaleTo(animTime, 0).easing(cc.easeBackIn()),
            cc.callFunc(() => {
                if (cb && typeof cb === "function")
                    cb();
                this.node.active = false;
                this.node.emit("close");
                if (this.autoDestroy) {
                    this.node.removeFromParent(true);
                    this.node.destroy();
                }
            }))
        // this.nodeBox.runAction(actions);
        cc.tween(this.nodeBox).then(actions).start();
        // cc.tween(this.nodeBox)
        //     .to(animTime, { scale: 0 }, { easing: 'quadIn' })
        //     .call(
        //         () => {
        //             if (cb && typeof cb === "function")
        //                 cb();
        //             this.node.active = false;
        //             this.node.emit("close");
        //             if (this.autoDestroy) {
        //                 this.node.removeFromParent(true);
        //                 this.node.destroy();
        //             }
        //         }
        //     )
        //     .start();
    }
    show() {
        this.node.active = true
        this.nodeBox.scale = 1
        this.nodeBg.opacity = this.bgOpacity
    }
    hide() {

    }
}
