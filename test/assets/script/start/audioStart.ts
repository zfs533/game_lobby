import Audio from "../g-share/audio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioStart extends Audio {
    @property({ type: cc.AudioClip })
    clipMusic: cc.AudioClip = undefined;

    playMusic() {
        Audio.playMusic(this.clipMusic);
    }
}
