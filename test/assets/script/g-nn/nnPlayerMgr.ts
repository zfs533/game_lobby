import PlyMgr from "../g-share/playerMgr";
import NNPlayer from "./nnPlayer";
import JDNNGame from "./jdnnGame";
import QznnGame from "./qznnGame";
const { ccclass, property } = cc._decorator;
@ccclass
export default class NNPlayerMgr extends PlyMgr<NNPlayer, JDNNGame | QznnGame> {
    clearCards(): void {
        for (let player of this.players) {
            if (player.exist) {
                player.clearCards();
            }
        }
    }

}