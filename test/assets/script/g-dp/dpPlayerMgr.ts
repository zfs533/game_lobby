import PlyMgr from "../g-share/playerMgr";
import DpPlayer from "./dpPlayer";
import DpGame from "./dpGame";

const { ccclass, property } = cc._decorator
@ccclass
export default abstract class DplayerMgr extends PlyMgr<DpPlayer, DpGame> {
    initEnable() {
        this.players.forEach(player => {
            player.initUI();
            if (player.exist) {
                player.node.active = true;
            }else{
                player.node.active = false;
            }
        });
    }

    setRemainCard() {
        this.players.forEach(player => {
            player.setCurrCardNum();
        });
    }

    getNextPlayer(): DpPlayer {
        for (const player of this.players) {
            if (player.isRightPlayer) {
                return player;
            }
        }
        return;
    }

    hideAll() {
        this.players.forEach(ply => {
            if (ply.exist) {
                ply.hideAllStatus();
            }
        });
    }

    clearCards() {
        this.players.forEach(player => {
            if (player.exist) {
                player.cleanCards();
                player.setCardsLayout(true);
            }
        });
    }

}
