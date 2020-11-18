import Audio from "../g-share/audio";
import DFDCGame from "./dfdcGame";
const { ccclass, property } = cc._decorator;

enum BgChgState {
    uping = 0,//逐渐变大
    downing = 1,//逐渐变小
    staying = 2,//音量为0，计算玩家多久没有操作
    normalPlaying = 3,//正常播放状态，等待玩家操作
    freePlaying = 4,//免费游戏状态
    egg = 5,//彩蛋状态
}

@ccclass
export default class DFDCAudio extends Audio {

    game: DFDCGame;
    @property({ type: cc.AudioClip })
    private bgm: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private enterBgm: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private startBgm: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private freebgm: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private clickStartBtn: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private stopGame: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private flyCoin: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private flipEgg: cc.AudioClip = undefined;


    @property({ type: [cc.AudioClip] })
    private victSou: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private freeWinning: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private ratio: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private Bowl: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    private colorPoolClip: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private wild: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private freeStart: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private gold: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private clap: cc.AudioClip = undefined;

    private freeAudios = 0;

    private winsers = 0;

    private isMulian = 0;

    private timeCallback: Function = undefined;

    private iscurrentfree = false;

    public auidoLength: number[] = [1.28, 2.01, 2.5, 3.5, 4.5, 6.5, 7.11, 7.41, 8.5, 10.02, 13.03, 15.01, 18.73, 20.05, 30.01, 45.34, 8.5];

    /**
     * 背景音乐是调整方向
     */
    private bgChgState = BgChgState.normalPlaying;
    /**
     * 当前背景音乐大小
     */
    private nowBgVolume = 100;
    /**
     * 背景音乐是否初始化好了，玩家必须要点一次开始才初始化好，或者进游戏就是之前积累的免费游戏，也算初始化好
     */
    private bgIsInited = false;
    /**
     * 上次操作的时间戳
    */
    private lastTimeOpertion = 0;
    /**
     *  是否在播放胜利音效
     */
    private isPlayingWinEffect = false;
    /**
     *音量变化的速度
     */
    private readonly chgSpeed = 100 / 2;



    onLoad() {
        //this.playMusic();
    }

    start() {
        this.playEnterBgMusic();
    }

    playMusic() {
        Audio.playMusic(this.bgm);
    }
    /**
     * 播放免费次数的音乐
     */
    playfreeMusic() {
        this.stopMusic();
        this.bgChgState = BgChgState.freePlaying;
        Audio.playMusicVolume(this.freebgm, 0.8);
    }

    /**
     * 设置背景音乐已经初始化好了
     */
    initBg() {
        // cc.log("背景音乐初始化好了")
        this.bgIsInited = true;
    }

    unInitBgm() {
        this.bgIsInited = false;
        this.stopMusic();
    }

    /**
     * 结束免费次数的音乐
     */
    endFreeMusic() {
        this.setOperateTime();
        this.stopMusic();
        this.nowBgVolume = 0;
        this.bgChgState = BgChgState.staying;
    }

    /**
     * 进入彩蛋状态
     */
    enterEggState() {
        this.bgChgState = BgChgState.egg;
        this.stopMusic();
    }

    /**
     * 彩蛋状态结束
     */
    outEggState() {
        this.nowBgVolume = 0;
        this.setOperateTime();
        this.bgChgState = BgChgState.staying;
    }

    /**
     * 设置当前操作时间存档
     */
    setOperateTime() {
        this.lastTimeOpertion = Date.now();
    }
    playfreeWinning() {
        this.iscurrentfree = true;
        this.play(this.freeWinning);
    }

    playRatioaudio(isbool: boolean) {
        if (isbool) {
            this.freeAudios = this.play(this.ratio)
        } else {
            this.stop(this.freeAudios)
        }
    }

    playButtonClickSound() {
        this.playClick();
    }

    playClickStartBtn() {
        this.play(this.clickStartBtn);
    }

    playBowl() {
        this.play(this.Bowl);
    }

    playFreeStart() {
        this.play(this.freeStart);
    }

    playStopGame() {
        this.play(this.stopGame);
    }
    playGold() {
        this.play(this.gold);
    }
    playwild() {
        this.play(this.wild);
    }
    playMuLian() {
        this.isMulian = this.play(this.bgm);
    }
    playEnterBgMusic() {
        Audio.playMusic(this.enterBgm);
    }

    /**
     * 初次游戏开始的时候，切换背景音乐;之后的操作为记录操作时间
     */
    startBtnClick() {
        //如果初始化为免费次数音乐，也不会播放
        if (this.bgIsInited) {
            this.setOperateTime();
            if (this.bgChgState == BgChgState.normalPlaying
                || this.bgChgState == BgChgState.uping) {
                // cc.log("正常播放了");
                this.bgChgState = BgChgState.downing;
            }
            else if (this.bgChgState == BgChgState.staying) {
                this.stopMusic();
            }
            else if (this.bgChgState == BgChgState.freePlaying) {
                this.stopMusic();
            }
            return;
        }
        else {
            this.bgIsInited = true;
            this.stopMusic();
            this.nowBgVolume = 100;
            this.setOperateTime();
            Audio.playMusicVolume(this.startBgm, 1);
            this.bgChgState = BgChgState.downing;
        }
    }

    playStartBgMusic(volume: number) {
        this.stopMusic();
        this.nowBgVolume = volume * 100;
        Audio.playMusicVolume(this.startBgm, volume);
    }

    playFlyCoin() {
        this.play(this.flyCoin);
    }

    playFlipEgg() {
        this.play(this.flipEgg);
    }

    playColorPool(num: number) {
        for (let index = 0; index < this.colorPoolClip.length; index++) {
            if (index === num) {
                this.play(this.colorPoolClip[index]);
            }
        }
    }
    stopWinContinue() {
        this.iscurrentfree = false;
        this.setOperateTime();
        this.isPlayingWinEffect = false;
        if (this.winsers != 0) {
            this.stop(this.winsers);
            this.unschedule(this.timeCallback)
            this.winsers = 0;
            //this.playfreeMusic(this.isfree);
            //cc.audioEngine.stop(Audio.playingBgm);
        }

    }

    stopBG() {
        //cc.audioEngine.stopAll();
        cc.audioEngine.stop(this.isMulian);
        cc.audioEngine.stop(Audio.playingBgm);
    }

    playWinContinue(num: number, game: DFDCGame, isbool: boolean) {
        // cc.log("playWinContinue num:" + num + "  isbool:" + isbool + "  this.iscurrentfree:" + this.iscurrentfree);
        //iscurrentfree经过验证在免费游戏状态下也是false，好像没有什么作用
        if (this.iscurrentfree) {
            return;
        }
        if (isbool) {
            let eewss = this.auidoLength[num];
            game.autoTime = eewss;
            return;
        }
        //cc.audioEngine.stop(Audio.playingBgm);
        for (let i = 0; i < this.victSou.length; i++) {
            if (i == num) {
                this.winsers = this.play(this.victSou[i]);
                break;
            }
        }
        this.isPlayingWinEffect = true;
        let self = this;
        this.timeCallback = function () {
            self.stopWinContinue();
        }
        this.scheduleOnce(this.timeCallback, game.autoTime);
    }

    playClap() {
        this.playWithVolume(this.clap, false, 0.3);
    }

    onDestroy() {
        this.stopMusic();
    }

    update(dt: number) {
        if (!this.bgIsInited) {
            return;
        }

        switch (this.bgChgState) {
            case BgChgState.freePlaying:
                return;
            case BgChgState.normalPlaying:
                return;
            case BgChgState.egg:
                return;
            case BgChgState.staying:
                let currTime = Date.now();
                if ((currTime - this.lastTimeOpertion) < 1000 * 10) {
                    //cc.log("时间差:" + (currTime - this.lastTimeOpertion));
                    return;
                }
                if (this.isPlayingWinEffect) {
                    return;
                }
                // cc.log("恢复背景音乐");
                this.playStartBgMusic(0.1);
                this.bgChgState = BgChgState.uping;
                return;
            case BgChgState.uping:
                this.nowBgVolume += dt * this.chgSpeed;
                if (this.nowBgVolume >= 100) {
                    this.nowBgVolume = 100;
                    this.bgChgState = BgChgState.normalPlaying;
                }
                this.setMusicVolume(this.nowBgVolume * 0.01);
                return;
            case BgChgState.downing:
                this.nowBgVolume -= dt * this.chgSpeed;
                if (this.nowBgVolume <= 0) {
                    this.nowBgVolume = 0;
                    this.stopMusic();
                    this.setOperateTime();
                    this.bgChgState = BgChgState.staying;
                }
                else {
                    this.setMusicVolume(this.nowBgVolume * 0.01);
                }
                return;
        }

    }
}
