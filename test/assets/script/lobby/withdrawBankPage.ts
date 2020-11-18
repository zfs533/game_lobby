import WithdrawPage from "./withdrawPage";
import User from "../common/user";
import { showTip } from "../common/ui";
import { ErrCodes } from "../common/code";
import { WithdrawType } from "./withdrawPage"
import net from "../common/net";
const { ccclass, property } = cc._decorator;

@ccclass
export default class WithdrawBankPage extends WithdrawPage {

    @property(cc.Label)
    private lblAct: cc.Label = undefined;

    @property(cc.RichText)
    private lblBind: cc.RichText = undefined;

    @property(cc.Prefab)
    private preSSSBind: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preBankBind: cc.Prefab = undefined;

    private getAct() {
        if (this._type === WithdrawType.BankCard) {
            return User.bankAccount;
        } else {
            return User.SSSAccount;
        }
    }

    protected onEnable() {
        if (super.onEnable) {
            super.onEnable();
        }
        this.refresh();
    }

    private onClickBind() {
        let canvas = cc.find("Canvas");
        let node;
        if (this._type === WithdrawType.BankCard) {
            node = cc.instantiate(this.preBankBind);
        } else if (this._type === WithdrawType.SSS) {
            node = cc.instantiate(this.preSSSBind);
        }
        if (!node) return cc.warn('not found node!');
        canvas.addChild(node);
        node.setPosition(0, 0);

        node.once("close", () => {
            this.refresh();
        });
    }

    private async refresh() {
        if (!this || !this.isValid) {
            return;
        }
        let act = this.getAct();
        this.lblAct.string = act || this.strAct;

        let data = await net.request("hall.billHandler.getOrderCnt", {});
        this.lblBind.node.active = this._type === WithdrawType.BankCard ? !!data.union : !!data.ali;

        this.lblBind.string = "<u>" + this.strBind + "</u>";
        this.node.color = (new cc.Color).fromHEX(act ? "#bbbbbb" : "#fb003c");
    }

    protected checkOk() {
        let ok = super.checkOk();
        if (!ok) {
            return false;
        }
        let act = this.getAct();
        if (!act) {
            if (this._type === WithdrawType.BankCard) {
                showTip(ErrCodes.BIND_CARD);
            } else {
                showTip(ErrCodes.BIND_SSS);
            }
            return false;
        }
        return true;
    }
}
