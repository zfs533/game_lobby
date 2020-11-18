import Audio from "../g-share/audio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioLobby extends Audio {
    @property({ type: cc.AudioClip })
    adBg: cc.AudioClip = undefined;

    onLoad() {
        Audio.playMusic(this.adBg);
    }
}
