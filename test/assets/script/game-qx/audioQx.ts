/**
 * File: audioQx
 * 七夕音效控制
 */
import Audio from "../g-share/audio";
import TanabataMgr from "./TanabataMgr";
// import { AUDIO_KEY, AUDIO_STATUS } from "../g-by/byAudio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class audioQx extends Audio {

    /** */
    @property({ type: cc.AudioClip })
    protected adLobbyBGM: cc.AudioClip = undefined;

    /**背景音乐 */
    @property({ type: cc.AudioClip })
    protected normalBg: cc.AudioClip = undefined;

    /**中奖音乐 */
    @property({ type: cc.AudioClip })
    protected adzhongJiang: cc.AudioClip = undefined;

    /**抽中炮台音乐 */
    @property({ type: cc.AudioClip })
    protected adPaoTai: cc.AudioClip = undefined;

    /**抽中红包100音乐 */
    @property({ type: cc.AudioClip })
    protected adRedP100: cc.AudioClip = undefined;

    /**抽中红包520音乐 */
    @property({ type: cc.AudioClip })
    protected adRedP520: cc.AudioClip = undefined;


    // onLoad() {

    // }

    onEnable() {
        cc.audioEngine.stopAll();
        TanabataMgr.Instance.audioQx_script = this;

        Audio.playMusic(this.normalBg);
    }

    onDisable() {
        // cc.log("-------------- onDisable 恢复大厅bgm-------this.adLobbyBGM:" + this.adLobbyBGM);
        cc.audioEngine.stopAll();
        Audio.playMusic(this.adLobbyBGM);
    }

    // play(clip: string, loop = false) {
    //     if (+Audio.configs[AUDIO_KEY.SOUND] == AUDIO_STATUS.OPEN)
    //         return cc.audioEngine.play(clip, loop, 1);
    // }

    /**中奖音效 */
    playMusicZhongJiang() {
        this.play(this.adzhongJiang);
    }

    /**中炮台音效 */
    playMusicPaoTai() {
        this.play(this.adPaoTai);
    }

    /**中100红包音效 */
    playMusicRedP100() {
        this.play(this.adRedP100);
    }

    /**中520红包音效 */
    playMusicRedP520() {
        this.play(this.adRedP520);
    }
}