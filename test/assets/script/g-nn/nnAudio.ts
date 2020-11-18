import Audio from "../g-share/audio";
import { BullType } from "./nnConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NNAudio extends Audio {

    @property({ type: cc.AudioClip })
    private bgm: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private deal: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private bet: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private dealerChoosing: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private dealerChosen: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_bulls: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private w_bulls: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private win: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private winAll: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private lose: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private chips: cc.AudioClip = undefined;

    protected onLoad() {
        this.playMusic();
    }

    playMusic() {
        Audio.playMusic(this.bgm);
    }

    playDeal() {
        this.play(this.deal);
    }

    playBet() {
        this.play(this.bet);
    }

    playDealerChoosing() {
        this.play(this.dealerChoosing);
    }

    playDealerChoose() {
        this.play(this.dealerChosen);
    }

    playBull(bullType: BullType, male: boolean) {
        let bulls = male ? this.m_bulls : this.w_bulls;
        this.play(bulls[bullType]);
    }

    playWin() {
        this.play(this.win);
    }

    playWinAll() {
        this.play(this.winAll);
    }

    playLose() {
        this.play(this.lose);
    }

    playChips() {
        this.play(this.chips);
    }
}
