interface Window {
    jsclass: number;
}

declare module JsClass {
    /**
     * 获取BundleID
     */
    export function getBundleID(): string;

    /**
     * 获取应用名称
     */
    export function getAppName(): string;

    /**
     * 获取ios广告标识符
     */
    export function getIdfa(): string;

    /**
     * 获取应用版本
     */
    export function getAppVersion(): string;

    /**
     * 获取剪切板中的内容
     */
    export function getChannel(): string;

    /**
     * 把字符串存进剪切板中
     * @param strData 要存放的字符串
     */
    export function copyToClipboard(strData: string): boolean;

    /**
     * 分享图片
     * @param file 要分享的文件
     */
    export function shareImage(file: string);

    /**
     * 判断是否可以打开应用
     * @param appName 应用名称
     */
    export function isInstalledApp(appName: string): boolean;

    /**
     * 打开相册
     * @param savePath
     * @param callback
     */
    export function openImagePicke(savePath: string, callback: string);

    /**
    * 打开相册新
    * @param savePath
    * @param callback
    * @param quality
    */
    export function openImagePickeNew(savePath: string, callback: string, quality: number);

    /**
     * 把Base64数据保存为文件
     * @param savePath 文件路径
     * @param data 数据
     */
    export function saveBase64ToFile(savePath: string, data: string);

    /**
     * 判断官方代充版本
     */
    export function haveAgentChat(): boolean;

    /**
     * 判断官方代充版本
     */
    export function haveNewAgentChat(): boolean;

    /**
     * 设置键盘回调
     * @param callback
     */
    export function setKeyBoarHightCallBack(callback: string);

    /**
     * 设置横竖屏幕
     * @param orientations
     */
    export function setInterfaceOrientations(orientations: string);

    /**
     * 把图片保存到相册中
     */
    export function saveImage();

    /**
     * 获取网络状态
     */
    export function getInternetState(): number;

    /**
     * 获取设备电量
     */
    export function getBatteryLevel(): number;

    /**
     * 在应用商店打开app
     * @param appId
     */
    export function openAppWithIdentifier(appId: string): boolean;

    /**
     * 解压文件
     * @param firstFile
     * @param cPath
     * @param unzipPath
     */
    export function unzipFile(firstFile: string, cPath: string, unzipPath: string);

    /**
     * 判断是否为企业包
     */
    export function isEnterpriseOfPackage(): boolean;

    /**
     * 获得状态栏的高度
     */
    export function getStatusBarHeighet(): number;

    /**
     * 获得底部圆形区域的高度
     */
    export function getTabbarSafeBottomMargin(): number;

    /**
     * 手动关闭键盘
     */
    export function manualHideKeyBoard(): number;

    /**
     * 清除原生键盘内容
     */
    export function clearTextField(): number;
}