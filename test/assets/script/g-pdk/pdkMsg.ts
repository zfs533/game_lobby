import PdkGame from "./pdkGame";
import { CARD_TYPE } from "./pdkCardTools";
import GameMsg from "../g-share/gameMsg";
import net from "../common/net";
import { ROUTE } from '../common/route';

export interface ResultShowInfo {
    ur: ps.Pdk_UserReslut_Result,
    loc: string,
    minScore: string,
    isMe: boolean,
    isRight: boolean,
    guan: string,
    remainCards: number[],
}

const CLOSED_DOUBLE = 2;
let Decimal = window.Decimal;
export default class PdkMsg extends GameMsg {
    protected game: PdkGame;

    protected regMsgHanlder(): void {
        // cc.log('pdk reg...........');
        this.onMsg(ROUTE.pdk_DealCard, this.handleDealCard.bind(this));
        this.onMsg(ROUTE.pdk_UsersStartCards, this.handleUsersStartCards.bind(this));
        this.onMsg(ROUTE.pdk_UsersPlayCards, this.handleUsersPlayCards.bind(this));
        this.onMsg(ROUTE.pdk_UsersNotPlay, this.handleUsersNotPlay.bind(this));
        this.onMsg(ROUTE.pdk_UserAuto, this.handleUserAuto.bind(this));
        this.onMsg(ROUTE.pdk_UserReslut, this.handleUserReslut.bind(this));
        this.onMsg(ROUTE.pdk_BombGetMoney, this.handleBoomGetMoney.bind(this));
    }

    ///////////////////////////////response/////////////////////////////////
    /**
     * 发牌
     * @param data
     */
    handleDealCard(data: ps.Pdk_DealCard) {
        this.game.sendCard(data.cards);
        this.game.turnPlayerPlay(data.firstPos);
    }

    /**
     * 轮到玩家出牌
     * @param data
     */
    handleUsersStartCards(data: ps.Pdk_UsersStartCards) {
        this.game.turnPlayerPlay(data.pos, data.isFirst, data.leftTime);
    }

    /**
     * 出牌
     * @param data
     */
    handleUsersPlayCards(data: ps.Pdk_UsersPlayCards) {
        this.game.showPlayerDiscard(data.pos, data.cards, data.shape);
    }

    /**
     * 不出
     * @param data
     */
    handleUsersNotPlay(data: ps.Pdk_UsersNotPlay) {
        this.game.showPlayerNoPlay(data.pos);
    }

    /**
     * 结算
     * @param data
     */
    async handleUserReslut(data: ps.Pdk_UserReslut) {
        let resultInfo: ResultShowInfo[] = [];
        let proAll: Promise<{}>[] = [];
        for (const uResult of data.result) {
            let player = this.game.plyMgr.getPlyByPos(uResult.pos);
            if (!player) continue;
            let isMe = player.isMe;
            let loc = player.loc;
            let guanStatus: string;
            let remainCards: number[];

            // 被关、反关、包赔
            if (!!uResult.isClosed) {
                if (player.isFirst) {
                    guanStatus = "fg";
                } else {
                    guanStatus = "bg";
                }
            }
            if (data.payForAllPos === uResult.pos) {
                guanStatus = "bp";
            }

            // 刷新界面、展示余牌
            if (!isMe) {
                player.setSirenAnim(false);
                player.hideRemain();
                player.hideAllStatus();
                if (!uResult.remainCards)
                    remainCards = player.lastCards;
            } else {
                if (guanStatus !== undefined) {
                    this.game.setPayAnim(guanStatus);
                }
                // 双关
                let closedNum = 0;
                for (const ur of data.result) {
                    let player = this.game.plyMgr.getPlyByPos(ur.pos);
                    let isMe = player.isMe;
                    if (!isMe && !!ur.isClosed) closedNum += 1;
                }
                if (closedNum === CLOSED_DOUBLE) {
                    this.game.setPayAnim("sg");
                }
            }
            if (uResult.remainCards) {
                remainCards = uResult.remainCards;
                proAll.push(player.playEndAnim(!!uResult.isClosed));
            }

            let pMoney = player.money ? player.money : 0;
            let money = new Decimal(pMoney).add(uResult.money).toString();
            player.updateMoney(money);

            let info: ResultShowInfo = {
                ur: uResult,
                loc: loc,
                minScore: this.game.baseScore.toString(),
                isMe: isMe,
                isRight: player.isRightPlayer,
                guan: guanStatus,
                remainCards: remainCards,
            }
            resultInfo.push(info);
        }

        // 提前亮牌
        for (let idx = 0; idx < data.result.length; idx++) {
            const ur = data.result[idx];
            if (!ur.remainCards) break;
            if (idx === data.result.length - 1) {
                proAll.push(this.game.showAdvanceTips());
            }
        }

        await Promise.all(proAll);
        this.game.resultPanel.show(resultInfo);
    }

    /**
     * 炸弹奖励
     * @param data
     */
    handleBoomGetMoney(data: ps.Pdk_BombGetMoney) {
        this.updateMoney(data.bomb);
        for (let i = 0; i < data.bomb.length; i++) {
            const offMoney = data.bomb[i];
            let player = this.game.plyMgr.getPlyByPos(offMoney.pos);
            if (!player) continue;

            player.showWinOrLost(offMoney.bombMoney);

        }
    }

    /**
     * 托管
     * @param data
     */
    handleUserAuto(data: ps.Pdk_UserAuto) {
        let player = this.game.plyMgr.getPlyByPos(data.pos);
        if (player.isMe) {
            this.game.meHosted(!!data.isAuto);
        } else {
            player.setAuto(!!data.isAuto);
        }
    }

    /**
     * 断线重连
     * @param gameInfo
     */
    protected handleGameInfo(gameInfo: ps.Pdk_GameInfo) {
        super.handleGameInfo(gameInfo);
        console.log("------------handleCurrentGameInfo--------------");

        if (gameInfo.handCards) {
            // 加载自己的手牌
            this.game.initHolds(gameInfo.handCards);
        }
        for (const userInfo of gameInfo.userInfo) {
            let player = this.game.plyMgr.getPlyByPos(userInfo.pos);
            if (player.isMe) {
                this.game.meHosted(!!userInfo.hosted);
            } else {
                player.setAuto(!!userInfo.hosted);
            }
            player.setCurrCardNum(userInfo.remainCount);

            // 玩家个人信息
            player.isMale = !!userInfo.gender;
            player.updateLoc(userInfo.loc);
            player.money = userInfo.money
            player.updateMoney();
        }
        this.updateMoney(gameInfo.userInfo);

        this.game.returnGame = true;
        this.game.hideHold(!gameInfo.isShow);
        // 上手牌
        if (gameInfo.beforePos > -1) {
            this.game.showPlayerDiscard(gameInfo.beforePos, gameInfo.beforeCards);
        }
        if (gameInfo.curPlayPos > -1) {
            this.game.turnPlayerPlay(gameInfo.curPlayPos, gameInfo.isFirst, gameInfo.leftTime);
        }

        // 记牌器
        if (gameInfo.alreadyCards) {
            this.game.recordCardPanel.saveDiscardNum(gameInfo.alreadyCards);
        }
    }

    private updateMoney(data: ps.Pdk_BombGetMoney_bombData[]) {
        for (let i = 0; i < data.length; i++) {
            const offMoney = data[i];
            let player = this.game.plyMgr.getPlyByPos(offMoney.pos);
            if (!player) continue;
            if (player.money !== undefined && offMoney.bombMoney !== undefined) {
                player.money = new Decimal(player.money).add(offMoney.bombMoney).toString();
                player.updateMoney();
            }
        }
    }

    ///////////////////////////////send/////////////////////////////////
    sendPlayCards(cardType: CARD_TYPE, cardsData: number[]) {
        net.notify("game.pdkHandler.playCards", { cards: cardsData });
    }

    sendNotPlay() {
        net.notify("game.pdkHandler.noPlay", {});
    }

    sendHosted() {
        net.notify("game.pdkHandler.auto", {});
    }

}
