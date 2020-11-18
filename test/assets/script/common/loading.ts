const { ccclass, property } = cc._decorator

@ccclass
export default class Loading extends cc.Component {


    @property(cc.Label)
    info: cc.Label = undefined;

    @property(cc.Animation)
    loadingAni: cc.Animation = undefined;

    private showing: boolean;
    onLoad() {
        // init logic
        this.info.string = "请等待";
    }

    show(info?: string) {
        this.node.active = true
        this.loadingAni.play();
        this.info.string = info || "请等待"
        if (this.showing) {
            return;
        }
        this.showing = true;
        this.node.active = true;
        //this.node.opacity = 0;
        this.node.stopAllActions();
        // this.node.runAction(cc.fadeIn(0.5));
    }

    close() {
        // let closeActions: cc.FiniteTimeAction[] = [];
        // closeActions.push(cc.fadeOut(0.2));
        // closeActions.push(cc.callFunc(() => {
        //     this.showing = false;
        //     this.node.destroy();
        // }));
        // this.node.stopAllActions();
        this.loadingAni.stop();
        //this.node.runAction(cc.sequence(closeActions));
        cc.tween(this.node)
            .to(0.2, { opacity: 0 })
            .call(
                () => {
                    this.showing = false;
                    this.node.destroy();
                }
            ).start();
    }
}
