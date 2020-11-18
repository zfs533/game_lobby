import Lobby from "../lobby";
import { WeeklyRebateModel } from "./weeklyRebateModel";
import PopActionBox from "../popActionBox";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WeeklyRebate extends PopActionBox {

    @property({ type: cc.Node, tooltip: "抽奖界面" })
    lotteryPanel: cc.Node = null;

    @property({ type: cc.Node, tooltip: "任务列表界面" })
    taskPanel: cc.Node = null;

    @property({ type: cc.Node, tooltip: "合成界面" })
    synthesisPanel: cc.Node = null;

    @property({ type: cc.Node, tooltip: "右边版面显示区域" })
    rightPanel: cc.Node = null;

    @property({ type: cc.Node, tooltip: "帮助界面" })
    helpPanel: cc.Node = null;

    @property({ type: cc.Node, tooltip: "左边按钮界面" })
    leftPanel: cc.Node = null;

    //大厅脚本
    Lobby_script: Lobby = null;


    onLoad() {
        super.onLoad();
        let lotteryTs = this.leftPanel.getChildByName("lottery").getChildByName("tiShi");
        let synthesisTs = this.leftPanel.getChildByName("synthesis").getChildByName("tiShi");
        let taskTS = this.leftPanel.getChildByName("task").getChildByName("tiShi");
        let weekModel = WeeklyRebateModel.instance();
        if (!weekModel.isGift) taskTS.active = false;
        if (!weekModel.isSynthesis) synthesisTs.active = false;
        lotteryTs.active = false;
        weekModel.isChouJiang = false;
    }



    /**
     * 选择页面按钮点击
     * @param event
     * @param info
     */
    clickLaftButtonAction(event: cc.Event.EventTouch, info: string) {
        let tiShi = event.target.getChildByName("tiShi");
        tiShi.active = false;
        for (let index = 0; index < this.rightPanel.children.length; index++) {
            let element = this.rightPanel.children[index];
            if (element.name === info) element.active = true;
            else element.active = false;

        }
    }


    /**
     * 点击帮住界面按钮
     */
    clickHelpButtonAction() {
        this.helpPanel.active = true;
        let animTime = 0.3;
        this.helpPanel.scale = 0;
        let actions = cc.sequence(
            cc.scaleTo(animTime, 1, 1).easing(cc.easeBackOut()),
            cc.callFunc(() => {
                this.node.emit("open");
            }),
        )
        // this.helpPanel.runAction(actions);
        cc.tween(this.helpPanel).then(actions).start();
        // cc.tween(this.helpPanel).to(animTime, { scale: 1 }, { easing: 'quadOut' })
        //     .call(
        //         () => {
        //             this.node.emit("open");
        //         }
        //     ).start();
    }


    /**
     *点击关闭说明界面按钮
     */
    onCilkeCloseHelpButtonAction() {
        let animTime = 0.3;
        let actions = cc.sequence(
            cc.scaleTo(animTime, 0).easing(cc.easeBackIn()),
            cc.callFunc(() => {
                this.helpPanel.active = false;
                this.helpPanel.emit("close");
            }))
        // this.helpPanel.runAction( actions);
        cc.tween(this.helpPanel).then(actions).start();
        // cc.tween(this.helpPanel).to(animTime, { scale: 0 }, { easing: 'quadIn' })
        //     .call(
        //         () => {
        //             this.helpPanel.active = false;
        //             this.helpPanel.emit("close");
        //         }
        //     ).start();
    }




}
