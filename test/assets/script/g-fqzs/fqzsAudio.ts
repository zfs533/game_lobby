import Audio from "../g-share/audio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FQZSAudio extends Audio {
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

    @property({ type: cc.AudioClip })
    private round: cc.AudioClip = undefined;
    @property({ type: cc.AudioClip })
    private round2: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private openPrize: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    private shapeArr: cc.AudioClip[] = [];

    private roundId = 0;

    onLoad() {
        this.playMusic();
    }

    playMusic() {
        Audio.playMusic(this.bgm);
        // cc.audioEngine.setCurrentTime(Audio.playingBgm, 5);
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

    playRound() {
        // this.stopMusic();
        // Audio.playMusic(this.round);
        // this.roundId = this.play(this.round);
    }
    playRound2() {
        // this.stopMusic();
        // Audio.playMusic(this.round);
        // this.roundId = this.play(this.round);
        // if (cc.audioEngine.getState(this.roundId) != cc.audioEngine.AudioState.PLAYING) {

        if (!this.roundId || cc.audioEngine.getCurrentTime(this.roundId) > 0.08 || cc.audioEngine.getCurrentTime(this.roundId) == 0) {
            this.roundId = this.play(this.round2);
        }

        // this.roundId = this.play(this.round2);
    }


    stopRound() {
        this.stopMusic();
        // Audio.playMusic(this.bgm);
        // if (this.roundId != 0)
        //     this.stop(this.roundId);
    }
    playOpenPrize() {
        this.stopMusic();
        Audio.playMusic(this.openPrize);
    }

    stopOpenPrize() {
        this.stopMusic();
        Audio.playMusic(this.bgm);

    }

    setCurrentBgmTime() {
        this.stopMusic();
        Audio.playMusic(this.bgm);
        cc.audioEngine.setCurrentTime(Audio.playingBgm, 5);
    }


    onDestroy() {
        this.stopMusic();
    }

}
