import LoginHelper from "./loginHelper"
import { isValidateMobile, doCountdown, setInteractable } from "../common/util"
import { ErrCodes } from "../common/code"
import g from "../g"
import Article from "./article"
import { LoginWay } from "../common/enum"
import User from "../common/user"
import { showTip, showLoading, showConfirm, hideLoading } from "../common/ui"
import Audio from "../g-share/audio"
import net from "../common/net";

const { ccclass, property } = cc._decorator
@ccclass
export default class Login extends cc.Component {
    @property(cc.Node)
    nodeNormal: cc.Node = undefined

    @property(cc.Button)
    btnFastLogin: cc.Button = undefined

    @property(cc.Button)
    btnRegister: cc.Button = undefined

    @property(cc.Button)
    btnLoginAct: cc.Button = undefined

    @property(cc.EditBox)
    act: cc.EditBox = undefined

    @property(cc.EditBox)
    pwd: cc.EditBox = undefined

    @property(cc.Node)
    nodeMobile: cc.Node = undefined

    @property(cc.Button)
    btnGetCode: cc.Button = undefined

    @property(cc.Button)
    btnLoginMobile: cc.Button = undefined

    @property(cc.EditBox)
    phone: cc.EditBox = undefined

    @property(cc.EditBox)
    code: cc.EditBox = undefined

    @property(cc.Prefab)
    private article: cc.Prefab = undefined

    private switching: boolean

    onLoad() {
        this.showNormal(false)
        this.showLoginInfo()
        g.hallVal.showRegister = false;
        g.hallVal.showBind = true;
    }

    start() {
        if (g.loginTime) {
            let next = g.loginTime
            doCountdown(this.btnGetCode, this.btnGetCode.getComponentInChildren(cc.Label), next)
        }
    }

    showNormal(doAnim = true) {
        this.switchNode(this.nodeMobile, this.nodeNormal, doAnim)
    }

    private switchNode(from: cc.Node, to: cc.Node, doAnim: boolean) {
        return new Promise<boolean>(resolve => {
            if (this.switching) {
                resolve(false)
                return
            }
            if (doAnim) {
                if (from.active) {
                    this.switching = true
                    let actions = cc.sequence(cc.scaleTo(0.3, 0, 0).easing(cc.easeBackIn()), cc.callFunc(() => {
                        from.active = false
                        from.scale = 1
                        to.active = true
                        to.scale = 0
                        // to.runAction(cc.sequence(cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()), cc.callFunc(() => {
                        //     this.switching = false
                        //     resolve(true)
                        // })))
                        cc.tween(to).then(
                            cc.sequence(cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()), cc.callFunc(() => {
                                this.switching = false
                                resolve(true)
                            }))
                        ).start()
                    }))
                    // from.runAction(actions)
                    cc.tween(from).then(actions).start();
                    // cc.tween(from).to(0.3, { scale: 0 }, { easing: 'quadIn' })
                    //     .call(
                    //         () => {
                    //             from.active = false
                    //             from.scale = 1
                    //             to.active = true
                    //             to.scale = 0
                    //             cc.tween(to).to(0.3, { scale: 1 }, { easing: 'quadOut' })
                    //                 .call(
                    //                     () => {
                    //                         this.switching = false
                    //                         resolve(true)
                    //                     }
                    //                 ).start();
                    //         }
                    //     ).start();
                }
            } else {
                to.active = true
                from.active = false
                resolve(true)
            }
        })
    }

    showLoginInfo() {
        if (User.act) {
            this.act.string = User.act
        }
        if (User.pwd) {
            this.pwd.string = User.pwd
        }
        if (cc.sys.isNative && User.act) {
            this.btnFastLogin.node.active = false
            this.btnRegister.node.active = false
        }
    }


    onEndEditAct() {
        this.pwd.string = ""
    }

    quickShowMobile() {
        this.nodeNormal.active = false
        this.nodeMobile.active = true
        this.phone.string = this.act.string;
        this.nodeMobile.scale = 0
        //this.nodeMobile.runAction(cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()))
        //cc.tween(this.nodeMobile).to(0.3, { scale: 1 }, { easing: 'quadOut' }).start();
        cc.tween(this.nodeMobile).then(cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut())).start();
    }

    async loginUuid() {
        showLoading("正在登录")
        let ok = await LoginHelper.loginByWay(LoginWay.UUID)
        if (ok !== 200) {
            showTip(ErrCodes.getErrStr(ok, "登录失败"))
            hideLoading()
        }
    }

    private onClickPrivicyToggle(tog: cc.Toggle) {
        let active = tog.isChecked
        setInteractable(this.btnFastLogin, active);
        setInteractable(this.btnLoginAct, active);
        setInteractable(this.btnRegister, active);
    }
    async onClickActLogin() {
        Audio.PlayClick()
        let act = this.act.string
        let pwd = this.pwd.string
        if (!this.btnFastLogin.node.active && User.act && User.pwd) {
            // 本地存有正式账号，则必须输入账号和密码才能登录
            if (!act) {
                showTip("请输入账号！")
                return
            }
            if (!pwd) {
                showTip("请输入密码！")
                return
            }
        }
        if (act || pwd) {
            if (!isValidateMobile(act)) {
                showTip("您输入的手机号码有误，请重新输入！")
                return
            }
            if (!pwd) {
                showTip("请输入密码！")
                return
            }
        }
        showLoading("正在登录")
        let code: number
        if (act && pwd) {
            g.login.act = act
            g.login.pwd = pwd
            code = await LoginHelper.loginByWay(LoginWay.ACT)
        } else {
            code = await LoginHelper.loginByWay(LoginWay.UUID)
        }
        if (code !== 200) {
            hideLoading()
            g.login.act = "";
            g.login.pwd = "";
            if (code === ErrCodes.FORBID_LOGIN) {
                showConfirm(ErrCodes.getErrStr(code, ""))
            } else {
                showTip(ErrCodes.getErrStr(code, "登录失败"))
                if (code === ErrCodes.UNUSUAL_LOGIN) {
                    this.quickShowMobile()
                }
            }
        }
    }

    async onClickGetVerfCode() {
        Audio.PlayClick()
        let phone = this.phone.string
        // 验证号码是否符合电话号码格式
        if (isValidateMobile(phone)) {
            let label = this.btnGetCode.getComponentInChildren(cc.Label)
            let originLabel = label.string
            label.string = "发送中"
            setInteractable(this.btnGetCode, false);

            let code = await LoginHelper.handShake()
            if (code === 200) {
                let data = await net.request("auth.authHandler.sendLoginVerifyCode", { act: phone, pid: g.pid });
                label.string = originLabel
                setInteractable(this.btnGetCode, true);
                if (data.code !== 200) {
                    showTip(ErrCodes.getErrStr(data.code, "获取验证码失败"))
                    return
                }
                let countdown = 60
                let next = Date.now() + countdown * 1000
                g.loginTime = next
                doCountdown(this.btnGetCode, label, next)
                showTip("已发送验证码，请注意查收！")
            }
        } else {
            showTip("您输入的手机号码有误，请重新输入！")
        }
    }

    async onClickMobileLogin() {
        Audio.PlayClick()
        let phone = this.phone.string
        let code = this.code.string
        if (!isValidateMobile(phone)) {
            showTip("您输入的手机号码有误，请重新输入！")
            return
        }
        if (!code) {
            showTip("请输入验证码！")
            return
        }
        showLoading("正在登录")
        g.login.act = phone
        g.login.smsCode = code
        let ok = await LoginHelper.loginByWay(LoginWay.MOBILE)
        if (ok !== 200) {
            g.login.act = "";
            g.login.pwd = "";
            showTip(ErrCodes.getErrStr(ok, "登录失败"))
            hideLoading()
        }
    }
    private onClickQuickLogin() {
        Audio.PlayClick()
        this.loginUuid()
    }

    async onClickShowMobile() {
        Audio.PlayClick()
        let success = await this.switchNode(this.nodeNormal, this.nodeMobile, true)
        if (success) {
            showConfirm("请注意，只有已注册用户才能通过手机验证登录!")
        }
    }

    private onClickRegister() {
        Audio.PlayClick()
        g.hallVal.showRegister = true
        this.loginUuid()
    }

    private onClickPrivicy() {
        Audio.PlayClick()
        let node = this.node.getChildByName("article")
        if (!node) {
            node = cc.instantiate(this.article)
            this.node.addChild(node)
            node.name = "article"
            node.setPosition(0, 0)
        } else {
            let article = node.getComponent(Article)
            article.openAnim()
        }
    }
    private onClickCloseMobile() {
        Audio.PlayClick()
        this.showNormal()
    }
}