/**
 * File: TanabataPopups
 * 活动预热界面脚本
 */

import PopBasePanel from "./PopBasePanel";
import TanabataMgr from "./TanabataMgr";
import Lobby from "../lobby/lobby";
import { showTip } from "../common/ui";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FestivalBefore extends cc.Component {

    @property(cc.RichText)
    tips: cc.RichText = undefined;

    @property(cc.Toggle)
    tog: cc.Toggle = undefined;

    @property(cc.Sprite)
    tipsBg: cc.Sprite = undefined;

    @property(cc.Label)
    startTime: cc.Label = undefined;

    @property(cc.Node)
    WarmUpNode: cc.Node = undefined;



    show() {
        // super.openPanel();
    }

    dontShow() {
        TanabataMgr.Instance.dontShowFestvailTimes = this.tog.isChecked;
    }

    setStartTime(_time: number) {
        this.WarmUpNode.active = true
        let sTime = this.getDateString(_time);
        if (this.startTime) {
            this.startTime.string = sTime;
        }
    }

    freshRemainTimes() {
        if (TanabataMgr.Instance.remainCount > 0) {
            this.tips.string = "您的抽奖机会还有" + TanabataMgr.Instance.remainCount + `次未使用，点击“前往参与”参加国庆活动`;
        }
        else {
            this.tips.string = `点击“前往参与”参加国庆活动`;
        }

        this.scheduleOnce(() => {
            this.tipsBg.node.width = this.tips.node.width + 66;
        }, 0.1);
    }

    goFestival() {
        // this.closePanel();
        let nodeLobby = cc.find("lobby");
        if (!nodeLobby) {
            return;
        }
        let lobby = nodeLobby.getComponent(Lobby);
        lobby.scheduleOnce(() => {
            lobby.onClickNationalDay();
        }, 0.1);
    }

    /**
     * 预热点击
     */
    onclickWarmUp(){
        showTip("活动即将来临");
    }

    // update (dt) {}

    getDateString(time: number) {
        let date = new Date(time);
        let y = date.getFullYear();
        let mo = date.getMonth();
        let d = date.getDate();
        let str = "" + y + "." + (mo + 1) + "." + d;
        return str;
    }
}
