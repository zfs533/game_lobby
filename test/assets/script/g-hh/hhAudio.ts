import Audio from "../g-share/audio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HHAudio extends Audio {
    @property({ type: cc.AudioClip })
    private bgm: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private startBet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private stopBet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private bet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private flipCard: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private showCard: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private winBet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private alert: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    private shapeArr: cc.AudioClip[] = [];

    onLoad() {
        this.playMusic();
    }

    playMusic() {
        Audio.playMusic(this.bgm);
    }

    playStart() {
    }

    playStartBet() {
        this.play(this.startBet);
    }

    playStopBet() {
        this.play(this.stopBet);
    }

    playBet() {
        this.play(this.bet);
    }

    playFlip() {
        this.play(this.flipCard);
    }

    playShow() {
        this.play(this.showCard);
    }

    playShape(shape: number) {
        this.play(this.shapeArr[shape]);
    }

    playWinBet() {
        this.play(this.winBet);
    }

    onDestroy() {
        this.stopMusic();
    }

}
