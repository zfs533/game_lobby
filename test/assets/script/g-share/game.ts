import GameMsg from "./gameMsg"
import Player from "./player"
import PlyMgr from "./playerMgr"
import Audio from "./audio"
import Menu from "./menu"

import user from "../common/user"
import Tips from "../common/tips"
import net from '../common/net'
import { ErrCodes } from "../common/code"
import { GameId, QuitShow } from "../common/enum"
import { How2Play } from "../common/how2play";
import { showCurtain, showTip, showLoading, hideLoading } from "../common/ui";

import g from "../g";
import Ticker from "./ticker"
import CheckTouched from './checkTouched';
import { fitCanvas } from "../common/util";
import Lobby from "../lobby/lobby";

// 所有游戏中需发送的loadGameInfo
const LoadGameProto: { [key: string]: string } = {
    [GameId.BRNN]: 'game.brnnHandler.loadGameInfo',
    [GameId.BY]: 'game.byHandler.loadGameInfo',
    [GameId.DDZ]: 'game.ddzHandler.loadGameInfo',
    [GameId.ERMJ]: 'game.ermjHandler.loadGameInfo',
    [GameId.HH]: 'game.hhHandler.loadGameInfo',
    [GameId.JDNN]: 'game.jdnnHandler.loadGameInfo',
    [GameId.JH]: 'game.jhHandler.loadGameInfo',
    [GameId.LH]: 'game.lhHandler.loadGameInfo',
    [GameId.QZNN]: 'game.qznnHandler.loadGameInfo',
    [GameId.PDK]: 'game.pdkHandler.loadGameInfo',
    [GameId.DZPK]: 'game.dzpkHandler.loadGameInfo',
    [GameId.QHB]: 'game.qhbHandler.loadGameInfo',
    [GameId.HBSL]: 'game.hbslHandler.loadGameInfo',
    [GameId.EBG]: "game.ebgHandler.loadGameInfo",
    [GameId.DFDC]: "game.dfdcHandler.loadGameInfo",
    [GameId.BCBM]: "game.bcbmHandler.loadGameInfo",
    [GameId.FQZS]: "game.fqzsHandler.loadGameInfo",
}

const { ccclass, property } = cc._decorator
@ccclass
export default abstract class Game extends cc.Component {
    @property({ type: cc.Label, tooltip: "房间号" })
    labGameNum: cc.Label = undefined

    @property({ type: Menu, tooltip: "菜单" })
    menu: Menu = undefined

    @property({ type: Audio, tooltip: "游戏音效管理" })
    abstract adoMgr: Audio = undefined

    @property({ type: PlyMgr, tooltip: "玩家管理" })
    abstract plyMgr: PlyMgr<Player, Game> = undefined

    @property({ type: cc.Node, tooltip: "动画播放节点" })
    protected nodeAnimation: cc.Node = undefined

    @property({ type: cc.Prefab, tooltip: "开始游戏动画预制" })
    protected animStartGame: cc.Prefab = undefined

    @property({ type: cc.Prefab, tooltip: "赢钱飘字预制" })
    preWin: cc.Prefab = undefined

    @property({ type: cc.Prefab, tooltip: "输钱飘字预制" })
    preLose: cc.Prefab = undefined

    @property({ type: cc.Prefab, tooltip: "牌型界面预制" })
    cardTypesBox: cc.Prefab = undefined

    @property({ type: Ticker, tooltip: "游戏共用倒计时（场景中的ticker预制件）" })
    public ticker: Ticker = undefined

    @property({ type: CheckTouched, tooltip: "检测是否点击" })
    checkTouched: CheckTouched = undefined

    @property(cc.Node)
    public nodeCanvas: cc.Node = undefined;

    abstract msg: GameMsg
    gameName: GameId
    yid: string
    gameState = -1
    gaming: boolean
    baseScore: number// 底分
    dontPrepare: boolean
    isChgRoom: boolean = undefined
    private _initListeners: boolean
    abstract initGame(): void
    abstract initRound(): void
    // 游戏单独处理房间信息
    abstract dealRoomData(data: ps.GameRoomHandlerGetRoomData)
    abstract updateUI(): void
    get helpDesc() {
        return How2Play.gameHelpDesc(this.gameName);
    }

    protected onLoad() {
        fitCanvas(this.nodeCanvas);
        showCurtain(true, () => { showCurtain(false) })
        if (this.menu) this.menu.node.active = true
        this.gameName = <GameId>g.gameVal.lastGame;
        this.yid = g.gameVal.yid

        this.isChgRoom = false
        this._initListeners = false

        if (this.checkTouched) this.checkTouched.setGame(this)
        this.plyMgr.setGame(this)
        if (this.menu) this.menu.init(this)
        this.initGame()
    }

    protected start() {
        this.getRoomData()
    }

    getRoomData() {
        return new Promise(async (resolve) => {
            // cc.log("getRoomData getRoomData getRoomData")
            let data = await net.request("game.roomHandler.getRoomData")
            if (data.code === 200) {
                //这条消息之前可能有userenter消息造成写入serverPlayers，清掉，金花pk卡应该就是这问题造成的。服务器应确认为什么在getroomdata之前发送了userenter消息
                this.plyMgr.deepClearPlys()
                this.initWithData(data)
                resolve(true)
            } else {
                await this.backToHall()
                showTip(ErrCodes.getErrStr(data.code))
                resolve(false)
            }
        })
    }

    initWithData(data: ps.GameRoomHandlerGetRoomData) {
        if (this.isChgRoom) {
            if (this.msg) {
                this.msg.uninit()
            }
            this.initGame()
            this.plyMgr.hidePlys();
        }
        this._initListeners = false
        //房间号
        if (this.labGameNum) {
            this.labGameNum.string = data.gameNo
        }
        //底分
        if (data.bets !== undefined) {
            this.baseScore = +data.bets
        }
        //座位偏移
        if (data.pos !== undefined) {
            if (this.gameName != GameId.BY) {
                this.plyMgr.seatOffset = data.pos;
            }
            // else {
            //     if (data.pos > 1) {
            //         this.plyMgr.isRotate = true;
            //     } else {
            //         this.plyMgr.isRotate = false;
            //     }
            // }
        }
        // 是否游戏中
        this.gaming = !!data.isGaming
        if (this.gaming) this.dontPrepare = true
        //各个游戏初始化
        this.dealRoomData(data)
        //当前存在的玩家
        for (let player of data.users) {
            this.plyMgr.setPlyEtr(player, false, false)
        }
        if (!data.isGaming) {
            this.regMsg()
            if (data.startKickTime) {
                this.showPrepareTicker(data.startKickTime);
            }
            if (this.gameName == GameId.BCBM) {
                net.notify(<any>LoadGameProto[this.gameName], {})
            }
        } else {
            net.notify(<any>LoadGameProto[this.gameName], {})
        }
        if (data.leftTime !== undefined) {
            this.showTicker(data.leftTime)
        }
    }

    /**
     * 返回大厅
     */
    backToHall() {
        showLoading("加载中");
        let me = this.plyMgr.me
        if (me && me.money !== undefined) user.money = me.money
        let canvas = cc.find("Canvas")
        if (canvas) canvas.getComponentsInChildren(cc.Animation).forEach(a => a.stop())
        return new Promise(resolve => cc.director.loadScene(g.hallVal.scene, () => {
            if (g.curQiutShow === QuitShow.SHOWRECHARGE) {
                let nodeLobby = cc.find("lobby");
                if (!nodeLobby) {
                    return;
                }
                let lobby = nodeLobby.getComponent(Lobby);
                lobby.scheduleOnce(() => {
                    lobby.onClickRecharge();
                }, 0.1);
            } else if (g.curQiutShow === QuitShow.SHOWBANK) {
                let nodeLobby = cc.find("lobby");
                if (!nodeLobby) {
                    return;
                }
                let lobby = nodeLobby.getComponent(Lobby);
                lobby.scheduleOnce(() => {
                    lobby.onClickBank();
                }, 0.1);
            } else if (g.curQiutShow === QuitShow.Festvial) {
                let nodeLobby = cc.find("lobby");
                if (!nodeLobby) {
                    return;
                }
                let lobby = nodeLobby.getComponent(Lobby);
                lobby.scheduleOnce(() => {
                    lobby.clickTheWeeklyRebateButton();
                    let zfl = lobby.nodeParent.getChildByName("FL_TanChuang")
                    if (zfl) zfl.active = false;
                }, 0.1);
            }
            g.curQiutShow = QuitShow.NOSHOW;
            resolve()
        }))
    }

    regMsg() {
        // cc.log('this._initListeners', this._initListeners)
        if (!this._initListeners) {
            this._initListeners = true
            this.msg.regGameMsg()
        }
        // 断线重连或观战时检测一次自己是否为旁观，旁观在当局结束时不需要判断是否操作
        if (this.checkTouched && this.plyMgr.me) {
            this.checkTouched.userTouched = this.plyMgr.me.isLooker
        }
    }

    changeState(s: number) {
        this.gameState = s
        this.updateUI()
    }

    // 游戏开始
    setGameStart() {
    }
    // 游戏结束
    setGameEnd() {
        if (this.checkTouched) {
            this.checkTouched.check()
        }
    }

    async chgRoom() {
        showLoading("正在换桌")
        let data = await net.request("hall.roomHandler.chgRoom")
        hideLoading()
        if (data.code === 3003) {
            showTip("换桌失败，金币不足。")
            this.backToHall()
            return
        }
        if (data.code !== 200) {
            showTip("换桌失败，请稍后再试！")
            return
        }
        this.chgRommSuccess()
    }
    chgRommSuccess() {
        this.isChgRoom = true
        this.getRoomData().then(() => {
            showCurtain(true, () => { showCurtain(false) })
        })
    }
    showPrepareTicker(time: number) { }
    doPrepare() {
        net.request("game.roomHandler.userReady")
    }

    showTicker(time: number, cb?: Function) {
        if (this.ticker) this.ticker.show(time, cb);
    }

    hideTicker() {
        if (this.ticker) this.ticker.hide()
    }

    timerCb() {
        hideLoading()
        showTip("亲，当前网络繁忙，请您稍后再试")
    }

    async leaveGame() {
        showLoading()
        this.scheduleOnce(this.timerCb, 15)
        let data = await net.request("hall.hallHandler.leaveGame")
        hideLoading()
        this.unschedule(this.timerCb)
        if (this.menu) this.menu.isClickBackBtn = false;
        if (data.code !== 200) {
            showTip("亲，当前网络繁忙，请您稍后再试")
            return
        }
        if (this && this.msg) this.msg.handleMeLeave(data)
    }

    /**
     * 如果传prefab会自动判断有没有，没有则创建、添加进去
     * 如果传node则本身就是场景中放好的（或调用此方法之前添加了的），这里不会再添加
     */
    protected playAnim(obj: cc.Prefab | cc.Node, isRepeat = false) {
        return new Promise(resolve => {
            if (!obj) {
                // cc.warn("no anim prefab")
                resolve(false)
                return
            }
            let node: cc.Node = undefined
            if (obj instanceof cc.Prefab) {
                node = this.nodeAnimation.getChildByName(obj.name)
                if (!node) {
                    node = cc.instantiate(obj)
                    this.nodeAnimation.addChild(node)
                }
            } else {
                node = obj
            }
            node.active = true
            let anim = node.getComponent(cc.Animation)
            if (!anim) {
                console.warn("prefab no anim")
                return resolve(false)
            }
            if (anim.defaultClip) {
                anim.play()
            } else {
                let clips = anim.getClips()
                if (!clips || clips.length === 0) return resolve(false)
                anim.play(clips[0].name)
            }
            anim.once("stop", function finish() {
                if (!isRepeat) {
                    node.active = false
                    node.destroy();
                    resolve(true)
                }
            })
        })
    }

    playAnimStartGame() {
        return this.playAnim(this.animStartGame)
    }
    protected onDestroy() {
        Tips.clean()
        this.msg.uninit()
    }
}