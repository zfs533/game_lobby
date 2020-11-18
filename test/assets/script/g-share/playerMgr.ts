import Player, { PlayerState } from "./player";
import Game from "./game";

const { ccclass, property } = cc._decorator
@ccclass
export default abstract class PlyMgr<T1 extends Player, T2 extends Game> extends cc.Component {
    @property({ type: [Player], tooltip: "玩家节点组" })
    protected players: T1[] = [];
    protected game: T2;
    seatOffset = 0;
    isRotate: boolean = undefined;

    setGame(g: T2) {
        this.game = g
        this.players.forEach((ply, i) => {
            ply.seat = i
            ply.init(this.game)
        })
    }
    /**
     * 游戏最大人数
     */
    get playerCnt() {
        return this.players.length;
    }
    /**
     * 获取自己
     */
    get me() {
        return this.players[0]
    }
    /**
     * 座位上正在游戏的玩家集合
     */
    get gamer() {
        return this.players.filter(ply => ply.exist && !ply.isLooker)
    }
    // 获取在位的玩家集合
    getPlys() {
        return this.players.filter(ply => ply.exist);
    }

    // 改变所有玩家状态
    chgState(state: number) {
        this.players.forEach(ply => {
            if (ply.exist) ply.changeState(state)
        })
    }
    // 改变游戏中玩家的状态
    chgGmrState(state: number) {
        this.gamer.forEach(gmr => {
            if (gmr && gmr.exist) gmr.changeState(state);
        })
    }
    // 通过seat获取玩家
    getPlyBySeat(seat: number): T1 {
        return this.players[seat]
    }

    // 根据服务器次序获取玩家
    getPlyByPos(pos: number): T1 {
        return this.players.filter(ply => ply.exist && ply.pos === pos)[0];
    }

    /**解决换房时，getRoomData协议中users字段没有之前userEnter的玩家信息 */
    getPlyByStartPos(pos: number): T1 {
        return this.players.filter(ply => ply.pos === pos)[0];
    }

    // 得到庄家
    getDealer() {
        return this.players.filter(ply => ply.exist && ply.isDealer)[0];
    }

    // 设置玩家进入，isGaming游戏是否正在进行
    setPlyEtr(data: ps.User, reCome = false, ani = true) {
        let seat = data.pos - this.seatOffset
        if (seat < 0) seat += this.playerCnt
        let p = this.getPlyBySeat(seat)
        if (!p) return cc.warn("进入到错误的座位：%o", data);
        if (p.exist && !reCome) return cc.warn("重复的进入：%o", data);
        this.updatePly(p, data);
        p.enterAni(ani);
        if (data.bReady) {
            if (this.game.gaming) {
                p.changeState(PlayerState.STARTED)
            } else {
                p.changeState(PlayerState.READY)
            }
        } else {
            if (reCome) {
                p.changeState(PlayerState.STARTED)
            } else {
                p.changeState(PlayerState.UNREADY)
            }
        }
    }

    updatePlys(data?: ps.User[]) {
        if (!data) return
        data.forEach(plyData => {
            let p = this.getPlyByStartPos(plyData.pos)
            if (p) this.updatePly(p, plyData)
        })
        this.players.forEach(p => {
            if (p.isReady) p.changeState(PlayerState.STARTED)
        })
    }

    updatePly(p: T1, data: ps.User) {
        p.updatePly(data)
    }

    // 玩家离开
    setPlyLeave(pos: number) {
        let ply = this.getPlyByPos(pos);
        if (ply) {
            ply.pos = -1;
            ply.leaveAni();
        }
    }

    clearOtherPlys() {
        this.players.forEach(ply => {
            if (ply.exist && !ply.isMe) ply.clear()
        })
    }

    deepClearPlys() {
        this.players.forEach(ply => ply.deepClear())
    }

    hidePlys() {
        this.players.forEach(ply => {
            if (!ply.exist) {
                ply.hide()
            }
        })
    }
}
