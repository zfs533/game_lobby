import PlyMgr from "../g-share/playerMgr";
import HbslPlayer from "./hbslPlayer";
import HbslGame from "./hbslGame";
let Decimal = window.Decimal;
const { ccclass, property } = cc._decorator;

@ccclass
export default class HbslPlayerMgr extends PlyMgr<HbslPlayer, HbslGame> {
    private _playerInfoArr: gameIface.brPlayerInfo[] = [];
    private bigRegalPos: number;
    private gambleGodPos: number;


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
        } else {
            if (!reCome) {
                this.updateTablePlayer(data);
            } else {
                this.updateTablePlayer();
            }
        }
    }

    updatePly(p: HbslPlayer, data: ps.User) {
        super.updatePly(p, data);
        p.enterAni();
    }

    updatePlyBets(pos: number, leftMoney: string, totalSendMoney?: string, noBoomCnt?: number ) {
        let playerInfo = this.getPlyInfoByPos(pos);
        // cc.log("-------- updatePlyBets ", totalSendMoney)
        if (playerInfo) {
            if (totalSendMoney) {playerInfo.totalSendMoney = totalSendMoney}
            if (noBoomCnt) { playerInfo.noBoomCnt = noBoomCnt}
            if (leftMoney) { playerInfo.money = leftMoney}
        }
    }
    updateMoney(pos: number, money: string | number) {
        let playerInfo = this.getPlyByPos(pos);
        if (playerInfo) {
            playerInfo.money = money + ""
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

    /**
     * 刷新桌上玩家
     * @param data
     */
    updateTablePlayer(data?: gameIface.brPlayerInfo) {
        if (data) this._playerInfoArr.push(data);
        let people = this._playerInfoArr.concat();
        people.sort((a, b) => {
            return +b.totalBets - +a.totalBets;
        });

        // 删除不能在桌子上的玩家
        let idx = 0;
        while (idx < people.length) {
            const info = people[idx];
            if (info.pos === this.gambleGodPos || info.pos === this.bigRegalPos || info.pos === this.getMePos()) {
                people.splice(idx, 1);
            } else {
                idx++;
            }
        }

        // 替换新排名的玩家
        for (let idx = 0; idx < this.playerCnt - 1; idx++) {
            const info = people[idx];
            let tempPlayer = this.players[idx + 1];
            if (!info) {
                if (tempPlayer.exist) {
                    this.setPlyLeave(tempPlayer.pos, true);
                } else {
                    tempPlayer.leaveAni();
                }
                continue;
            };
            if (tempPlayer.exist) {
                if (tempPlayer.pos === info.pos) {
                    continue;
                }
            }

            // 移除新信息的玩家
            this.setPlyLeave(info.pos, true);
            this.updatePly(tempPlayer, info);
        }
    }
    setPlyLeave(pos: number, isDismiss: boolean = false) {
        super.setPlyLeave(pos);
        if (!isDismiss) {
            for (let idx = 0; idx < this._playerInfoArr.length; idx++) {
                let leavePlayerInfo = this._playerInfoArr[idx];
                if (leavePlayerInfo.pos === pos) {
                    this._playerInfoArr.splice(idx, 1);
                    break;
                }
            }
            this.updateTablePlayer();
        }
    }

    // update (dt) {}
}
