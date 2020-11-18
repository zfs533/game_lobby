import Game from "./game"
import Lobby from "../lobby/lobby"
import user from "../common/user"
import { GameId } from "../common/enum"
import { PlayerState } from "./player"
import { showConfirm, showTip } from "../common/ui"
import net from "../common/net";
import { ROUTE } from "../common/route";

// 所有游戏优先监听GameInfo
const onGameInfo: { [key: string]: string } = {
    [GameId.BRNN]: ROUTE.brnn_GameInfo,
    [GameId.BY]: ROUTE.by_GameInfo,
    [GameId.DDZ]: ROUTE.ddz_GameInfo,
    [GameId.ERMJ]: ROUTE.ermj_GameInfo,
    [GameId.HH]: ROUTE.hh_GameInfo,
    [GameId.JDNN]: ROUTE.jdnn_GameInfo,
    [GameId.JH]: ROUTE.jh_GameInfo,
    [GameId.LH]: ROUTE.lh_GameInfo,
    [GameId.QZNN]: ROUTE.qznn_GameInfo,
    [GameId.PDK]: ROUTE.pdk_GameInfo,
    [GameId.DZPK]: ROUTE.dzpk_GameInfo,
    [GameId.QHB]: ROUTE.qhb_GameInfo,
    [GameId.HBSL]: ROUTE.hbsl_GameInfo,
    [GameId.EBG]: ROUTE.ebg_GameInfo,
    [GameId.DFDC]: ROUTE.dfdc_GameInfo,
    [GameId.BCBM]: ROUTE.bcbm_GameInfo,
    [GameId.FQZS]: ROUTE.fqzs_GameInfo,
}
enum Leave { leave, kick, lost, moneyNotEnough, forceChangeRoom, notBet, serverClosed, balancing, }

export default abstract class GameMsg {
    private msgs: string[] = []
    constructor(protected game: Game) { }

    init() {
        this.regBaseHanlder()
        this.regSpcHanlder()
    }

    onMsg(route: string, func: Function) {
        net.on(route, func.bind(this))
        this.msgs.push(route)
    }

    uninit() {
        this.unregAllHanlder()
    }

    regGameMsg() {
        this.unregMsgHandler()
        this.unregSpcHanlder()
        this.regMsgHanlder()
        this.regSpcHanlder()
    }

    private regSpcHanlder() {
        net.on(onGameInfo[this.game.gameName], this.handleGameInfo.bind(this))
    }

    private unregSpcHanlder() {
        net.off(onGameInfo[this.game.gameName])
    }

    protected abstract regMsgHanlder(): void
    protected unregMsgHandler() {
        this.msgs.forEach(e => net.off(e))
    }


    /**
     * 游戏外消息
     */
    private regBaseHanlder() {
        //开始倒计时
        net.on(ROUTE.startTimer, this.handleStartTimer.bind(this))
        //stop倒计时
        net.on(ROUTE.stopStartTimer, this.handleStopStartTimer.bind(this))
        //游戏开始
        net.on(ROUTE.startGame, this.handleStartGame.bind(this))
        //游戏结束
        net.on(ROUTE.gameEnd, this.handleEndGame.bind(this))
        //玩家进入房间
        net.on(ROUTE.userEnter, this.handleUserEnter.bind(this))
        //玩家重入
        net.on(ROUTE.userRecome, this.handleUserRecome.bind(this))
        //玩家掉线
        net.on(ROUTE.userLost, this.handleUserLost.bind(this))
        //玩家离开
        net.on(ROUTE.userLeave, this.handleLeave.bind(this))
        //托管
        net.on(ROUTE.userAuto, this.handleAuto.bind(this))
        //玩家准备好
        net.on(ROUTE.userReady, this.handleReady.bind(this))
        //玩家地理位置
        net.on(ROUTE.updateUserLocation, this.handleLocationChange.bind(this))
        //强制换桌成功
        net.on(ROUTE.chgRoomSuc, this.handleChangeRoomSuccess.bind(this))
    }

    private unregAllHanlder() {
        net.off(ROUTE.startTimer)
        net.off(ROUTE.stopStartTimer)
        net.off(ROUTE.startGame)
        net.off(ROUTE.gameEnd)
        net.off(ROUTE.userEnter)
        net.off(ROUTE.userRecome)
        net.off(ROUTE.userLost)
        net.off(ROUTE.userLeave)
        net.off(ROUTE.userAuto)
        net.off(ROUTE.userReady)
        net.off(ROUTE.updateUserLocation)
        net.off(ROUTE.chgRoomSuc)

        this.unregMsgHandler()
        this.unregSpcHanlder()
    }

    /**
     * 断线重连
     * @param data
     */
    protected handleGameInfo(data: any): void {
        this.game.regMsg()
    }

    handleUserEnter(data: ps.UserEnter) {
        let game = this.game
        if (game && game._isOnLoadCalled) {
            this.doUserEnter(data)
        } else {
            console.warn("游戏还没初始化完毕")
        }
    }

    private doUserEnter(data: ps.UserEnter) {
        if (data.user.uid !== user.uid && this.game) {
            this.game.plyMgr.setPlyEtr(data.user)
        }
    }

    private handleUserRecome(data: ps.UserRecome) {
        data.user.money = undefined
        if (this.game && this.game._isOnLoadCalled) {
            this.doUserRecome(data)
        } else {
            console.warn("游戏还没初始化完毕")
        }
    }

    private doUserRecome(data: ps.UserRecome) {
        if (this.game) {
            this.game.plyMgr.setPlyEtr(data.user, true, false)
        }
    }


    //------------------------------------------------------------------------
    handleLeaveReason(reason: any) {
        //被踢
        if (reason === Leave.kick || reason === Leave.notBet) {
            showConfirm("亲，你很久没有操作了，请休息一会儿再来吧～")
        } else if (reason === Leave.moneyNotEnough) {
            if (!user.shield) {
                let node = cc.find("lobby")
                if (!node) {
                    return
                }
                let lobby = node.getComponent(Lobby);
                let c = showConfirm("亲，您身上的金币不太够了噢～请补充点金币吧。", "去充值", "去银行");
                c.showClose();
                c.okFunc = lobby.onClickRecharge.bind(lobby);
                c.cancelFunc = lobby.onClickBank.bind(lobby);
            }
        }
    }

    handleStartTimer(data: ps.StartTimer) {
        this.game.showTicker(data.timerSecond)
    }
    private handleStopStartTimer(data: ps.StopStartTimer) {
        this.game.hideTicker()
    }

    handleStartGame(data: ps.StartGame) {
        this.game.regMsg();
        this.game.gaming = true;
        this.game.plyMgr.updatePlys(data.users);
        this.game.setGameStart();
        this.game.playAnimStartGame().then(() => {
            if (data.willChangeRoom) {
                showTip("本局结束后将自动换桌")
            }
        });
        if (this.game.adoMgr) {
            this.game.adoMgr.playStart()
        }
        if (this.game.labGameNum) this.game.labGameNum.string = data.gameNo;
        this.game.hideTicker();
    }

    handleReady(data: ps.UserReady) {
        if (!this.game) return
        let plr = this.game.plyMgr.getPlyByPos(data.pos)

        if (!plr) return

        plr.changeState(PlayerState.READY)
    }
    private handleUserLost(data: ps.UserLost) {
        if (!this.game) return
        let p = this.game.plyMgr.getPlyByPos(data.pos)
        if (!p) return

        if (p.isMe) {
            this.game.backToHall()
        } else if (p.state === PlayerState.READY) {
            p.changeState(PlayerState.UNREADY)
        }
    }
    private handleLeave(data: ps.UserLeave) {
        if (!this.game) return
        let p = this.game.plyMgr.getPlyByPos(data.pos)
        if (p && p.isMe) {
            if (this.game.menu && this.game.menu.isClickBackBtn) return
            if (data.reason !== Leave.forceChangeRoom && data.reason !== Leave.leave) {
                this.unregAllHanlder()
                this.game.backToHall().then(() => this.handleLeaveReason(data.reason))
            }
        } else {
            this.game.plyMgr.setPlyLeave(data.pos)
        }
    }

    public handleMeLeave(data: any) {
        this.unregAllHanlder();
        this.game.backToHall();
    }

    private handleAuto(data: ps.UserAuto) {
        if (!this.game || (this.game.menu && this.game.menu.isClickBackBtn)) return
        let p = this.game.plyMgr.getPlyByPos(data.pos)
        if (p && p.isMe) this.game.backToHall()
    }

    //游戏end
    private handleEndGame(data: ps.GameEnd) {
        let game = this.game
        if (!game) return
        let me = game.plyMgr.me
        if (me && !me.isLooker && me.money !== undefined) {
            user.money = me.money
        }
        game.gaming = false
        game.setGameEnd()
        if (game.gameName === GameId.DDZ || game.gameName === GameId.PDK || game.gameName === GameId.ERMJ)
            game.dontPrepare = true
        game.initRound()
        if (data.startKickTime) {
            game.showPrepareTicker(data.startKickTime);
        }
    }

    private handleLocationChange(data: { pos: number, loc: string }) {
        let game = this.game
        if (!game) return
        let plr = game.plyMgr.getPlyByPos(data.pos)
        if (!plr) return
        plr.updateLoc(data.loc)
    }

    private handleChangeRoomSuccess(data: any) {
        showTip("为了防止作弊，换桌成功")
        this.game.chgRommSuccess()
    }
}