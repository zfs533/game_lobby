import Audio from "../g-share/audio";
export enum ConfirmEvent { close = 'close' }

const { ccclass, property } = cc._decorator;

@ccclass
export default class Confirm extends cc.Component {
    @property(cc.Node)
    private bg: cc.Node = undefined;

    @property(cc.Node)
    private dlg: cc.Node = undefined;

    @property(cc.Label)
    protected info: cc.Label = undefined;

    @property(cc.Button)
    private ok: cc.Button = undefined;

    @property(cc.Button)
    private cancel: cc.Button = undefined;

    @property(cc.Button)
    private btnClose: cc.Button = undefined;
    okFunc: Function;
    cancelFunc: Function;
    closeFunc: Function;

    onLoad() {
        this.node.active = false;
        if (this.btnClose)
            this.btnClose.node.active = false;
        this.bg.width = 1400;
    }

    onEnable() {
        this.bg.opacity = 0;
        //this.bg.runAction(cc.fadeTo(0.3, 125));
        cc.tween(this.bg).to(0.3, { opacity: 125 }).start();
        this.dlg.scale = 0;
        //this.dlg.runAction(cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut()));
        cc.tween(this.dlg).then(cc.scaleTo(0.3, 1, 1).easing(cc.easeBackOut())).start();
    }

    show(info: string, okStr: string = "确定", cancelStr?: string) {
        this.node.active = true;
        this.cancel.node.active = !!cancelStr
        this.info.string = info;
        this.ok.getComponentInChildren(cc.Label).string = okStr;
        this.cancel.getComponentInChildren(cc.Label).string = cancelStr ? cancelStr : ""
    }
    /**
     * 显示关闭(close)按钮
     */
    showClose() {
        if (this.btnClose)
            this.btnClose.node.active = true;
    }

    private onClickOk() {
        Audio.PlayClick()
        this.close();
        if (this.okFunc) {
            this.okFunc();
        }
    }

    private onClickCancel() {
        Audio.PlayClick()
        this.close();
        if (this.cancelFunc) {
            this.cancelFunc();
        }
    }

    private onClickClose() {
        Audio.PlayClick()
        this.close();
    }

    /**
     * 一般外部不用调用close
     */
    close() {
        //this.bg.runAction(cc.fadeTo(0.3, 0));
        cc.tween(this.bg).to(0.3, { opacity: 0 }).start();
        //this.dlg.runAction(cc.scaleTo(0.3, 0, 0).easing(cc.easeBackIn()));
        cc.tween(this.dlg).then(cc.scaleTo(0.3, 0, 0).easing(cc.easeBackIn())).start();
        this.scheduleOnce(() => {
            if (this.closeFunc) {
                this.closeFunc();
            }
            this.node.emit(ConfirmEvent.close);
            this.node.active = false
        }, 0.3);
    }
}
