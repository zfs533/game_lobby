import DDZGame from "./ddzGame";
import { ResultShowInfo } from "./ddzMsg";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DdzResult extends cc.Component {
    @property(cc.Node)
    private animResult: cc.Node = undefined;

    @property(cc.Node)
    private infoPanel: cc.Node = undefined;

    @property(cc.Node)
    private nodeBtns: cc.Node = undefined;

    @property(cc.Node)
    private nodePlayers: cc.Node = undefined;

    @property(cc.Label)
    private labBomb: cc.Label = undefined;

    @property(cc.Label)
    private labSpring: cc.Label = undefined;

    @property(cc.Label)
    private prepareTime: cc.Label = undefined;

    @property(cc.Node)
    private leftCards: cc.Node = undefined;

    @property(cc.Node)
    private rightCards: cc.Node = undefined;


    private game: DDZGame;

    private _prepareEndTime: number;

    setGame(game: DDZGame) {
        this.game = game;
    }

    show(resultInfos: ResultShowInfo[], bombNum: number, spring: number) {
        this.labBomb.string = (bombNum === 1 ? "- -" : "x" + bombNum).toString();
        this.labSpring.string = (spring === 1 ? "- -" : "x" + spring).toString();
        let me_chgScore = 0;
        let isdealer: boolean = false
        for (let resultInfo of resultInfos) {
            let uResult = resultInfo.ur;
            // let nodePlayer = this.nodePlayers.getChildByName(`player${uResult.pos}`);
            // let nodeDealer = nodePlayer.getChildByName("banker");
            // let labLoc = nodePlayer.getChildByName("location").getComponent(cc.Label);
            // let labBase = nodePlayer.getChildByName("base").getComponent(cc.Label);
            // let labMul = nodePlayer.getChildByName("multiple").getComponent(cc.Label);
            // let labScore = nodePlayer.getChildByName("balance").getComponent(cc.Label);
            // let nodeAddMul = nodePlayer.getChildByName("addMul");

            // nodeDealer.active = resultInfo.isDealer;
            // nodeAddMul.active = resultInfo.isAddMul;
            // labLoc.string = resultInfo.loc ? resultInfo.loc : '--';
            // labBase.string = this.game.baseScore.toString();
            // labMul.string = uResult.totalMulti;
            // labScore.string = uResult.chgScore;

            // let col = resultInfo.isMe ? (new cc.Color).fromHEX("#F5A302") : (new cc.Color).fromHEX("#D6D6D6");
            // labLoc.node.color = col;
            // labBase.node.color = col;
            // labMul.node.color = col;
            // labScore.node.color = col;

            if (resultInfo.isMe) {
                let me = this.nodePlayers.getChildByName("player0");
                let bsScore = me.getChildByName("bsScore").getComponent(cc.Label);
                let banker = me.getChildByName("bankerNumber").getComponent(cc.Label);
                let multiple = me.getChildByName("multipleNumber").getComponent(cc.Label);
                let labScore = me.getChildByName("balance").getComponent(cc.Label);

                bsScore.string = this.game.baseScore.toString();
                banker.string = (resultInfo.isDealer ? "2" : "0");
                multiple.string = uResult.totalMulti;
                labScore.string = (Number(uResult.chgScore) >= 0 ? `+${uResult.chgScore}` : `${uResult.chgScore}`);

                me_chgScore = +uResult.chgScore;
                isdealer = resultInfo.isDealer
            } else {
                let remainCards = resultInfo.remainCards;
                if (!remainCards) continue;
                remainCards.sort(this.pointSort);

                let nodeCards: cc.Node;
                if (resultInfo.isRight) {
                    nodeCards = this.rightCards;
                } else {
                    nodeCards = this.leftCards;
                }
                if (!nodeCards) continue;

                nodeCards.removeAllChildren();
                for (let index = 0; index < remainCards.length; index++) {
                    const cardData = remainCards[index];
                    let card = this.game.pkrGame.getDdzCard(cardData);
                    card.y = 0;
                    card.scale = 0.5;
                    nodeCards.addChild(card);
                }
            }
        }
        this.node.active = true;

        this.infoPanel.scale = 1;
        this.prepareTime.node.active = false;
        this.nodeBtns.opacity = 0;
        this.infoPanel.opacity = 0;
        this.animResult.active = false;

        this.scheduleOnce(() => {
            //this.infoPanel.runAction(cc.fadeTo(0.5, 255));
            cc.tween(this.infoPanel).to(0.5, { opacity: 255 }).start();
            this.showResult(me_chgScore > 0, isdealer);
        }, 0.05/*2.5*/);
        this.scheduleOnce(() => {
            //this.nodeBtns.runAction(cc.fadeTo(0.5, 255));
            cc.tween(this.nodeBtns).to(0.5, { opacity: 255 }).start();
        }, 1)
    }

    showResult(isSuc: boolean, isDealer: boolean) {
        this.animResult.active = true;
        let failyreSp = this.animResult.getChildByName('failed');
        let victorySp = this.animResult.getChildByName('success');
        failyreSp.active = !isSuc;
        victorySp.active = isSuc;

        if (isSuc) {
            let sl = victorySp.getChildByName("tywinjs");
            sl.getChildByName("sl_01").active = isDealer;
            sl.getChildByName("sl_02").active = !isDealer;
            victorySp.getChildByName('tywinjs').getComponent(cc.Animation).play();
        } else {
            let sb = failyreSp.getChildByName("tylossjs");
            sb.getChildByName("sb_01").active = isDealer;
            sb.getChildByName("sb_02").active = !isDealer;
            failyreSp.getChildByName('tylossjs').getComponent(cc.Animation).play();
        }

        if (isSuc) {
            this.game.adoMgr.playSuc();
        } else {
            this.game.adoMgr.playFail();
        }
        this.game.adoMgr.stopMusic();
    }

    showTicker(timer?: number) {
        if (timer === undefined) {
            return;
        }
        this.prepareTime.node.active = true;
        this._prepareEndTime = Date.now() + timer;
        let t = Math.round(timer / 1000);
        this.prepareTime.string = t.toString();
        this.unschedule(this.countdownPre);
        this.schedule(this.countdownPre, 1, t, 1);
    }

    private countdownPre() {
        let now = Date.now();
        if (!this.prepareTime || !this.prepareTime.isValid || now >= this._prepareEndTime) {
            this.unschedule(this.countdownPre);
            return;
        }
        let t = Math.round((this._prepareEndTime - now) / 1000);
        this.prepareTime.string = t.toString();

    }

    hide() {
        this.node.active = false;
    }

    onClickBack() {
        this.hide();
        this.game.menu.onBackClick();
    }

    onClickNext() {
        this.game.adoMgr.playMusic();
        this.game.adoMgr.stopSucOrFail();
        this.hide();
        this.game.onClickNext();
    }

    leaveNoMoney() {
        let msg = this.game.msg;
        this.game.backToHall().then(() => {
            msg.handleLeaveReason(3);
        });
    }

    private pointSort(aData: number, bData: number) {
        let aPoint = aData & 0xff;
        let bPoint = bData & 0xff;
        let aSuit = aData >> 8;
        let bSuit = bData >> 8;
        if (aPoint === bPoint) {
            return bSuit - aSuit;
        } else {
            return bPoint - aPoint;
        }
    }
}
