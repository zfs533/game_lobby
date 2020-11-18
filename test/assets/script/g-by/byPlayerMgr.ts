import BYGame from "./byGame";
import BYPlayer from "./byPlayer";
import { massive } from "./massive";
import PlyMgr from '../g-share/playerMgr';



const { ccclass, property } = cc._decorator;

@ccclass
export default class BYPlayerMgr extends PlyMgr<BYPlayer, BYGame>  {
    playerCount = 4;
    /**
    3 | 2
    -----
    0 | 1
    */
    public mySeat: number = undefined;    // 自己在当前游戏中的位置

    clearCards() { }

    get me() {
        return this.players[this.mySeat];
    }

    get playerArr() {
        return this.players;
    }

    // 游戏中时  其他user的进入时的处理
    setPlyEtr(data: ps.User, reCome = false, ani = false) {
        // cc.warn("setplayer enter ", data);
        this.playerCount = 4;
        let seat = this.toGameLocation(data.pos);
        let realSeat = data.pos - this.seatOffset;
        if (realSeat < 0) {
            realSeat += this.playerCount;
        }
        let p = this.getPlyBySeat(seat);
        if (!p) {
            // cc.warn("setplayer enter p is null ");
            return;
        }
        p.init(this.game);
        p.changeLevelLable(1);
        p.showOrHideGun(true);
        p.updatePly(data);
        p.changeCoinLabelById(+data.money);
        p.changeGunSp(0);
        //-------------------------------
        p.pos = data.pos;
        this.getPlyByPos[data.pos] = p;
    }

    // 玩家离开
    setPlyLeave(pos: number) {
        let ply = this.getPlyByPos(pos);
        if (ply) {
            ply.leaveHideOthers();
            ply.pos = -1;
            ply.leaveAni();
        }
    }

    // 处理自己的信息
    handleMyInfo(seat: number) {
        // cc.log('handle my info ', seat)
        if (seat == 0 || seat == 1) {
            this.isRotate = false;
        } else {
            seat -= 2;
            this.isRotate = true;
        }
        if (this.isRotate) {
            this.game.dieLayer.angle = 180;
            this.game.fishLayer.angle = 180;
        }
        this.mySeat = seat;
        // cc.log('my seat=', this.mySeat)
        this.game.byAnimMgr.showThisIsGun(seat);
        for (let i = 0; i < 4; i++) {
            let p = this.getPlyBySeat(i);
            if (p) {
                p.showOrHideGun(false);
                p.showWaitJoin();
            }
        }
        this.game.initMyTouchPos();
        let p = this.getPlyBySeat(seat);
        if (p) {
            p.showMyGunBt();
        }
    }

    // 处理进入房间时  所有USER的信息
    handleUserInfo(users: ps.User[]) {
        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            let seat = this.toGameLocation(user.pos)
            let p = this.getPlyBySeat(seat);
            if (p) {
                p.updateLoc(user.location);
                p.showOrHideGun(true);
            }
            p.emptySeat.active = false;
        }
    }

    // 把服务器中的位置  变成在本地游戏中的真实位置
    toGameLocation(pos: number) {
        if (this.isRotate) {
            if (pos < 2) {
                return pos + 2;
            } else {
                return pos - 2;
            }
        } else {
            return pos;
        }
    }

    initPlayerIsLock() {
        this.players.forEach(p => {
            if (p) {
                p.isLock = 0;
            }
        });
    }

    initPlayerIsAuto() {
        this.players.forEach(p => {
            if (p) {
                p.isAuto = 0;
            }
        });
    }

    playerAimCircleRotate() {
        this.players.forEach(p => {
            if (p) {
                p.aimCircleRotate();
            }
        });
    }




}
