import PopActionBox from "./popActionBox";
import Lobby from "./lobby";
import { WelfareResult } from "./welfareEvents";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PayRebateEvents extends PopActionBox {
    @property(cc.Sprite)
    spContent: cc.Sprite = undefined;

    @property([cc.SpriteFrame])
    sfContent: cc.SpriteFrame[] = [];

    private PAY_TYPE = ["yun", "official_pay"];
    private _lobby: Lobby = undefined
    private rechargeRebate: WelfareResult;

    init(lobby: Lobby, data: WelfareResult) {
        this._lobby = lobby;
        this.rechargeRebate = data;
        this.selectContent();
    }

    selectContent() {
        let types = this.rechargeRebate.rechargeChannels;

        if (types && types.length > 0) {
            let containYun;
            let containChat;
            for (let i = 0; i < types.length; i++) {
                if (types[i].includes(this.PAY_TYPE[0])) {
                    containYun = true;
                }
                if (types[i].includes(this.PAY_TYPE[1])) {
                    containChat = true;
                }
            }
            let finalSfIndex = 0;
            if (containChat && containYun) {
                finalSfIndex = 2;
            } else if (containYun) {
                finalSfIndex = 1;
            } else if (containChat) {
                finalSfIndex = 0;
            }
            this.spContent.spriteFrame = this.sfContent[finalSfIndex];
        }
    }

    onClickRechage() {
        this._lobby.isOpenRechargeRebate = true;
        this._lobby.onClickRecharge();
        this.closeAction();
    }
}
