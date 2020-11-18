import g from "../g";
import { ItemNames } from "./enum";
import { getJsonData, verCmp, getUrlState, getUrlData } from "./util";
import { getAppName } from "./app"
import { showLoading, hideLoading, showConfirm } from "./ui";
import Debug from "../start/debug";
import { getUUID } from "../common/app";
export enum UPDATE_STATUS {
    NO,
    MAINTAIN,
    UPDATE,
}
export async function checkUpdatable(loadingStr?: string) {
    if (!CC_JSB) {
        return UPDATE_STATUS.NO;
    }
    let cmpRes: number;
    let TOTAL_TIMES = 2;
    let autoRetryCount = TOTAL_TIMES;
    let ok = false;
    let apkUrl = "";
    let regex = /^http(s)?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}/;
    while (!ok) {
        Debug.log("check updatable, remain times:" + autoRetryCount)

        let testUrls: string[] = [];
        let ipDomains: string[] = [];
        for (let i = 0; i < g.domainNames.length; i++) {
            for (let j = 0; j < g.domainNames[i].length; j++) {
                // ip还是域名
                if (regex.test(g.domainNames[i][j])) {
                    ipDomains.push(g.domainNames[i][j]);
                } else {
                    if (g.domainNames[i][j].indexOf("aliyuncs") >= 0) {
                        ipDomains.push(g.domainNames[i][j]);
                    } else {
                        testUrls.push(g.domainNames[i][j]);
                    }
                }
            }
        }

        let outTime = 5000;
        //先测试常用域名
        let requests = await getJsonData(testUrls, outTime);
        //如果常用域名全部挂掉,再测试原站跟ip地址
        if (!requests) {
            requests = await getJsonData(ipDomains, outTime);
        } else {  //否则直接将原站地址以及ip地址加入默认可以访问的队列
            g.ipNameList = ipDomains;
            cc.log("将ip地址加入IP池里面");
        }
        if (requests) {
            cc.log("*************** 请求2个json文件 over *****************")
            let commonData: {
                maintain: boolean, desc: string, cs: string,
                hotUpdate: boolean, coldUpdateApkUrl: string,
                hotUpdatePath: string, rechargeQuestionUrl: string,
                isForceCold: boolean,
            } = requests[0];

            if (commonData.hotUpdatePath) g.hotUpdatePath = commonData.hotUpdatePath;
            if (commonData.rechargeQuestionUrl) g.serviceCfg.rechargeQuestionUrl = commonData.rechargeQuestionUrl;
            if (commonData.isForceCold) g.isForceCold = commonData.isForceCold;
            Debug.log("commonData.isForceCold: " + commonData.isForceCold)
            let appVerData: { appVer: string, appId: string, desc: string } = requests[1];

            Debug.log("commonUrl: " + JSON.stringify(commonData))
            Debug.log("appVerData: " + JSON.stringify(appVerData))
            if (requests[0].hasOwnProperty("androidDownLimit")) {
                let androidDownLimit = requests[0].androidDownLimit
                if (androidDownLimit === undefined ||
                    androidDownLimit === NaN ||
                    Number(androidDownLimit.toString()) <= 0) {
                    g.androidDownLimits = 12;
                    cc.log("默认12个并发")
                } else {
                    g.androidDownLimits = Number(androidDownLimit.toString());
                    cc.log("配置的下载并发：" + g.androidDownLimits);
                }
            } else {
                g.androidDownLimits = 12;
                cc.log("默认12个并发")
            }


            if (!commonData.hotUpdate) {
                Debug.log("***************common not hotUpdate")
                return UPDATE_STATUS.NO;
            }
            if (commonData.coldUpdateApkUrl) {
                apkUrl = commonData.coldUpdateApkUrl;
            }
            let devFlag = cc.sys.localStorage.getItem(ItemNames.devFlag);
            if (commonData.maintain === true && !devFlag) {
                hideLoading();
                let desc = commonData.desc || "服务器维护中，请稍后登录。";
                let s = showConfirm(desc, "确定", "取消");
                s.okFunc = cc.game.end;
                return UPDATE_STATUS.MAINTAIN;
            }
            Debug.log("remote appVer: " + appVerData.appVer + " " + appVerData.appId + " " + g.appVerUrl)
            g.appId = appVerData.appId
            g.desColdUpdate = appVerData.desc;
            cmpRes = verCmp(g.appVer, appVerData.appVer);
            Debug.log("local appVer vs remote appVer: " + cmpRes)
            ok = true;
            break;
        }

        //自动重试几次后，提示用户点击再重试
        if (--autoRetryCount < 1 && !ok) {
            hideLoading();
            await showRetry();
            if (loadingStr) {
                showLoading(loadingStr);
            }
            autoRetryCount = TOTAL_TIMES;
        }
    }
    // 小于0，需要冷更新。
    if (cmpRes < 0) await coldUpdate(apkUrl);

    let chkHotUpdate = true;
    // 检查，审核版本，是否需要检查热更新。
    if (cmpRes > 0) {
        chkHotUpdate = false;
    }
    if (chkHotUpdate) return UPDATE_STATUS.UPDATE;
    return UPDATE_STATUS.NO;
}


function showRetry() {
    cc.log("show retry");
    return new Promise(resolve => {
        let str = `亲，当前网络环境稍差，点击确定重试。\n${g.errorMsg}`;
        let s = showConfirm(str, "确定", "取消");
        s.okFunc = () => {
            resolve();
        };
    });
}

export async function coldUpdate(apkUrl: string) {
    Debug.log("cold update go")
    // 去冷更新
    return new Promise<boolean>(resolve => {
        hideLoading();
        let desc = g.desColdUpdate || "检测到有新版本，为了提升游戏体验，强烈推荐您确认更新！"
        let s = showConfirm(desc, "确定", "取消");
        if (g.isForceCold) s = showConfirm(desc, "确定");
        Debug.log("isForceCold: " + g.isForceCold)
        s.okFunc = async () => {
            if (cc.sys.os === cc.sys.OS_IOS) {
                //如果配的是url
                if (g.appId.toString().indexOf('http') >= 0) {
                    cc.sys.openURL(g.appId)
                    cc.game.end();
                } else {
                    //否则打开商店
                    if (window.jsclass !== undefined) {
                        JsClass.openAppWithIdentifier(g.appId);
                    } else {
                        //否则打开商店
                        jsb.reflection.callStaticMethod("NativeUtil", "openAppWithIdentifier:", g.appId);
                    }
                }
            } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                if (apkUrl === "") {
                    cc.sys.openURL(g.apkDownloadUrl);
                    cc.game.end();
                } else {
                    await openApkColdUpdateDownloadUrl(apkUrl);
                }
            }
            resolve(true);
        }
        s.cancelFunc = () => {
            resolve(false);
        }
    });
}

async function openApkColdUpdateDownloadUrl(apkUrl: string) {
    return new Promise(async relove => {
        showLoading("获取中...");
        const SALT = "-2ghlmcl1hblsqtlbb";
        let uuid = localStorage.getItem(ItemNames.uuid) || getUUID();
        let appName = getAppName()
        let myToken = md5(g.bundleId + appName + SALT)
        let backstageUrl = `${apkUrl}/newAdrUrl?bundleId=${g.bundleId}&name=${appName}&pid=${g.pid}&token=${myToken}`;
        Debug.log("backstageUrl  " + backstageUrl);
        let ret1 = await getUrlData(backstageUrl, 7000);
        Debug.log("ret1  " + ret1);
        hideLoading();
        if (!ret1) {
            Debug.log("获取冷更新地址失败! NO Return!");
            cc.sys.openURL(g.apkDownloadUrl);
            cc.game.end();

        } else {
            Debug.log(" apk冷更新下载地址  " + JSON.stringify(ret1.ret));
            if (ret1.ret.code === 200 && ret1.ret.msg) {
                let requestUrls = ret1.ret.msg
                Debug.log("------------------ret1.ret.msg------  " + JSON.stringify(requestUrls));
                if (requestUrls && requestUrls.url != "") {
                    let checkState = await checkHttpRequest(requestUrls.url);
                    if (checkState) {
                        cc.sys.openURL(requestUrls.url);
                        cc.game.end();
                    } else {
                        console.log("fail url=" + requestUrls.officialUrl);
                        cc.sys.openURL(requestUrls.officialUrl);
                        cc.game.end();
                    }
                } else {
                    Debug.log("获取冷更新地址失败!下载地址为空! NO Return Msg!");
                    // cc.sys.openURL(g.apkDownloadUrl);
                    // cc.game.end();
                }
            } else {
                Debug.log("获取冷更新地址失败! Return Code Not Equal 200" + ret1.ret.code);
                cc.sys.openURL(g.apkDownloadUrl);
                cc.game.end();

            }
        }
        relove();
    });

    //检查下载地址是否能够访问
    async function checkHttpRequest(url: string) {
        console.log("request url=" + url);
        let result = await getUrlState(url, 3000);
        if (!result) {
            Debug.log("无返回结果=" + result);//网络原因可能出现超时的情况，其实地址能够正常访问
            return false;
        }
        if (result.code == 404) {
            Debug.log("文件不存在");
            return false;
        }
        return true;
    }

}
