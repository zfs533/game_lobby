import Audio from "../g-share/audio"

const { ccclass, property } = cc._decorator

@ccclass
export default class BrnnAudio extends Audio {
    @property({ type: cc.AudioClip })
    private bgm: cc.AudioClip = undefined

    @property({ type: cc.AudioClip })
    private coin: cc.AudioClip = undefined

    @property({ type: cc.AudioClip })
    private coins: cc.AudioClip = undefined

    @property({ type: cc.AudioClip })
    private sendCard: cc.AudioClip = undefined

    @property({ type: cc.AudioClip })
    private win: cc.AudioClip = undefined

    @property({ type: cc.AudioClip })
    private lose: cc.AudioClip = undefined

    @property({ type: [cc.AudioClip] })
    private m_BullArr: cc.AudioClip[] = []

    @property({ type: [cc.AudioClip] })
    private w_BullArr: cc.AudioClip[] = []

    @property({ type: cc.AudioClip })
    private m_BullBoom: cc.AudioClip = undefined

    @property({ type: cc.AudioClip })
    private w_BullBoom: cc.AudioClip = undefined

    @property({ type: cc.AudioClip })
    private m_BullMarbled: cc.AudioClip = undefined

    @property({ type: cc.AudioClip })
    private w_BullMarbled: cc.AudioClip = undefined

    @property({ type: cc.AudioClip })
    private m_BullSmall: cc.AudioClip = undefined

    @property({ type: cc.AudioClip })
    private w_BullSmall: cc.AudioClip = undefined

    onLoad() {
        this.playMusic()
    }

    playMusic() {
        Audio.playMusic(this.bgm)
    }

    playStart() {
    }

    playStartSound() {
        this.play(this.clipStart)
    }

    playCoin() {
        this.play(this.coin)
    }

    playCoins() {
        this.play(this.coins)
    }

    playSendCard() {
        this.play(this.sendCard)
    }

    playWin() {
        this.play(this.win)
    }

    playLose() {
        this.play(this.lose)
    }

    playBull(isMale: boolean, nnType: number) {
        if (isMale) {
            this.play(this.m_BullArr[nnType])
        } else {
            this.play(this.w_BullArr[nnType])
        }
    }

    playBullBoom(isMale: boolean) {
        if (isMale) {
            this.play(this.m_BullBoom)
        } else {
            this.play(this.w_BullBoom)
        }
    }

    playBullMarbled(isMale: boolean) {
        if (isMale) {
            this.play(this.m_BullMarbled)
        } else {
            this.play(this.w_BullMarbled)
        }
    }

    playBullSmall(isMale: boolean) {
        if (isMale) {
            this.play(this.m_BullSmall)
        } else {
            this.play(this.w_BullSmall)
        }
    }

    onDestroy() {
        this.stopMusic()
    }

}