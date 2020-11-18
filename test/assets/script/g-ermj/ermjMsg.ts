import ErmjGame from "./ermjGame";
import * as ErmjType from "./ermj";
import GameMsg from "../g-share/gameMsg";
import net from "../common/net";
import ErmjPlayer from "./ermjPlayer";
import { ROUTE } from '../common/route';

const Decimal = window.Decimal
export type jiaBeiInfo = {
    pai: number,
    paiPos: number,
}
export default class ErmjMsg extends GameMsg {
    protected game: ErmjGame;

    protected regMsgHanlder(): void {
        this.onMsg(ROUTE.ermj_PlayerWaitOutTile, this.handleWaitOutPai);
        this.onMsg(ROUTE.ermj_ChiPengGangHu, this.handlePengGangHu);
        this.onMsg(ROUTE.ermj_DealTile, this.handleSendPai);
        this.onMsg(ROUTE.ermj_PlayerOutTile, this.handleOutCard);
        this.onMsg(ROUTE.ermj_PlayerUpTile, this.handleUpPai);
        this.onMsg(ROUTE.ermj_PlayerGangTile, this.handleGangCard);
        this.onMsg(ROUTE.ermj_PlayerHu, this.handleHu);
        this.onMsg(ROUTE.ermj_PlayerPengTile, this.handlePengCard);
        this.onMsg(ROUTE.ermj_PlayerChiTile, this.handleChiCard);
        this.onMsg(ROUTE.ermj_GameResult, this.handleGameResult);
        this.onMsg(ROUTE.ermj_UserAuto, this.handleUserAuto);
        this.onMsg(ROUTE.ermj_TingNextTiles, this.handleTingNextHandlePais);
        this.onMsg(ROUTE.ermj_HuPass, this.handleFangHuCount);
    }

    /**
     * 发牌
     */
    handleSendPai(data: ps.Ermj_DealTile) {
        // console.log("==================================begin");
        this.game.plyMgr.setPlayerDealer(data.dealerPos);
        this.game.startGame(data.tiles);
        this.game.mjResult.savePlayerData();
        this.game.setQuanMen(data.quanFeng, data.menFeng);
        this.game.mjTimer.setRemainPaiTotal(37);
    }

    /**
     * 报听后看对方牌
     */
    handleTingNextHandlePais(data: ps.Ermj_TingNextTiles) {
        this.game.plyMgr.getPlyBySeat(1).setHoldPais(data.nextTiles);
    }

    /**
     * 轮到谁操作
     */
    handleWaitOutPai(data: ps.Ermj_PlayerWaitOutTile) {
        this.game.setWaitOutPai(data.curOptPos, data.leftTime);
    }

    /**
     * 玩家摸牌
     */
    handleUpPai(data: ps.Ermj_PlayerUpTile) {
        this.game.setPlayerDraw(data.pos, data.tile);
    }

    /**
     * 玩家托管
     */
    handleUserAuto(data: ps.Ermj_UserAuto) {

    }

    /**
     * 玩家出牌
     */
    handleOutCard(data: ps.Ermj_PlayerOutTile) {
        // cc.log('this.game.isTrusteeship', this.game.isTrusteeship)
        let player = this.game.plyMgr.getPlyByPos(data.pos);
        if (player) {
            player.setDiscard(data.tile, data.isTing);
            this.game.adoMgr.playDraw(player.isMale, data.tile);
        }

        let lastDiscardInfo: ErmjType.SaveDiscardInfo = {
            outPos: data.pos,
            outPaiVal: [data.tile]
        };
        this.game.lastDiscardInfo = lastDiscardInfo;
        if (player.isMe) {
            this.game.isTing = data.isTing;
            if (this.game.isTrusteeship == 1) {
                this.game.isTrusteeship = 3;
            } else {
                this.game.isTrusteeship = 2;
            }
        }
    }

    /**
     * 过胡加倍
     */
    handleFangHuCount(data: ps.Ermj_HuPass) {
        let player = this.game.plyMgr.getPlyByPos(data.pos);
        this.game.double(!player.isMe);

        let doubledPlayer = this.game.plyMgr.getPlyByPos(this.game.lastDiscardPos);
        doubledPlayer.doubled([{ paiPos: data.pos, pai: data.tile }]);
        this.game.adoMgr.playDouble(player.isMale);
    }

    /**
     * 进行碰、杠、胡 操作
     */
    handlePengGangHu(data: ps.Ermj_ChiPengGangHu) {
        let optArr: number[] = new Array();
        let isTingPai = false
        if (data.hu === ErmjType.BooleanType.BOOLEAN_YES) {
            optArr.push(ErmjType.OptType.OPT_HU);
            isTingPai = this.game.plyMgr.me.nodeBaoTing.active;     // 自己已听牌并且此轮有胡时显示翻倍
        }
        if (data.peng === ErmjType.BooleanType.BOOLEAN_YES)
            optArr.push(ErmjType.OptType.OPT_PENG);
        if (data.gang === ErmjType.BooleanType.BOOLEAN_YES)
            optArr.push(ErmjType.OptType.OPT_GANG);
        if (data.chi === ErmjType.BooleanType.BOOLEAN_YES)
            optArr.push(ErmjType.OptType.OPT_CHI);

        let isAuto = this.game.getIsAutoDraw();
        if (optArr.length > 0 && !isAuto && this.game.gaming) {
            this.game.mjOptPanel.show(optArr, isTingPai);
            this.game.mjTimer.setGameTicker(data.leftTime);

            this.game.coverPanel.active = true;
            this.game.baoTingPanel.hide();
        } else if (isAuto) {
            if (data.hu === ErmjType.BooleanType.BOOLEAN_YES) {
                this.sendHu();
            } else {
                this.sendPass();
            }
        }
    }

    handleChangeScore(data: { type: number[], changeScore: ErmjType.ChangeScore[] }) {
        this.game.mjResult.addChangeScore(data);

        let changeScoreArr = data.changeScore;
        let winRPos = 0;
        let changeScore;
        for (let index = 0; index < changeScoreArr.length; index++) {
            let changeScoreInfo = changeScoreArr[index];
            let rPos = changeScoreInfo.rPos;
            let score = changeScoreInfo.changeScore
            changeScore = changeScoreInfo.changeScore;
            let player = this.game.plyMgr.getPlyByPos(rPos);

            let resultScore = score
            player.showResultScore(resultScore);
            if (player.money !== undefined) {
                player.money = new Decimal(player.money).add(resultScore).toString();
                player.updateMoney();
            }
            if (score > 0)
                winRPos = rPos;
        }

        let types = data.type;
        types.forEach((t) => {

            // 抢杠胡
            if (t === ErmjType.HU_TYPE_ER.HUPAI_QIANG_GANG_HE) {
                changeScoreArr.forEach(scoreInfo => {
                    if (scoreInfo.changeScore < 0) {
                        let player = this.game.plyMgr.getPlyByPos(scoreInfo.rPos);
                        player.setQiangGangHu();
                        this.game.mjResult.updateGangData(scoreInfo.rPos);
                    }
                });
            }

            // 动画
            if (t === ErmjType.HU_TYPE_ER.HUPAI_GANG_SHANG_KAI_HUA) {
                // 杠上开花
                this.game.playAnimGskh();
            } else if (t === ErmjType.HU_TYPE_ER.HUPAI_QIANG_GANG_HE) {
                // 抢杠胡
                this.game.playAnimQgh();
            }
        });

        // 播放胡音效
        let isZimo = false;
        types.forEach((t) => {
            if (t === ErmjType.HU_TYPE_EX.HUPAI_ZI_MO) {
                isZimo = true;
            }
        });

        let player = this.game.plyMgr.getPlyByPos(winRPos);
        let fanInfo = this.game.mjResult.GetHuFanScore(types);
        if (changeScore != 0) {
            if (fanInfo >= 53) {
                this.game.adoMgr.playHu(player.isMale, isZimo, true);
            } else {
                this.game.adoMgr.playHu(player.isMale, isZimo, false);
            }
        }


    }


    /**
     * 玩家进行碰操作
     */
    handlePengCard(data: ps.Ermj_PlayerPengTile) {
        this.game.mjResult.saveGangData(data.pos, { type: data.type, pai: data.tile, chiPai: undefined });

        let player = this.game.plyMgr.getPlyByPos(data.pos);
        if (player) {
            player.setPGangPai(data.tile, ErmjType.GangType.GANG_TYPE_PENG);
            this.game.adoMgr.playPeng(player.isMale);
            this.game.playAnimPeng(player.getEffOptPos());
        }

        let lastOutPaiInfo = this.game.lastDiscardInfo;
        let outPlayer = this.game.plyMgr.getPlyByPos(lastOutPaiInfo.outPos);
        if (outPlayer) {
            outPlayer.removeFromDiscard();
        }
    }

    /**
     * 玩家进行吃操作
     */
    handleChiCard(data: ps.Ermj_PlayerChiTile) {
        this.game.mjResult.saveGangData(data.pos, { type: ErmjType.GangType.GANG_TYPE_CHI, pai: data.tile, chiPai: data.chiTile });

        let player = this.game.plyMgr.getPlyByPos(data.pos);
        if (player) {
            player.setPGangPai(data.tile, ErmjType.GangType.GANG_TYPE_CHI, data.chiTile);
            this.game.adoMgr.playChi(player.isMale);
            this.game.playAnimChi(player.getEffOptPos());
        }

        let lastOutPaiInfo = this.game.lastDiscardInfo;
        let outPlayer = this.game.plyMgr.getPlyByPos(lastOutPaiInfo.outPos);
        if (outPlayer) {
            outPlayer.removeFromDiscard();
        }
    }

    /**
     * 玩家进行杠操作
     */
    handleGangCard(data: ps.Ermj_PlayerGangTile) {
        this.game.mjResult.saveGangData(data.pos, { type: data.type, pai: data.tile, chiPai: undefined });

        // 保存数据
        let player = this.game.plyMgr.getPlyByPos(data.pos);
        if (player) {
            player.setPGangPai(data.tile, data.type);
            this.game.adoMgr.playGang(player.isMale);
        }

        // 点杠才有
        if (data.type === ErmjType.GangType.GANG_TYPE_SHINE) {
            let lastOutPaiInfo = this.game.lastDiscardInfo;
            let outPlayer = this.game.plyMgr.getPlyByPos(lastOutPaiInfo.outPos);
            if (outPlayer) {
                outPlayer.removeFromDiscard();
            }
        }

        this.game.playAnimGang(player.getEffOptPos());
    }

    /**
     * 胡
     */
    handleHu(data: ps.Ermj_PlayerHu) {
        [data.pos].forEach(rPos => {
            let isZm = false;
            if (this.game.currOptPlayer === undefined) {
                isZm = true;
            } else if (this.game.currOptPlayer === rPos) {
                isZm = true;
            }
            let player = this.game.plyMgr.getPlyByPos(rPos);
            player.setPlayerHu(data.tile, isZm);

            if (!isZm) {
                let pos = this.game.lastDiscardPos;
                let outPlayer = this.game.plyMgr.getPlyByPos(pos);
                outPlayer.setDiscardHuStatus(data.tile);
            }
        });
        this.game.adoMgr.playComHu();
    }

    /**
     * 游戏结算
     */
    handleGameResult(data: ps.Ermj_GameResult) {
        let changeScore = [];
        for (const r of data.results) {
            changeScore.push({ rPos: r.pos, changeScore: +r.chgMoney })
        }
        this.handleChangeScore({
            type: data.huType || [],
            changeScore
        });

        for (let idx = 0; idx < this.game.plyMgr.playerCnt; idx++) {
            let player = this.game.plyMgr.getPlyByPos(idx)
            if (player) {
                player.clearWaitingTimer();
            }
        }

        this.game.setSelfHu();
        this.game.mjTimer.setGameTicker(0);

        this.game.mjResult.prepareTime.node.active = false;
        this.game.mjResult.times = [this.game.oppDoubleCount.string, this.game.doubleCount.string];
        this.game.resultsFun = setTimeout(() => {
            this.game.mjResult.show(data.results);
            this.game.plyMgr.clearAllLeavePlayer();
        }, 2000);
    }

    /**
    * 断线重连
    * @param gameEndInfo
    */
    protected handleGameInfo(data: ps.Ermj_GameInfo) {
        if (!this.game.gaming) {
            return;
        }
        super.handleGameInfo(data);

        // 获取状态
        let isGamingStatus = false;// 是否在正常游戏中
        let isEndStatus = false;
        let isOutPaiStatus = false;
        let isOptStatus = false;
        switch (data.gameStatus) {
            case ErmjType.GameStatus.GAME_WAIT:
                console.log("当前状态 : 等待开始");
                return;
            case ErmjType.GameStatus.GAME_SEND_CARD:
                console.log("当前状态 : 发牌");
                break;
            case ErmjType.GameStatus.GAME_WAIT_USER_OUT_CARD:
                console.log("当前状态 : 出牌");
                isGamingStatus = true;
                isOutPaiStatus = true;
                break;
            case ErmjType.GameStatus.GAME_CHI_PENG_GANG_HU:
                console.log("当前状态 : 操作");
                isGamingStatus = true;
                isOptStatus = true;
                break;
            case ErmjType.GameStatus.GAME_ROUND_RESULT:
                console.log("当前状态 : 结算");
                isGamingStatus = true;
                isEndStatus = true;
                break;
            default:
                break;
        }

        // 把已离开玩家的信息还原到游戏中
        if (data.users) {
            for (let rPos = 0; rPos < data.users.length; rPos++) {
                let serverPlayer = this.game.plyMgr.getPlyByPos(rPos);
                let realSeat = rPos - this.game.plyMgr.seatOffset;
                if (realSeat < 0) {
                    realSeat += data.users.length;
                }
                let clientPlayer = this.game.plyMgr.getPlyBySeat(realSeat);
                if (!serverPlayer) {
                    // 玩家已离开
                    clientPlayer.init(this.game);
                    clientPlayer.pos = rPos;
                    clientPlayer.setLeave(true);
                    // this.game.plyMgr.players[rPos] = clientPlayer;
                }
            }
        }


        // 判断是否该自己操作
        let isTurnSelf = false;
        let currOptPlayer: ErmjPlayer = undefined;
        if (data.curOptPos !== undefined) {
            currOptPlayer = this.game.plyMgr.getPlyByPos(data.curOptPos);
            if (currOptPlayer && currOptPlayer.isMe) {
                isTurnSelf = true;
            }
        }

        // 不会变化的数据
        this.game.mjTimer.setGameTicker(data.leftTime);
        if (data.lastOutTilePos !== undefined) {
            let lastDiscardInfo: ErmjType.SaveDiscardInfo = {
                outPos: data.lastOutTilePos,
                outPaiVal: [data.lastOutTile]
            };
            this.game.lastDiscardInfo = lastDiscardInfo;
        }
        if (data.dealerPos !== undefined) {
            this.game.plyMgr.setPlayerDealer(data.dealerPos);
            if (data.remainTileCount !== undefined)
                this.game.mjTimer.setRemainPaiTotal(data.remainTileCount);
            // if (data.scores !== undefined) {
            //     this.game.mjResult.changeScoreData = data.scores.concat();
            //     data.scores.forEach((changeScoreInfo: { type: number[], changeScore: ErmjType.ChangeScore[] }) => {
            //         changeScoreInfo.changeScore.forEach(scoreInfo => {
            //             let player = this.game.plyMgr.getPlyByPos(scoreInfo.rPos);
            //             if (player && player.money) {
            //                 let changeScore = new Decimal(scoreInfo.changeScore).mul(this.game.baseScore);
            //                 player.money = new Decimal(player.money).add(changeScore).toString();
            //                 player.updateMoney();
            //             }
            //         });
            //     });
            // }
        }

        // 玩家手牌信息
        let holdsValArr = data.handTile;
        // 按客户端座位排序
        if (data.users) {
            data.users.sort((userA, userB) => {
                let realSeatA = userA.pos - this.game.plyMgr.seatOffset;
                if (realSeatA < 0) {
                    realSeatA += data.users.length;
                }
                let realSeatB = userB.pos - this.game.plyMgr.seatOffset;
                if (realSeatB < 0) {
                    realSeatB += data.users.length;
                }
                return realSeatA - realSeatB;
            });
            let savePlayerInfoArr = [];
            for (let seatIdx = 0; seatIdx < data.users.length; seatIdx++) {
                let userInfo = data.users[seatIdx];
                let player = this.game.plyMgr.getPlyByPos(userInfo.pos);
                let isSelf = player.isMe;
                if (userInfo) {
                    let saveInfo: ErmjType.PlayerInfo = {
                        isMale: player.isMale,
                        avatar: userInfo.avatar,
                        avatarFrame: userInfo.avatarFrame,
                        location: userInfo.location,
                        name: player ? player.playerName : "",
                        isMe: isSelf,
                        isDealer: data.dealerPos === userInfo.pos,
                    }
                    savePlayerInfoArr[userInfo.pos] = saveInfo;

                    // 金币房玩家离开
                    player.isMale = !!userInfo.gender;
                    player.updateLoc(userInfo.location);
                    player.updateHead(userInfo.avatar);
                    player.money = userInfo.money;
                    player.updateMoney();
                }


                if (isSelf) {
                    // 显示自己牌
                    this.game.startGame(holdsValArr);
                    this.game.setQuanMen(data.quanFeng, userInfo.menFeng);
                }

                if (isGamingStatus) {
                    if (userInfo.isTing) {
                        player.baoTing();
                        if (isSelf) {
                            this.game.nodeBaoTingCover.active = true;
                        }
                    }

                    // if (userInfo.queType !== undefined) {
                    //     let seat = player.seat;
                    //     // this.game.mjTimer.setSuit(seat, userInfo.queType);
                    //     player.startGame();
                    // }
                    if (userInfo.deskTile) {
                        player.quickSetPlayerDiscard(userInfo.deskTile, undefined, (userInfo.pos === data.lastOutTilePos));
                    }

                    // 从碰杠数据算出剩余手牌个数
                    if (userInfo.pgInfos) {
                        let pgInfos = userInfo.pgInfos;
                        if (pgInfos.length > 0) {
                            pgInfos.forEach(pgInfo => {
                                this.game.mjResult.saveGangData(userInfo.pos, { type: pgInfo.type, pai: pgInfo.tile, chiPai: undefined });
                                player.quickSetPengGang(pgInfo.tile, pgInfo.type);
                            });
                        }
                    }

                    if (!isSelf) {
                        player.setHoldPais(data.nextHandTile);
                    }

                    if (userInfo.userState !== undefined && userInfo.userState === ErmjType.UserState.USER_STATE_HU_PAI) {
                        // 从分数变化中算出是否自摸
                        let isZimo = false;
                        // if (data.scores) {
                        //     let scores = data.scores;
                        //     scores.forEach(scoreInfo => {
                        //         if (scoreInfo.type[0] >= ErmjType.HU_TYPE_EX.HUPAI_HU_PAI) {
                        //             let isZimoType = false;
                        //             scoreInfo.type.forEach(typeIdx => {
                        //                 if (typeIdx === ErmjType.HU_TYPE_EX.HUPAI_ZI_MO) {
                        //                     isZimoType = true;
                        //                 }
                        //             });
                        //             if (isZimoType) {
                        //                 scoreInfo.changeScore.forEach(changeScoreInfo => {
                        //                     if ((changeScoreInfo.rPos === userInfo.rPos) && (changeScoreInfo.changeScore > 0)) {
                        //                         isZimo = true;
                        //                     }
                        //                 });
                        //             }
                        //         }
                        //     });
                        // }
                        player.quickSetPlayerHu(userInfo.huTile, isZimo);
                    }
                }
            }

            for (const u of data.users) {
                if (u.jiaBeiTilePos) {
                    for (let i = 0; i < u.jiaBeiTilePos.length; i++) {
                        let doubledPlayer = this.game.plyMgr.getPlyByPos(u.jiaBeiTilePos[i]);
                        doubledPlayer.doubled([{
                            paiPos: u.pos,
                            pai: u.pgInfos[i].tile,
                        }]);

                    }
                    for (const jiaBei of u.jiaBeiTilePos) {
                        this.game.double(u.pos !== this.game.plyMgr.me.pos);
                    }
                }

                this.game.plyMgr.getPlyByPos(u.pos).tipJiaos();
            }

            this.game.mjResult.playerInfoData = savePlayerInfoArr;
        } else {
            this.game.startGame(holdsValArr);
        }

        if (isGamingStatus) {
            // 减去庄家多的一张牌
            this.game.plyMgr.getPlyByPos(data.dealerPos).setPaiRemainNum(1);
        }

        // 结算
        if (isEndStatus) {
            let changeScore = [];
            for (const r of data.users) {
                changeScore.push({ rPos: r.pos, changeScore: +r.chgMoney })
            }
            this.handleChangeScore({
                type: data.huType || [],
                changeScore
            });

            let results: ps.Ermj_GameResult_Result[] = [];
            for (let index = 0; index < data.users.length; index++) {
                let userInfo = data.users[index];
                let handlePai = userInfo.handTile;

                let resultInfo: ps.Ermj_GameResult_Result = { handTile: handlePai.concat(), pos: userInfo.pos, huTile: 0, chgMoney: userInfo.chgMoney };
                if (userInfo.userState !== undefined && userInfo.userState === ErmjType.UserState.USER_STATE_HU_PAI)
                    resultInfo.huTile = userInfo.huTile;
                results.push(resultInfo);
            }
            this.game.mjResult.show(results);
        }

        // 玩家操作
        cc.log(isOutPaiStatus, isOptStatus, currOptPlayer, data.curInTile)
        if ((isOutPaiStatus || isOptStatus) && currOptPlayer) {
            if (data.curInTile) {
                currOptPlayer.addHoldsPai(data.curInTile);
            }

            if (isOptStatus) {
                console.log("isOptStatus1");
                this.handlePengGangHu({ ...data.pghInfo, leftTime: data.leftTime });
                let lastOutPlayer = this.game.plyMgr.getPlyByPos(data.lastOutTilePos);
                if (lastOutPlayer) {
                    this.game.mjTimer.setWait(data.leftTime, lastOutPlayer.seat);
                }
            } else {
                console.log("isOptStatus2");
                this.game.setWaitOutPai(data.curOptPos, data.leftTime);
                this.game.mjTimer.setWait(data.leftTime, currOptPlayer.seat);
            }
        }
        this.game.updateUI();
    }

    ///////////////////////////////send/////////////////////////////////
    /**
     * 打牌
     * @param paiVal
     */
    sendOutPai(paiVal: number, ting = 0) {
        net.notify('game.ermjHandler.playTile', { tile: paiVal, ting: ting })
        if (this.game.isTrusteeship === 2) {
            this.game.isTrusteeship = 0;
        } else {
            this.game.isTrusteeship = 1;
        }
    }
    sendPeng() {
        net.notify('game.ermjHandler.peng')
    }
    sendGang(gangVal: number) {
        net.notify('game.ermjHandler.gang', { tile: gangVal })
    }
    sendChi(chiVal: number) {
        net.notify('game.ermjHandler.chi', { tile: chiVal })
    }
    sendHu() {
        if (this.game.gaming) {
            net.notify('game.ermjHandler.hu')
            this.game.setSelfHu();
        }
    }
    sendPass() {
        net.notify('game.ermjHandler.pass')
    }

}
