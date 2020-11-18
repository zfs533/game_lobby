import * as util from "../../../script/common/util";
import { hideLoading, showTip, showLoading } from "../../../script/common/ui";
import net from "../../../script/common/net";
import { ErrCodes } from "../../../script/common/code";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BG_Video extends cc.Component {

    @property(cc.WebView)
    webView: cc.WebView = undefined;
    private fmsize: cc.Size = undefined;

    onLoad() {
    }
    start() {
        this.scheduleOnce(this.screenAdaptation, 0.2);
    }
    openUrl(url: string) {
        if (!url) return;
        console.log("url==", url);
        this.webView.url = url;
    }

    async closeAction() {
        // let data = await net.request("hall.hallHandler.leaveBGGame");
        // console.log("关闭页面===>", data);
        // if (data.code != 200) {
        //     showTip(ErrCodes.getErrStr(data.code, ""));
        //     return;
        // }
        // this.node.active = false;
        // this.node.removeFromParent(true);
        // this.node.destroy();
        this.leaveGame();
    }

    timerCb() {
        hideLoading()
        showTip("亲，当前网络繁忙，请您稍后再试")
    }

    async leaveGame() {
        showLoading()
        this.scheduleOnce(this.timerCb, 15)
        let data = await net.request("event.eventHandler.leaveDGGame")
        hideLoading()
        this.unschedule(this.timerCb)
        if (data.code !== 200) {
            showTip("亲，当前网络繁忙，请您稍后再试")
            return
        }
        this.node.active = false;
        this.node.removeFromParent(true);
        this.node.destroy();
    }
    screenAdaptation() {
        if (!util.getStatusBarHeighet()) {
            console.log("不支持屏幕适配");
            return;
        }
        // this.fmsize = cc.view.getFrameSize();
        // let canvas = cc.find('Canvas');

        // let canvasWidth = canvas.width;

        // let scale = canvasWidth / this.fmsize.width;
        // let tmpH = scale * this.fmsize.height;

        // let barHeight = util.getStatusBarHeighet();
        // let tmpBarH = tmpH * barHeight;  // 状态栏的高度

        // console.log("状态栏的高度===>", barHeight);
        // console.log("状态栏的高度tmpBarH===>", tmpBarH);
        // console.log("this.node.x11===>", this.node.x);
        this.webView.node.scaleX = 0.9;
        // console.log("this.node.x22===>", this.node.x);

    }

}
