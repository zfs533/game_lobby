import { ItemNames } from "../common/enum";
import g from "../g";
import { showConfirm, hideLoading } from "../common/ui";
import { verCmp } from "../common/util";
import Debug from "../start/debug";
enum HANDLER_STATUS {
    Failure = 0,
    Newest,
    Do,
}

export class UpdateTool {
    private updating: boolean;
    private assetsMgr: jsb.AssetsManager;
    private canRetry: boolean;
    overHandler: Function;

    showVer: (ver: string) => void
    infoHandler: (info: string) => void;
    progressHandler: (num: number, info: string) => void;
    checkNewHandler: (cb: (update: boolean) => void) => void;
    private _progress = 0;
    get progress() {
        if (isNaN(this._progress)) {
            return 0;
        }
        return this._progress;
    }
    private _valid = true;
    get valid() {
        return this._valid;
    }
    constructor(private manifest: string, private relativePath = "", private mainGame = false, private autoRetry = false) {
        this.hotInit();
    }

    get storagePath() {
        return (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + this.relativePath;
    }

    private hotInit() {
        cc.log("*****hotInit");
        this.canRetry = false;
        if (!cc.sys.isNative) {
            cc.log("** HU 不可用 (仅原生APP) **");
            return;
        }

        // 冷更新清除缓存
        let localPath = this.storagePath;
        Debug.log("local path: " + localPath)
        if (this.mainGame) {
            let ver = localStorage.getItem(ItemNames.localVer);
            Debug.log("local ver = " + ver)
            if (!ver || ver !== g.appVer) {
                localStorage.setItem(ItemNames.localVer, g.appVer);
                if (ver && ver !== g.appVer) {
                    // 大版本更新则先删除更新目录，再更新paths
                    Debug.log(" ** cold update")
                    if (jsb.fileUtils.removeDirectory(localPath)) {
                        Debug.log(" ** remove local path ok")
                        localStorage.setItem(ItemNames.searchPaths, "");
                        jsb.fileUtils.setSearchPaths([]);
                    }
                }
            }
        }

        // 修改热更新域名
        let manifestStr = jsb.fileUtils.getStringFromFile(`${localPath}/project.manifest`);
        if (manifestStr) {
            // 只要热更新过就会执行，通过前面筛选出来的最快域名来当作热更新的域名
            let manifestJson = JSON.parse(manifestStr);
            Debug.log(" curr packageUrl " + manifestJson.packageUrl)

            manifestJson.packageUrl = `${g.domainName}${g.hotUpdatePath}`;
            manifestJson.remoteManifestUrl = `${manifestJson.packageUrl}project.manifest`;
            manifestJson.remoteVersionUrl = `${manifestJson.packageUrl}version.manifest`;

            let customManifestStr = JSON.stringify(manifestJson);
            let isSuc = jsb.fileUtils.writeStringToFile(customManifestStr, `${localPath}/project.manifest`);
            Debug.log(" is write = " + isSuc)
        } else {
            Debug.log("no local this.manifest")
        }
        Debug.log(" fastest packageUrl " + g.domainName)

        this.assetsMgr = new jsb.AssetsManager("", localPath);
        // Init with empty manifest url for testing custom manifest
        cc.log("-- HOTUPDATE 本地路径:", localPath);

        // 设置版本比较方法
        this.assetsMgr.setVersionCompareHandle(verCmp);

        // if (!cc.macro.ENABLE_GC_FOR_NATIVE_OBJECTS) {
        //     this.assetsMgr.retain();
        // }

        // let panel = this.panel;
        // Setup the verification callback, but we don"t have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this.assetsMgr.setVerifyCallback((path, asset) => {
            let dataPath = jsb.fileUtils.getDataFromFile(path);
            let code = md5(dataPath);
            if (code === asset.md5) {
                return true;
            }

            if (jsb.fileUtils.isFileExist(path)) {
                jsb.fileUtils.removeFile(path);
            }
            if (jsb.fileUtils.isFileExist(path + ".tmp")) {
                jsb.fileUtils.removeFile(path + ".tmp");
            }
            if (jsb.fileUtils.isFileExist(path + ".temp")) {
                jsb.fileUtils.removeFile(path + ".temp");
            }

            Debug.log("MD5 ERR:" + asset.path + " \n remote:" + asset.md5 + " \n download:" + code)
            return false;
        });

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this.assetsMgr.setMaxConcurrentTask(g.androidDownLimits);
        }
        Debug.log("热更新准备好了")
    }

    private release() {
        cc.log("*****hotRelease");
        Debug.log("hot release")
        if (!cc.sys.isNative) {
            return;
        }
        this._valid = false;
        this.assetsMgr.setEventCallback(null);
    }

    /**
     * 检查是否有热更新资源 undefined:有错误;true:有更新需要更新;false:已经最新.
     * @returns undefined:有错误;true:有更新需要更新;false:已经最新.
     */
    start() {
        cc.log("*****hotCheck");
        if (!cc.sys.isNative) {
            cc.warn("no native, no check");
            return;
        }
        if (this.updating) {
            this.showInfo("正在更新中…");
            Debug.log("** 正在更新中 0 …")
            return;
        }

        //将热更新已经重试的次数归0
        this.retryedTimes = 0;

        this.showInfo("检查版本");
        Debug.log("** 检查版本 1 start")

        if (this.assetsMgr.getLocalManifest()) {
            Debug.log("** have getLocalManifest")
        } else {
            Debug.log("** not have getLocalManifest")
        }

        if (!this.assetsMgr.getLocalManifest() && this.assetsMgr.getState() === jsb.AssetsManager.State.UNINITED) {
            this.showInfo("载入清单文件");
            Debug.log("** 载入清单文件")
            if (typeof this.manifest === "string") {
                Debug.log("this.manifest string 1")
                // 如果本地有文件来则不是第一次进入游戏
                if (jsb.fileUtils.getStringFromFile(`${this.storagePath}/project.manifest`)) {
                    Debug.log("this.manifest string 11")
                    // 实际上不能修改本地manifest内容，但不执行这步操作LocalManifest就获取不到
                    this.assetsMgr.loadLocalManifest(this.manifest);
                } else {
                    // 第一次进入游戏时，自定义构造manifest文件内容并存入本地
                    Debug.log("this.manifest string 12")

                    let manifestStr = jsb.fileUtils.getStringFromFile(this.manifest);
                    let manifestJson = JSON.parse(manifestStr);
                    Debug.log(" curr packageUrl " + manifestJson.packageUrl)

                    manifestJson.packageUrl = `${g.domainName}${g.hotUpdatePath}`;
                    manifestJson.remoteManifestUrl = `${manifestJson.packageUrl}project.manifest`;
                    manifestJson.remoteVersionUrl = `${manifestJson.packageUrl}version.manifest`;

                    let newManifest = new jsb.Manifest(JSON.stringify(manifestJson), this.storagePath);
                    this.assetsMgr.loadLocalManifest(newManifest, this.storagePath);
                }
            } else {
                Debug.log("this.manifest string 2" + this.storagePath)
                this.assetsMgr.loadLocalManifest(this.manifest, this.storagePath);
            }
        }
        let localManifest = this.assetsMgr.getLocalManifest();
        g.hotVer = localManifest.getVersion();
        Debug.log("g.hotVer = " + g.hotVer)
        Debug.log("** 热更新地址 = " + localManifest.getPackageUrl())
        if (this.showVer) this.showVer(g.hotVer)
        if (!localManifest || !localManifest.isLoaded()) {
            this.showInfo("** 载入清单文件失败了");
            Debug.log("** 载入清单文件失败了")
            return;
        }

        this.assetsMgr.setEventCallback(this.checkHandler.bind(this));
        this.assetsMgr.checkUpdate();
        this.showInfo("检查更新资源");
        Debug.log("** 检查更新资源 2 ready")
    }

    private hotUpdate() {
        cc.log("*****hotUpdate");
        if (!cc.sys.isNative) {
            return;
        }

        if (this.updating) {
            Debug.log("** 已经在更新中，不能反复更新！（UPDATE）")
            return;
        }
        this.showProgress(0);

        this.showInfo("资源更新中…");
        Debug.log("UPDATE START(1)!!!")

        if (this.assetsMgr.getState() === jsb.AssetsManager.State.UNINITED) {
            if (typeof this.manifest === "string") {
                this.assetsMgr.loadLocalManifest(this.manifest);
            } else {
                this.assetsMgr.loadLocalManifest(this.manifest, this.storagePath);
            }
        }

        this.assetsMgr.setEventCallback(this.updateHandler.bind(this));

        this.assetsMgr.update();
        this.updating = true;
        Debug.log("UPDATE START(2)!!! ready")
    }

    //不用提示的retry次数
    private noNoticeRetryTimes: number = 3;
    //已经retry的次数
    private retryedTimes = 0;
    private async hotRetry() {
        cc.log("*****hotRetry");
        if (!cc.sys.isNative) {
            return;
        }
        if (!this.updating) {
            if (this.canRetry) {
                this.showInfo("重试资源更新");
                Debug.log("** 重试资源更新！")

                this.retryedTimes++;
                if (this.retryedTimes > this.noNoticeRetryTimes) {
                    await this.showRetry();
                }
                this.assetsMgr.downloadFailedAssets();
            } else {
                // 没有发现本地清单文件或下载清单文件失败
                Debug.log("** 更新重试，加载清单错造成。")
            }
        }
    }

    private showRetry() {
        cc.log("show retry");
        if (this.autoRetry) {
            return;
        }
        return new Promise(resolve => {
            hideLoading();
            let str = `亲，当前网络环境稍差，点击确定重试。\n${g.errorMsg}`;
            let s = showConfirm(str);
            s.okFunc = () => {
                resolve();
            };
        });
    }

    private async checkHandler(event: jsb.EventAssetsManager) {
        cc.log("*****checkHandler");
        let code = event.getEventCode();
        let ret: HANDLER_STATUS;
        Debug.log("** checkHandler code = " + code)
        switch (code) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.showInfo("没有找到本地文件列表");
                Debug.log("** 没有找到本地文件列表")
                ret = HANDLER_STATUS.Failure;
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                this.showInfo("下载清单文件错。");
                Debug.log("** 下载清单文件错")
                ret = HANDLER_STATUS.Failure;
                if (g._domainIdx < (g._domainNameList.length + g.ipNameList.length - 1)) {
                    this.switchUpdateUrl();
                    return;
                } else {
                    break;
                }
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.showInfo("解析清单文件错。");
                Debug.log("** 解析清单文件错")
                ret = HANDLER_STATUS.Failure;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.showInfo("已经是最新版本了。");
                Debug.log("** 已经是最新版本了。")
                ret = HANDLER_STATUS.Newest;
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                this.showInfo("检测到新版本");
                Debug.log("** 检测到新版本")
                ret = HANDLER_STATUS.Do;
                break;
            default:
                Debug.log("** CHECK UPDATE Code(没处理):" + code)
                return;
        }

        Debug.log("** checkCompleted1")
        if (ret !== HANDLER_STATUS.Failure) {
            this.assetsMgr.setEventCallback(null);
        }
        if (ret === HANDLER_STATUS.Failure) {
            await this.showRetry();
            //因为要从0开始重新切换，switchUpdateUrl刚开始就会加1，所以这里要搞成-1
            g._domainIdx = -1;
            this.switchUpdateUrl();
            return;
        } else if (ret === HANDLER_STATUS.Newest) {
            this.beginLogin();
        } else if (ret === HANDLER_STATUS.Do) {
            if (typeof this.checkNewHandler === "function") {
                this.checkNewHandler(update => {
                    if (update) {
                        this.hotUpdate();
                    }
                });
            } else {
                this.hotUpdate();
            }
        }

        Debug.log("** checkCompleted2")
    }



    private switchUpdateUrl() {
        console.log("切换热更新地址, idx:", g._domainIdx);
        this.release();
        g._domainIdx++;
        g._domainIdx = (g._domainIdx >= (g._domainNameList.length + g.ipNameList.length)) ? 0 : g._domainIdx;
        let tool = new UpdateTool(this.manifest, this.relativePath, this.mainGame, this.autoRetry);
        tool.showVer = this.showVer;
        tool.infoHandler = this.infoHandler;
        tool.progressHandler = this.progressHandler;
        tool.overHandler = this.overHandler;
        tool.start();
    }

    private updateHandler(event: jsb.EventAssetsManager) {
        //cc.log("*****updateHandler");
        let code = event.getEventCode();
        let ret: HANDLER_STATUS;
        // Debug.log("UPDATE Code:" + code)
        switch (code) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.showInfo("没有发现本地清单文件！");
                ret = HANDLER_STATUS.Failure;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                if (event.getPercent()) {
                    let totalBytes = event.getTotalBytes() / 1024;
                    let downloadedBytes = event.getDownloadedBytes() / 1024;
                    let info = ""
                    if (downloadedBytes >= 1000) {
                        downloadedBytes /= 1024;
                        info = downloadedBytes.toFixed(1) + "M/";
                    } else {
                        info = downloadedBytes.toFixed(0) + "K/";
                    }

                    if (totalBytes >= 1000) {
                        totalBytes /= 1024;
                        info += totalBytes.toFixed(1) + "M";
                    } else {
                        info += totalBytes.toFixed(0) + "K";
                    }

                    let percent = event.getPercent() * 100;
                    info += "   " + percent.toFixed(0) + "%";

                    this.showProgress(event.getPercent(), info);
                }

                let msg = event.getMessage();
                if (msg) {
                    setTimeout(() => {
                        Debug.log("Updated Total files: " + event.getTotalFiles() + "  Total size: " + event.getTotalBytes())
                    }, 0);
                }
                return;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.showInfo("下载清单文件失败.");
                Debug.log("下载清单文件失败")
                ret = HANDLER_STATUS.Failure;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.showInfo("已经最新版本了.");
                Debug.log("** 已经最新版本了")
                ret = HANDLER_STATUS.Newest;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.showInfo("更新完成。");
                Debug.log("** 更新完成" + event.getMessage())
                ret = HANDLER_STATUS.Do;
                this.showProgress(1);
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                this.showInfo("更新失败。");
                Debug.log("** 更新失败 " + event.getMessage())
                this.canRetry = true;
                ret = HANDLER_STATUS.Failure;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                Debug.log("ERROR_UPDATING " + event.getAssetId() + ", " + event.getMessage())
                g.errorMsg = event.getAssetId() + ", " + event.getMessage();
                this.removeErrorFile(event.getAssetId());
                return;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                // Debug.log( "ERROR_DECOMPRESS " + event.getMessage())
                return;
            default:
                // Debug.log( "UPDATE Code:(未处理)" + code)
                return;
        }

        Debug.log("** updated end1")
        if (ret === HANDLER_STATUS.Failure) {
            Debug.log("** 更新 失败")
            this.updating = false;
            this.hotRetry();
        } else if (ret === HANDLER_STATUS.Newest || (!this.mainGame && ret === HANDLER_STATUS.Do)) {
            //将热更新重试次数归0
            this.retryedTimes = 0;
            this.beginLogin();
        } else if (ret === HANDLER_STATUS.Do) {
            //将热更新重试次数归0
            this.retryedTimes = 0;

            this.assetsMgr.setEventCallback(null);

            if (this.mainGame) {
                this.showInfo("准备重启游戏");
                Debug.log("准备重启游戏")
                // Prepend the manifest"s search path
                let paths = jsb.fileUtils.getSearchPaths();
                let path = this.assetsMgr.getLocalManifest().getSearchPaths();

                Debug.log(" ** searchPaths before: " + paths.toString())
                paths = path.concat(paths);
                Debug.log(" ** searchPaths after: " + paths.toString())
                localStorage.setItem(ItemNames.searchPaths, JSON.stringify(paths));
                jsb.fileUtils.setSearchPaths(paths);
                localStorage.setItem(ItemNames.hotUpdateTime, (new Date()).getTime().toString());

                cc.audioEngine.stopAll();
                cc.game.restart();
            }
            this.release();
        }
        Debug.log("** updated end2")
    }

    private removeErrorFile(assetId: string) {
        if (assetId !== undefined && assetId.length > 0) {
            let path = this.storagePath;
            let idx = path.lastIndexOf("/");
            if (idx >= 0) {
                path = path.substring(0, idx);
            }
            path += "/game_temp/" + assetId;
            console.log("错误文件路径:" + path);

            if (jsb.fileUtils.isFileExist(path)) {
                jsb.fileUtils.removeFile(path);
            }
            if (jsb.fileUtils.isFileExist(path + ".tmp")) {
                jsb.fileUtils.removeFile(path + ".tmp");
            }
            if (jsb.fileUtils.isFileExist(path + ".temp")) {
                jsb.fileUtils.removeFile(path + ".temp");
            }
        }
    }

    private beginLogin() {
        this.release();
        cc.log("over");
        if (typeof this.overHandler === "function") {
            this.overHandler();
        }
    }

    private showInfo(info: string) {
        if (typeof this.infoHandler === "function") {
            this.infoHandler(info);
        }
    }

    private showProgress(pro: number, info: string = "") {
        this._progress = pro;
        if (typeof this.progressHandler === "function") {
            this.progressHandler(pro, info);
        }
    }
}