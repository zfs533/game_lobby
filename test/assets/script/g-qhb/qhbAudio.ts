import Audio from "../g-share/audio";

const {ccclass, property} = cc._decorator;

@ccclass
export default class QHBAudio extends Audio {
    @property({ type: cc.AudioClip })
    private bgm: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private clickGrab: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private boom: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private bigWin: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private grabed: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private notGrabed: cc.AudioClip = undefined;



    onLoad() {
        this.playMusic();
    }

    playMusic() {
        Audio.playMusic(this.bgm);
    }

    playClickGrabBtn() {
        this.play(this.clickGrab);
    }

    playBoom() {
        this.play(this.boom);
    }

    playBigWin() {
        this.play(this.bigWin);
    }

    playGrabed() {
        this.play(this.grabed);
    }

    playNotGrabed() {
        this.play(this.notGrabed);
    }
}
