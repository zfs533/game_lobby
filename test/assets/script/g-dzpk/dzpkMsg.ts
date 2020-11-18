import GameMsg from "../g-share/gameMsg";
import User from "../common/user";
import DZPKGame, { DZPKGameStatus, State } from "./dzpkGame";
import { BetType, PlayerStates } from "./dzpkPlayer";
import { ROUTE } from "../common/route";

export default class DZPKMsg extends GameMsg {
    protected game: DZPKGame;

    protected regMsgHanlder(): void {

        this.onMsg(ROUTE.dzpk_AppointDealer, this.handleAppointDealer.bind(this));
        this.onMsg(ROUTE.dzpk_DealHandCard, this.handleDealHandCard.bind(this));
        this.onMsg(ROUTE.dzpk_DealCards, this.handleDealCards.bind(this));
        this.onMsg(ROUTE.dzpk_Opt, this.handleOpt.bind(this));
        this.onMsg(ROUTE.dzpk_Fold, this.handleDiscard.bind(this));
        this.onMsg(ROUTE.dzpk_Check, this.handleUserCheck.bind(this));
        this.onMsg(ROUTE.dzpk_Follow, this.handleUserFollow.bind(this));
        this.onMsg(ROUTE.dzpk_Raise, this.handleUserRaise.bind(this));
        this.onMsg(ROUTE.dzpk_AllIn, this.handleUserAllIn.bind(this));
        this.onMsg(ROUTE.dzpk_DoPot, this.handleUserDoPot.bind(this));
        this.onMsg(ROUTE.dzpk_DoBalance, this.handleResult.bind(this));
        this.onMsg(ROUTE.dzpk_StatusChange, this.handleStatusChange.bind(this));

        this.onMsg(ROUTE.dzpk_InitTakeMoney, this.handleInitTakeMoney.bind(this));
        this.onMsg(ROUTE.dzpk_InitUsers, this.handleInitUsers.bind(this));

        // 德州扑克是游戏中单独分配钱，所以需要这里单独监听一下自身money的变化
        this.onMsg(ROUTE.userMoney, this.handleUserMoney.bind(this));

        // 测试
        // this.onMsg('dzpk_OpenHandCard', this.handOpenCard.bind(this));

    }

    // async handOpenCard (data: { openMsg: { pos: number, handCard: number[] }[]}){
    //     this.game.changeState(State.Deal);
    //     let poarr = [];
    //     for (let i = 0; i < data.openMsg.length; i++) {
    //         let msg = data.openMsg[i];
    //         let p = this.game.plyMgr.getPlyByPos(msg.pos);
    //         if (!p) {
    //             continue;
    //         }
    //         p.handlePai = msg.handCard;
    //         for (const i in msg.handCard) {
    //             poarr.push(p.addCards(+i, msg.handCard[i]));
    //         }
    //         await Promise.all(poarr);
    //     }
    // }

    handleInitTakeMoney(data: { takeMoney: string }) {
        let me = this.game.plyMgr.me;
        me.updateShowMoney(data.takeMoney);
    }

    handleInitUsers(data: { users: ps.User[] }) {
        this.game.plyMgr.updatePlayersForTakeMoney(data.users);
    }



    handleStatusChange(data: ps.Dzpk_StatusChange) {
        if (data.status === DZPKGameStatus.PREFLOP) {
            this.game.dealHandCard();
        }
    }

    /**
     * 处理下注信息
     * @param currRoundBets 当前单注
     * @param totalBets 总注
     */
    private handleBets(currRoundBets: string, totalBets: string) {
        let game = this.game;
        game.setBetsInfo(+currRoundBets, +totalBets);
        game.updateRoomInfo();
    }

    private handleOpt(data: ps.Dzpk_Opt) {
        let game = this.game;
        let player = game.plyMgr.getPlyByPos(data.pos);
        if (player && player.exist) {
            game.changeState(State.Turing);
            player.setCurRoundAddBetCnt(data.curRoundAddCnt);
            player.startTurn(data.time);
        } else {
            cc.warn("找不到player!" + data.pos);
        }
    }

    private handleDiscard(data: ps.Dzpk_Fold) {
        let game = this.game;
        let player = game.plyMgr.getPlyByPos(data.pos);
        if (player && player.exist) {
            player.discard();
        } else {
            cc.warn("找不到player!" + data.pos);
        }
    }
    private handleUserCheck(data: ps.Dzpk_Check) {
        let game = this.game;
        let player = game.plyMgr.getPlyByPos(data.pos);
        if (player && player.exist) {
            player.check();
        } else {
            cc.warn("找不到player!" + data.pos);
        }
    }

    private handleUserFollow(data: ps.Dzpk_Follow) {
        this.handleDoBet(data.pos, BetType.Follow, data.bets, data.userMoney, data.totalBets);
    }

    private handleUserRaise(data: ps.Dzpk_Raise) {
        this.handleDoBet(data.pos, BetType.Raise, data.bets, data.userMoney, data.totalBets);
    }

    private handleUserAllIn(data: ps.Dzpk_AllIn) {
        this.handleDoBet(data.pos, BetType.AllIn, data.bets, data.userMoney, data.totalBets);
    }

    private handleDoBet(rPos: number, betType: number, betPoints: string, remainBetPoints: string, totalBets: string) {
        let game = this.game;
        let player = game.plyMgr.getPlyByPos(rPos);
        if (player && player.exist) {
            player.takeMoney = remainBetPoints;
            player.updateBalance();
            player.bets(betPoints, betType);
        } else {
            cc.warn("找不到player!" + rPos);
        }

        this.handleBets(player.roundBets.toString(), totalBets);

        if (!this.game.isTwoWheel) {
            this.game.dealSmallBetsPool([+totalBets]);
        }
    }
    /**
     * 处理下大小盲注
     * @param data
     */
    private handleUserDoPot(data: ps.Dzpk_DoPot) {
        this.handleDoBet(data.pos, BetType.None, data.pot, data.userMoney, data.totalBets);
    }

    protected handleGameInfo(data: ps.Dzpk_GameInfo) {
        super.handleGameInfo(data);

        let game = this.game;
        this.game.roundBets = +data.curRoundMaxBets;
        data.userInfo.forEach(info => {
            let player = game.plyMgr.getPlyByPos(info.pos);
            if (player && player.exist) {
                if (info.money) {
                    player.takeMoney = info.money;
                }
                for (const i in info.handPai) {
                    player.addCards(+i, info.handPai[i]);
                }
                if (info.isDealer) {
                    player.becomeDealer();
                }
                player.setCurRoundAddBetCnt(info.curRoundAddBetCnt);
                player.setRoundBets(+info.curRoundBets);
                player.changeState(PlayerStates.STARTED);
            }
        });

        if (data.commonCards && data.commonCards.length > 0) {
            for (const c of data.commonCards) {
                this.game.dealCommonCard(c);
            }
            this.game.changeOperationsDefultRaiseLabel();
            this.game.dealMyCardType();
        }

        if (data.pools && data.pools.length > 0) {
            this.game.dealSmallBetsPool(data.pools);
        }

        if (data.status > DZPKGameStatus.PREFLOP && data.status < DZPKGameStatus.GAMEEND) {
            let player = game.plyMgr.getPlyByPos(data.curOptUser);
            if (player && player.exist && data.leftTime > 0) {
                game.changeState(State.Turing);
                player.startTurn(data.leftTime);
            } else {
                cc.warn("leftTime小于等于0 或 找不到player!" + data.curOptUser);
            }
        }
        game.changeState(data.status);
        data.userInfo.forEach(info => {
            let player = game.plyMgr.getPlyByPos(info.pos);
            if (player && player.exist) {
                player.updateLookerView();
                player.takeMoney = info.money;
                player.updateBalance();
                player.updateLoc(info.location);
                if (info.isFold) {
                    player.discard(false);
                }
            }
        });

        //显示等待提示
        let me = this.game.plyMgr.me;
        // cc.log("--data.status---", data.status);
        // cc.log("--me.status---", me.state);
        if (User.where == undefined && data.status > DZPKGameStatus.FREE && me.state < PlayerStates.READY) {
            this.game.showWaitTips();
        }
        User.where = undefined;
    }

    private handleResult(data: ps.Dzpk_DoBalance) {
        let game = this.game;
        game.changeState(State.Result);
        game.plyMgr.hideActions();
        game.resetOperations();
        this.game.plyMgr.resetRoundBets();
        this.game.dealSmallBetsPool(data.pools);

        game.hideCardType();
        game.winnerNum = 0;
        for (let info of data.userInfo) {
            game.winnerNum += info.isWinner;

            setTimeout(function () {
                game.showResult(info);
            }, 500);

            if (info.handCards && info.handCards.length > 0) {
                let player = game.plyMgr.getPlyByPos(info.pos);
                if (player && player.exist) {
                    if (!player.isLooker) {
                        if (player.isMe && player.cards.length > 0) {
                            player.showFinalCardType(info.cardType, info.maxCards);
                        } else if (info.handCards[0] != 0) {
                            player.addCards(1, info.handCards[1], false).then(() => {
                                player.turnCard(1, true, true);
                            });
                            player.addCards(0, info.handCards[0], false).then(() => {
                                player.turnCard(0, true, true).then(() => {
                                    player.showFinalCardType(info.cardType);
                                });
                            });
                        }
                    }
                    if (!info.isWinner) {
                        player.updateShowMoney(info.userMoney);
                        player.updateBalance();
                    }
                }
            }
        }
    }

    private async handleDealHandCard(data: ps.Dzpk_DealHandCard) {
        this.game.changeState(State.Deal);
        // 从小盲注 开始发牌
        this.game.plyMgr.me.handlePai = data.handPai;

    }

    private async handleDealCards(data: ps.Dzpk_DealCards) {
        for (const c of data.cards) {
            this.game.dealCommonCard(c);
        }
        this.game.resetRoundBets();
        this.game.dealSmallBetsPool(data.pools);

        // 展示公共牌后  即进入第二轮以后  改变默认加注按钮的面值
        this.game.changeOperationsDefultRaiseLabel();
        this.game.dealMyCardType();
    }


    private async handleAppointDealer(data: ps.Dzpk_AppointDealer) {
        // cc.log("---设置庄家--", data.dealerPos);
        let game = this.game;
        let player = game.plyMgr.getPlyByPos(data.dealerPos);
        if (player) {
            player.becomeDealer();
        } else {
            cc.log("---没有Dealer--");
        }
        this.game.smallPos = data.smallPos;
    }

    private handleUserMoney(data: { money: string }) {
        let me = this.game.plyMgr.me;
        if (me) {
            me.money = data.money;
        }
    }
}