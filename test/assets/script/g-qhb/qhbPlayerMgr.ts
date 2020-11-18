import QHBPlayer from "./qhbPlayer";
import QHBGame from "./qhbGame";

import PlyMgr from "../g-share/playerMgr";

let Decimal = window.Decimal;
const {ccclass, property} = cc._decorator;

@ccclass
export default class QHBPlayerMgr extends PlyMgr<QHBPlayer, QHBGame> {
    private _playerInfoArr: gameIface.brPlayerInfo[] = [];

    setPlyEtr(data: gameIface.brPlayerInfo, reCome = false) {
        let p = this.getPlyByPos(data.pos);
        if (p) {
            console.warn("服务器有玩家1");
            return;
        }

        if (data.pos === this.seatOffset) {
            this._playerInfoArr.push(data);
            p = this.getPlyBySeat(0);
            this.updatePly(p, data);
            // this.serverPlayers[data.pos] = p;
        } else {
            if (!reCome) {
                this.savePlayerInfo(data);
            } else {
                this.savePlayerInfo();
            }
        }
    }

    updatePly(p: QHBPlayer, data: ps.User) {
        p.init(this.game);
        p.enterAni(false);
        super.updatePly(p, data);
    }

    /**
     * 存储玩家信息
     * @param data
     */
    savePlayerInfo(data?: gameIface.brPlayerInfo) {
        if (data) this._playerInfoArr.push(data);
        let people = this._playerInfoArr.concat();
        people.sort((a, b) => {
            return +b.totalSendMoney - +a.totalSendMoney;
        });
    }

    updatePlyBets(pos: number, totalSendMoney: string, noBoomCnt: number) {
        let playerInfo = this.getPlyInfoByPos(pos);
        if (playerInfo) {
            playerInfo.totalSendMoney = totalSendMoney;
            playerInfo.noBoomCnt = noBoomCnt;
        }
    }

    getAllPlayerInfo() {
        return this._playerInfoArr;
    }

    getMePos() {
        return this.seatOffset;
    }

    getPlyInfoByPos(pos: number) {
        return this._playerInfoArr.filter(info => info.pos === pos)[0];
    }

    updateBalance(pos: number, money: string | number) {
        let playerInfo = this.getPlyInfoByPos(pos);

        if (playerInfo) {
            playerInfo.money = new Decimal(money).add(0).toString();
        }
    }

    updatePlayerInfo(pos: number, money: string | number) {
        let playerInfo = this._playerInfoArr.filter((info: any) => {
            return (info.pos === pos);
        })[0];
        if (playerInfo) {
            playerInfo.money = new Decimal(money).add(0).toString();
        }
    }

    setPlyLeave(pos: number, isDismiss: boolean = false) {
        super.setPlyLeave(pos);
        if (!isDismiss) {

        }
        for (let idx = 0; idx < this._playerInfoArr.length; idx++) {
            let leavePlayerInfo = this._playerInfoArr[idx];
            if (leavePlayerInfo.pos === pos) {
                this._playerInfoArr.splice(idx, 1);
                break;
            }
        }
    }

    clearCards() { }
}
