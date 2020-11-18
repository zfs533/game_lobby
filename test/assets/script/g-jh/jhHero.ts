import JHPlayer from "./jhPlayer";
import { PlayerState } from "../g-share/player";
import { CardsType } from './jhGame';

const { ccclass, property } = cc._decorator;

@ccclass
export default class JHHero extends JHPlayer {

    get isMe() {
        return true;
    }

    /**
     * 是否已全下
     *
     * @type {boolean}
     * @memberof JHHero
     */
    isAllIn: boolean;

    changeState(state: PlayerState): void {
        super.changeState(state);
        let game = this.game;
        switch (state) {
            case PlayerState.UNREADY:
                this.isAllIn = false;
                game.info.updateBlindIcon();
                game.operation.updateLookCardsBtn(false);
                break;
        }
        this.updateLookerView();
    }

    /**
     * 开始回合
     *
     * @param {number} time
     * @param {number} [totalTime]
     * @memberof Player
     */
    startTurn(time: number, totalTime?: number) {
        super.startTurn(time, totalTime);
        this.game.operation.updateTurns();
    }

    endTurn(discard = false) {
        super.endTurn();
        let o = this.game.operation;
        if (discard) {
            o.hideNormal();
        } else {
            o.showTurn();
        };
        o.hidePKView();
    }

    discard() {
        super.discard();
        this.game.info.updateBlindIcon();
        // this.game.operation.showOver();
    }

    lose() {
        super.lose();
        this.game.operation.hideTurn();
    }

    showCardType(type: CardsType) {
        super.showCardType(type, true);
        this.game.operation.updateLookCardsBtn();
    }
}
