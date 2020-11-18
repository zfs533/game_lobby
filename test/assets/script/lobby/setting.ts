import PopActionBox from "../lobby/popActionBox"
import LoginHelper from "../start/loginHelper";
import { soundCfg, musicCfg, shiftMusic, shiftSound } from "../common/cfg"
import Audio from "../g-share/audio"
import g from "../g"

const { ccclass, property } = cc._decorator

@ccclass
export class Setting extends PopActionBox {
    @property(cc.Button)
    btnMusic: cc.Button = undefined

    @property(cc.Button)
    btnSound: cc.Button = undefined

    @property(cc.Node)
    nodeLogin: cc.Node = undefined

    @property([cc.SpriteFrame])
    sfAudio: cc.SpriteFrame[] = []

    @property(cc.Label)
    private labVer: cc.Label = undefined

    onLoad() {
        super.onLoad()
    }

    start() {
        super.start()
        this.setDefault()
        this.labVer.string = g.hotVer
    }

    setDefault() {
        this.btnMusic.getComponent(cc.Sprite).spriteFrame = this.sfAudio[musicCfg()]
        this.btnSound.getComponent(cc.Sprite).spriteFrame = this.sfAudio[soundCfg()]
    }

    hideReLogin() {
        this.nodeLogin.active = false
    }

    onClickSound() {
        shiftSound()
        this.btnSound.getComponent(cc.Sprite).spriteFrame = this.sfAudio[soundCfg()]
    }

    onClickMusic() {
        shiftMusic()
        this.btnMusic.getComponent(cc.Sprite).spriteFrame = this.sfAudio[musicCfg()]
        if (musicCfg()) {
            if (g.hallVal.currBgmClip)
                Audio.playMusic(g.hallVal.currBgmClip)
        } else {
            cc.audioEngine.stopAll()
        }
    }

    private onClickReLogin() {
        LoginHelper.returnToLogin();
    }
}
