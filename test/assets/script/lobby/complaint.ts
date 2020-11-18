import PopActionBox from "../lobby/popActionBox"
import { showTip, showLoading, hideLoading } from "../common/ui";
import { ErrCodes } from "../common/code";
import g from "../g";
import { ItemNames } from "../common/enum";
import { doCountdown } from "../common/util";
import net from "../common/net";
enum QUESTION_TYPE {
    TYPE_NULL,
    TYPE_NORMAL,                // 提问
    TYPE_REPORT_BUSINESS,       // 投诉商人
    TYPE_ALL
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class Complaint extends PopActionBox {

    @property(cc.EditBox)
    private editAsk: cc.EditBox = undefined;

    @property(cc.Button)
    private btnCommit: cc.Button = undefined;

    protected onEnable() {
        if (super.onEnable) {
            super.onEnable();
        }
        this.checkCD();
    }

    private onClickReset() {
        this.editAsk.string = "";
    }

    private async onClickCommit() {
        let content = this.editAsk.string.trim();
        if (content.length < 10) {
            showTip("输入的问题字数不得少于10个！");
            return;
        }
        showLoading("提交中");
        let data = await net.request("hall.csHandler.submit", { content: content, type: QUESTION_TYPE.TYPE_REPORT_BUSINESS });
        hideLoading();
        if (data.code === 200) {
            showTip("提交成功！");
            let next = Date.now() + 60 * 10 * 1000;
            g.complainTime = next;
            cc.sys.localStorage.setItem(ItemNames.complainTime, next);
            this.onClickReset();
            this.checkCD();
        }
        else {
            showTip(ErrCodes.getErrStr(data.code, "问题提交失败"));
        }
    }

    private checkCD() {
        let latestComplainTime = cc.sys.localStorage.getItem(ItemNames.complainTime);
        let next = g.complainTime;
        if (latestComplainTime) {
            next = latestComplainTime;
        }
        if (!next || isNaN(next)) {
            return;
        }
        let now = Date.now();
        if (now < next) {
            let lbl = this.btnCommit.getComponentInChildren(cc.Label);
            let self = this;
            doCountdown(this.btnCommit, lbl, next, () => {
                if (!self || !self.btnCommit || !self.btnCommit.isValid) {
                    return true;
                }
                return false;
            })
        }
    }

    initAgentInfo(str: string) {
        this.editAsk.string = str.trim() + "\n";
        this.editAsk.setFocus();
    }
}
