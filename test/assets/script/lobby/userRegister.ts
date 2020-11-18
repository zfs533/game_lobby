import User from "../common/user";
import { doCountdown, isValidateMobile, checkPwd, checkPwdRule, setInteractable } from '../common/util';
import { ErrCodes } from "../common/code";
import PopActionBox from "./popActionBox"
import Lobby from "./lobby";
import { ItemNames } from "../common/enum";
import g from "../g";
import { showLoading, showTip, hideLoading, showConfirm } from "../common/ui";
import net from "../common/net";
const { ccclass, property } = cc._decorator;

@ccclass
export default class UserRegister extends PopActionBox {
    @property(cc.EditBox)
    ebAccount: cc.EditBox = undefined;

    @property(cc.EditBox)
    ebVCode: cc.EditBox = undefined;

    @property(cc.EditBox)
    ebPwd: cc.EditBox = undefined;

    @property(cc.Button)
    btnBind: cc.Button = undefined;

    @property(cc.Button)
    btnSendCode: cc.Button = undefined;

    @property(cc.Slider)
    sliderVertify: cc.Slider = undefined;

    @property(cc.ProgressBar)
    progressVertify: cc.ProgressBar = undefined;

    @property(cc.Label)
    lblVertifyTip: cc.Label = undefined;

    private isShowConfirm = false;
    private bindBonus: string;
    private isCanSendCode: boolean;

    onLoad() {
        super.onLoad();
    }

    start() {
        super.start();
        let next = g.bindTime;
        let label = this.btnSendCode.node.getChildByName("lab").getComponent(cc.Label);
        doCountdown(this.btnSendCode, label, next);
        if (!this.isCanSendCode) this.btnSendCode.interactable = false;
    }

    async onClickSure() {
        let phone = this.ebAccount.string.trim();
        let code = this.ebVCode.string.trim();
        let pwd = this.ebPwd.string;
        if (!isValidateMobile(phone)) {
            showTip("您输入的手机号码有误，请重新输入！");
            return;
        }
        if (!code || !pwd) {
            showTip("请输入完整信息！");
            return;
        }
        if (!checkPwdRule(pwd)) {
            showTip("密码格式不符合要求!只能输入数字或字符");
            return;
        }
        if (!checkPwd(pwd)) {
            showTip("密码格式不符合要求！最少需要6位");
            return;
        }
        showLoading();

        let data = await net.request("hall.hallHandler.bind", { act: phone, code: code, pwd: pwd });
        if (data.code !== 200) {
            hideLoading();
            showTip(ErrCodes.getErrStr(data.code, "绑定失败"));
            return;
        }
        showTip("绑定成功！");
        if (data.bindBonus && data.money) {
            this.isShowConfirm = true;
            User.money = data.money;
            this.bindBonus = data.bindBonus;
            let lob = cc.find("lobby").getComponent(Lobby);
            lob.playFallCoin();
        }
        User.act = phone;
        cc.sys.localStorage.setItem(ItemNames.account, phone);
        User.pwd = pwd;
        cc.sys.localStorage.setItem(ItemNames.password, pwd);
        hideLoading();
        this.onClose();
    }

    onClickVertifySlider() {
        this.progressVertify.progress = this.sliderVertify.progress;
        if (!this.isCanSendCode && this.progressVertify.progress >= 1) {
            this.lblVertifyTip.string = "验证成功";
            this.isCanSendCode = true;
            this.sliderVertify.handle.node.getChildByName("arrow").active = false;
            this.sliderVertify.handle.node.getChildByName("succ").active = true;
            this.sliderVertify.enabled = false;
            this.btnSendCode.interactable = true;
        }
    }

    onClickeHandleButton(event: cc.Event, customData: string) {
        if (this.sliderVertify.progress >= 1) return;
        this.sliderVertify.progress = 0;
        this.progressVertify.progress = 0;
        showTip("验证不成功，请重试！");
    }

    async onSendCodeButton() {
        let phone = this.ebAccount.string.trim();
        // 验证号码是否符合电话号码格式
        if (isValidateMobile(phone)) {
            let originLabel = this.btnSendCode.node.getChildByName("lab").getComponent(cc.Label);
            originLabel.string = "发送中";
            setInteractable(this.btnSendCode, false);

            let data = await net.request("hall.hallHandler.getBindCode", { act: phone });
            originLabel.string = "获取验证码";
            if (data.code !== 200) {
                showTip(ErrCodes.getErrStr(data.code, "获取验证码失败"));
                setInteractable(this.btnSendCode, true);
                return;
            }
            showTip("已发送验证码，请注意查收！");
            let countdown = 60;
            let next = Date.now() + countdown * 1000;
            g.bindTime = next;
            doCountdown(this.btnSendCode, originLabel, next);
        } else {
            showTip("您输入的手机号码有误，请重新输入！");
            return;
        }
    }

    onClose() {
        if (this.isShowConfirm) {
            this.user.refreshUserInfos();
            let confirm = showConfirm("恭喜你获得绑定奖励 金币" + this.bindBonus);
            confirm.okFunc = function () {
                let lob = cc.find("lobby").getComponent(Lobby);
                lob.showNewbieBonus();
            };
        }

        this.closeAction();
    }
}
