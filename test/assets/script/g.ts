import { DevStatus, QuitShow, ItemNames, GameId } from "./common/enum";
import { COMMON_URL, VER_URL, RES_URL, SERVER_NODE } from "./common/cfg";
import { bundleId, appVer } from "./common/app";
import __wsInit = require("./pomelo/index")
__wsInit();

class GlobalVal {
    // 修改当前开发状态
    _dev = DevStatus.OUT_DEV;

    get bundleId(): string {
        return bundleId();
    }

    get appVer(): string {
        return appVer();
    }

    get domainNames() {
        return RES_URL[this._dev];
    }

    /**
     * 所有包通用配置地址，包含服务器是否在维护
     */
    get commonUrl() {
        if (this.bundleId === "com.hyyl.testofficial") return "json/testcommon.json";
        return COMMON_URL;
    }

    /**
    * 此包私有配置地址,包含远端IP
    */
    get ipListUrl() {
        return "json/ipList.json";
    }

    /**
     * 此包私有配置地址,包含是否在审核、包版本
     */
    get appVerUrl() {
        if (this._dev === DevStatus.OFFICIAL) {
            if (this.bundleId) return `json/${this.bundleId}.json`;
        }
        return VER_URL;
    }

    get gameServers() {
        return SERVER_NODE[this._dev];
    }

    get lobbyScene() {
        return "lobby";
    }


    get officialEnv() {
        return this._dev === DevStatus.OFFICIAL;
    }
    errorMsg: string;

    hotVer: string = "";
    pid: string = "B";

    private _serviceCfg = {
        web: "https://feiwi.com/",
        weChat: '',
        qq: '',
        rechargeQuestionUrl: "https://agentdata.localsakura.com",
    }


    _vip = {
        web: "",
        isvip: false,
        weChat: "",
        info: 0,
        dailyNotify: "",
    }

    _vipinfo = {
        _newVipNotify: {
            content: "",
            id: "",
        },
        _notifyPush: {
            content: "",
            id: "",
        },
        _wxChangeNotice: {
            content: "",
            id: "",
        },
    }
    set serviceCfg(data) {
        if (data.web)
            this._serviceCfg.web = data.web;
        if (data.weChat)
            this._serviceCfg.weChat = data.weChat;
        if (data.qq)
            this._serviceCfg.qq = data.qq;
        if (data.rechargeQuestionUrl)
            this._serviceCfg.rechargeQuestionUrl = data.rechargeQuestionUrl;
    }

    get serviceCfg() {
        let strWeb: string = localStorage.getItem(ItemNames.officialUrl);
        let strWx: string = localStorage.getItem(ItemNames.weChat);
        let strQq: string = localStorage.getItem(ItemNames.qq)
        let strRechargeQuestionUrl: string = localStorage.getItem(ItemNames.rechargeQuestionUrl);
        if (strWeb && strWeb !== 'undefined') {
            this._serviceCfg.web = strWeb;
        }
        if (strWx && strWx !== 'undefined') {
            this._serviceCfg.weChat = strWx;
        }
        if (strQq && strQq !== 'undefined') {
            this._serviceCfg.qq = strQq;
        }
        if (strRechargeQuestionUrl && strRechargeQuestionUrl !== 'undefined') {
            this._serviceCfg.rechargeQuestionUrl = strRechargeQuestionUrl;
        }
        return this._serviceCfg;
    }

    get apkDownloadUrl() {
        let web = this.serviceCfg.web;
        let urlParams = web.split("/");
        if (urlParams.length >= 3) {
            let url = urlParams[0] + "//" + urlParams[2];
            let downloadUrl = url + "/apk"
            return downloadUrl;
        } else {
            return web;
        }
    }

    _domainNameList: string[] = [];
    //域名中在第一个返回正常的common，version数据的情况下，防止ip去抢占其他还未返回数据的域名在_domainNameList的位置，将ip列表单独存储
    ipNameList: string[] = [];
    cny: string = "6.69";//美元汇率，每次登录的时候会去获取一次当前最新的
    _domainIdx = 0;
    get domainName() {
        if (this._domainNameList.length > this._domainIdx) {
            return this._domainNameList[this._domainIdx];
        } else {
            if (this._domainNameList.length + this.ipNameList.length > this._domainIdx) {
                return this.ipNameList[this._domainIdx - this._domainNameList.length];
            }
        }
        return undefined;
    }

    _androidDownLimits = 2;
    get androidDownLimits(): number {
        return this._androidDownLimits;
    }

    set androidDownLimits(limit: number) {
        this._androidDownLimits = limit;
    }

    login = {
        act: "",
        pwd: "",
        smsCode: "",
    }

    gameVal = {
        lastGame: "",
        yid: "",
    }

    hallVal: gameIface.IHallVal = {
        saveGameList: [],
        saveGameRoomList: {},
        currBgmClip: undefined,
        reportData: {},
        scene: "lobby",

        showBind: false,
        shouldShowBillboard: false,
        showRegister: false,
        showShopPackage: true,
        guideCfg: { gid: GameId.DDZ, isForce: 0 },
        gameCates: [],
    };

    chgPwdTime: number;
    complainTime: number;
    bindTime: number;
    loginTime: number;

    appId: string
    payEnforceData: any;
    //远端ip
    remoteIP: string[] = undefined;
    // 兑换限制
    withdrawCardMin: string;
    withdrawCardMax: string;
    withdrawSSSMin: string;
    withdrawSSSMax: string;

    CustomerJudge: boolean = false;  // 客服界面判断
    curQiutShow: QuitShow = QuitShow.NOSHOW;
    eventsActive: boolean = false;  // 福利活动按钮显隐
    iosPushSwitch: boolean = true; // ios推送上传设备token开关
    iosPushUrl: string = '/s/uploadDeviceToken'; // ios上传设备token网址,需要使用serviceCfg.rechargeUrl拼接
    needIsUpdate: number = 0; // 是否更新
    updateTitel: string = "undefined"; // 标题
    updateContent: string = "undefined"; // 内容
    updateUrl: string = "undefined"; // 链接
    isShowColdUpdate: boolean = true; // 因路径问题。针对热更无效的安卓老包用户
    iosDesUrl: string = ""; // ios描述文件下载地址
    desColdUpdate: string = ""; // 冷更新配置：提示描述
    isForceCold: boolean = false    //是否强制冷更新
    customerServiceUrl: string = ""; // 客服平台地址
    customerFileServerUrl: string = ""; // 客服平台文件服务器地址
    hotUpdatePath = "client/";  // 接在热更新域名后的，热更路径
    linkedCsUrl: string = "";   // 记录每次链接客服平台的地址，用于区分是否为代理客服
    isOnKick: string = "";      // 记录玩家是否被踢
}

export default new GlobalVal();
