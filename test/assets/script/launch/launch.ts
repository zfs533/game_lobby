import { fitCanvas, fixInstallPath } from "../common/util";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Launch extends cc.Component {
    @property(cc.Node)
    private nodeLogo: cc.Node = undefined;

    @property(cc.Node)
    private nodeCanvas: cc.Node = undefined;

    protected onLoad() {
        this.nodeLogo.opacity = 0;
        fitCanvas(this.nodeCanvas);
    }

    protected async start() {

        let p1 = new Promise(resolve => {
            cc.tween(this.nodeLogo).to(0.5, { opacity: 255 }).delay(1).call(
                () => {
                    resolve();
                }
            ).start();
        });
        let p2 = new Promise(resolve => {
            cc.director.preloadScene("start", resolve);
        });

        await Promise.all([p1, p2]);

        cc.tween(this.nodeLogo).to(0.5, { opacity: 0 }).call(
            () => {
                fixInstallPath();
                cc.director.loadScene("start");
            }
        ).start();
    }
}
