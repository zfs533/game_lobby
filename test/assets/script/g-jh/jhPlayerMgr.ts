import PlyMgr from "../g-share/playerMgr";
import JHPlayer from "./jhPlayer";
import JHGame from "./jhGame";
import JHHero from "./jhHero";

const { ccclass, property } = cc._decorator;
@ccclass
export default class JHPlayerMgr extends PlyMgr<JHPlayer, JHGame> {
    get playerArr(){
        return this.players;
    }
    get me() {
        return this.players[0] as JHHero;
    }
    clearCards(): void {
        for (let player of this.players) {
            if (player.exist) {
                player.clearCards();
            }
        }
    }

    async drawFakeCards() {
        for (let p of this.players) {
            if (!p.exist || p.isLooker) {
                continue;
            }
            for (let i = 0; i < 3; i++) {
                p.addCards(i, 0);
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
    }

    hideLooked() {
        this.players.forEach(p => {
            if (!p.exist || p.isLooker) {
                return;
            }
            p.updateLooked(false);
        });
    }

    endTurn() {
        this.players.forEach(p => {
            if (!p.exist || p.isLooker || !p.isTuring) {
                return;
            }
            p.endTurn();
        });
    }

    setPlayersActive() {
        this.players.forEach(p => {
            if (p.exist) {
                p.getPkNode().active = true;
            }
        });
    }
}