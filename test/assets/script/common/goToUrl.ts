const { ccclass, property } = cc._decorator;

@ccclass
export default class GoToUrl extends cc.Component {
    private url: string;
    private cb: Function;

    protected onLoad() {
        this.node.active = false;
    }

    protected start() {
        this.node.opacity = 0;
        //this.node.runAction(cc.fadeIn(0.2));
        cc.tween(this.node).to(0.2, { opacity: 255 }).start();
    }

    show(url: string, cb?: Function) {
        this.url = url;
        if (cb) {
            this.cb = cb;
        }
        this.node.active = true;
    }

    private onClickScreen() {
        if (this.url) {
            cc.sys.openURL(this.url);
        }
        if (this.cb) {
            this.cb();
        }
        this.node.opacity = 0;
        this.node.destroy();
    }
}
