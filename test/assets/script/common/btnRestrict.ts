import { setInteractable } from './util';
/**
 * 按钮约束，防止连续点击
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class BtnRestrict extends cc.Component {
    private intervalTime: number = 1;

    private _button: cc.Button = undefined;

    start() {
        let btn = this.node.getComponent(cc.Button);
        if (!btn) return
        this._button = btn;
        if (btn.clickEvents.filter(e => e.handler === 'onClickRestrict').length === 0) {
            let handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = cc.js.getClassName(this);
            handler.handler = "onClickRestrict";
            btn.clickEvents.push(handler);
        }
    }

    onClickRestrict() {
        if (this._button.interactable) {
            setInteractable(this._button, false);
            this.scheduleOnce(() => {
                setInteractable(this._button, true);
            }, this.intervalTime);
        }
    }
}
