import DDZGame, { State } from "./ddzGame";
import { CARD_TYPE } from "./ddzCardTools";
import GameMsg from "../g-share/gameMsg";
import { showTip } from "../common/ui";
import net from "../common/net";
import { ROUTE } from '../common/route';

enum GameStatus {
    STATUS_FREE, //空闲阶段
    STATUS_DEAL_CARD, // 发牌阶段
    STATUS_JIAO_DIZHU, //叫地主
    STATUS_ADD_MULT, //加倍
    STATUS_PLAY_CARD, //出牌
    STATUS_RESULT, //结算阶段
    STATUS_END //结束
}

enum JiaoStatus {
    BUJIAO = 0, JIAO_ONE, JIAO_TWO, JIAO_THREE, JIAO_NULL
}

export interface ResultShowInfo {
    ur: ps.Ddz_EnterResult_ResultInfo, isDealer: boolean, loc: string, isMe: boolean, isRight: boolean, isAddMul: boolean, remainCards: number[],
}

const Decimal = window.Decimal

export default class DdzMsg extends GameMsg {
    protected game: DDZGame;

    protected regMsgHanlder(): void {
        // cc.log('ddz reg...........');
        this.onMsg(ROUTE.ddz_SendCard, this.handleDdzSendCard.bind(this));
        this.onMsg(ROUTE.ddz_EnterJiaoFen, this.handleDdzEnterJiaoFen.bind(this));
        this.onMsg(ROUTE.ddz_JiaoFen, this.handleDdzJiaoFen.bind(this));
        this.onMsg(ROUTE.ddz_BroadcastDiZhu, this.handleDdzBroadcastDiZhu.bind(this));
        this.onMsg(ROUTE.ddz_EnterDouble, this.handleDdzEnterDouble.bind(this));
        this.onMsg(ROUTE.ddz_Double, this.handleDdzDouble.bind(this));
        this.onMsg(ROUTE.ddz_EnterPlayCards, this.handleDdzEnterPlayCards.bind(this));
        this.onMsg(ROUTE.ddz_PlayCards, this.handleDdzPlayCards.bind(this));
        this.onMsg(ROUTE.ddz_NoPlay, this.handleDdzNoPlay.bind(this));
        this.onMsg(ROUTE.ddz_EnterResult, this.handleDdzEnterResult.bind(this));
        this.onMsg(ROUTE.ddz_NoBodyJiaoFen, this.handleDdzNoBodyJiaoFen.bind(this));
        this.onMsg(ROUTE.ddz_Hosted, this.handleDdzHosted.bind(this));
    }


    ///////////////////////////////response/////////////////////////////////
    /**
     * 发牌
     * @param data
     */
    handleDdzSendCard(data: ps.Ddz_SendCard) {

        this.game.initHolds(data.handCards);
        this.game.plyMgr.setRemainCard();

        this.game.sendCardsAnimation();
        this.game.delayShowBtnHosted();

        this.game.changeState(State.Start);
        this.game.ddzCombination.node.active = false;
    }

    /**
     * 轮到玩家叫分
     * @param data
     */
    handleDdzEnterJiaoFen(data: ps.Ddz_EnterJiaoFen) {
        this.game.turnPlayerScore(data.leftTime, data.pos);
    }

    /**
     * 玩家叫分
     * @param data
     */
    handleDdzJiaoFen(data: ps.Ddz_JiaoFen) {
        this.game.showPlayerScore(data.point, data.pos);
    }

    /**
     * 通知地主消息
     * @param data
     */
    handleDdzBroadcastDiZhu(data: ps.Ddz_BroadcastDiZhu) {
        this.game.showDealer(data.pos, data.cards);
        this.game.plyMgr.endJiaoFen();
    }

    /**
     * 选择加倍
     * @param data
     */
    handleDdzEnterDouble(data: ps.Ddz_EnterDouble) {
        this.game.waitPlayerAdd(data.leftTime);
    }

    /**
     * 通知玩家是否加倍
     * @param data
     */
    handleDdzDouble(data: ps.Ddz_Double) {
        this.game.showPlayerAdd(data.pos, data.add);
    }

    /**
     * 轮到玩家出牌
     */
    handleDdzEnterPlayCards(data: ps.Ddz_EnterPlayCards) {
        //cc.log('轮到玩家出牌')
        this.game.turnPlayerPlay(data.leftTime, data.pos, data.first);
    }

    /**
     * 通知用户出牌
     * @param data
     */
    handleDdzPlayCards(data: ps.Ddz_PlayCards) {
        //cc.log('通知用户出牌')
        this.game.showPlayerDiscard(data.pos, data.cards, data.shape);
    }

    /**
     * 通知玩家不出
     * @param data
     */
    handleDdzNoPlay(data: ps.Ddz_NoPlay) {
        //cc.log('不出')
        this.game.showPlayerNoPlay(data.pos);
    }

    /**
     * 结算
     * @param data
     */
    async handleDdzEnterResult(data: ps.Ddz_EnterResult) {
        this.game.gaming = false;
        this.game.hideDealerCards();
        // 保存玩家信息
        let resultInfo: ResultShowInfo[] = [];
        for (const uResult of data.ur) {
            let player = this.game.plyMgr.getPlyByPos(uResult.pos);
            let isDealer = player.isDealer;
            let loc = player.loc;
            let isMe = player.isMe;
            let addMul = player.addMul;
            let remainCards: number[];

            if (!isMe) {
                player.setSirenAnim(false);
                player.hideRemain();
                player.cleanCards();
                if (uResult.remainCards) {
                    remainCards = uResult.remainCards;
                } else {
                    remainCards = player.lastCards;
                }
            }

            let pMoney = player.money ? player.money : 0;
            player.updateMoney(new Decimal(pMoney).add(uResult.chgScore).toString());

            let info: ResultShowInfo = {
                ur: uResult,
                isDealer: isDealer,
                loc: loc,
                isMe: isMe,
                isRight: player.isRightPlayer,
                isAddMul: (addMul === 2) ? true : false,
                remainCards: remainCards,
            }
            resultInfo.push(info);
        }

        // 春天加倍情况
        if (data.spring !== 1) {
            await this.game.playSpringAnim();
        }
        this.game.resultPanel.show(resultInfo, data.bombNum, data.spring);
        this.game.adoMgr.stopMusic();
    }

    /**
     * 所有玩家都不叫
     */
    handleDdzNoBodyJiaoFen(data?: ps.Ddz_NoBodyJiaoFen) {
        showTip("当前无玩家叫分，本局重新发牌");
        this.game.initRound();
        this.game.plyMgr.initEnable();
    }

    /**
     * 断线重连
     * @param gameEndInfo
     */
    protected handleGameInfo(gameEndInfo: ps.Ddz_GameInfo) {
        super.handleGameInfo(gameEndInfo);

        let currScore = 0;
        for (const userInfo of gameEndInfo.users) {
            // 记录玩家在各个状态时的情况
            let player = this.game.plyMgr.getPlyByPos(userInfo.pos);
            if (!player) {
                break;
            }
            if (gameEndInfo.status === GameStatus.STATUS_JIAO_DIZHU) {
                if (userInfo.jiaoStatus) {
                    player.showScoreStatus(userInfo.jiaoStatus);
                    if (currScore < userInfo.jiaoStatus && userInfo.jiaoStatus !== JiaoStatus.JIAO_NULL) {
                        currScore = userInfo.jiaoStatus;
                    }
                }
            } else if (gameEndInfo.status > GameStatus.STATUS_JIAO_DIZHU) {
                // 叫分之后有地主信息、倍数
                if (gameEndInfo.ddzPos === userInfo.pos) {
                    player.setDealer(true, false);
                } else {
                    player.setDealerHead(false);
                }

                if (gameEndInfo.status === GameStatus.STATUS_ADD_MULT) {
                    // 地主不用显示加倍
                    if (userInfo.addStatus) {
                        player.showMulStatus(userInfo.addStatus);
                    } else if (!player.isDealer && player.isMe) {
                        this.game.setAddMulPanel(true);
                    } else {
                        player.setWaitTime(gameEndInfo.leftTime);
                    }
                }
                if (player.isMe && userInfo.totalMulti) {
                    this.game.labMul.string = userInfo.totalMulti.toString();
                }
            }
            // 加载自己的手牌
            if (player.isMe) {
                this.game.initHolds(userInfo.handCards);
                this.game.meHosted(userInfo.hosted === 1);
            } else {
                player.setAuto(userInfo.hosted === 1);
            }
            player.setCurrCardNum(userInfo.remainCount);

            // 玩家个人信息
            player.isMale = !!userInfo.gender;
            player.updateLoc(userInfo.loc);
            player.money = userInfo.money;
            player.updateMoney();
        }

        // 游戏状态
        if (gameEndInfo.status === GameStatus.STATUS_JIAO_DIZHU) {
            if (gameEndInfo.optPos !== undefined) {
                this.game.currScore = currScore;
                this.game.turnPlayerScore(gameEndInfo.leftTime, gameEndInfo.optPos)
            }
        } else if (gameEndInfo.status > GameStatus.STATUS_JIAO_DIZHU) {
            if (gameEndInfo.lastPos !== undefined && gameEndInfo.lastCards !== undefined) {
                this.game.showPlayerDiscard(gameEndInfo.lastPos, gameEndInfo.lastCards);
            }
            if (gameEndInfo.optPos !== undefined) {
                this.game.turnPlayerPlay(gameEndInfo.leftTime, gameEndInfo.optPos, gameEndInfo.first);
            }

            this.game.setDealerCards(gameEndInfo.ddzCards);
            // 记录已出的牌还包括自己手牌
            if (gameEndInfo.cardsCounter) {
                this.game.recordCardPanel.saveDiscardNum(gameEndInfo.cardsCounter);
            }
        }

        this.game.changeState(State.Start);
    }

    handleDdzHosted(data: ps.Ddz_Hosted) {
        let player = this.game.plyMgr.getPlyByPos(data.pos);
        if (player.isMe) {
            this.game.meHosted(data.state === 1);
        } else {
            player.setAuto(data.state === 1);
        }
    }
    ///////////////////////////////send/////////////////////////////////
    sendJiaoFen(score: number) {
        net.notify("game.ddzHandler.JiaoFen", { point: score });
    }

    sendAddMulti(mul: number) {
        net.notify("game.ddzHandler.addMulti", { add: mul });
    }

    sendPlayCards(cardType: CARD_TYPE, cardsData: number[]) {
        net.notify("game.ddzHandler.playCards", { cards: cardsData, shape: cardType });
        this.game.touchMgr.enableCards(true);
    }

    sendNotPlay() {
        net.notify("game.ddzHandler.noPlay", {});
    }

    sendHosted() {
        net.notify("game.ddzHandler.hostedChg", {});
    }
}
