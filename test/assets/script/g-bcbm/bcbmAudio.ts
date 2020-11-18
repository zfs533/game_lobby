import Audio from "../g-share/audio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BCBMAudio extends Audio {
    @property({ type: cc.AudioClip })
    private bgm: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private startBet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private startBetBg: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private stopBet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private bet: cc.AudioClip = undefined;


    @property({ type: cc.AudioClip })
    private winBet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private alert: cc.AudioClip = undefined;


    /********************** */
    @property({ type: cc.AudioClip })
    private jiqiClick: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private carStart: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private carAdd: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private carStop: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private win: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private lose: cc.AudioClip = undefined;

    private isCarStop = false;
    private isCarStart = false;
    private isCarAdd = false;
    private carstartid = 0;
    private caraddid = 0;
    private carstopid = 0;

    onLoad() {
        this.playMusic();
    }

    init() {
        this.isCarStop = false;
        this.isCarAdd = false;
        this.isCarStart = false;
    }

    playMusic() {
        Audio.playMusic(this.bgm);
    }

    playStart() {
    }

    playStartBet() {
        this.play(this.startBet);
        // this.play(this.startBetBg);
    }

    playStopBet() {
        this.play(this.stopBet);
    }

    playBet() {
        this.play(this.bet);
    }
    playJiqi() {
        this.play(this.jiqiClick);
    }

    playWinBet() {
        this.play(this.winBet);
    }

    playCarStart() {
        if (!this.isCarStart) {
            this.isCarStart = true;
            this.carstartid = this.play(this.carStart);
        }
    }

    stopCarStart() {
        this.stop(this.carstartid);
    }

    playCarAdd() {
        if (!this.isCarAdd) {
            this.isCarAdd = true;
            this.caraddid = this.play(this.carAdd);
        }
    }

    stopCarAdd() {
        this.stop(this.caraddid);
    }

    playCarStop() {
        if (!this.isCarStop) {
            this.isCarStop = true;
            this.carstopid = this.play(this.carStop);
        }
    }

    stopCarStop() {
        this.stop(this.carstopid);
    }


    playWin() {
        this.play(this.win)
    }

    playLose() {
        this.play(this.lose)
    }


    onDestroy() {
        this.stopMusic();
    }

}
