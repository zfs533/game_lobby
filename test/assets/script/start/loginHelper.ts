import { tos, toj, getJsonDataEx, uploadLoginInfo } from "../common/util";
import { showLoading, hideLoading, showConfirm, showTip, showCurtain } from "../common/ui";
import { ErrCodes } from "../common/code";
import { ShieldStatus } from "../common/shieldStatus";
import { ItemNames, LoginWay, GameId, DevStatus } from "../common/enum";
import { SCENE_NAME } from "../common/cfg";
import { getUUID } from "../common/app";
import g from "../g";
import net from "../common/net";
import agentUtil from "../lobby/agentUtil"
import User from "../common/user";
import Lobby from "../lobby/lobby";
import RechargePage from "../lobby/payPage";
import Start from "./start";
import Debug from "../start/debug";
import ActivityModel from "../lobby/activityModel";
import { getAppName } from "../common/app";

const localStorage: Storage = cc.sys.localStorage;

class LoginHelper {
    private getIplistOnce = true;
    private fastestServer: string = "";
    private errCount = 0

    private connTest(server: string, servers201: string[], servers200: string[]): void {
        Debug.log("test1=" + server)
        let host = server
        if (server.indexOf("://") !== -1) {
            host = server.substring(server.indexOf("://") + 3)
        }

        if (!g.officialEnv) {
            servers201.push(host);
            return
        }

        let temp = "http://" + host + "/888666/"
        Debug.log("test= " + temp)
        let start = Date.now();
        let xhr = new XMLHttpRequest();
        xhr.timeout = 20000;
        xhr.onreadystatechange = (ev) => {
            Debug.log("state chg=" + xhr.readyState + ",sta=" + xhr.status)
        }
        xhr.onload = () => {
            if (xhr.status === 201) {
                servers201.push(host);
            } else if (xhr.status === 200) {
                servers200.push(host);
            }
            Debug.log(xhr.status + "  " + temp + " opened, costs " + (Date.now() - start))
        }
        xhr.ontimeout = function () {
            Debug.log("获取超时:" + temp)
        };
        xhr.onerror = () => {
            this.errCount++
            Debug.log(temp + " error! ")
        };
        xhr.open("GET", temp);
        xhr.send();
    }

    getFastestServer(servers: string[]): Promise<string | undefined> {
        return new Promise(async resolve => {
            this.errCount = 0
            let servers200: string[] = [];
            let servers201: string[] = [];
            for (let s of servers) {
                this.connTest(s, servers201, servers200);
            }
            let checkcount = 0;
            let total = servers.length
            let checkTimer
            let okServers = await new Promise<string[]>(resolve => {
                checkTimer = setInterval(() => {
                    checkcount++;
                    if (this.errCount === total || checkcount > 15) {
                        Debug.log("全err或超过15了")
                        resolve([])
                        return
                    }
                    let ok = [...servers201, ...servers200];
                    if (this.errCount === total - 1 && ok.length === 1) {
                        Debug.log("只有一个没err，ok1个")
                        resolve(ok.slice(0, 1))
                        return
                    }

                    //0-15秒只要两个201返回就返回
                    if (servers201.length >= 2) {
                        Debug.log("server201 ok len>=2,len=" + servers201.length)
                        resolve(servers201.slice(0, 2));
                        return;
                    }

                    let t0 = 4
                    let t1 = 8
                    if (checkcount >= t0 && checkcount <= t1) { //t0-t1秒，有任意两个节点返回就返回
                        if (ok.length >= 2) {
                            Debug.log(`${t0}~${t1} oklen=${ok.length}`)
                            resolve(ok.slice(0, 2));
                            return;
                        }
                    } else if (checkcount > t1) {//t1-15秒，有任意一个节点返回就返回
                        if (ok.length >= 1) {
                            Debug.log(`>${t1} oklen:${ok.length}`)
                            resolve(ok.slice(0, 2));
                            return;
                        }
                    }
                }, 1000);
            })
            Debug.log("race over okservers:" + JSON.stringify(okServers))
            clearInterval(checkTimer);
            let rS: string = "";
            if (okServers.length === 2) {
                let idx = (Math.random() >= 0.5) ? 0 : 1;
                rS = okServers[idx];
            } else if (okServers.length === 1) {
                rS = okServers[0];
            }

            if (rS) {
                rS = "ws://" + rS
                resolve(rS);
            } else {
                cc.log("setTimeout no server");
                resolve();
            }
        });
    }

    /**
     * 登录方式
     * @param way
     */
    async loginByWay(way: LoginWay) {
        let uuid = localStorage.getItem(ItemNames.uuid) || getUUID();
        Debug.log('localStorage UUID = ' + uuid);
        let info: gameIface.LoginInfo = {
            uuid: uuid,
            pid: g.pid,
            bundleId: g.bundleId,
            channel: User.channel,
            platform: cc.sys.os === cc.sys.OS_IOS ? "ios" : "android",
            ver: "appVer:" + g.appVer + "/cccVer:2.3.2" + "/pkgName:" + getAppName(),
            businessPackage: undefined,//需要提示
        };

        if (cc.sys.os === cc.sys.OS_IOS) {//只检查iOS
            //根据app ID来判断  如果里面是网址链接则为企业包（下载地址）
            if (g.appId && g.appId.toString().indexOf('http') >= 0) {
                info.businessPackage = 1;
            } else {
                info.businessPackage = 0;//不需要提示
            }
        }

        Debug.log("LoginWay = " + way)
        // 登录方式
        switch (way) {
            case LoginWay.TOKEN:
                let localToken = localStorage.getItem(ItemNames.token);
                info.token = localToken;
                break;
            case LoginWay.ACT:
                info.act = g.login.act;
                info.pwd = g.login.pwd;
                break;
            case LoginWay.MOBILE:
                info.act = g.login.act;
                info.code = g.login.smsCode;
                break;
            case LoginWay.UUID:
                g.login.act = "";
                g.login.pwd = "";
                break;
            default:
                break;
        }
        let code = await this.connGame(info);
        if (g._dev === DevStatus.OFFICIAL && cc.sys.isNative) uploadLoginInfo(Debug._info);
        return code;
    }

    /**
     * 登录到大厅
     * @param info
     */
    async connGame(info: gameIface.LoginInfo) {
        // 先判断是否需要握手、短信登录
        let code;
        if (!info.code) {
            code = await this.handShake();
            if (code !== 200) return code;
        }

        Debug.log("handShake成功")
        code = await this.connServer(info);
        if (code !== 200) return code;

        Debug.log("connServer成功")
        code = await this.reqLobby();
        if (code !== 200) return code;

        this.enterLobby();
        return code;
    }

    /**
     * 握手
     */
    async handShake() {
        let fastSer: string;
        let ips = this.getLocalIps();
        if (ips && g.officialEnv) {
            fastSer = await this.getFastestServer(ips);
        }
        if (!fastSer) {
            fastSer = await this.getFastestServer(g.gameServers);
        }
        if (!fastSer) {
            //如果没有保存的IP且固定IP链接失败
            let testUrls = g.domainNames;
            let testIdx = 0;
            while (testIdx < testUrls.length) {
                let dataArr = await getJsonDataEx(testUrls[testIdx]);
                testIdx++;
                if (dataArr && dataArr.length > 0) {
                    this.fastestServer = await this.getFastestServer(dataArr);
                    break;
                }
            }
        }
        if (!fastSer) return ErrCodes.NET_INSTABILITY;
        Debug.log("   fastSer = " + fastSer)
        let code = await net.handShake(fastSer);
        Debug.log("handShake = " + code)
        if (code !== 200) return code;
        this.fastestServer = fastSer;
        return code;
    }

    /**
     * 连接服务器
     * @param info
     */
    async connServer(info: gameIface.LoginInfo) {
        cc.log('connServer token ====== ' + info);
        let dataStr = tos(info);
        let code = await net.connEntry(dataStr);
        Debug.log("connEntry code = " + code)
        if (code !== 200) return code;

        if (this.getIplistOnce && g.officialEnv) {
            Debug.log("get ip list")
            this.getIplistOnce = false;
            let str = await this.getIplist();
            Debug.log("get ip list end " + str)
            //当前连接不在列表中，断开重连
            if (str !== "" && str.indexOf(this.fastestServer) === -1) {
                let pomelo = window.pomelo;
                Debug.log("主动断开，重新连接")
                pomelo.off("disconnect");
                pomelo.disconnect();
                code = await this.handShake();
                if (code !== 200) return code;
                code = await this.connServer(info);
                if (code !== 200) return code;
            }
        }
        Debug.log("连接游戏服务器成功")
        if (info.uuid) Debug.log("存到本地的UUID：  " + info.uuid)
        localStorage.setItem(ItemNames.uuid, info.uuid);
        localStorage.removeItem(ItemNames.account);
        User.act = "";
        localStorage.removeItem(ItemNames.password);
        User.pwd = "";
        if (g.login.act) {
            localStorage.setItem(ItemNames.account, g.login.act);
            User.act = g.login.act;
            if (g.login.pwd) {
                localStorage.setItem(ItemNames.password, g.login.pwd);
                User.pwd = g.login.pwd;
            }
        }
        return code;
    }

    private getLocalIps() {
        let str = cc.sys.localStorage.getItem(ItemNames.ipList);
        if (str) {
            let list: string[] = toj(str);
            if (list && list.length > 0) {
                return list
            }
        }
    }

    private async getIplist() {
        let data = await net.request("hall.hallHandler.getIpList");
        if (data.code !== 200 || !data.ips) return "";
        // 将服务器传过来的ip都保存下来
        let newIps: string[] = [];
        data.ips.forEach(ip => {
            newIps.push(`ws://${ip}`);
        });
        let str = JSON.stringify(newIps);
        cc.sys.localStorage.setItem(ItemNames.ipList, str);
        return str;
    }

    private async reqLobby() {
        let data = await net.request("hall.hallHandler.enter");
        if (data.code !== 200) return data.code;
        // 储存活动类型
        let activityModel = ActivityModel.instance();
        if (data.eventData && data.eventData.length != 0) {
            activityModel.activityDataList = data.eventData;
            activityModel.initData(data.eventData);
        }
        if (data.popUps) {
            activityModel.popUpData = data.popUps;
        }
        User.initData(data.user);
        User.shieldStatus = new ShieldStatus(data.channelStatus, data.userFlag);
        g.hallVal.shouldShowBillboard = User.shieldStatus.showBillboard;
        User.newbieBonus = data.newbieBonus ? data.newbieBonus.money : undefined;
        User.bindBonus = data.bindBonus ? data.bindBonus.money : undefined;
        User.where = data.where;
        g.hallVal.withdrawSwitch = data.withdrawSwitch;
        g.hallVal.rechargeSwitch = data.rechargeSwitch;
        g.hallVal.reportData = data.report;
        g.hallVal.saveGameList = data.games;
        g.hallVal.gameCates = data.gameCates;

        g.hallVal.csworkTime = data.csWorkTime ? data.csWorkTime : undefined;

        if (data.guideCfg) g.hallVal.guideCfg = data.guideCfg;
        Debug.log("可以进入大厅 reqLobby")
        return 200;
    }

    async enterLobby() {
        Debug.log(("enterLobby"))
        let connected = true;
        window.pomelo.once("disconnect", function () {
            connected = false;
        });
        let handler = function () {
            if (!connected) {
                window.pomelo.emit("disconnect");
            }
            hideLoading();
        }
        showLoading("加载中");
        if (User.where && User.where.gid != "BUYU") {
            let ok = await this.returnToGame(User.where);
            if (ok) {
                handler();
                return;
            }
        }
        if (cc.director.getScene().name === g.lobbyScene) {
            let s = cc.director.getScene();
            let lobby = s.getChildByName("lobby").getComponent(Lobby);
            lobby.registerMethod();
            agentUtil.sendChatEnter();  // 监听代充聊天消息
            handler();
            return;
        }
        let s = cc.director.getScene();
        let lobbyNode = s.getChildByName("lobby");
        if (lobbyNode) {
            let lobby = lobbyNode.getComponent(Lobby)
            lobby.registerMethod();
            agentUtil.sendChatEnter();  // 监听代充聊天消息
            handler();
            return;
        }
        cc.director.preloadScene(g.lobbyScene, err => {
            if (err) {
                cc.error(err);
            }
            Debug.log("加载大厅scene")
            cc.director.loadScene(g.lobbyScene, handler);
        });
    }

    private async quickLogin() {
        let act = User.act;
        let pwd = User.pwd;
        let code: number;
        let token = localStorage.getItem(ItemNames.token);
        if (token) code = await this.loginByWay(LoginWay.TOKEN);
        if ((!code || (code === ErrCodes.RE_LOGIN)) && act && pwd) {
            g.login.act = act;
            g.login.pwd = pwd;
            code = await this.loginByWay(LoginWay.ACT);
        }
        if (!code || (code === ErrCodes.RE_LOGIN))
            code = await this.loginByWay(LoginWay.UUID);
        return code;
    }

    /**
     * 断线重连
     */
    async reconnect() {
        let start = Date.now();
        let code = 0;
        while (true) {
            let now = Date.now();
            if (now - start >= 30 * 1000) break; //重试30秒
            code = await this.quickLogin();
            if (code !== undefined && code !== 500 && code !== ErrCodes.NET_INSTABILITY) break;
        }
        if (code !== 200) {
            await this.returnToLogin();
            if (code === ErrCodes.FORBID_LOGIN) {
                showConfirm(ErrCodes.getErrStr(code, ""));
            } else {
                showTip(ErrCodes.getErrStr(code, "登录失败"));
            }
        }
    }

    returnToLogin() {
        showLoading("加载登录");
        return new Promise(resolve => {
            g.gameVal.lastGame = undefined;
            window.pomelo.off();
            window.pomelo.disconnect();
            agentUtil.changeInterfaceOrientations("2");
            let canvas = cc.find("Canvas");
            if (canvas) {
                canvas.getComponentsInChildren(cc.Animation).forEach(a => {
                    a.stop();
                });
            }
            cc.director.loadScene("start", () => {
                showCurtain(true, () => {
                    showCurtain(false);
                });
                let start = cc.find("start");
                let st = <Start>start.getComponent(Start);
                st.showLogin();
                resolve();
            })
        });
    }

    returnToGame(where: ps.Where) {
        let gameID = <GameId>where.gid;
        let yardId = where.mid;
        showLoading("正在回到游戏");
        return new Promise((resolve: (ok: boolean) => void) => {
            let sceneName = SCENE_NAME[gameID];
            if (!sceneName) {
                hideLoading();
                resolve(false);
                showTip("游戏暂未开放");
                return;
            }
            cc.director.preloadScene(sceneName, async err => {
                if (err) {
                    hideLoading();
                    resolve(false);
                    showTip("加载游戏失败");
                    return
                }
                let data = await net.request("hall.hallHandler.enterGame");
                if (data.code !== 200) {
                    hideLoading();
                    if (cc.director.getScene().name !== g.lobbyScene) {
                        cc.director.loadScene(g.lobbyScene, function () {
                            showTip(ErrCodes.getErrStr(data.code, "回到游戏失败"));
                            resolve(true);
                        });
                    } else {
                        showTip(ErrCodes.getErrStr(data.code, "回到游戏失败"));
                        resolve(true);
                    }
                } else {
                    g.gameVal.lastGame = gameID
                    g.gameVal.yid = yardId
                    cc.director.loadScene(sceneName, () => {
                        resolve(true);
                    })
                }
            })
        });
    }
}

export default new LoginHelper();