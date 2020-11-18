import { WeeklyRebateModel } from "./weeklyRebateModel";
import Lobby from "../lobby";
import * as util from "../../common/util";
import PopActionBox from "../popActionBox";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FLLoginTip extends PopActionBox {

    @property({ type: cc.Node, tooltip: "没有可抽奖次数" })
    ds_node_1: cc.Node = null;

    @property({ type: cc.Node, tooltip: "有可抽奖次数" })
    ds_node_2: cc.Node = null;


    Lobby_script: Lobby;

    onLoad() {
        super.onLoad();
        let weeklyRebateModel = WeeklyRebateModel.instance();
        if (!weeklyRebateModel.isChouJiang) {
            this.ds_node_2.active = false;
            this.ds_node_1.active = true;
        } else {
            this.ds_node_1.active = false;
            this.ds_node_2.active = true;
        }
    }

    /**
     * 点击立即前往按钮
     *
     */
    onClickeGotoBottonAction() {
        let self = this;
        let callback = function () {
            console.log("关闭完成回调");
            self.Lobby_script.clickTheWeeklyRebateButton();

        }
        this.closeAction(callback);

    }


    onClickeToggle(event: cc.Event) {
        let gou = event.target.getChildByName("gou");
        if (gou.active) {
            let closeTipTime = util.formatTimeStr("d");
            localStorage.setItem("closeTip", closeTipTime);
        } else {
            localStorage.removeItem("closeTip");
        }
        console.log("点击了");
    }





}
