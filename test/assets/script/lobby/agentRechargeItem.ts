import { loadUrlImg } from "../common/util";
import agentUtil from "./agentUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AgentRechargeItem extends cc.Component {
    @property(cc.Node)
    ndReputation: cc.Node = undefined;

    @property(cc.Node)
    ndPayMethod: cc.Node = undefined;

    @property(cc.Label)
    lblStarNum: cc.Label = undefined;

    @property(cc.Sprite)
    spHead: cc.Sprite = undefined;

    @property(cc.Node)
    ndEvaluation: cc.Node = undefined;

    @property(cc.Label)
    lblEvaluation: cc.Label = undefined;

    @property(cc.Button)
    btnRecharge: cc.Button = undefined;

    @property(cc.Button)
    btnOpenRecharge: cc.Button = undefined;

    @property(cc.Label)
    lblAgentName: cc.Label = undefined;

    @property(cc.Label)
    lblPayMethod: cc.Label = undefined;

    @property([cc.Sprite])
    spPayMethods: cc.Sprite[] = [];

    private _agentInfo: ps.ChatClientHandlerMatchAgent_Agents = undefined;    // 当前点击聊天的商人信息

    set curAgentInfo(data: ps.ChatClientHandlerMatchAgent_Agents) {
        this._agentInfo = data;
    }

    get curAgentInfo() {
        return this._agentInfo;
    }

    setData() {
        this.showReputationStar();
        this.lblPayMethod.node.parent.active = false;
        this.lblAgentName.string = this.curAgentInfo.name;
        this.btnRecharge.clickEvents[0].customEventData = this.curAgentInfo.aUid;
        this.btnOpenRecharge.clickEvents[0].customEventData = this.curAgentInfo.aUid;
        if (this.curAgentInfo.head && cc.sys.isNative) loadUrlImg(this.curAgentInfo.head, this.spHead);
        this.lblEvaluation.string = this.curAgentInfo.scoreCount.toString();
        if (!agentUtil.platWsUrl) return;
        if (this.curAgentInfo.scoreCount) {
            this.lblEvaluation.node.parent.active = true;
            this.lblEvaluation.string = this.curAgentInfo.scoreCount.toString();
        } else {
            this.lblEvaluation.node.parent.active = false;
        }
    }

    showPayMethodStr(method: string) {
        if (method.indexOf("hb_pay") != -1 && (method.indexOf("xy_pay") != -1)) {
            this.lblPayMethod.string = "花呗 信用卡";
            this.lblPayMethod.node.parent.active = true;
        } else if (method.indexOf("hb_pay") != -1) {
            this.lblPayMethod.string = "花呗";
            this.lblPayMethod.node.parent.active = true;
        } else if (method.indexOf("xy_pay") != -1) {
            this.lblPayMethod.string = "信用卡";
            this.lblPayMethod.node.parent.active = true;
        }
    }

    showPayMethodImg(sp: cc.SpriteFrame, idx: number) {
        this.spPayMethods[idx].spriteFrame = sp;
        this.spPayMethods[idx].node.active = true;
    }

    /**
     * 显示信誉星
     */
    showReputationStar() {
        if (!+this.curAgentInfo.score) {
            this.lblStarNum.node.active = false;
            return;
        }
        let num = Math.floor(+this.curAgentInfo.score);
        for (let index = 0; index < num; index++) {
            this.ndReputation.children[index].active = true;
        }
        let ceilNum = +this.curAgentInfo.score - num;
        if (+this.curAgentInfo.score < 5 && ceilNum > 0) {
            let star = this.ndReputation.children[num];
            star.active = true;
            star.getChildByName("xx").getComponent(cc.ProgressBar).progress = ceilNum;
        }
        this.lblStarNum.node.active = true;
        this.lblStarNum.string = this.curAgentInfo.score;
    }
}
