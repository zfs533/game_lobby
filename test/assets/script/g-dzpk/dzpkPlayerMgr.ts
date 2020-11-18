import PlayerMgr from "../g-share/playerMgr";
import DZPKPlayer, { PlayerStates } from "./dzpkPlayer";
import DZPKGame from "./dzpkGame";

const { ccclass, property } = cc._decorator;
@ccclass
export default class DZPKPlayerMgr extends PlayerMgr<DZPKPlayer, DZPKGame> {
    playerCount = 6;

    hideActions() {
        this.players.forEach(p => {
            if (p && p.exist) {
                p.hideAction();
            }
        });
    }

    clearCards() {
        for (let player of this.players) {
            if (player && player.exist) {
                player.clearHandCards();
            }
        }
    }

    resetRoundBets() {
        this.players.forEach(p => {
            if (p && p.exist) {
                p.resetRoundBets();
            }
        });
    }

    updateDealer(doAnim = true) {
        this.players.forEach(p => {
            if (p && p.exist) {
                try {
                    p.becomeDealer(doAnim);
                } catch (error) {
                    cc.warn(error);
                }
            }
        });
    }

    clearAllWaitingTimer() {
        this.players.forEach(p => {
            if (p && p.exist) {
                try {
                    p.clearWaitingTimer();
                } catch (error) {
                    cc.warn(error);
                }
            }
        });
    }

    updatePlayersForTakeMoney(data?: ps.User[]) {
        this.players.forEach(player => {
            if (player.exist && player.isReady) {
                player.changeState(PlayerStates.STARTED);
            }
        });
        if (data) {
            data.forEach(info => {
                let player = this.getPlyByPos(info.pos);
                if (player) {
                    player.isMale = !!info.gender;
                    player.updateHead(info.avatar);
                    if (info.money) player.updateShowMoney(info.money);
                }
            });
        }
    }

    clearOtherPlayers() {
        this.players.forEach(p => {
            if (p && p.exist && !p.isMe) {
                p.updateShowMoney();
                p.updateHead(-1);
                p.updateLoc("--");
            }
        });
    }


}
