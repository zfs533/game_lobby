import PopActionBox from "../lobby/popActionBox"
import { showTip } from "../common/ui";
import { ErrCodes } from "../common/code";
import User from "../common/user";
import { isEmail, isValidateMobile } from "../common/util";
import net from "../common/net";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BindSSS extends PopActionBox {
    @property(cc.EditBox)
    private ebAli: cc.EditBox = undefined;

    @property(cc.EditBox)
    private ebName: cc.EditBox = undefined;


    private _binding: boolean;

    protected onLoad() {
        super.onLoad();

        this.ebAli.string = "";
        this.ebName.string = "";
        this.ebAli.placeholder = `请输入支付宝账号`;
    }

    private async onClickBindAli() {
        let ali = this.ebAli.string;
        let name = this.ebName.string.trim();

        if (!isEmail(ali) && !isValidateMobile(ali)) {
            showTip("账号格式不对");
            return;
        }

        let nameNick = name.replace(/[^\u4E00-\u9FA5]/g, "");
        if (nameNick !== name) {
            showTip("您输入的姓名不能包含非中文字符");
            return
        }
        if (!ali || !name) {
            showTip("请输入所有信息");
            return;
        }
        if (this._binding) {
            return;
        }
        if (User.SSSAccount) {
            this._binding = true;
            // showLoading();
            let data = await net.request("hall.billHandler.modifyWithdrawAccount", { type: 1, account: ali, name, bankPwd: '888888', });
            // hideLoading();
            this._binding = false;
            if (data.code !== 200) {
                showTip(ErrCodes.getErrStr(data.code, "绑定失败"));
                return;
            }
            showTip("绑定成功");
            User.SSSAccount = ali.replace(/(\d{4})\d*(\d{4})/, "$1****$2");
            this.closeAction();
            return
        }
        this._binding = true;
        let data = await net.request("hall.billHandler.bindAli", { name: name, act: ali });

        this._binding = false;
        if (data.code !== 200) {
            showTip(ErrCodes.getErrStr(data.code, "绑定失败"));
            return;
        }
        showTip("绑定成功");
        User.SSSAccount = ali.replace(/(\d{4})\d*(\d{4})/, "$1****$2");
        this.closeAction();
    }
}
