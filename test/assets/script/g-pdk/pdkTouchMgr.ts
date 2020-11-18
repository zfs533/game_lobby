import DpTouchMgr from "../g-dp/dpTouchMgr"
import PdkGame from "./pdkGame"
import { PdkCardTools } from "./pdkCardTools";
import PdkPoker from "./pdkPoker";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PdkTouchMgr extends DpTouchMgr<PdkPoker> {
    game: PdkGame;
    cardTools: PdkCardTools;

    curPoker = PdkPoker;
    start() {
        this.cardTools = new PdkCardTools();
        super.start();
    }

    isAllowPlay() {
        let readyDisCards = this.getReadyCardData();
        let isAllow: boolean;
        if (readyDisCards.length !== 0) {
            isAllow = this.cardTools.isAllowPlayCard(readyDisCards, this._isFirstPlay ? undefined : this._playerCardData);
            if (!this._isFirstPlay && !isAllow) {
                isAllow = this.cardTools.isAllowThreeTake(readyDisCards, this._playerCardData);
            }
        } else {
            isAllow = false;
        }
        return isAllow;
    }

}
