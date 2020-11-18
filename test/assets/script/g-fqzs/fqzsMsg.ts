import FQZSGame from "./fqzsGame";
import { FQZSGameState } from "./fqzsConf";
import GameMsg from "../g-share/gameMsg";
import net from "../common/net";
import { ROUTE } from '../common/route';
import * as speedUtil from "./SpeedUtil";
import { FQZSTrendData } from "./fqzsTrendData"
import { showTip } from "../common/ui";

export default class FQZSMsg extends GameMsg {
    protected game: FQZSGame;

    protected regMsgHanlder(): void {
        this.onMsg(ROUTE.fqzs_EnterStart, this.handleEnterStartAnimation);//开始游戏
        this.onMsg(ROUTE.fqzs_EnterBet, this.handleEnterBet);//开始下注
        this.onMsg(ROUTE.fqzs_DoBet, this.handleUserDoBets);//收到下注通知
        this.onMsg(ROUTE.fqzs_EnterResult, this.handleGameResult);//动画，结果展示
        this.onMsg(ROUTE.fqzs_DupBet, this.handDupBetResult);
    }

    /**
     * 开始下注
     * @param data
     */
    private handleEnterBet(data: ps.FQZS_EnterBet) {
        console.log("----------------fqzs_EnterBet--------------------");
        this.game.changeState(FQZSGameState.STATUS_BET);
        FQZSTrendData.Instance.gameState = FQZSGameState.STATUS_BET;
        this.game.showBetAnimation(true);
        this.game.setTimer(data.time);
        let iscanDup = data.isCanDupBet === 1 ? true : false;
        this.game.showDupBet(iscanDup);
        this.game.showDupBetState(false);
    }

    /**
     * 用户下注
     * @param data
     */
    private handleUserDoBets(data: ps.FQZS_DoBet) {
        //console.log("-----------------------------------fqzs_DoBet--------------------------------", data);
        // console.log(data)
        this.game.setTotalAreaMoney(data.area, data.bet);
        this.game.userDoBets(data.pos, data.area, data.bet);
    }

    /**
     * 开始动画
     * @param data
     */
    private handleEnterStartAnimation(data: ps.FQZS_EnterStart) {
        console.log("---------------fqzs_EnterStart--------------------");
        //console.log(data)
        this.game.changeState(FQZSGameState.STATUS_START);
        FQZSTrendData.Instance.gameState = FQZSGameState.STATUS_START;
    }

    /**
     * 结算
     */
    private handleGameResult(data: ps.FQZS_EnterResult) {
        console.log("---------------fqzs_EnterResult--------------------");
        this.game.changeState(FQZSGameState.STATUS_RESULT);
        FQZSTrendData.Instance.gameState = FQZSGameState.STATUS_RESULT;
        this.game.showBetAnimation(false);
        this.game.showDupBet(false);
        this.game.addRecord(data.info);
        setTimeout(() => {
            this.game.playRoundAnimationNomal(data);
        },
            2000
        )

    }

    /**
     * 断线重连
     * @param data
     */
    protected handleGameInfo(data: ps.FQZS_GameInfo) {
        super.handleGameInfo(data);
        console.log("-------------fqzs_GameInfo-------------------");
        //console.log("===players=>" + JSON.stringify(data.players))
        // console.log("===data=>" + JSON.stringify(data))
        this.game.changeState(data.state);
        FQZSTrendData.Instance.gameState = data.state;
        this.game.setTimer(data.leftTime);
        this.game.setDefaultChooseIndex(data.curIcon);
        this.game.setMeLooker(true);
        let isDell: boolean = false;
        if (data.players) {
            data.players.forEach(plr => {
                let chgMoney = new window.Decimal(0);
                if (data.state === FQZSGameState.STATUS_BET || data.state === FQZSGameState.STATUS_RESULT) {
                    if (plr.bets) {
                        let ply = this.game.plyMgr.getPlyByPos(plr.pos);
                        plr.bets.forEach(areaBet => {
                            chgMoney = chgMoney.sub(areaBet.bet);
                            if (ply) {
                                ply.doBet(areaBet.area, areaBet.bet);
                                if (ply.isMe) {
                                    isDell = plr.isBet === 1 ? true : false;
                                    if (isDell) {
                                        this.game.setSelfAreaMoney(areaBet.area, +areaBet.bet);
                                    }
                                    let canDup = plr.isCanDupBet === 1 ? true : false
                                    let isDup = plr.isDupBet === 1 ? true : false
                                    if (data.state >= FQZSGameState.STATUS_BET) {
                                        this.game.showDupBet(canDup, isDup);
                                        //this.game.showDupBetState(isDup);
                                        if (isDup || data.state >= FQZSGameState.STATUS_RESULT) {
                                            this.game.showDupBet(false);
                                        }
                                    }
                                }
                            }
                        })
                    }
                }
                // 结算之前玩家身上的金额都是下注前的，要减去
                this.game.plyMgr.updatePlyBets(plr.pos, chgMoney.toString(), plr.totalBet, plr.winCnt);
            })
            this.game.plyMgr.setBigRegalGambleGodPos();
        }

        // 显示全部玩家下注筹码和金额
        if (data.state >= FQZSGameState.STATUS_BET) {
            if (data.infos) {
                data.infos.forEach(info => {
                    this.game.setTotalAreaMoney(info.area, info.totalBet, true);
                });
            }
        }
        //结算状态
        if (data.state > FQZSGameState.STATUS_BET) {
            let animationState = this.game.getAnimationState(data.leftTime)
            if (animationState === speedUtil.AnmationState.NoneAnimation) {
                if (data.winRecords) {
                    let winArea = data.winRecords[data.winRecords.length - 1];
                    this.game.setWinAreaEff(winArea.stopIcon);
                    this.game.setRecords(data.winRecords, data.animStatis, data.cateStatis);
                    this.game.updateRecord();
                }
            } else {
                if (data.winRecords) {
                    if (data.winRecords.length >= 1) {
                        let records = data.winRecords.slice(0, data.winRecords.length - 1)
                        this.game.setRecords(records, data.animStatis, data.cateStatis);
                        this.game.updateRecord();
                    } else {
                        //只有一个,不显示
                        this.game.setRecords([], data.animStatis, data.cateStatis);
                        this.game.updateRecord();//不需要记录
                    }
                }
                this.game.playRoundAnimationNew(animationState, data, isDell);
            }
        } else {
            //显示最新的结果
            if (data.winRecords) {
                this.game.setRecords(data.winRecords, data.animStatis, data.cateStatis);
                this.game.updateRecord(true);
            }
        }

        if (!isDell && data.state > FQZSGameState.STATUS_BET) {
            this.game.brGame.setWaitTips(true);
        }
    }

    handDupBetResult(data: ps.Fqzs_DupBet) {
        console.log("续压回复-----", data);
        if (this.game.gameState === FQZSGameState.STATUS_BET) {
            this.game.showDupBet(false, true);
            //this.game.showDupBetState(true);
            showTip("续压成功")
        }
    }

    //下注
    sendDoBets(areaIdx: number, bets: number) {
        net.notify("game.fqzsHandler.doBet", { area: areaIdx, bet: bets });
    }

    //续压
    sendDupBet() {
        net.notify("game.fqzsHandler.dupBet", {});
    }


}
