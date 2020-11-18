import { GameId } from "../common/enum"
import g from "../g"

const { ccclass, property } = cc._decorator

@ccclass
export default class DpPoker extends cc.Component {
    private nodeChoose: cc.Node = undefined
    private nodeEnable: cc.Node = undefined
    private nodeDealer: cc.Node = undefined
    private nodeBack: cc.Node = undefined

    private CARD_MOVE_DISTANCE = 30

    private _cardData: number
    private _isSelected: boolean                       // 是否被选中
    private _isReadyDiscard: boolean                   // 是否已准备打出此牌

    private isCanMove: boolean = true;

    set cardData(data: number) {
        this._cardData = data
    }

    get cardData() {
        return this._cardData
    }

    set isReadyDiscard(visible: boolean) {
        this._isReadyDiscard = visible
    }

    get isReadyDiscard() {
        return this._isReadyDiscard
    }

    set isSelected(visible: boolean) {
        this._isSelected = visible
    }

    get isSelected() {
        return this._isSelected
    }

    get cardSuit() {
        return this._cardData >> 8
    }

    get cardPoint() {
        return this._cardData & 0xff
    }

    onLoad() {
        this.nodeChoose = this.node.getChildByName("choose")
        this.nodeEnable = this.node.getChildByName('enable');

        this.nodeBack = this.node.getChildByName("back")
        this.nodeDealer = this.node.getChildByName("front").getChildByName('dealer');
    }

    onEnabled() {
        cc.log("enabled")
    }

    setSelected(visible: boolean) {
        this._isSelected = visible
        this.nodeChoose.active = visible
    }

    setEnabled(enabled: boolean) {
        this.nodeEnable.active = !enabled
        this.isCanMove = enabled;
    }

    resetCardStatus() {
        this.setSelected(false)
        this.isReadyDiscard = false
        this.node.y = 0
    }

    setCardMoveStatus() {
        if (!this.isCanMove && g.gameVal.lastGame == GameId.DDZ) {
            return;
        }
        let moveDis = 0
        if (!this.isReadyDiscard) {
            moveDis = this.CARD_MOVE_DISTANCE
        }
        this.isReadyDiscard = !this.isReadyDiscard

        this.node.stopAllActions()
        //this.node.runAction(cc.moveTo(0.1, this.node.x, moveDis))
        cc.tween(this.node).to(0.1, { position: cc.v2(this.node.x, moveDis) }).start();
    }

    setDealerLogo(visible: boolean) {
        this.nodeDealer.active = visible
    }

    setBack(visible: boolean) {
        this.nodeBack.active = visible
    }
}
