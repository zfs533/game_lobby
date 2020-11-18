import User from "../common/user";
import { maskAccount, doCountdown, checkPwd, setInteractable, checkPwdRule } from '../common/util';
import { ErrCodes } from "../common/code";
import PopActionBox from "../lobby/popActionBox"
import { ItemNames } from "../common/enum";
import g from "../g";
import { showTip } from "../common/ui";
import net from "../common/net";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChangePwd extends PopActionBox {
    @property(cc.Button)
    btnSendCode: cc.Button = undefined;

    @property(cc.Button)
    btnOk: cc.Button = undefined;

    @property(cc.EditBox)
    ebPhone: cc.EditBox = undefined;

    @property(cc.EditBox)
    ebVCode: cc.EditBox = undefined;

    @property(cc.EditBox)
    ebNewPwd: cc.EditBox = undefined;

    onLoad() {
        super.onLoad();
    }

    start() {
        super.start();

        if (User.act) {
            this.ebPhone.string = maskAccount(User.act);
        }

        let next = g.chgPwdTime;
        let label = this.btnSendCode.node.getChildByName("lab").getComponent(cc.Label);
        doCountdown(this.btnSendCode, label, next);
    }

    async onClickVCode() {
        let originLabel = this.btnSendCode.node.getChildByName("lab").getComponent(cc.Label);
        originLabel.string = "发送中";
        setInteractable(this.btnSendCode, false);


        let data = await net.request("hall.hallHandler.getChgPwdCode");
        originLabel.string = "获取验证码";
        if (data.code !== 200) {
            showTip(ErrCodes.getErrStr(data.code, "获取验证码失败"));
            setInteractable(this.btnSendCode, true);
            return;
        }
        showTip("已发送验证码，请注意查收！");
        let countdown = 60;
        let next = Date.now() + countdown * 1000;
        g.chgPwdTime = next;

        doCountdown(this.btnSendCode, originLabel, next);
    }

    async onClickOk() {
        let mobile = User.act;
        let code = this.ebVCode.string.trim();
        let pwd = this.ebNewPwd.string;
        if (!mobile || !code || !pwd) {
            showTip("请输入完整信息！");
            return;
        }

        if (!checkPwd(pwd)) {
            showTip("密码格式不符合要求！最少需要6位");
            return;
        }

        if (!checkPwdRule(pwd)) {
            showTip("格式不正确，请输入数字或字母！");
            return;
        }

        let data = await net.request("hall.hallHandler.chgPwd", { code: code, pwd: pwd })
        if (data.code !== 200) {
            showTip(ErrCodes.getErrStr(data.code, "密码修改失败"));
            return;
        }
        cc.sys.localStorage.setItem(ItemNames.password, pwd);
        showTip("密码修改成功！");
        this.closeAction();
    }
}
