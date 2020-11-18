const { ccclass, property } = cc._decorator;

@ccclass
export default class UsdtHelpNode extends cc.Component {

    @property(cc.Node)
    videoteach: cc.Node = undefined;

    @property(cc.VideoPlayer)
    videoplayer: cc.VideoPlayer = undefined;

    onLoad() {
        this.videoteach.active = false;
    }

    onDisable() {
        this.videoplayer.stop();
    }

    showVedioTeach() {
        this.videoteach.active = true;
        this.videoplayer.play();
    }


}
