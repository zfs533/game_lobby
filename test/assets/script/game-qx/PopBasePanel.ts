/**
 * File: PopBasePanel
 * 弹窗界面基类
 */

import * as util from "../common/util";
import Audio from "../g-share/audio";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PopBasePanel extends cc.Component {

    @property(cc.Node)
    protected ndMask: cc.Node = undefined;

    @property(cc.Node)
    protected ndPanel: cc.Node = undefined;

    private bgOpacity: number;

    /**弹窗时间 */
    protected readonly ___animTime: number = 0.3;
    protected readonly ___minVal: number = 0.01;

    /**是否完全展开 */
    isFullyOpen: Boolean = false;

    protected onLoad() {
        this.ndMask.active = false;
        this.ndPanel.active = false;
        this.bgOpacity = this.ndMask.opacity;

        this.isFullyOpen = false;
    }

    protected start() {
        this.isFullyOpen = false;
        this.openPanel();
    }

    /**
     * 关闭界面
     * @param cb
     */
    protected closePanel(cb?: Function) {
        Audio.PlayClick();

        this.ndMask.runAction(cc.fadeTo(this.___animTime, 0));
        this.ndPanel.runAction(cc.sequence(
            cc.scaleTo(this.___animTime, this.___minVal).easing(cc.easeBackIn()),
            cc.callFunc(() => {
                if (cb && typeof cb === "function") {
                    cb();
                }
                this.node.active = false;
            }))
        );
    }

    /**
     * 打开界面
     * @param cb
     */
    protected openPanel(cb?: Function) {
        this.node.active = true;
        this.node.position = cc.Vec2.ZERO;
        this.ndMask.active = true;
        this.ndPanel.active = true;

        this.ndMask.opacity = this.___minVal;
        this.ndMask.runAction(cc.fadeTo(this.___animTime, this.bgOpacity));
        this.ndPanel.scale = this.___minVal;
        this.ndPanel.runAction(cc.sequence(
            cc.scaleTo(this.___animTime, 1, 1).easing(cc.easeBackOut()),
            cc.callFunc(() => {
                this.isFullyOpen = true;
                if (cb) cb();
                this.ndPanel.stopAllActions();
            }),
        ));
    }

}
