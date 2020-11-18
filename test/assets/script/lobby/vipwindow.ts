import PopActionBox from "./popActionBox";
import { setClipboard } from '../common/util';
import { showTip } from '../common/ui'
import { isAppInstalled, openApp } from "../common/app";
import g from "../g";
const { ccclass, property } = cc._decorator;

@ccclass
export default class vipwindow extends PopActionBox {

    @property(cc.RichText)
    private newVipinfo: cc.RichText = null;

    @property(cc.Label)
    private weixin: cc.Label = null;


    protected onLoad() {
        if (super.onLoad) {
            super.onLoad();
        }
        this.initialize();
        switch (g._vip.info) {
            case 1:
                this.newVipinfo.string = g._vipinfo._notifyPush.content;
                break;
            case 2:
                this.newVipinfo.string = g._vipinfo._newVipNotify.content;
                break;
            case 3:
                this.newVipinfo.string = g._vipinfo._wxChangeNotice.content;
                break;
            default:
                this.newVipinfo.string = g._vip.dailyNotify;
                break;
        }
    }

    initialize() {
        this.newVipinfo.node.active = true;
        if (g._vip.weChat != "") {
            this.weixin.string = g._vip.weChat;
        } else {
            this.weixin.string = "";
        }
    }

    JumpWeChat() {
        let success = setClipboard(this.weixin.string);
        if (success) {
            let install = isAppInstalled('wx');
            if (!install) {
                showTip("微信已拷贝到剪切板");
            } else {
                openApp('wx')
            }
        } else {
            showTip("微信号拷贝失败");
        }
    }
}
