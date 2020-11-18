import g from "../g"
import LoginHelper from "./loginHelper"
import User from "../common/user"
import Login from "./login"
import AudioStart from "./audioStart"
import { ErrCodes } from "../common/code"
import { UpdateTool } from "./updateTool"
import { chkChineseStr, fitCanvas, toj, checkEmu, random } from "../common/util"
import { getChannel } from "../common/app";
import { ItemNames, LoginWay } from "../common/enum"
import { showTip, showConfirm, showLoading, hideLoading } from "../common/ui"
import { checkUpdatable, UPDATE_STATUS } from "../common/update"
import Debug from "../start/debug";
import { getUUID } from "../common/app";


const LOGIN_TIPS: string[] = [
    "超多惊喜，超多奖励，场次多多，任你选择！",
    "登录送金，绑定再送金！",
    "万人在线，真人对战！",
    "多样竞技，激情对战，把握时机，加大下注！"
]

const localStorage: Storage = cc.sys.localStorage
const { ccclass, property } = cc._decorator

@ccclass
export default class Start extends cc.Component {
    @property(Login)
    login: Login = undefined

    @property(AudioStart)
    audioStart: AudioStart = undefined

    @property(cc.Node)
    private nodeMask: cc.Node = undefined

    @property(cc.Label)
    info: cc.Label = undefined

    @property(cc.Label)
    updateInfo: cc.Label = undefined;

    @property(cc.Label)
    tips: cc.Label = undefined

    @property(cc.Label)
    private lblResVer: cc.Label = undefined

    @property(cc.Node)
    private nodeCanvas: cc.Node = undefined
    @property(cc.Node)
    private bar: cc.Node = undefined

    @property(cc.Prefab)
    private preSuperService: cc.Prefab = undefined

    @property(cc.Node)
    private serviceBtn: cc.Node = undefined

    @property({ type: cc.Asset })
    private manifest: cc.Asset = undefined

    // 停服维护相关
    @property(cc.Node)
    private maintainTip: cc.Node = undefined;

    @property(cc.Label)
    private maintainContent: cc.Label = undefined;

    @property(cc.Label)
    private maintainTime: cc.Label = undefined;

    private timeoutID: NodeJS.Timeout;
    private firstLoading = true
    private barWidth = 0

    private logining: boolean = false;
    private mainTainfunc: Function = undefined;
    private hotUpdateState: any = undefined;

    onLoad() {
        Debug.log("== 启动界面载入 ==")
        fitCanvas(this.nodeCanvas)
        this.barWidth = this.bar.width
        this.nodeMask.width = 0
        this.lblResVer.string = ""
        this.chgTips()

        Debug.log(cc.sys.os)//Android

        g.login.act = "";
        g.login.pwd = "";
        g.login.smsCode = "";

        this.serviceBtn.active = false;
        this.serviceBtn.zIndex = 10010;
        this.timeoutID = setTimeout(() => {
            if (this.serviceBtn) this.serviceBtn.active = true;
        }, 3000);
    }

    async start() {
        Debug.log("===启动游戏===")

        // 保持屏幕常亮
        if (cc.sys.isNative) jsb.Device.setKeepScreenOn(true)

        if (checkEmu()) {
            Debug.log("当前设备为模拟器");
            let conf = showConfirm("请不要在模拟器中运行本游戏");
            conf.okFunc = cc.game.end;
            return;
        }

        this.tryGetChannel()

        if (this.firstLoading) {
            this.firstLoading = false;
            this.showStart()
        }

        this.info.string = "准备启动";
        this.runTips();
        this.checkMaintain();
        if (!cc.sys.isNative) {
            this.beginLogin();
            return;
        }
        this.showResVersion();

        // 热更新后1分钟内不再检测
        // let currTime = (new Date()).getTime();
        // let updateTime = +localStorage.getItem(ItemNames.hotUpdateTime);
        // if ((currTime - updateTime) < 1000 * 60) {
        //     Debug.log(" hot update no need check！ coldTime")
        //     this.hotUpdateState = UPDATE_STATUS.NO;
        //     this.beginLogin();
        //     return;
        // }
        this.isTransit();
        let updateStatus = await checkUpdatable();
        // 是否在维护
        if (updateStatus === UPDATE_STATUS.MAINTAIN)
            return;
        // 检测热更新, 直接进入游戏了，不要检查热更新（因为是美服审核）
        if (updateStatus === UPDATE_STATUS.NO) {
            Debug.log(" 不要用热更新 ")
            this.hotUpdateState = UPDATE_STATUS.NO;
            this.beginLogin();
            return;
        }
        //开始热更新
        Debug.log(" 开始热更新 ")
        localStorage.setItem(ItemNames.manifestMain, this.manifest.nativeUrl);
        let tool = new UpdateTool(this.manifest.nativeUrl, ItemNames.lobbyPath, true);
        tool.showVer = ver => {
            this.lblResVer.string = ver
        }
        tool.infoHandler = info => {
            this.info.string = info;
        };
        tool.progressHandler = (num, info) => {
            this.nodeMask.width = num * this.barWidth;
            if (this.updateInfo) this.updateInfo.string = info;
        };
        tool.overHandler = this.beginLogin.bind(this);
        tool.start();
        this.requestCurrentCNY();
    }

    runTips() {
        cc.tween(this.tips.node).to(0.8, { opacity: 255 })
            .delay(1.8)
            .to(0.8, { opacity: 0 })
            .call(() => { this.chgTips() })
            .start();
    }

    chgTips() {
        let l = LOGIN_TIPS.length - 1;
        this.tips.string = LOGIN_TIPS[random(0, l)];
    }

    private tryGetChannel() {
        Debug.log("tryGetChannel")
        let chl = localStorage.getItem(ItemNames.channel)
        if (chl) {
            User.channel = chl
        } else {
            let clipboard = getChannel();
            if (clipboard && !chkChineseStr(clipboard) && clipboard.length < 150) {
                localStorage.setItem(ItemNames.channel, clipboard)
                User.channel = clipboard;
            }
        }
        Debug.log("tryGetChannel User.chl:" + User.channel)
    }

    showStart() {
        this.node.active = true;
        this.login.node.active = false;
        this.audioStart.playMusic();
    }

    showLogin() {
        this.nodeMask.parent.active = false;
        this.info.node.active = false;
        this.node.active = false;
        this.login.node.active = true;
        if (cc.sys.isNative && User.act) {
            this.login.showLoginInfo();
        }
    }

    showMobile() {
        this.nodeMask.parent.active = false;
        this.info.node.active = false;
        this.node.active = false;
        this.login.node.active = true;
        this.login.quickShowMobile();
    }
    private async beginLogin() {
        if (this.logining) {
            //showTip("正在登录中...");
            return;
        }
        this.logining = true;
        Debug.log("begin login")
        this.info.string = "正在登录";
        if (this.nodeMask) {
            this.nodeMask.width = 0;
            let w = (0.01 * (this.barWidth - this.nodeMask.width)) / 20;
            let progressing = () => {
                if (this.nodeMask.width <= 0.95 * this.barWidth) {
                    this.nodeMask.width += w;
                } else {
                    this.unschedule(progressing);
                }
            }
            this.schedule(progressing, 0);
        }

        let code: number;
        let token = localStorage.getItem(ItemNames.token);
        if (token) code = await LoginHelper.loginByWay(LoginWay.TOKEN);
        if ((!code || (code === ErrCodes.RE_LOGIN))
            && (g.login.act && g.login.pwd)) {
            if (code && code === ErrCodes.RE_LOGIN) {
                localStorage.removeItem(ItemNames.token);
            }
            code = await LoginHelper.loginByWay(LoginWay.ACT);
        }
        if (!code) code = await LoginHelper.loginByWay(LoginWay.UUID);

        Debug.log("Login Back code = " + code)
        if (code != 200 && this.maintainTip && this.maintainTip.active) {
            this.logining = false;
            hideLoading()
            return;
        }
        if (code === 200) {
            this.nodeMask.width = this.barWidth;
        } else {
            this.showLogin();
            g.login.act = "";
            g.login.pwd = "";
            if (code === ErrCodes.FORBID_LOGIN) {
                showConfirm(ErrCodes.getErrStr(code, ""));
            } else {
                showTip(ErrCodes.getErrStr(code, "登录失败"));
                if (code === ErrCodes.UNUSUAL_LOGIN) {
                    this.showMobile();
                }
            }

        }
        this.logining = false;
    }

    /**
     * 显示资源版本号
     */
    private async showResVersion() {
        if (!cc.sys.isNative) {
            let ver = await new Promise((resolve: (v: string | undefined) => void) => {
                cc.loader.load(this.manifest.nativeUrl, (err: Error, str: string) => {
                    let json: { version: string } = toj(str);
                    resolve(json.version);
                });
            })
            g.hotVer = ver;
        }
        this.lblResVer.string = g.hotVer;
    }

    private onClickShowService() {
        let canvas = cc.find("Canvas");
        if (canvas.getChildByName('superService')) {
            return;
        }
        let node = cc.instantiate(this.preSuperService);
        canvas.addChild(node);
        node.active = true;
        node.setPosition(0, 0);
    }

    private async checkMaintain() {
        if (!cc.sys.isNative) return;
        let fastestServer = await LoginHelper.getFastestServer(g.gameServers);
        const SALT = "+tczaflwsyhy2yhXbb";
        let uuid = localStorage.getItem(ItemNames.uuid) || getUUID();
        let myToken = md5(g.pid + uuid + SALT)
        fastestServer = fastestServer.replace("ws://", "http://");
        let furl = `${fastestServer}/i/loginNotice?pid=${g.pid}&token=${myToken}&uuid=${uuid}`;
        let data: { active: boolean, content: string, countdown: string }[] = undefined;
        this.mainTainfunc = () => {
            return new Promise(async resolve => {
                data = await this.getMaintainUrlData(furl);
                Debug.log("checkMaintain::" + data);
                if (!this.logining && this.maintainTip.active && !data[0].active && this.hotUpdateState === UPDATE_STATUS.NO) {
                    cc.log("logining-------");
                    this.beginLogin();
                }
                if (data && data[0] && data[0].active && cc.isValid(this.maintainTip && this.hotUpdateState === UPDATE_STATUS.NO)) {
                    this.maintainContent.string = data[0].content;
                    this.maintainTime.string = "距离维护结束,预计还有:" + data[0].countdown;
                    this.maintainTip.active = true;
                    this.info.node.active = false;
                    this.nodeMask.parent.active = false;
                } else if (cc.isValid(this.maintainTip)) {
                    this.info.node.active = true;
                    this.maintainTip.active = false;
                    this.nodeMask.parent.active = true;

                }
                resolve();
            });
        };
        this.mainTainfunc()
        this.schedule(this.mainTainfunc, 60);
    }


    private maintainLogin() {
        if (!this.logining) {
            showLoading("正在登录")
            this.beginLogin();
        }
    }

    getMaintainUrlData(url: string, timeout: number = 5000) {
        return new Promise((resolve: (ret?: any) => void) => {
            cc.log("      url         " + url)
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function (event: Event) {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 400) {
                        let ret;
                        try {
                            ret = JSON.parse(xhr.responseText);
                        } catch (error) {
                            cc.log("-----------JSON.parse err ----------" + url)
                            resolve();
                        }
                        cc.log("获取:" + url + "数据:" + ret);
                        if (ret && ret.code === 200 && ret.msg)
                            resolve(ret.msg);
                        resolve();
                    } else {
                        resolve();
                    }
                }
            };

            xhr.timeout = timeout;
            xhr.ontimeout = function () {
                cc.log("获取超时:" + url);

                resolve();
            };
            xhr.onerror = function () {
                cc.log("获取失败:" + url);
                resolve();
            };
            xhr.open("GET", url);
            xhr.setRequestHeader('Content-Type', "application/json");
            xhr.send();
        });
    }

    onDestroy() {
        if (this.mainTainfunc) this.unschedule(this.mainTainfunc);
        clearTimeout(this.timeoutID);
    }
    isTransit() {
        if (g.bundleId === "com.hyyl.testofficial") {
            // 热更新后1分钟内不再检测
            let currTime = (new Date()).getTime();
            let updateTime = +localStorage.getItem(ItemNames.hotUpdateTime);
            if ((currTime - updateTime) > 1000 * 60) {
                Debug.log(" hot update no need check！ coldTime")
                let storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + ItemNames.lobbyPath;
                let manifestStr = jsb.fileUtils.getStringFromFile(`${storagePath}/project.manifest`);
                if (manifestStr) {
                    jsb.fileUtils.removeDirectory(storagePath)
                    Debug.log(" ** remove local path ok")
                    localStorage.setItem(ItemNames.searchPaths, "");
                    jsb.fileUtils.setSearchPaths([]);
                    manifestStr = jsb.fileUtils.getStringFromFile(`${storagePath}/project.manifest`);
                    if (!manifestStr) {
                        Debug.log("-----------删除成功---- ")
                    }
                    cc.game.restart();
                }
            }
        }
    }

    /**
     * 获取当前实时汇率
     * @param timeout
     */
    requestCurrentCNY(timeout: number = 5000) {
        let url: string = "http://apiv2.bitz.com/Market/currencyCoinRate?coins=usdt";
        cc.log("      url         " + url)
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (event: Event) {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    let ret;
                    try {
                        ret = JSON.parse(xhr.responseText);
                        g.cny = (Number(ret.data.usdt.cny).toFixed(2));
                        cc.sys.localStorage.setItem("usdtvalue", g.cny)
                    } catch (error) {
                    }
                    cc.log("获取:" + url + "数据:" + ret);
                } else {
                    g.cny = cc.sys.localStorage.getItem("usdtvalue") ? cc.sys.localStorage.getItem("usdtvalue") : g.cny;
                }
            }
        };

        xhr.timeout = timeout;
        xhr.ontimeout = function () {
        };
        xhr.onerror = function () {
        };
        xhr.open("GET", url);
        xhr.setRequestHeader('Content-Type', "application/json");
        xhr.send();
    }
}