import Audio from "../g-share/audio";
import { DZPKCardType } from "./dzpkGame";
import { DZPKAction } from "./dzpkPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DZPKAudio extends Audio {

    @property({ type: cc.AudioClip })
    bgm: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    chip: cc.AudioClip[] = [];
    @property({ type: cc.AudioClip })
    meWin: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    dealCard: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    alarm: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    win: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    m_call: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    m_pass: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    m_raise: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    m_discard: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    m_showHand: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    w_call: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    w_pass: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    w_raise: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    w_discard: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    w_showHand: cc.AudioClip[] = [];

    onLoad() {
        // cc.log(this.clipWin);
        this.playMusic();
    }

    playMusic() {
        Audio.playMusic(this.bgm);
    }

    noticeWin(cardType: DZPKCardType) {
        this.play(this.win[cardType]);
    }

    playCheer() {
        this.play(this.meWin);
    }
    private getRandomClip(clipArray: cc.AudioClip[]) {
        return clipArray[Math.floor(Math.random() * clipArray.length)];
    }

    noticeAction(male: boolean, action: DZPKAction) {
        if (male) {
            switch (action) {
                case DZPKAction.Call:
                    this.play(this.getRandomClip(this.m_call));
                    break;
                case DZPKAction.Discard:
                    this.play(this.getRandomClip(this.m_discard));
                    break;
                case DZPKAction.Check:
                    this.play(this.getRandomClip(this.m_pass));
                    break;
                case DZPKAction.Raise:
                    this.play(this.getRandomClip(this.m_raise));
                    break;
                case DZPKAction.AllIn:
                    this.play(this.getRandomClip(this.m_showHand));
                    break;
            }
        } else {
            switch (action) {
                case DZPKAction.Call:
                    this.play(this.getRandomClip(this.w_call));
                    break;
                case DZPKAction.Discard:
                    this.play(this.getRandomClip(this.w_discard));
                    break;
                case DZPKAction.Check:
                    this.play(this.getRandomClip(this.w_pass));
                    break;
                case DZPKAction.Raise:
                    this.play(this.getRandomClip(this.w_raise));
                    break;
                case DZPKAction.AllIn:
                    this.play(this.getRandomClip(this.w_showHand));
                    break;
            }
        }
    }

    noticeDealCard() {
        this.play(this.dealCard);
    }

    noticeMoveChips() {
        this.play(this.getRandomClip(this.chip));
    }

    noticeTurnOver() {
        this.play(this.alarm);
    }

    onDestroy() {
        this.stopMusic();
    }
}
