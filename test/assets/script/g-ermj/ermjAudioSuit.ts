const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioSuit extends cc.Component {
    @property({ type: [cc.AudioClip] })
    private audioClip1: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private audioClip2: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private audioClip3: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private audioClip4: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private audioClip5: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private audioClip6: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private audioClip7: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private audioClip8: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private audioClip9: cc.AudioClip[] = [];


    @property({ type: [cc.AudioClip] })
    private w_audioClip1: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_audioClip2: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_audioClip3: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_audioClip4: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_audioClip5: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_audioClip6: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_audioClip7: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_audioClip8: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_audioClip9: cc.AudioClip[] = [];

    private maleAudioArr: cc.AudioClip[][] = [];
    private femaleAudioArr: cc.AudioClip[][] = [];
    onLoad() {
        this.maleAudioArr = [this.audioClip1, this.audioClip2, this.audioClip3, this.audioClip4, this.audioClip5,
        this.audioClip6, this.audioClip7, this.audioClip8, this.audioClip9];
        this.femaleAudioArr = [this.w_audioClip1, this.w_audioClip2, this.w_audioClip3, this.w_audioClip4, this.w_audioClip5,
        this.w_audioClip6, this.w_audioClip7, this.w_audioClip8, this.w_audioClip9];
    }

    getAudioClip(isMale: boolean, rank: number): cc.AudioClip {
        let clipArr: cc.AudioClip[] = [];
        if (isMale) {
            clipArr = this.maleAudioArr[rank - 1].concat();
        } else {
            clipArr = this.femaleAudioArr[rank - 1].concat();
        }
        return clipArr[Math.floor(Math.random() * clipArr.length)];
    }
}
