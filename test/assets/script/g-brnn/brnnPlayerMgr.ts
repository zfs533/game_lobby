import BrnnPlayer from "./brnnPlayer";
import PlyMgr from "../g-share/playerMgr";
import BrnnGame from "./brnnGame";

const Decimal = window.Decimal;
const { ccclass, property } = cc._decorator
@ccclass
export default class BrnnPlyMgr extends PlyMgr<BrnnPlayer, BrnnGame> {
    private _playerInfoArr: gameIface.brPlayerInfo[] = [];

    setPlyEtr(data: gameIface.brPlayerInfo, reCome = false, ani = true) {
        let p = this.getPlyByPos(data.pos);
        if (p) {
            console.log("服务器有玩家1");
            return;
        }

        if (data.pos === this.seatOffset) {
            this._playerInfoArr.push(data);
            p = this.getPlyBySeat(0);
            this.updatePly(p, data);
        } else if (!reCome) {
            this.updateTablePlayer(data);
        } else {
            this.updateTablePlayer();
        }
    }

    updatePly(p: BrnnPlayer, data: ps.User) {
        super.updatePly(p, data);
        p.enterAni();
        p.initBets();
    }

    initBets() {
        this.players.forEach(player => {
            if (player.exist) {
                player.initBets();
            }
        });
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
        for (let idx = 0; idx < people.length; idx++) {
            if (people[idx].pos === this.seatOffset) {
                people.splice(idx, 1);
                break;
            }
        }

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

    updatePlyBets(pos: number, chgMoney: string, totalBets: string, winCount: number) {
        let playerInfo = this.getPlyInfoByPos(pos);
        if (playerInfo) {
            playerInfo.money = new Decimal(playerInfo.money).add(chgMoney).toString();
            playerInfo.totalBets = totalBets;
            playerInfo.winCnt = winCount;
        }
    }

    getAllPlayerInfo() {
        return this._playerInfoArr;
    }

    getPlyInfoByPos(pos: number) {
        return this._playerInfoArr.filter(info => info.pos === pos)[0];
    }

    setPlyMoney(pos: number, money: string) {
        let playerInfo = this.getPlyInfoByPos(pos);
        if (playerInfo) {
            playerInfo.money = money.toString();
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

            // 一个玩家离开则从其他玩家列表中选一个来填补这个位置
            // let needPlayerNum = this._playerInfoArr.length > this.playerCnt ? this.playerCnt : this._playerInfoArr.length;
            // for (let playerIdx = 1; playerIdx < needPlayerNum; playerIdx++) {
            //     let playInfo = this._playerInfoArr[playerIdx];
            //     let serverPlayer = this.getPlyByPos(playInfo.pos);
            //     if (!serverPlayer) {
            //         this.setPlyEtr(playInfo, true);
            //         break;
            //     }
            // }
            this.updateTablePlayer();
        }
    }
}
