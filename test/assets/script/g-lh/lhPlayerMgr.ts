import LhPlayer from "./lhPlayer";
import LhGame from "./lhGame";
import PlyMgr from "../g-share/playerMgr";
const { ccclass, property } = cc._decorator;

let Decimal = window.Decimal;

@ccclass
export default class LhPlayerMgr extends PlyMgr<LhPlayer, LhGame> {
    private _playerInfoArr: gameIface.brPlayerInfo[] = [];
    private bigRegalPos: number;
    private gambleGodPos: number;

    initBets() {
        this.players.forEach(player => {
            if (player.exist) {
                player.initBets();
            }
        });
    }

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

    updatePly(p: LhPlayer, data: ps.User) {
        super.updatePly(p, data);
        p.enterAni();
        p.initBets();
    }

    updatePlyBets(pos: number, chgMoney: string, totalBets: string, winCount: number) {
        let playerInfo = this.getPlyInfoByPos(pos);
        if (playerInfo) {
            playerInfo.money = new Decimal(playerInfo.money).add(chgMoney).toString();
            playerInfo.totalBets = totalBets;
            playerInfo.winCnt = winCount;
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

    /**
     * 设置富豪、赌神
     */
    setBigRegalGambleGodPos() {
        let people = this._playerInfoArr.concat();
        if (!people || people.length < 1) return;

        people.sort((a, b) => {
            return b.winCnt - a.winCnt;
        });
        if (!people[0]) return;
        let rPosGambleGod = people[0];

        people.sort((a, b) => {
            return +b.totalBets - +a.totalBets;
        });
        let rPosBigRegal = people[0];

        this.game.isExistFh = true;
        this.game.isExistDs = true;

        let oldBigRegalPos = this.bigRegalPos;
        let oldGambleGodPos = this.gambleGodPos;

        // 先设置好新富豪、赌神的位置，防止老富豪、老赌神在桌子上找不到座位坐下
        this.bigRegalPos = rPosBigRegal.pos;
        this.gambleGodPos = rPosGambleGod.pos;

        // cc.log("oldBigRegalPos = " + oldBigRegalPos + "    oldGambleGodPos = " + oldGambleGodPos);
        // cc.log("rPosBigRegal = " + rPosBigRegal.pos + "    rPosGambleGod = " + rPosGambleGod.pos);
        if (oldBigRegalPos !== rPosBigRegal.pos) {
            this.chgBigRegalGambleGod(rPosBigRegal.pos, this.game.fhPlayer);
        } else {
            this.updatePly(this.game.fhPlayer, rPosBigRegal);
        }

        if (oldGambleGodPos !== rPosGambleGod.pos) {
            this.chgBigRegalGambleGod(rPosGambleGod.pos, this.game.dsPlayer);
        } else {
            this.updatePly(this.game.dsPlayer, rPosGambleGod);
        }
        this.updateTablePlayer();
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
            if (pos === this.game.fhPlayer.pos) {
                this.game.isExistFh = false;
            }
            if (pos === this.game.dsPlayer.pos) {
                this.game.isExistDs = false;
            }
            if (!this.game.isExistFh || !this.game.isExistDs) {
                this.setBigRegalGambleGodPos();
            }
            this.updateTablePlayer();
        }
    }

    /**
     *
     * 替换富豪或赌神
     * @param oldPos
     * @param newPos
     * @param player 富豪或赌神
     */
    private chgBigRegalGambleGod(newPos: number, player: LhPlayer) {
        // 填补新富豪
        let newPlayerInfo = this.getPlyInfoByPos(newPos);
        if (newPlayerInfo) {
            super.updatePly(player, newPlayerInfo);
            player.enterAni();
            // console.log("新富豪进入");
        }
    }
}
