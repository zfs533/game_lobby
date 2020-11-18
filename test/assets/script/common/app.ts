import Debug from "../start/debug";

let _bundleId: string = "";
/**
 * 获取包名
 */
export function bundleId(): string {
    if (!_bundleId) {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            _bundleId = jsb.reflection.callStaticMethod("util/NativeUtil", "getBundleID", "()Ljava/lang/String;");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                _bundleId = JsClass.getBundleID()
            } else {
                _bundleId = jsb.reflection.callStaticMethod("NativeUtil", "getBundleID");
            }
        } else {
            _bundleId = "com.ceshi.kx";
        }
    }
    return _bundleId;
}

let _appVer: string = "";
/**
 * 获取app版本
 */
export function appVer(): string {
    if (!_appVer) {
        let os = cc.sys.os;
        if (os === cc.sys.OS_ANDROID) {
            _appVer = jsb.reflection.callStaticMethod("util/NativeUtil", "getAppVersion", "()Ljava/lang/String;");
        } else if (os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                _appVer = JsClass.getAppVersion()
            } else {
                Debug.log("获取app版本111 ")
                _appVer = jsb.reflection.callStaticMethod("NativeUtil", "getAppVersion");
                Debug.log("获取app版本222 ")

            }
        } else {
            _appVer = "0.5";
        }
    }
    return _appVer;
}

let _uuid: string
/**
 * 获取uuid
 */
export function getUUID(): string {
    if (cc.sys.isNative) {
        if (_uuid) return _uuid
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            _uuid = jsb.reflection.callStaticMethod("util/NativeUtil", "getUuid", "()Ljava/lang/String;");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                _uuid = JsClass.getIdfa();
            } else {
                _uuid = jsb.reflection.callStaticMethod("NativeUtil", "getIdfa");//ios广告标识符
            }
        }
    }
    if (_uuid) Debug.log("原生代码获取的UUID： " + _uuid);

    if (!_uuid || _uuid === "00000000-0000-0000-0000-000000000000") {
        _uuid = genNewUUID()
        Debug.log("随机生成的UUID： " + _uuid);
    }

    return _uuid
}

export function genNewUUID(): string {
    let d = Date.now()
    let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

let _appName = "";
/**
 * 获取App名字
 */
export function getAppName(): string {
    if (!cc.sys.isNative) return "少女娱乐";
    if (!_appName) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                _appName = JsClass.getAppName();
            } else {
                _appName = jsb.reflection.callStaticMethod("NativeUtil", "getAppName");
            }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            _appName = jsb.reflection.callStaticMethod("util/NativeUtil", "getAppName", "()Ljava/lang/String;");
        }
    }
    return _appName;
}

let _channel = "";
export function getChannel(): string {
    if (!cc.sys.isNative) return "";
    if (!_channel) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                _channel = JsClass.getChannel();
            } else {
                _channel = jsb.reflection.callStaticMethod("NativeUtil", "getChannel");
            }
        } else if (cc.sys.os === cc.sys.OS_ANDROID) {
            _channel = jsb.reflection.callStaticMethod("util/NativeUtil", "getChannel", "()Ljava/lang/String;");
        }
    }
    return _channel;
}



export function copyStr(str: string): boolean {
    let rst = false;
    if (cc.sys.os === cc.sys.OS_ANDROID) {
        rst = jsb.reflection.callStaticMethod("util/NativeUtil", "copyString", "(Ljava/lang/String;)Z", str)
    } else if (cc.sys.os === cc.sys.OS_IOS) {
        if (window.jsclass !== undefined) {
            rst = JsClass.copyToClipboard(str);
        } else {
            rst = jsb.reflection.callStaticMethod("NativeUtil", "copyToClipboard:", str)
        }
    }
    return rst;
}

const AppTags = {
    'wx': ['com.tencent.mm', 'weixin://'],
    'qq': ['com.tencent.mobileqq', 'mqq://']
}
export function isAppInstalled(app: 'wx')
export function isAppInstalled(app: 'qq')
export function isAppInstalled(app: string): boolean {
    let tag = AppTags[app]
    let rst = false
    if (cc.sys.os === cc.sys.OS_ANDROID) {
        rst = jsb.reflection.callStaticMethod("util/NativeUtil", "isInstalledApp", "(Ljava/lang/String;)Z", tag[0])
    } else if (cc.sys.os === cc.sys.OS_IOS) {
        if (window.jsclass !== undefined) {
            rst = JsClass.isInstalledApp(tag[1]);
        } else {
            rst = jsb.reflection.callStaticMethod("NativeUtil", "isInstalledApp:", tag[1])
        }
    }
    return rst;
}

const OpenAppTags = {
    'wx': ['weixin://', 'weixin://'],
    'qq': ['mqqwpa://im/chat?chat_type=wpa&uin=', 'mqq://']
}
export function openApp(app: "wx", args?: string)
export function openApp(app: "qq", args?: string)
export function openApp(app: string, args?: string) {
    let tag = OpenAppTags[app]
    let url: string
    if (cc.sys.os === cc.sys.OS_ANDROID) {
        if (app === 'qq') {
            url = tag[0] + args
        } else {
            url = tag[0]
        }
    } else if (cc.sys.os === cc.sys.OS_IOS) {
        url = tag[1]
    }
    if (url) cc.sys.openURL(url)
}

/**
 * 分享图片
 */
export function shareImage(path: string) {
    if (CC_JSB) {
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("util/NativeUtil", "shareImage", "(Ljava/lang/String;)V", path);
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            if (window.jsclass !== undefined) {
                JsClass.shareImage(path);
            } else {
                jsb.reflection.callStaticMethod("NativeUtil", "shareImage:", path);
            }
        }
    }
}