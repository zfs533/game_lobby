import PlayerMgr from "../g-share/playerMgr";
import DFDCPlayer from "./dfdcPlayer";
import DFDCGame from "./dfdcGame";
//import { add } from "../common/util";


const { ccclass, property } = cc._decorator;

interface PlayerInfo {
    money?: string;
    avatar: number;
    gender: number;
    pos: number;
    location?: string;
    winCount?: number,
    totalBets?: number,
}

@ccclass
export default class DFDCPlayerMgr extends PlayerMgr<DFDCPlayer, DFDCGame> {
    private _playerInfoArr: gameIface.brPlayerInfo[] = [];
    setPlyEtr(data: gameIface.brPlayerInfo, reCome = false, ani = false) {
        let p = this.getPlyByPos(data.pos);
        if (p) {
            cc.warn("服务器有玩家1");
            return;
        }
        if (data.pos === this.seatOffset) {
            this._playerInfoArr.push(data);
            p = this.getPlyBySeat(0);
            this.updatePly(p, data);
            //this.serverPlayers[data.pos] = p;
        }
    }

    updatePly(p: DFDCPlayer, data: ps.User) {
        //  p.init(this.game);
        // p, data
        p.enterAni(false);
        super.updatePly(p, data);
    }
    // updatePlayer(p: DFDCPlayer, data: ps.User) {
    //     // p.gender = data.gender; // 更新头像之前先更新性别，因为头像是根据性别取的
    //     p.init(this.game);
    //     // p.updateId(1);
    //     // p.updateLocation(data.location);
    //     // p.updateMoney(data.money);
    //     // p.updateHead(data.avatar);
    //     p.enterAni(false);
    //     super.updatePly(p, data);
    //     // p.serverPos = data.pos;
    //     // p.enterAni(true);
    // }

    updateBalance(pos: number, money: string | number) {
        let playerInfo = this._playerInfoArr.filter((info: any) => {
            return (info.pos === pos);
        })[0];
        if (playerInfo) {
            // playerInfo.money = add(money, 0).toString();
            playerInfo.money = new window.Decimal(money).add(0).toString();
        }
    }

    clearCards() { }
}
