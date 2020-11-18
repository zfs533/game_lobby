import PlyMgr from "../g-share/playerMgr";
import ErmjPlayer from "./ermjPlayer";
import ErmjGame from "./ermjGame";

const { ccclass, property } = cc._decorator
@ccclass
export default class ErmjPlayerMgr extends PlyMgr<ErmjPlayer, ErmjGame> {


    setPlayerDealer(pos: number) {
        for (let player of this.players) {
            if (player && (player.pos === pos)) {
                player.setDealerVisb(true);
            } else {
                player.setDealerVisb(false);
            }
        }
    }

    initHold(holdData: number[]) {
        for (let player of this.players) {
            if (player) {
                player.initHold(holdData);
            }
        }
    }

    initRound() {
        for (let player of this.players) {
            if (player && player.isInitUI) {
                player.initRound();
                player.hidePointer();
            }
        }
    }

    hidePointer() {
        for (let player of this.players) {
            if (player) {
                player.hidePointer();
            }
        }
    }

    clearCards() { }

    clearAllLeavePlayer() {
        for (let player of this.players) {
            if (player && player.isLeave) {
                this.setPlyLeave(player.pos);
            }
        }
    }

    setPlyLeave(pos: number) {
        let ply = this.getPlyByPos(pos);
        if (ply) {
            ply.leaveAni();
            if (!this.game.gaming) {
                ply.pos = -1
            }
        }
    }
    getPlayers() {
        return this.players
    }
}
