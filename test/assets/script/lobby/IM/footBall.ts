import agentUtil from "../../../script/lobby/agentUtil";
import * as util from "../../../script/common/util";
import { hideLoading, showTip, showLoading } from "../../../script/common/ui";
import net from "../../../script/common/net";
import Debug from "../../../script/start/debug";
const { ccclass, property } = cc._decorator;

@ccclass
export default class FootBall extends cc.Component {

    @property(cc.WebView)
    webView: cc.WebView = undefined;

    @property(cc.Node)
    topNode: cc.Node = undefined;    // 需要进行屏幕适配的，上方的节点

    private fmsize: cc.Size = undefined;


    onLoad() {
        this.screenAdaptation();
    }
    openUrl(url: string) {
        if (!url) return;
        console.log("url==", url);
        this.webView.url = url;
    }

    onClickeCloseButtonAction() {
        this.node.active = false;

    }


    onClickCloseBt() {
        this.closeAction();
    }
    timerCb() {
        hideLoading()
        showTip("亲，当前网络繁忙，请您稍后再试")
    }
    async closeAction() {
        showLoading()
        this.scheduleOnce(this.timerCb, 15)
        let data = await net.request("hall.hallHandler.leaveIM")
        hideLoading()
        this.unschedule(this.timerCb)
        if (data.code !== 200) {
            showTip("亲，当前网络繁忙，请您稍后再试")
            return
        }
        agentUtil.changeInterfaceOrientations('2');
        this.node.active = false;
        this.node.removeFromParent(true);
        this.node.destroy();
    }
    screenAdaptation() {
        if (!util.getStatusBarHeighet()) {
            console.log("不支持屏幕适配");

            return;
        }

        this.fmsize = cc.view.getFrameSize();
        let canvas = cc.find('Canvas');

        Debug.log("this.fmsize.width====" + this.fmsize.width);
        Debug.log("this.fmsize.height====" + this.fmsize.height);
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;

        Debug.log("canvasWidth==>" + canvasWidth);
        Debug.log("canvasHeight==>" + canvasHeight);
        let scale = canvasWidth / this.fmsize.width;
        let tmpH = scale * this.fmsize.height;

        // this.adaptationHeight = tmpH;
        let barHeight = util.getStatusBarHeighet();
        let tmpBarH = tmpH * barHeight;  // 状态栏的高度

        Debug.log("状态栏的高度===>" + barHeight);
        this.node.height = (this.fmsize.height - barHeight) * scale - tmpBarH;
        // this.node.width = this.fmsize.width;

        // let bottomHighet = getTabbarSafeBottomMargin();
        // let tmpBottomBarH = tmpH * bottomHighet;  // 底部圆形区域的高度
        // this.adaptationBottomBarH = tmpBottomBarH;

    }

}
