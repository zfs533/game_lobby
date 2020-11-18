import { WeeklyRebateModel } from "./weeklyRebateModel";
import * as ui from "../../common/ui";
import { ErrCodes } from "../../common/code";
import net from "../../common/net";
import user from "../../common/user";
// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

interface LobbyEventHandlerMergeFragment_Info {
    eventGoodsId: number,  // 物品id
    type: number,
    skinTatterId: number,  // 皮肤碎片id
    skinTatterCnt: number,  // 皮肤碎片数量
    avatarBoxTatterId: number,  // 头像框碎片id
    avatarBoxTatterCnt: number, // 头像框碎片数量
    tatterLotteryCnt: number  // 抽奖次数
}

@ccclass
export default class SynthesisPanel extends cc.Component {

    @property({ type: cc.Node, tooltip: "炮台所在父节点" })
    gun_Node: cc.Node = null;

    @property({ type: cc.Node, tooltip: "头像框所在父节点" })
    avatarBox_Node: cc.Node = null;

    @property({ type: cc.Button, tooltip: "炮台合成按钮" })
    gun_button: cc.Button = null;

    @property({ type: cc.Button, tooltip: "头像框合成按钮" })
    avatarBox_button: cc.Button = null;

    @property({ type: cc.Node, tooltip: "抽奖红点" })
    lottery: cc.Node = null;



    onEnable() {
        let weeklyRebateModel = WeeklyRebateModel.instance();
        weeklyRebateModel.isSynthesis = false;
        this.refreshSyntheticInterface();
    }


    /**
     * 刷新合成界面
     */
    async refreshSyntheticInterface() {
        let gun_nodeArr = this.gun_Node.children;
        for (let index = 0; index < gun_nodeArr.length; index++) {
            await this.hiddenNode(index);
        }
        let weeklyRebateModel = WeeklyRebateModel.instance();
        let scoreInfo = weeklyRebateModel.scoreInfo;
        if (weeklyRebateModel.scoreInfo == null || weeklyRebateModel.scoreInfo == undefined) {
            ui.showTip("没有数据！");
            return;
        }
        let gun = this.gun_Node.getChildByName(scoreInfo.skinTatterId + "");
        if (!gun) return;
        gun.active = true;
        let avatarBox = this.avatarBox_Node.getChildByName(scoreInfo.avatarBoxTatterId + "");
        if (!avatarBox) return;
        avatarBox.active = true;
        gun.getChildByName("amount").getComponent(cc.Label).string = scoreInfo.skinTatterCnt + "/30";
        avatarBox.getChildByName("amount").getComponent(cc.Label).string = scoreInfo.avatarBoxTatterCnt + "/30";
        let gun_jh = this.node.getChildByName("gun_btn").getChildByName("font_jh");
        let avatarBox_jh = this.node.getChildByName("avatarBox_btn").getChildByName("font_jh");
        let gun_haveLabel = this.node.getChildByName("gun_btn").getChildByName("haveLabel");
        let avatarBox_haveLabel = this.node.getChildByName("avatarBox_btn").getChildByName("haveLabel");
        if (scoreInfo.skinTatterCnt >= 30 && scoreInfo.hasSkin === 0) {
            gun_jh.active = true;
            gun_haveLabel.active = false;
        } else if (scoreInfo.skinTatterCnt < 30 && scoreInfo.hasSkin === 0) {
            gun_jh.active = false;
            gun_haveLabel.getComponent(cc.Label).string = "未拥有";
            gun_haveLabel.active = true;
            // this.gun_button.interactable = false;
        } else if (scoreInfo.skinTatterCnt < 30 && scoreInfo.hasSkin === 1) {
            gun_jh.active = false;
            gun_haveLabel.getComponent(cc.Label).string = "已拥有";
            gun_haveLabel.active = true;
            this.gun_button.interactable = false;
        }
        //头像框
        if (scoreInfo.avatarBoxTatterCnt >= 30 && scoreInfo.hasAvatarBox === 0) {
            avatarBox_jh.active = true;
            avatarBox_haveLabel.active = false;
        } else if (scoreInfo.avatarBoxTatterCnt < 30 && scoreInfo.hasAvatarBox === 0) {
            avatarBox_jh.active = false;
            avatarBox_haveLabel.getComponent(cc.Label).string = "未拥有";
            avatarBox_haveLabel.active = true;
            // this.avatarBox_button.interactable = false;
        } else if (scoreInfo.avatarBoxTatterCnt < 30 && scoreInfo.hasAvatarBox === 1) {
            avatarBox_jh.active = false;
            avatarBox_haveLabel.getComponent(cc.Label).string = "已拥有";
            avatarBox_haveLabel.active = true;
            this.avatarBox_button.interactable = false;
        }
    }

    hiddenNode(index: number) {
        return new Promise((resolve) => {
            let gun = this.gun_Node.children[index];
            gun.active = false;
            let avatarBox = this.avatarBox_Node.children[index];
            avatarBox.active = false;
            resolve();
        })

    }

    /**
     * 点击合成按钮
     * @param event 事件类型
     * @param type 合成类型
     */
    async clickTheCompositeButton(event: cc.Event, type: string) {
        let leventGoodsId: number;
        let weeklyRebateModel = WeeklyRebateModel.instance();
        let scoreInfo = weeklyRebateModel.scoreInfo;
        if (type === "1") {
            if (scoreInfo.skinTatterCnt < 30) {
                ui.showTip("炮台碎片不足！");
                return;
            }
            leventGoodsId = scoreInfo.skinTatterId;
        } else if (type === "2") {
            if (scoreInfo.avatarBoxTatterCnt < 30) {
                ui.showTip("头像框碎片不足！");
                return;
            }
            leventGoodsId = scoreInfo.avatarBoxTatterId;
        } else {
            return;
        }
        ui.showLoading("正在合成....")
        let data = await net.request("event.eventHandler.mergeFragment", { actId: weeklyRebateModel.actId, eventGoodsId: leventGoodsId })
        // console.log("合成返回====>", data);
        if (data.code !== 200) {
            ui.showTip(ErrCodes.getErrStr(data.code, "合成失败"));
            ui.hideLoading()
            return;
        }
        let tatterLotteryCnt = weeklyRebateModel.tatterLotteryCnt
        let dataRebate = await net.request("event.eventHandler.getRebateEventInfo", { actId: weeklyRebateModel.actId })
        // console.log("周返利活动请求返回====>>>", dataRebate);
        if (dataRebate.code === 200) WeeklyRebateModel.instance().setData(dataRebate);
        else WeeklyRebateModel.instance().code = dataRebate.code;
        if (tatterLotteryCnt < weeklyRebateModel.tatterLotteryCnt) this.lottery.active = true
        ui.hideLoading()
        ui.showTip("合成成功！");
        if (data.info.type === 4) {
            user.avatarBoxList.push(data.info.eventGoodsId);
        }
        if (leventGoodsId === scoreInfo.skinTatterId) { //炮台
            let weeklyRebateModel = WeeklyRebateModel.instance();
            weeklyRebateModel.scoreInfo.hasSkin = 1;
            weeklyRebateModel.scoreInfo.skinTatterCnt = data.info.skinTatterCnt;
        } else if (leventGoodsId === scoreInfo.avatarBoxTatterId) {
            let weeklyRebateModel = WeeklyRebateModel.instance();
            weeklyRebateModel.scoreInfo.hasAvatarBox = 1;
            weeklyRebateModel.scoreInfo.avatarBoxTatterCnt = data.info.avatarBoxTatterCnt;
        }
        this.refreshSyntheticInterface();
    }

}
