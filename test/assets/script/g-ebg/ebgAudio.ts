//游戏相关音效

import Audio from "../g-share/audio"

const { ccclass, property } = cc._decorator

@ccclass
export default class EbgnAudio extends Audio {
    //游戏背景
    @property({ type: cc.AudioClip })
    private bgm: cc.AudioClip = undefined

    //游戏开始 提示
    @property({ type: cc.AudioClip })
    private StartGame: cc.AudioClip = undefined;

    //开始下注
    @property({ type: cc.AudioClip })
    private StartDoBet: cc.AudioClip = undefined;

    //stop下注
    @property({ type: cc.AudioClip })
    private StopBoBets: cc.AudioClip = undefined;

    //下注
    @property({ type: cc.AudioClip })
    private DoBet: cc.AudioClip = undefined;

    //骰子
    @property({ type: cc.AudioClip })
    private Dice: cc.AudioClip = undefined;

    //金币
    @property({ type: cc.AudioClip })
    private coin: cc.AudioClip = undefined

    //发牌
    @property({ type: cc.AudioClip })
    private sendCard: cc.AudioClip = undefined

    //赢
    @property({ type: cc.AudioClip })
    private win: cc.AudioClip = undefined

    //输
    @property({ type: cc.AudioClip })
    private lose: cc.AudioClip = undefined

    //牌型
    @property({ type: cc.AudioClip })
    private CardTyep: cc.AudioClip[] = []

    //同杀
    @property({ type: cc.AudioClip })
    private TSTP_Win: cc.AudioClip = undefined

    //同赔
    @property({ type: cc.AudioClip })
    private TSTP_Lose: cc.AudioClip = undefined

    onLoad() {
        this.playMusic()
    }

    A_TSTP_Win() {
        this.play(this.TSTP_Win)
    }

    A_TSTP_Lose() {
        this.play(this.TSTP_Lose)
    }

    playMusic() {
        Audio.playMusic(this.bgm)
    }

    playgameStart() {
        this.play(this.StartGame)
    }

    startDoBets() {
        this.play(this.StartDoBet);
    }

    StopDoBets() {
        this.play(this.StopBoBets);
    }

    DoBets() {
        this.play(this.DoBet);
    }

    aDice() {
        this.play(this.Dice)
    }

    Aduio_CardType(index: number) {
        this.play(this.CardTyep[index]);
    }

    playCoin() {
        this.play(this.coin)
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

    onDestroy() {
        this.stopMusic()
    }

}
