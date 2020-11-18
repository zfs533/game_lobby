import User from "./user";
import { copyStr, genNewUUID, getUUID } from "./app";
import { showLoading, hideLoading } from "./ui";
import { GameId, QuitShow } from "../common/enum";
import Lobby from "../lobby/lobby";
import g from "../g";
import BankInfo from "./bankinfo";
import * as bankbin from '../lib/bankbin'
import Debug from "../start/debug";
import { ItemNames } from "./enum";
/**
 * 处理转换json对象
 * @param str
 * @returns 返回一个对象，至少都是一个{}， 出错时，返回undefined
 */
export function toj<T>(str: string) {
    let data: T
    try { data = JSON.parse(str) }
    catch (err) {
        cc.log("转json出错")
        cc.error(err)
    }
    return data
}

/**
 * 处理转换json对象到string
 * @param obj
 * @returns {string}
 */
export function tos(obj: Object) {
    return JSON.stringify(obj)
}

/**
 * 闭区间[min,max]随机整数
 */
export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomMinus1To1() {
    return (Math.random() - 0.5) * 2
}

/**
 * 随机(min到max)小数
 */
export function randf(max: number): number
export function randf(min: number, max: number): number
export function randf(min: number, max?: number): number {
    if (max === undefined) {
        max = min
        min = 0
    }
    if (min > max) {
        min = max + min
        max = min - max
        min = min - max
    }
    let r = Math.random()
    let a = r * (Math.round(Math.random()) ? -1 : 1)
    return (a / 2 + 0.5) * (max - min) + min
}


let allJsonUrlCount = 0;
let failedJsonUrlCount = 0;
let resultArrlist: any[] = [];
export function getJsonData(domains: string[], outTime: number): Promise<any | undefined> {
    return new Promise(async resolve => {
        if (domains.length === 0) {
            resolve();
            return;
        }
        let commonStr = g.commonUrl;
        let tests: Promise<any>[] = [];
        for (let s of domains) {
            tests.push(getCommonJsonlData(`${s}${commonStr}`, outTime));
        }

        resultArrlist = [];
        allJsonUrlCount = tests.length;
        failedJsonUrlCount = 0;
        g._domainNameList = [];
        g.ipNameList = [];
        g._domainIdx = 0;

        //这里除非返回正确的数据，否则要等所有的请求都错误或者超时，才会真正的返回
        let result = await Promise.race(tests);
        Debug.log(("Promise commonData==========" + JSON.stringify(result)))

        for (let k = 0; k < resultArrlist.length; k++) {
            let result = resultArrlist[k];
            if (result) {
                let domainName = result.url.substring(0, result.url.indexOf(`${commonStr}`));
                Debug.log("domainName==========" + domainName);
                let result1 = await getUrlData(`${domainName}${g.appVerUrl}`);
                if (result1) {
                    Debug.log("Promise appVerData==========" + JSON.stringify(result1));
                    let commonData = result.ret;
                    let appVer = result1.ret;
                    resolve([commonData, appVer]);
                    return;
                } else {
                    let regex1 = /^http(s)?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}/;
                    let a = domainName.split(".");
                    // ip还是域名
                    if (regex1.test(domainName)) {
                        g.errorMsg = `${a[a.length - 2]}.${a[a.length - 1]} bundleID.json not find`;
                    } else {
                        g.errorMsg = `${a[a.length - 2]} bundleID.json not find`;
                    }
                    resolve();
                }
            }
        }

        g.errorMsg = "all domain common.json not connect";
        resolve();
    });
}

/**
 * 正常登陆失败获取新的登陆地址
 * @param domains 域名列表
 * @param timeOut 超时
 */
export function getJsonDataEx(domains: string[], timeOut: number = 20000): Promise<any | undefined> {
    return new Promise(async resolve => {
        if (domains.length === 0) {
            resolve();
            return;
        }
        let ipListUrl = g.ipListUrl;
        let num = 0;
        let len = domains.length;
        let timer: any = null;
        for (let s of domains) {
            let d = getUrlData(`${s}${ipListUrl}`);
            d.then((result) => {
                if (result && result.ret) {
                    timer && clearTimeout(timer);
                    resolve(result.ret);
                }
                else {
                    num++;
                    if (num == len) {
                        timer && clearTimeout(timer);
                        resolve();
                    }
                }
            }).catch((err) => {
                num++;
                if (num == len) {
                    timer && clearTimeout(timer);
                    resolve();
                }
            });
        }

        timer = setTimeout(() => {
            resolve();
        }, timeOut);
    });
}

/**
 * 获取url的数据
 * @param url 获取数据的url
 * @param timeout 设置超时，默认5秒。
 * @returns 非空是数据，空是错误。
 */
export function getUrlData(url: string, timeout: number = 5000) {
    return new Promise((resolve: (ret?: any) => void) => {
        Debug.log(("getUrlData() url:  " + url))
        let now = Date.now();
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
                    if (ret) {
                        let delayTime = Date.now() - now;
                        resolve({ url: url, ret: ret, delay: delayTime });
                    }
                } else {
                    resolve();
                }
            }
        };

        xhr.timeout = timeout;
        xhr.ontimeout = function () {
            Debug.log("获取超时: " + url);
            resolve();
        };
        xhr.onerror = function () {
            Debug.log("获取失败: " + url);
            resolve();
        };
        xhr.open("GET", url);
        xhr.setRequestHeader('User-Agent', "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.81 Safari/537.36");
        xhr.send();
    });
}


export function getUrlState(url: string, timeout: number = 5000) {
    return new Promise((resolve: (ret?: any) => void) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (event: Event) {
            if (xhr.readyState === 4) {
                console.log("xhr.status=", xhr.status)
                if (xhr.status >= 200) {
                    resolve({ url: url, code: xhr.status });
                }
            }
        };

        xhr.timeout = timeout;
        xhr.ontimeout = function () {
            Debug.log("获取超时: " + url);
            resolve({ url: url, code: 206 });
        };
        xhr.onerror = function () {
            Debug.log("获取失败: " + url);
            resolve();
        };
        xhr.open("GET", url);
        xhr.setRequestHeader('User-Agent', "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.81 Safari/537.36");
        xhr.send();
    });
}
// 是否所有连接都失败
function canResolveEmpty(): boolean {
    failedJsonUrlCount++;
    return (failedJsonUrlCount >= allJsonUrlCount);
}

export function getCommonJsonlData(url: string, timeout: number = 5000) {
    return new Promise((resolve: (ret?: any) => void) => {
        Debug.log(" getCommonJsonlData() url:  " + url)
        let now = Date.now();
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (event: Event) {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    let ret;
                    try {
                        ret = JSON.parse(xhr.responseText);
                    } catch (error) {
                        cc.log("-----------JSON.parse err ----------" + url)
                        if (canResolveEmpty()) {
                            resolve();
                        }
                    }
                    if (ret) {
                        let delayTime = Date.now() - now;
                        resultArrlist.push({ url: url, ret: ret, delay: delayTime });
                        let commonStr = g.commonUrl;
                        let domainName = url.substring(0, url.indexOf(`${commonStr}`));
                        if (g._domainNameList.indexOf(domainName) < 0) {
                            g._domainNameList.push(domainName);
                            Debug.log("有效链接:" + domainName + " 延迟(ms):" + delayTime);
                        }
                        resolve({ url: url, ret: ret, delay: delayTime });
                    } else {
                        //获取到的数据为空
                        if (canResolveEmpty()) {
                            resolve();
                        }
                    }
                } else {
                    Debug.log("状态错误: url:" + url + " xhr.status:" + xhr.status);
                    if (canResolveEmpty()) {
                        resolve();
                    }
                }
            }
        };

        xhr.timeout = timeout;
        xhr.ontimeout = function () {
            Debug.log("获取超时:" + url);
            if (canResolveEmpty()) {
                resolve();
            }
        };
        xhr.onerror = function () {
            Debug.log("获取失败:" + url);
            if (canResolveEmpty()) {
                resolve();
            }
        };
        xhr.open("GET", url);
        xhr.setRequestHeader('User-Agent', "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.81 Safari/537.36");
        xhr.send();
    });
}

/**检测密码是否符合要求 */
export function checkPwd(pwd: string) {
    let pattern = /^.{6,16}$/;
    if (pattern.test(pwd)) {
        return true;
    }
    return false;
}

/**检测密码是否符合要求 */
export function checkPwdRule(pwd: string) {
    let pattern = /[^a-zA-Z0-9]/;
    if (pattern.test(pwd)) {
        return false;
    }
    return true;
}

/**检测是否是邮箱 */
export function isEmail(str: string) {
    let re = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
    return re.test(str);
}

/**检测是否全是中文 */
export function isPureChinese(str: string) {
    let re = /[^\u4e00-\u9fa5]/;
    if (re.test(str)) return false;
    return true;
}

export function maskAccount(account: string) {
    let keepNum = Math.ceil(account.length / 3);
    let end = account.substr(account.length - keepNum, keepNum);
    let start = account.substring(0, account.length - 2 * keepNum);
    let maskArray = new Array();
    for (let i = 0; i < keepNum; i++) {
        maskArray.push("*");
    }
    return start + maskArray.join("") + end;
}

/**
 * 是否是iphoneX
 */
export function isIphoneX() {
    if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
        let size = cc.view.getFrameSize();
        let isIphoneX = (size.width == 2436 && size.height == 1125) || (size.width == 1125 && size.height == 2436);
        // let osVersion = cc.sys.osMainVersion;
        return isIphoneX;
    }
    return false;
}

export function fitCanvas(nodeCanvas: cc.Node) {
    if (!nodeCanvas) {
        return;
    }
    let size = cc.view.getFrameSize();
    let r = size.width / size.height;
    let canvas: cc.Canvas = nodeCanvas.getComponent(cc.Canvas);
    if (r > 1.775) {
        canvas.designResolution = cc.size(1384, 640);
        canvas.fitHeight = true;
        canvas.fitWidth = false;
    } else {
        canvas.designResolution = cc.size(1136, 640);
        canvas.fitHeight = true;
        canvas.fitWidth = true;
    }
}

/**
 * 背景适配
 * @param nodeCanvas
 */
export function canvasResize() {
    let canvas = cc.find('Canvas').getComponent(cc.Canvas);
    if (!canvas) return;
    let curDR = canvas.designResolution;
    let dr = curDR;
    let size = cc.view.getFrameSize();
    let rw = size.width;
    let rh = size.height;
    let finalW = rw;
    let finalH = rh;

    if ((rw / rh) > (dr.width / dr.height)) {
        // !#zh: 是否优先将设计分辨率高度撑满视图高度。
        // cvs.fitHeight = true;

        // 如果更长，则用更高
        finalH = dr.height;
        finalW = finalH * rw / rh;
    } else {
        //!#zh: 是否优先将设计分辨率宽度撑满视图宽度。
        //cvs.fitWidth = true;

        //如果更短，则用定宽
        finalW = dr.width;
        finalH = rh / rw * finalW;
    }
    canvas.designResolution = cc.size(finalW, finalH);
    canvas.node.width = finalW;
    canvas.node.height = finalH;
    canvas.node.emit('resize');
}


export function isValidateMobile(phoneNo: string) {
    let pattern = /^1[0-9]{10}$/;
    return pattern.test(phoneNo);
}

export function doCountdown(btn: cc.Button, label: cc.Label, next: number, fc?: Function) {
    if (isNaN(next)) {
        return;
    }
    let originLabel = label.string;
    let timeLast = Math.round((next - Date.now()) / 1000);
    if (timeLast > 0) {
        setInteractable(btn, false);
        let handler = setInterval(() => {
            let span = Math.round((next - Date.now()) / 1000);
            if (span <= 0 || (fc && fc())) {
                clearInterval(handler);
                if (label.isValid) {
                    label.string = originLabel.trim();
                }
                if (btn.isValid) {
                    setInteractable(btn, true);
                }
            }
            else {
                if (label.isValid) {
                    let time = Math.abs(span) > 60 ? Math.floor(Math.abs(span) / 60) + "分钟" : Math.abs(span) + "秒";
                    label.string = originLabel + `\n(${time})`;
                }
            }
        }, 1000);
        let time1 = Math.abs(timeLast) > 60 ? Math.floor(Math.abs(timeLast) / 60) + "分钟" : Math.abs(timeLast) + "秒";
        label.string = originLabel + `\n(${time1})`;
    }
}

//转换剩余时间
export function getLeftTime(cdTime: number, lastTime: number) {
    let leftTime = cdTime - Math.round((Date.now() - lastTime) / 1000);
    if (leftTime > 0) {
        let time = Math.abs(leftTime) > 60 ? Math.floor(Math.abs(leftTime) / 60) + "分钟" : Math.abs(leftTime) + "秒";
        return time;
    }
}

//提取数字
export function extractNum(str: string) {
    var regexp2 = /[0-9]+/g
    //得到多段数字组成的数组
    var nums = str.match(regexp2)
    if (nums && nums.length > 0)
        return nums[0]
}

/**
 * 对钱进行格式化处理
 *
 * @export
 * @param {number} num
 * @param {number} [fig]
 * @returns
 */
export function toCNMoney(num: string): string {
    let n = +num
    if (isNaN(n)) return "--"
    if (n >= 100000000) {
        return fomatFloat(n / 100000000) + "亿"
    } else if (n >= 10000) {
        return fomatFloat(n / 10000) + "万"
    } else {
        return num
    }
}
//保留n位小数并格式化输出（不足的部分补0）
function fomatFloat(val: number, n = 2) {
    var f = Math.floor(val * Math.pow(10, n)) / Math.pow(10, n)
    var s = f.toString()
    var rs = s.indexOf('.')
    if (rs < 0) {
        s += '.'
    }
    for (var i = s.length - s.indexOf('.'); i <= n; i++) {
        s += "0"
    }
    return s
}

/**
 * 转换地区信息
 *
 * @export
 * @param {string} location
 * @returns
 */
export function parseLocation(location?: string) {
    if (!location || location === "||" || location === "") {
        return "未知地区";
    }
    let newLocation = location;
    if (newLocation.indexOf("CN") === 0) {
        newLocation = newLocation.substring(3);
    }
    newLocation = newLocation.split("|").join("");
    if (newLocation.length > 5) {
        newLocation = newLocation.substring(0, 5) + "…";
    }
    return newLocation;
}

export function getMoneyStr(text: string): string {
    if (!text) {
        return text;
    }
    let reg0 = /^0+/;
    let t = text;
    t = t.replace(reg0, "0");

    let reg1 = /^0[1-9]+/;
    if (reg1.test(t)) {
        t = t.substr(1, t.length - 1);
    }

    let reg = /^(([0-9]+(.|(.[0-9]{1,2}))?)|(.[0-9]{1,2})|.{1})$/;
    if (reg.test(t)) {
        return t;
    }
    else {
        if (t.length === 1) {
            return "";
        }
        let r = getMoneyStr(t.substr(0, t.length - 1));
        return r;
    }
}

/* 质朴长存法  by LifeSinger */
export function pad(num: any, n: number) {
    let len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}

export function addSingleEvent(btn: cc.Button, h: cc.Component.EventHandler) {
    if (btn.clickEvents.filter(e => e.component === h.component && e.target === h.target && e.handler === h.handler).length === 0) {
        btn.clickEvents.push(h);
    }
}

/* 检测模拟器
*
* @private
* @returns
* @memberof Start
*/
let isEmulator = undefined
export function checkEmu() {
    if (isEmulator !== undefined || cc.sys.os !== cc.sys.OS_ANDROID)
        return isEmulator

    let Detection: boolean[] = []
    Detection[0] = jsb.reflection.callStaticMethod("util/NativeUtil", "isHasBlueTooth", "()Z");
    Detection[1] = jsb.reflection.callStaticMethod("util/NativeUtil", "isHasLightSensor", "()Z");
    Detection[2] = jsb.reflection.callStaticMethod("util/NativeUtil", "isHasFeatures", "()Z");
    Detection[3] = jsb.reflection.callStaticMethod("util/NativeUtil", "isHasPhonecpu", "()Z");

    isEmulator = Detection.filter(d => d).length >= 3
    Debug.log("------安卓设备检测:" + Detection.join(','));
    return isEmulator
}

/**
 * 获取正态分布数值
 * @param {number} mean 均值
 * @param {number} std_dev 标准差
 * @returns
 */
export function getNumberInNormalDistribution(mean: number, std_dev: number): number {
    function uniform() {
        let u = 0.0, v = 0.0, w = 0.0, c = 0.0
        do {
            // 获得两个（-1,1）的独立随机变量
            u = Math.random() * 2 - 1.0
            v = Math.random() * 2 - 1.0
            w = u * u + v * v
        } while (w == 0.0 || w >= 1.0)
        // Box-Muller转换
        c = Math.sqrt((-2 * Math.log(w)) / w)
        return u * c
    }
    return mean + (uniform() * std_dev)
}
/**
 * 获取`url`参数并转换为`json`
 */
export function getRequest() {
    let url = location.search; //获取url中"?"后的字串（包括?）
    let req: any = {};
    if (url.indexOf("?") !== -1) {
        let str = url.substr(1);
        let strA = str.split("&");
        for (let i = 0; i < strA.length; i++) {
            req[strA[i].split("=")[0]] = (strA[i].split("=")[1]);
        }
    }
    return req;
}

/**
 * 拷贝文本
 * @export
 * @param {string} str
 * @returns
 */
export function setClipboard(str: string) {
    let rst: boolean
    if (cc.sys.isNative) {
        rst = copyStr(str);
    } else {
        let el = document.createElement("textarea")
        el.style.position = 'fixed'
        el.style.width = '2em'//不要改成0，否则不成功
        el.style.height = '2em'//不要改成0，否则不成功
        el.style.background = 'transparent'
        el.value = str
        document.body.appendChild(el)
        el.select()
        rst = document.execCommand('copy')
        document.body.removeChild(el)
    }
    return rst
}

export function setInteractable(btn: cc.Button, visible: boolean) {
    // let orgScale = btn.node.scale || -1;
    btn.interactable = visible;
    // if (btn.node) btn.node.scale = 1;
}

/**
 * 递归变灰
 *
 * @export
 * @param {cc.Node} node
 * @param {boolean} [gray=true]
 */
export function setGray(node: cc.Node, gray: boolean = true) {
    // let arrSprite = obj.getComponentsInChildren(cc.Sprite);
    // arrSprite.forE1ach(s => {
    //     (<any>s)["_sgNode"].setState(gray ? 1 : 0);
    // });
    let spri = node.getComponent(cc.Sprite);
    let effectName = gray ? '2d-gray-sprite' : '2d-spine';
    if (spri) //spri.setState(gray ? 1 : 0);
        spri.setMaterial(0, cc.Material.createWithBuiltin(effectName, 0));
    let sprites = node.getComponentsInChildren(cc.Sprite)
    if (sprites) sprites.forEach(s => {
        //s.setState(gray ? 1 : 0)
        s.setMaterial(0, cc.Material.createWithBuiltin(effectName, 0));
    })
}

export function setNodeGray(obj: cc.Node, gray: boolean = true) {
    let orc = (<any>obj)["originalColor"];
    if (!orc) {
        orc = obj.color;
        let attr = { originalColor: orc }
        obj.attr(attr);
    }
    obj.color = gray ? cc.Color.GRAY : orc;
}

declare let gl: any;
/**
 * 截屏
 *
 * @export
 */
export function captureScreen(): Promise<string> {
    //注意，EditBox，VideoPlayer，Webview 等控件无法截图
    return new Promise(resolve => {
        if (CC_JSB) {
            let size = cc.view.getVisibleSize();
            let RenderTexture = (<any>cc).RenderTexture;
            let canvas: any = cc.find("Canvas");
            //如果待截图的场景中含有 mask，请开启下面注释的语句
            // var renderTexture = cc.RenderTexture.create(1280,640, cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);
            var renderTexture = RenderTexture.create(size.width, size.height, cc.Texture2D.PixelFormat.RGBA8888, gl.DEPTH24_STENCIL8_OES);

            //把 renderTexture 添加到场景中去，否则截屏的时候，场景中的元素会移动
            canvas._sgNode.addChild(renderTexture);
            //把 renderTexture 设置为不可见，可以避免截图成功后，移除 renderTexture 造成的闪烁
            renderTexture.setVisible(false);

            //实际截屏的代码
            renderTexture.begin();
            //this.richText.node 是我们要截图的节点，如果要截整个屏幕，可以把 this.richText 换成 Canvas 切点即可
            canvas._sgNode.visit();
            renderTexture.end();
            let fileName = "capture.png";
            try {
                renderTexture.saveToFile(fileName, cc.macro.ImageFormat.PNG, true, () => {
                    //把 renderTexture 从场景中移除
                    renderTexture.removeFromParent();
                    cc.log("capture screen successfully!");
                    let wPath: string = jsb.fileUtils.getWritablePath();
                    let path = "";
                    if (endsWith(wPath, "/")) {
                        path = wPath + fileName;
                    } else {
                        path = wPath + "/" + fileName;
                    }
                    resolve(path);
                });
            } catch (error) {
                resolve();
            }
        }
    });
}

export function endsWith(str: string, char: string) {
    if (str && str.lastIndexOf(char) === str.length - 1) {
        return true;
    }
    return false;
}

/**
 * 返回可写路径+文件名
 *
 * @export
 * @returns
 */
export function getWritablePath(fileName: string) {
    if (!CC_JSB) {
        cc.warn("不是app，没有路径");
        return "";
    }
    return (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + fileName;
}
export function writeString2File(dataStr: string, fileName: string, cb?: Function) {
    if (!CC_JSB) {
        cc.warn("不是app，不可写");
        return;
    }
    let path = getWritablePath(fileName);
    let isSuc = jsb.fileUtils.writeStringToFile(dataStr, path);
    cc.log("写文件" + isSuc);
    if (cb) {
        cb(isSuc);
    }
}

/**
 * 后台配置以/结尾则组合channel，如http://baidu.com/
 * 如果不是则不组合，如http://baidu.com/index.html
 */
export function getOfficialUrl() {
    let url = g.serviceCfg.web;
    if (User.shieldStatus.downloadJmp) {
        if (url.charAt(url.length - 1) === "/" && User.channel) {
            url += User.channel + ".html";
        }
    }
    return url;
}

export function parabola(t: number, sp: cc.Vec2, ep: cc.Vec2, height = 60) {
    // 把角度转换为弧度
    // let radian = angle * Math.PI / 180.0;

    // 第二个控制点为整个抛物线的中点
    let q2 = cc.v2(sp.x + (ep.x - sp.x) / 2, sp.y + height + Math.abs(ep.y - sp.y) / 2)

    return cc.bezierTo(t, [sp, q2, ep])/* .easing(cc.easeInOut) */
}

export function getRechargeProblemUrl() {
    let uid = User.uid;
    let uuid = genNewUUID();
    return `${g.serviceCfg.rechargeQuestionUrl}/html/rechargeQuestion.html?uid=${uid}&uuid=${uuid}&token=${md5(`${uid + uuid}-2ghlmcl1hblsqt`)}`
}

/**
 * 检测是否有汉字
 * @param str
 */
export function chkChineseStr(str: string) {
    for (let idx = 0; idx < str.length; idx++) {
        if (str.charCodeAt(idx) > 255) return true;
    }
    return false;
}

export function chkBank(cardno: string) {
    return new Promise<{ cardNum?: string, bankName?: string, bankCode?: string, cardType?: string, cardTypeName?: string }>(resolve => {
        bankbin.getBankBin(cardno, async (err: any, info: any) => {
            if (err === "err0") {
                let res = await bankinfo(cardno);
                resolve(res)
                return;
            }
            if (err && err.includes(':')) {
                info = { cardNum: err.substring(0, err.indexOf(':')) }
            }
            resolve(info)
        })
    })
}

export async function bankinfo(cardno: string) {
    let url = "https://ccdcapi.alipay.com/validateAndCacheCardInfo.json?_input_charset=utf-8&cardNo=" + cardno + "&cardBinCheck=true"
    let result1 = await getUrlData(url);
    if (result1.ret) {
        if (result1.ret.validated) {
            let bankName = "";
            for (let i = 0; i < BankInfo.bankInfo.length; i++) {
                const el = BankInfo.bankInfo[i];
                if (result1.ret.bank == el.bankCode) {
                    bankName = el.bankName
                    break
                }
            }
            return {
                "cardType": result1.ret.cardType,
                "bankCode": result1.ret.bank,
                "cardTypeName": BankInfo.bankCardType[result1.ret.cardType],
                "backName": bankName,
                "bankName": bankName
            }
        } else return { "cardNum": cardno }
    } else return { "cardNum": cardno }
}


//秒数转成显示的时钟格式mm:ss
export function formatSeconds(time: number) {
    time = Math.floor(time);
    if (time <= 0) return "00:00"
    let m = Math.floor(time / 60);
    let s = time % 60;
    return ((m < 10) ? ("0" + m) : m) + ":" + ((s < 10) ? ("0" + s) : s);
}
/**
 * 格式化输出当前本地时间
 * @param 时间精度
 * d:日  m:分  s:秒  ms:毫秒
 *
 * @param 指定时间
 */
export function formatTimeStr(prec: 'd' | 'm' | 's' | 'ms', date?: string | number) {
    let d: Date = date ? new Date(date) : new Date()
    let str = `${d.getFullYear()}/${prefixInteger(d.getMonth() + 1, 2)}/${prefixInteger(d.getDate(), 2)}`
    if (prec === 'd') return str
    str += ` ${prefixInteger(d.getHours(), 2)}:${prefixInteger(d.getMinutes(), 2)}`
    if (prec === 'm') return str
    str += `:${prefixInteger(d.getSeconds(), 2)}`
    if (prec === 's') return str
    str += `:${d.getMilliseconds()}`
    if (prec === 'ms') return str
}
/**
 * 补位函数
 * @param num 数字
 * @param length 期望的位数
 */
export function prefixInteger(num, length) {
    return (Array(length).join('0') + num).slice(-length);
}

/**
 * 时间差倒计时
 * @param num 秒数, ex:98876秒,xx时xx分xx秒
 */
export function getCountDownTime(num: number) {
    let hour = prefixInteger(Math.floor(num / 60 / 60), 2); // 时
    let min = prefixInteger(Math.floor(num / 60) % 60, 2); // 分
    let sec = prefixInteger(Math.floor(num % 60), 2); // 秒
    return {
        hours: hour,
        mins: min,
        secs: sec,
    }
}

/**
 * 获得秒级时间戳
 */
export function getSecondsTime() {
    let time = parseInt((new Date().getTime() / 1000).toString());
    return time;
}

export function getInternetState() {
    // 0：无网络 ；1：2G网络； 2：3G网络； 3：4G网络；  5：WIFI信号
    let state = 0;
    if (cc.sys.os === cc.sys.OS_IOS) {
        if (window.jsclass !== undefined) {
            state = JsClass.getInternetState()
        } else {
            state = jsb.reflection.callStaticMethod("NativeUtil", "getInternetState");
        }
    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
        state = jsb.reflection.callStaticMethod("util/NativeUtil", "getInternetState", "()I");
    }
    return state;
}
export function getBatteryLevel() {
    let battery = 0;
    if (cc.sys.os === cc.sys.OS_IOS) {
        // ios获取到的是 0-1
        if (window.jsclass !== undefined) {
            battery = JsClass.getBatteryLevel()
        } else {
            battery = jsb.reflection.callStaticMethod("NativeUtil", "getBatteryLevel");
        }
    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
        // android获取到的是 0-100
        battery = jsb.reflection.callStaticMethod("util/NativeUtil", "getBatteryLevel", "()F");
    }
    return battery;
}

/**
 * 比较两个版本号
 * @returns {number} 1:a>b   0 a=b   -1 a<b
 */
export function verCmp(ver1: string, ver2: string) {
    Debug.log("va:" + ver1 + "-vb:" + ver2)
    let vA = ver1.split(".");
    let vB = ver2.split(".");
    for (let i = 0; i < vA.length; ++i) {
        let a = parseInt(vA[i]);
        let b = parseInt(vB[i] || "0");
        if (a === b) continue;
        else return a - b;
    }
    if (vB.length > vA.length) return -1;
    else return 0;
}

/**
 * 获取当前分辨率与标准分辨率的比例
 */
export function getCommonRatio() {
    let standardRatio = 1136 / 640;
    let frameSize = cc.view.getFrameSize();
    let curRatio = frameSize.width / frameSize.height;
    let offsetRatio = curRatio / standardRatio;
    // let size = cc.winSize;
    // let r = size.width / size.height;
    // console.log("winsize width & height: ", size.width, size.height, r);
    // console.log("getFrameSize width & height & r ", frameSize.width, frameSize.height);
    // console.log("standardRatio & curRatio & offsetRatio: ", standardRatio, curRatio, offsetRatio);
    if (offsetRatio < 1) offsetRatio = 1;
    return offsetRatio;
}
/**
 * 节点 闪烁 动画
 * @param  obj 需要 闪烁的对象
 * @param  duration = 0.4F 单次闪烁的时间 所消耗的时间
 * @param  callFunc = undefined  闪烁之后的回调函数
 * /
 * @param duration
 * @param mycallFunc
 */
export function animFlicker(obj: cc.Node, duration: number = 0.4, mycallFunc: Function = undefined): cc.Action {
    if (!obj) return undefined;
    cc.log("渐隐 动画 进行中")
    let anim = obj.runAction(cc.sequence(cc.fadeTo(duration, 20), cc.fadeTo(duration, 255), cc.fadeTo(duration, 20), cc.fadeTo(duration, 255), cc.fadeTo(duration, 20), cc.fadeTo(duration, 255), cc.callFunc(() => {
        obj.opacity = 255;
        if (mycallFunc) mycallFunc();
    })));

    return anim;
}

/**
 * 获得状态栏的高度
 */
export function getStatusBarHeighet() {
    let barHeight = 0;
    if (cc.sys.os === cc.sys.OS_IOS) {
        if (window.jsclass !== undefined) {
            barHeight = JsClass.getStatusBarHeighet();
        } else {
            barHeight = jsb.reflection.callStaticMethod("NativeUtil", "getStatusBarHeighet");
        }
    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
        barHeight = jsb.reflection.callStaticMethod("util/NativeUtil", "getStatusBarHeighet", "()F");
    }
    return barHeight;
}

/**
 * 获得底部圆形区域的高度
 */
export function getTabbarSafeBottomMargin() {
    let barHeight = 0;
    if (cc.sys.os === cc.sys.OS_IOS) {
        if (window.jsclass !== undefined) {
            barHeight = JsClass.getTabbarSafeBottomMargin()
        } else {
            barHeight = jsb.reflection.callStaticMethod("NativeUtil", "getTabbarSafeBottomMargin");
        }
    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
        barHeight = jsb.reflection.callStaticMethod("util/NativeUtil", "getTabbarSafeBottomMargin", "()F");
    }
    return barHeight;
}

/**
 * 底层是否支持新的图片质量选择
 */
export function getSupportNewImgPicker() {
    let support = false;
    if (!cc.sys.isNative) {
        support = true;
    } else if (cc.sys.os === cc.sys.OS_IOS) {
        support = window.jsclass !== undefined && window.jsclass > 101;
    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
        //support = jsb.reflection.callStaticMethod("util/NativeUtil", "getImgQuality", "()Z");
        support = true;
    }
    return support;
}

/**
 * 检测本地存储时间是否超过24小时
 * @param local
 */
export function checkLocalTime(local: ItemNames): boolean {
    let localTime = +cc.sys.localStorage.getItem(local);
    let intervalTime = (Date.now() - localTime) / 1000 / 60 / 60;
    if (intervalTime > 24) {
        cc.sys.localStorage.setItem(local, Date.now());
        return true;
    }
    return false;
}

/**
 * 上传登陆调试信息
 * @param info
 */
export function uploadLoginInfo(info: string) {
    let uuid = localStorage.getItem(ItemNames.uuid) || getUUID();
    let date = new Date().getTime();
    const SALT = "-94henshengqi";
    // let token = md5(uuid + date + SALT + info);  // 2019/10/07 小兵兵说可以去掉
    let xhr = new XMLHttpRequest();
    xhr.open("POST", g.serviceCfg.rechargeQuestionUrl + "/s/log");
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 400) {
                Debug.log("上传登录调试信息返回： " + g.serviceCfg.rechargeQuestionUrl + "  " + JSON.stringify(xhr.response));
            }
        }
    }
    xhr.ontimeout = function () {
        Debug.log("ontimeout  上传登录调试信息超时～");
    }
    xhr.onerror = function () {
        Debug.log("onerror  上传登录调试信息失败～");
    }
    let uploadInfo = {
        uuid: uuid,
        content: info,
        logDate: date,
        // token: token,
    }
    xhr.send(JSON.stringify(uploadInfo));
}

/**
 * 载入远端图片
 * @param remoteUrl 远端图片url地址
 * @param imgNode 更换图片节点
 */
export function loadUrlImg(remoteUrl: string, imgNode: cc.Node | cc.Sprite) {
    return new Promise(resolve => {
        remoteUrl = remoteUrl.replace(/\s/g, '%20');
        cc.loader.load({ url: remoteUrl, type: 'jpeg' }, function (error: any, spriteFrame: cc.Texture2D) {
            if (!error) {
                if (imgNode instanceof cc.Node) {
                    let sp = imgNode.getComponent(cc.Sprite);
                    if (sp) sp.spriteFrame = new cc.SpriteFrame(spriteFrame);
                    else console.warn("this imgNode not have Sprite Component!");
                } else {
                    imgNode.spriteFrame = new cc.SpriteFrame(spriteFrame);
                }
                resolve(true);
            } else {
                console.error("----加载图片 error-----", error);
                resolve(false);
            }
        });
    });
}


//是否有消息
let isMessger = false;

export function setIsMessger(messger: boolean) {
    isMessger = messger;
}

/**
 * 获取是否有消息
 */
export function getIsMessger() {
    return isMessger;
}
export function fixInstallPath() {
    if (cc.sys.isNative) {
        let searchPath = localStorage.getItem(ItemNames.searchPaths);
        console.log("searchPath===>", searchPath)
        if (jsb.fileUtils && searchPath && searchPath.length > "['']".length) {
            let paths = JSON.parse(searchPath);
            paths = singleArr(paths);
            let jsbPath = jsb.fileUtils.getWritablePath();
            console.log("jsbPath", jsbPath);
            //大于1个，是覆盖了
            if (paths.length > 0 && paths.indexOf(jsbPath + ItemNames.lobbyPath + "/") < 0) {
                console.log("覆盖安装产生了不同的路径，删除原来的可读写路径");
                //
                for (let i = 0; i < paths.length; i++) {
                    if (!jsb.fileUtils.isDirectoryExist(paths[i])) {
                        paths.splice(i, 1);
                        console.log("删除不存在的目录=>", paths[i]);
                        i--;
                    }
                }
                paths.push(jsbPath + ItemNames.lobbyPath + "/");
                localStorage.setItem(ItemNames.searchPaths, JSON.stringify(paths));
                jsb.fileUtils.setSearchPaths(paths);
                console.log("设置新的搜索路径===》", paths.toString());
                console.log('重启加入新的搜索路径');
                cc.audioEngine.stopAll();
                cc.game.restart();
            }
        }
        console.log("---------------------------------------------------------")
    }
}

//去除一个数组中重复元素，返回新的数组
export function singleArr(arr: Array<string>): Array<string> {
    let newArr = arr.filter((elem, index, self) => {
        return index == self.indexOf(elem)
    })
    for (let i = 0; i < newArr.length; i++) {
        if (newArr[i] === '') {
            newArr.splice(i, 1);
            i--;
        }
    }
    return newArr;
}

///星座头像框调整
export function getActorFrameScale(frameID: number) {
    //175 水瓶   179 双鱼   129 白羊   183 金牛  147 双子  151 巨蟹
    //155 狮子   159 处女   163 天枰   167 天蝎  171 射手  187 魔蝎
    let frameIDs = [175, 179, 129, 183, 147, 151, 155, 159, 163, 167, 171, 187];
    let scaleArr = [1.1, 1.1, 1.2, 1.2, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1];

    let idnex = frameIDs.indexOf(frameID);
    if (idnex < 0) return 1.0;
    console.log("缩放比例==》", scaleArr[idnex], " 头像id==", frameID);
    return scaleArr[idnex];
}

let theFirstTime: boolean = true;
/**
 * 第一次弹框
 */
export function getTheFirstTime() {
    if (theFirstTime) {
        theFirstTime = false
        return true
    } else {
        return theFirstTime
    }
}

/**
 *获取底层是否支持功能
 * @param functionName
 */
export function getSupportGame(functionName: string) {
    let support = false;
    if (cc.sys.os === cc.sys.OS_IOS) {
        support = jsb.reflection.callStaticMethod("NativeUtil", functionName);
    } else if (cc.sys.os === cc.sys.OS_ANDROID) {
        support = jsb.reflection.callStaticMethod("util/NativeUtil", functionName, "()Z");
    }
    return support;
}
