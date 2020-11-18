import GameMsg from "../g-share/gameMsg";
import JHGame, { State, ResultType } from "./jhGame";
import { PlayerState } from "../g-share/player";
import JHPlayer from "./jhPlayer";
import user from "../common/user";
import { ROUTE } from '../common/route';
import net from "../common/net";
import { UserOpt } from './jhOperation';

const Decimal = window.Decimal

export default class JHMsg extends GameMsg {
    protected game: JHGame;

    protected regMsgHanlder(): void {
        // cc.log('jh reg...........');
        this.onMsg(ROUTE.jh_AppointDealer, this.handleAppointDealer.bind(this));
        this.onMsg(ROUTE.jh_DoBets, this.handleDoBets.bind(this));
        this.onMsg(ROUTE.jh_DealCards, this.handleDealCards.bind(this));
        this.onMsg(ROUTE.jh_opt, this.handleCurOpt.bind(this));
        this.onMsg(ROUTE.jh_Fold, this.handleFold.bind(this));
        this.onMsg(ROUTE.jh_FaceUp, this.handleFaceUp.bind(this));
        this.onMsg(ROUTE.jh_ChallengeRes, this.handleChallengeRes.bind(this));
        this.onMsg(ROUTE.jh_NextRound, this.handleNextRound.bind(this));
        this.onMsg(ROUTE.jh_Result, this.handleResult.bind(this));
        this.onMsg(ROUTE.jh_GameInfo, this.handleGameInfo.bind(this));

        // 供产品测试的接口,直接亮牌
        // this.onMsg('jh_openCards', this.handOpenCards.bind(this));
        this.onMsg("jh_robotInfo", this.showTest.bind(this));
    }

    // async handOpenCards (data: { pos: number, handCards: number[], cardType: number }[]){
    //     cc.log(data);
    //     for(let player of data){
    //         let p = this.getPlayer(player.pos);
    //         if (!p) {
    //             cc.warn('no player')
    //             continue;
    //         }
    //         let promises = [];
    //         p.clearCards();

    //         for (let i = 0; i < player.handCards.length; i++) {
    //             let r = player.handCards[i];
    //             promises.push(p.addCards(i, r, false));
    //         }
    //         let cards = await Promise.all(promises);
    //         p.showCardType(player.cardType, true);
    //         await Promise.all(cards.map(c => p.turnCard(c)));
    //     }
    // }

    showTest(data:any) {
        this.game.testRobotShow(data);
    }

    /**
     * 指定庄家，播放庄家动画
     * @param data
     */
    handleAppointDealer(data: ps.Jh_AppointDealer) {
        let p = this.getPlayer(data.pos);
        if (!p) {
            console.warn("no dealer choose");
            return;
        }
        p.becomeDealer();
    }

    /**
     * 下注(包含下底注、跟注、加注、全押、比牌下注)
     * @param data
     */
    handleDoBets(data: ps.Jh_DoBets) {
        let p = this.getPlayer(data.pos);
        if (!p) {
            console.warn("no player DoBets");
            return;
        }
        p.doBet(data);
        let me = this.game.plyMgr.me;
        this.game.lastBetType = data.opt;
        if (data.opt === UserOpt.ALLIN && me.pos === data.pos) { // 全押后不能弃牌
            me.isAllIn = true;
            this.game.operation.updateTurns();
        }
        // 更新总注、当前单注
        this.game.curSingleBet = +data.curMinBets;
        this.game.totalBets = +data.gameTotalBets;
        this.game.info.updateBetsPool();
    }

    /**
     * 发牌
     * @param data
     */
    async handleDealCards() {
        await this.game.plyMgr.drawFakeCards();
        this.handleNextRound({ round: 1 });
        this.game.operation.showTurn();
    }

    /**
     * 当前谁可以操作，可操作的动作
     * @param data
     */
    handleCurOpt(data: ps.Jh_opt) {
        this.game.plyMgr.endTurn();
        let p = this.getPlayer(data.pos);
        if (!p) {
            console.warn("no player Opt");
            return;
        }
        p.startTurn(data.time);
        if (p.isMe) {
            this.game.operation.showTurn();
        }
    }

    /**
     * 已看牌玩家
     * @param data
     */
    async handleFaceUp(data: ps.Jh_FaceUp) {
        let game = this.game;
        let p = this.getPlayer(data.pos);
        if (!p) {
            console.warn("no one look cards");
            return;
        }
        game.adoMgr.noticeLookCard(p.isMale);
        if (p.isMe) {
            await this.showCards(p, data.cardType, data.handCards, true); // 自己看牌
            game.operation.updateLookCardsBtn();
        } else {
            p.isLooked = true;
            p.showFanCards();
            p.updateLooked();
        }
    }

    /**
     * 弃牌
     * @param data
     */
    async handleFold(data: ps.Jh_Fold) {
        let p = this.getPlayer(data.pos);
        if (!p) {
            console.warn("no player discard");
            return;
        }
        if (p.isMe) {
            if (p.isLooked) {
                p.discard();
            } else {
                p.showAction(UserOpt.FOLD);
                p.endTurn(true);
                await this.showCards(p, data.cardType, data.handCards, true); // 弃牌后自己可以看到牌
                p.updateDiscardSp()
                this.game.info.updateBlindIcon();
                this.game.operation.updateLookCardsBtn();
            }
            this.game.operation.hideTurn();
            // this.game.operation.showOver();
            this.game.changeState(State.FREE);
        } else {
            p.discard();
        }
        p.showWinOrLost('-' + p.bets)
        this.game.operation.updatePkSelector();
    }

    /**
     * 比牌(PK)结果
     * @param data
     */
    async handleChallengeRes(data: ps.Jh_ChallengeRes) {
        await this.showResultPK(data.curPos, data.coverPos, data.failPos, data.cardType, data.failHandCards);
        if (data.failPos === this.game.plyMgr.me.pos) this.game.updateUI();  // 比牌失败后可以换桌
        let failP = this.getPlayer(data.failPos);
        //failP.money = new Decimal(failP.bets).add(data.failChgMoney).toString();
        failP.showWinOrLost(data.failChgMoney)
    }

    /**
     * 下一轮
     * @param data
     */
    handleNextRound(data: ps.Jh_NextRound) {
        let game = this.game;
        game.round = data.round;
        game.info.updateRound();
        game.operation.updateLookCardsBtn(data.round > this.game.blindRound);
        game.info.updateBlindIcon();
        game.operation.roundCanAllIn = (data.round >= this.game.allInRound) && (data.round < this.game.totalRound) ? true : false; // 最后一轮不能全押
        game.operation.showTurn();
    }

    /**
     * 结算
     * @param data
     */
    async handleResult(data: ps.Jh_Result) {
        if (!this || !this.game || !this.game.isValid) {
            return;
        }
        switch (data.resultType) {
            case ResultType.challenge:
                await this.gameResultPk(data);
                break;
            case ResultType.allin:
                await this.gameResultPk(data);
                break;
            case ResultType.maxRound:
                await this.game.pk.showFinalPk();
                break;
        }
        this.game.changeState(State.BALANCE);
        this.game.operation.hideTurn();
        // this.game.operation.hideOver();
        this.game.plyMgr.hideLooked();
        this.game.plyMgr.endTurn();
        this.game.adoMgr.playAllIn(false);
        this.game.showOrHideAllInParticle(false);
        this.game.info.updateBetsPool();
        this.finalShowCards(data.resShowCards);
        if (data.userInfo && data.userInfo.length > 0) {
            await this.finalShowWinAnim(data.userInfo);
            await this.collectChips(data.userInfo);
            await this.showEarn(data.userInfo);
        }
    }

    /**
     * 结算比牌动画
     * @param fromPos
     * @param toPos
     * @param cardType
     * @param handCards
     * @param failChgMoney
     */
    async gameResultPk(data: ps.Jh_Result) {
        if (data.cmpPos.length === 2) {
            let curPos = data.cmpPos[0];
            let coverPos = data.cmpPos[1];
            let failPos: number;
            let failCardtype: number;
            let failHandCards: number[];
            for (let j = 0; j < data.userInfo.length; j++) {
                if (data.userInfo[j].isWinner === 0) {
                    failPos = data.userInfo[j].pos;
                    failCardtype = data.userInfo[j].cardType;
                    failHandCards = data.userInfo[j].handCards;
                    break;
                }
            }
            await this.showResultPK(curPos, coverPos, failPos, failCardtype, failHandCards);
        } else if (data.cmpPos.length > 2) {
            let curPos: number;
            let coverPos: number;
            let failCardtype: number;
            let failHandCards: number[];
            let winPos: number;
            let allInLosePly: ps.Jh_Result_uInfo[] = [];
            for (let j = 0; j < data.userInfo.length; j++) {
                if (data.userInfo[j].isWinner === 1) {
                    winPos = data.userInfo[j].pos;
                } else {
                    allInLosePly.push(data.userInfo[j]);
                }
            }
            curPos = winPos;
            for (let i = 0; i < allInLosePly.length; i++) {
                coverPos = allInLosePly[i].pos;
                failCardtype = allInLosePly[i].cardType;
                failHandCards = allInLosePly[i].handCards;
                await this.showResultPK(curPos, coverPos, coverPos, failCardtype, failHandCards);
            }
        }
    }

    async showResultPK(curPos: number, coverPos: number, failPos: number, failCardtype: number, failHandCards: number[]) {
        await this.game.pk.showPk(curPos, coverPos, curPos !== failPos);
        let failP = this.getPlayer(failPos);
        if (!failP) {
            console.warn("no player");
            return;
        }
        if (failP.isMe && !failP.isLooked) {
            failP.endTurn(true);
            await this.showCards(failP, failCardtype, failHandCards, true); // 弃牌后自己可以看到牌
            this.game.info.updateBlindIcon();
            this.game.operation.updateLookCardsBtn();
            this.game.showOrHideAllInParticle(false);
            this.game.operation.hideTurn();
        }
    }

    private finalShowCards(data?: ps.Jh_Result_showCards[]) {
        if (!data) {
            return;
        }
        for (let r of data) {
            let p = this.getPlayer(r.pos);
            if (p.isMe && p.isDiscarded) {
                continue;
            }
            this.showCards(p, r.cardType, r.cards)
        }
    }

    private async finalShowWinAnim(data: ps.Jh_Result_uInfo[]) {
        data.sort((a, b) => {
            return a.isWinner - b.isWinner;
        })
        for (let user of data) {
            let p = this.getPlayer(user.pos);
            if (!p) {
                continue;
            }
            if (p.isMe) {
                if (!p.isLooked) {
                    this.showCards(p, user.cardType, user.handCards);
                }
                this.game.info.updateBlindIcon();
            } else {
                this.showCards(p, user.cardType, user.handCards);
            }

            if (!p.isMe || !user.isWinner) {
                continue;
            }
            await this.game.playAnimWin();
        }
    }

    private async collectChips(data: ps.Jh_Result_uInfo[]) {
        let totalWinner = 0;
        for (let user of data) {
            if (user.isWinner) {
                totalWinner++;
            }
        }
        let promises = [];
        for (let user of data) {
            if (totalWinner <= 0) {
                break;
            }
            let p = this.getPlayer(user.pos);
            if (!p || !user.isWinner) {
                continue;
            }
            promises.push(p.gainChips(totalWinner));
            totalWinner--;
        }
        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }

    private async showEarn(data: ps.Jh_Result_uInfo[]) {
        let promises = [];
        for (let user of data) {
            let p = this.getPlayer(user.pos);
            if (!p || !user.isWinner) {
                continue;
            }
            p.money = new Decimal(p.money).add(user.money).toString();
            promises.push(p.showWinOrLost(user.money));
        }
        await Promise.all(promises);
    }

    private getPlayer(pos: number) {
        return this.game.plyMgr.getPlyByPos(pos);
    }

    private async showCards(p: JHPlayer, cardType: number, handCards?: number[], doAnim = false) {
        if (!handCards) {
            // console.warn("show card without cards");
            return;
        }
        let promises = [];
        p.isLooked = true;
        p.clearCards();

        for (let i = 0; i < handCards.length; i++) {
            let r = handCards[i];
            promises.push(p.addCards(i, r, false));
        }
        let cards = await Promise.all(promises);
        p.showCardType(cardType, doAnim);
        return await Promise.all(cards.map(c => p.turnCard(c)));
    }

    protected handleGameInfo(data: ps.Jh_GameInfo): any {
        super.handleGameInfo(data);

        let game = this.game;
        game.plyMgr.playerArr.forEach(p => {
            p.isDiscarded = true;
            p.updateLookerView();
        });
        game.lastBetType = UserOpt.FOLLOW;
        if (data.player && data.player.length > 0) {
            for (let gmr of data.player) {
                if (gmr.isAllin && gmr.pos !== data.curOptPos) {
                    game.lastBetType = UserOpt.ALLIN;
                }
                let p = this.getPlayer(gmr.pos);
                if (!p) {
                    continue;
                }
                p.isDiscarded = false;
                p.changeState(PlayerState.STARTED);
                p.updateLookerView();
                p.becomeDealer(gmr.pos === data.dealerPos, false);
                let remain = gmr.curMoney
                p.setBets(gmr.totalBets);
                p.money = !isNaN(+remain) && remain;
                p.updateMoney();
                p.updateBets();

                p.isLooked = !!gmr.isFaceUp;
                if (p.isMe) {
                    if (!!gmr.isFaceUp) {
                        p.isLooked = true;
                        if (gmr.handCards) {
                            for (let i = 0; i < gmr.handCards.length; i++) {
                                let c = gmr.handCards[i];
                                p.addCards(i, c, false).then(card => {
                                    p.turnCard(card, true, false);
                                });
                            }
                        }
                        p.cardType = gmr.cardType;
                        p.updateCardType(true);
                        game.operation.updateLookCardsBtn();
                    } else {
                        for (let i = 0; i < 3; i++) {
                            p.addCards(i, 0, false);
                        }
                        game.operation.updateLookCardsBtn();
                        game.info.updateBlindIcon()
                    }
                } else {
                    for (let i = 0; i < 3; i++) {
                        p.addCards(i, 0, false);
                    }
                }
                if (p.isMe || !p.isLooked) {
                    continue;
                }
                p.updateLooked();
                p.showFanCards();
            }
        }
        game.curSingleBet = +data.curMinBets;
        game.totalBets = +data.totalBets;
        if (data.totalBets && (+data.totalBets) > 0) {
            game.addChips(+data.totalBets);
        }
        game.info.updateBetsPool();

        this.handleNextRound({ round: data.round });
        game.changeState(data.status + 1);

        let args = { pos: data.curOptPos, time: data.leftTime };
        this.handleCurOpt(args);

        //显示等待提示
        let me = this.game.plyMgr.me;
        if (user.where == undefined && data.status > State.FREE && me.state < PlayerState.READY) {
            this.game.showWaitTips();
        }
        user.where = undefined;
    }

    handlePayback(data: {
        rPos: number;
        paybackBetPoints: string;
        totalBetPoints: string;
        remainBetPoints: string
    }): any {
        let game = this.game;
        let p = game.plyMgr.getPlyByPos(data.rPos);
        if (p) {
            p.setBets(data.totalBetPoints);
            p.updateBets();
            p.money = data.remainBetPoints;
            p.updateMoney();
        }
    }

    // 结束亮牌
    sendShowCard() {
        net.notify("game.jhHandler.showCards", {})
    }

    // 弃牌
    sendDisCard() {
        net.notify("game.jhHandler.discard", { round: this.game.round })
    }

    // 发起比牌
    sendChallenge(seat: number) {
        net.notify("game.jhHandler.challenge", { coverPos: this.game.plyMgr.getPlyBySeat(seat).pos })
    }

    // 跟注/加注/allin
    sendDoBet(bets: number, type: UserOpt) {
        net.notify("game.jhHandler.doBet", { bets: bets.toString(), type: type })
    }

    // 点击看牌
    sendFaceUp() {
        net.notify("game.jhHandler.faceUp", {})
    }
}