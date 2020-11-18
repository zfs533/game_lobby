import Audio from "../g-share/audio";
import { UserOpt } from './jhOperation';
const { ccclass, property } = cc._decorator;


@ccclass
export default class JHAudio extends Audio {
    @property({ type: cc.AudioClip })
    private bgm: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private dealCard: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    private m_call: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_raise: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_discard: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_allIn: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_look: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_pk: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_call: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_raise: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_discard: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_allIn: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private af_allIn: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    private w_look: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_pk: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private pk: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private pkLose: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private win: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private straightGold: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private leopard: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private alarm: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    private chip: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private magic: cc.AudioClip = undefined;

    private _allInId: number;

    onLoad() {
        // console.log(this.clipWin);
        this.playMusic();
    }

    playMusic() {
        Audio.playMusic(this.bgm);
    }

    onDestroy() {
        this.stopMusic();
    }

    playChip() {
        this.play(this.getRandomClip(this.chip));
    }

    playDealCard() {
        this.play(this.dealCard);
    }

    private getRandomClip(clipArray: cc.AudioClip[]) {
        return clipArray[Math.floor(Math.random() * clipArray.length)];
    }

    noticeAction(male: boolean, action: UserOpt) {
        if (male) {
            switch (action) {
                case UserOpt.FOLLOW:
                    this.play(this.getRandomClip(this.m_call));
                    break;
                case UserOpt.FOLD:
                    this.play(this.getRandomClip(this.m_discard));
                    break;
                case UserOpt.ADD:
                    this.play(this.getRandomClip(this.m_raise));
                    break;
                case UserOpt.ALLIN:
                    this.play(this.getRandomClip(this.m_allIn));
                    break;
            }
        } else {
            switch (action) {
                case UserOpt.FOLLOW:
                    this.play(this.getRandomClip(this.w_call));
                    break;
                case UserOpt.FOLD:
                    this.play(this.getRandomClip(this.w_discard));
                    break;
                case UserOpt.ADD:
                    this.play(this.getRandomClip(this.w_raise));
                    break;
                case UserOpt.ALLIN:
                    this.play(this.getRandomClip(this.w_allIn));
                    break;
            }
        }
    }

    playAllIn(play: boolean) {
        if (play) {
            if (this._allInId) {
                return;
            }
            this._allInId = this.play(this.af_allIn, true);
        } else {
            if (this._allInId !== undefined) {
                this.stop(this._allInId);
                this._allInId = undefined;
            }
        }
    }

    noticeLookCard(male: boolean) {
        this.play(this.getRandomClip(male ? this.m_look : this.w_look));
    }

    noticePk(male: boolean) {
        this.play(this.getRandomClip(male ? this.m_pk : this.w_pk));
    }

    playPk() {
        this.play(this.pk);
    }

    playSoundWin() {
        this.play(this.win);
    }

    playSoundStraightGold() {
        this.play(this.straightGold);
    }

    playSoundLeopard() {
        this.play(this.leopard);
    }

    playSoundAlarm() {
        this.play(this.alarm);
    }

    playSoundPkLose() {
        this.play(this.pkLose);
    }

    playSoundMagic() {
        this.play(this.magic);
    }
}
