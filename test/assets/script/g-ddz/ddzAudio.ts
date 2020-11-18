import Audio from "../g-share/audio";
import { CardPoint } from "../g-dp/dpAlgorithm";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DdzAudio extends Audio {
    @property({ type: cc.AudioClip })
    private bgmNor1: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private bgmNor2: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private bgmRocket: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private bgmExciting: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private click: cc.AudioClip = undefined;

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
    private wang_bomb: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private chuntian: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private plane: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private dizhu: cc.AudioClip = undefined;

    @property({ type: [cc.AudioClip] })
    private playCard: cc.AudioClip[] = [];

    // --------------------------------man
    @property({ type: [cc.AudioClip] })
    private m_single: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_double: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_tuple: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_baojing: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_buyao: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_dani: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_score: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private m_addMul: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private m_feiji: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_shunzi: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_liandui: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_sandaiyi: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_sandaiyidui: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_sidaier: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_sidailiangdui: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_zhadan: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private m_wangzha: cc.AudioClip = undefined;

    // --------------------------------woman
    @property({ type: [cc.AudioClip] })
    private w_single: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_double: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_tuple: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_baojing: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_buyao: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_dani: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_score: cc.AudioClip[] = [];

    @property({ type: [cc.AudioClip] })
    private w_addMul: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    private w_feiji: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_shunzi: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_liandui: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_sandaiyi: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_sandaiyidui: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_sidaier: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_sidailiangdui: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_zhadan: cc.AudioClip = undefined;

    @property({ type: cc.AudioClip })
    private w_wangzha: cc.AudioClip = undefined;

    private aduioId: number;

    onLoad() {
        this.playMusic();
    }

    playOutCard() {
        let random = Math.floor(Math.random() * this.playCard.length);
        this.play(this.playCard[random]);
    }

    playSuc() {
        this.aduioId = this.play(this.gameWin);
    }

    playFail() {
        this.aduioId = this.play(this.gameLose);
    }

    stopSucOrFail() {
        if (this.aduioId)
            this.stop(this.aduioId);
        this.aduioId = null;
    }

    playInitHolds() {
        this.play(this.initHolds);
    }

    playScore(isMale: boolean, score: number) {
        if (isMale) {
            this.play(this.m_score[score]);
        } else {
            this.play(this.w_score[score]);
        }
    }

    playAddMul(isMale: boolean, mul: number) {
        if (isMale) {
            this.play(this.m_addMul[mul - 1]);
        } else {
            this.play(this.w_addMul[mul - 1]);
        }
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

    playTuple(isMale: boolean, cardData: number) {
        let num = this.getCardNumber(cardData);
        if (isMale) {
            this.play(this.m_tuple[num - 1]);
        } else {
            this.play(this.w_tuple[num - 1]);
        }
    }

    playBuyao(isMale: boolean) {
        let random = Math.floor(Math.random() * 4);
        if (isMale) {
            this.play(this.m_buyao[random]);
        } else {
            this.play(this.w_buyao[random]);
        }
    }

    playDani(isMale: boolean) {
        let random = Math.floor(Math.random() * 3);
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

    playSandaiyidui(isMale: boolean) {
        if (isMale) {
            this.play(this.m_sandaiyidui);
        } else {
            this.play(this.w_sandaiyidui);
        }
    }

    playSidaier(isMale: boolean) {
        if (isMale) {
            this.play(this.m_sidaier);
        } else {
            this.play(this.w_sidaier);
        }
    }

    playSidailiangdui(isMale: boolean) {
        if (isMale) {
            this.play(this.m_sidailiangdui);
        } else {
            this.play(this.w_sidailiangdui);
        }
    }

    playZhadan(isMale: boolean) {
        if (isMale) {
            this.play(this.m_zhadan);
        } else {
            this.play(this.w_zhadan);
        }
    }

    playWangZha(isMale: boolean) {
        if (isMale) {
            this.play(this.m_wangzha);
        } else {
            this.play(this.w_wangzha);
        }
        this.playRocketBgm();
    }

    playBaojing(isMale: boolean, remindNum: number) {
        if (isMale) {
            this.play(this.m_baojing[remindNum - 1]);
        } else {
            this.play(this.w_baojing[remindNum - 1]);
        }

        this.stopMusic();
        Audio.playMusic(this.bgmExciting);
    }

    playQuRenDizhu() {
        this.play(this.dizhu);
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

    playAnimWangBomb() {
        this.play(this.wang_bomb);
    }

    playAnimCT() {
        this.play(this.chuntian);
    }

    playAnimPlane() {
        this.play(this.plane);
    }

    playMusic() {
        this.stopMusic();
        let bgIdx = Math.floor(Math.random() * 2);
        let bgm = (bgIdx === 0) ? this.bgmNor1 : this.bgmNor2;
        Audio.playMusic(bgm);
    }

    playRocketBgm() {
        this.stopMusic();
        Audio.playMusic(this.bgmRocket);
    }

    playStartSound() {
        this.play(this.clipStart);
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
