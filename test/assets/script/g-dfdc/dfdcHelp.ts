
import DFDCAudio from "./dfdcAudio";
const { ccclass, property } = cc._decorator;

@ccclass
export default class DFDCHelp extends cc.Component {


    audioMgr: DFDCAudio;
    show(audioMgr: DFDCAudio) {
        this.audioMgr = audioMgr;
        this.node.active = true;
    }

    hide() {
        this.audioMgr.playButtonClickSound();
        this.node.active = false;
    }

}
