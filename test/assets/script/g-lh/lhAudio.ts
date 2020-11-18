import Audio from "../g-share/audio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LhAudio extends Audio {
    @property({ type: cc.AudioClip })
    private bgm: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private vs: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private startBet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private stopBet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private doBet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private bet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private flipCard: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private showCard: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private winBet: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    private lhWinBets: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private points: cc.AudioClip[] = [];

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

    playDoBeting() {
        this.play(this.doBet);
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

    playWinBet() {
        this.play(this.winBet);
    }

    playWinArea(area: number) {
        this.play(this.lhWinBets[area]);
    }

    playPoint(cardData: number) {
        let realPoint: number = cardData & 0x0f;
        this.play(this.points[realPoint - 1]);
    }

    playVsSound() {
        this.play(this.vs);
    }

    onDestroy() {
        this.stopMusic();
    }

}
