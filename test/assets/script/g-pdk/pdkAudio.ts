import Audio from "../g-share/audio";
import { CardPoint } from "../g-dp/dpAlgorithm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PdkAudio extends Audio {
    @property({ type: cc.AudioClip })
    private bgm: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private initHolds: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private gameWin: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private gameLose: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private alert: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private bomb: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private plane: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private playCard: cc.AudioClip = undefined;

    // --------------------------------man
    @property({ type: [cc.AudioClip] })
    private m_single: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_double: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private m_tuple: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    private m_baojing: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_buyao: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_dani: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private m_feiji: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_feijiWings: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_shunzi: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_liandui: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_sandaiyi: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_sandaier: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_sidaiyi: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_sidaier: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_sidaisan: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_zhadan: cc.AudioClip = undefined;

    // --------------------------------woman
    @property({ type: [cc.AudioClip] })
    private w_single: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_double: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private w_tuple: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    private w_baojing: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_buyao: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_dani: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private w_feiji: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_feijiWings: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_shunzi: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_liandui: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_sandaiyi: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_sandaier: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_sidaiyi: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_sidaier: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_sidaisan: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_zhadan: cc.AudioClip = undefined;

    onLoad() {
        this.playMusic();
    }

    playMusic() {
        Audio.playMusic(this.bgm);
    }

    playOutCard() {
        this.play(this.playCard);
    }

    playSuc() {
        this.play(this.gameWin);
    }

    playFail() {
        this.play(this.gameLose);
    }

    playInitHolds() {
        this.play(this.initHolds);
    }

    playSingle(isMale: boolean, cardData: number) {
        let num = this.getCardNumber(cardData);
        if (isMale) {
            this.play(this.m_single[num - 1]);
        } else {
            this.play(this.w_single[num - 1]);
        }
    }

    playDouble(isMale: boolean, cardData: number) {
        let num = this.getCardNumber(cardData);
        if (isMale) {
            this.play(this.m_double[num - 1]);
        } else {
            this.play(this.w_double[num - 1]);
        }
    }

    playTuple(isMale: boolean) {
        if (isMale) {
            this.play(this.m_tuple);
        } else {
            this.play(this.w_tuple);
        }
    }

    playBuyao(isMale: boolean) {
        let random = Math.floor(Math.random() * this.m_buyao.length);
        if (isMale) {
            this.play(this.m_buyao[random]);
        } else {
            this.play(this.w_buyao[random]);
        }
    }

    playDani(isMale: boolean) {
        let random = Math.floor(Math.random() * this.m_dani.length);
        if (isMale) {
            this.play(this.m_dani[random]);
        } else {
            this.play(this.w_dani[random]);
        }
    }

    playFeiji(isMale: boolean) {
        if (isMale) {
            this.play(this.m_feiji);
        } else {
            this.play(this.w_feiji);
        }
    }

    playFjWings(isMale: boolean) {
        if (isMale) {
            this.play(this.m_feijiWings);
        } else {
            this.play(this.w_feijiWings);
        }
    }

    playShunzi(isMale: boolean) {
        if (isMale) {
            this.play(this.m_shunzi);
        } else {
            this.play(this.w_shunzi);
        }
    }

    playLiandui(isMale: boolean) {
        if (isMale) {
            this.play(this.m_liandui);
        } else {
            this.play(this.w_liandui);
        }
    }

    playSandaiyi(isMale: boolean) {
        if (isMale) {
            this.play(this.m_sandaiyi);
        } else {
            this.play(this.w_sandaiyi);
        }
    }

    playSandaier(isMale: boolean) {
        if (isMale) {
            this.play(this.m_sandaier);
        } else {
            this.play(this.w_sandaier);
        }
    }

    playSidaiyi(isMale: boolean) {
        if (isMale) {
            this.play(this.m_sidaiyi);
        } else {
            this.play(this.w_sidaiyi);
        }
    }

    playSidaier(isMale: boolean) {
        if (isMale) {
            this.play(this.m_sidaier);
        } else {
            this.play(this.w_sidaier);
        }
    }

    playSidaisan(isMale: boolean) {
        if (isMale) {
            this.play(this.m_sidaisan);
        } else {
            this.play(this.w_sidaisan);
        }
    }

    playZhadan(isMale: boolean) {
        if (isMale) {
            this.play(this.m_zhadan);
        } else {
            this.play(this.w_zhadan);
        }
    }

    playBaojing(isMale: boolean, remindNum: number) {
        if (isMale) {
            this.play(this.m_baojing[remindNum - 1]);
        } else {
            this.play(this.w_baojing[remindNum - 1]);
        }
    }

    /**
     * 报警
     */
    playAlert() {
        this.play(this.alert);
    }

    playAnimBomb() {
        this.play(this.bomb);
    }

    playAnimPlane() {
        this.play(this.plane);
    }

    onDestroy() {
        this.stopMusic();
    }

    private getCardNumber(cardData: number) {
        let point = cardData & 0xff;
        let cardNumber: number = CardPoint.POINT_A;
        if (point === CardPoint.POINT_A) {
            cardNumber = 1;
        } else if (point === CardPoint.POINT_2) {
            cardNumber = 2;
        } else if (point === CardPoint.POINT_SMALL_JOKER) {
            cardNumber = 14;
        } else if (point === CardPoint.POINT_BIG_JOKER) {
            cardNumber = 15;
        } else {
            cardNumber = point;
        }
        return cardNumber;
    }

}
