import g from "../g";
import { soundCfg, musicCfg } from "../common/cfg";

const { ccclass, property } = cc._decorator;
@ccclass
export default abstract class Audio extends cc.Component {
    @property({ type: cc.AudioClip })
    protected clipStart: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    protected clipClick: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private countdown: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private rechargeSucc: cc.AudioClip = undefined;

    static playingBgm: number;

    private static _click: any// 通用点击音效
    private static _countdown: any// 倒计时

    static TimeCountDown() {
        if (!Audio._countdown) {
            cc.loader.loadRes('audio/timecountdown', function (err, file) {
                Audio._countdown = file
                pl()
            })
        } else {
            pl()
        }
        function pl() {
            if (soundCfg())
                return cc.audioEngine.play(Audio._countdown, false, 1);
        }
    }
    static PlayClick() {
        if (!Audio._click) {
            cc.loader.loadRes('audio/click', function (err, file) {
                Audio._click = file
                pl()
            })
        } else {
            pl()
        }
        function pl() {
            if (soundCfg())
                return cc.audioEngine.play(Audio._click, false, 1);
        }
    }

    static playMusic(clip: cc.AudioClip) {
        g.hallVal.currBgmClip = clip;
        if (musicCfg()) {
            Audio.playingBgm = cc.audioEngine.play(clip, true, 1);
        }
    }

    static playMusicVolume(clip: cc.AudioClip, volume: number) {
        g.hallVal.currBgmClip = clip;
        if (musicCfg()) {
            Audio.playingBgm = cc.audioEngine.play(clip, true, volume);
        }
    }
    onDestroy() {
        cc.audioEngine.stopAll();
    }

    stopMusic() {
        if (!Audio.playingBgm) {
            return;
        }
        cc.audioEngine.stop(Audio.playingBgm);
    }

    setMusicVolume(volume: number) {
        if (!Audio.playingBgm) {
            return;
        }
        cc.audioEngine.setVolume(Audio.playingBgm, volume);
    }
    play(clip: cc.AudioClip, loop = false) {
        if (soundCfg())
            return cc.audioEngine.play(clip, loop, 1);

    }
    playWithVolume(clip: cc.AudioClip, loop = false, volume = 1) {
        if (musicCfg())
            return cc.audioEngine.play(clip, loop, volume);
    }

    stop(id: number) {
        cc.audioEngine.stop(id);
    }

    /**
     * 播放游戏开始音效
     *
     * @memberof Audio
     */
    playStart() {
        this.play(this.clipStart);
    }

    playClick() {
        this.play(this.clipClick);
    }

    playClock() {
        this.play(this.countdown);
    }

    playRechargeSucc() {
        this.play(this.rechargeSucc);
    }
}