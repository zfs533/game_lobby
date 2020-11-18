import { getAvatar, getAvatarFrame } from "../common/ui";
import agentUtil from "./agentUtil"
import { ErrCodes } from "../common/code";
const { ccclass, property } = cc._decorator;
import * as util from "../common/util";
interface RcgTypes {
    recType: string,
    recStr: string,
}

@ccclass

export default class ChatContent extends cc.Component {
    @property(cc.Sprite)
    iconSp: cc.Sprite = undefined;   // 头像

    @property(cc.Sprite)
    iconBGSp: cc.Sprite = undefined;   // 头像框

    @property(cc.Label)
    timeLb: cc.Label = undefined;   // 时间

    @property(cc.Label)
    chatLb: cc.Label = undefined;  // 聊天文字

    @property(cc.Sprite)
    image: cc.Sprite = undefined;   // 玩家截图 仅存在玩家消息中

    @property(cc.Label)
    stateLb?: cc.Label = undefined;  // 消息状态  读与未读  仅存在玩家消息中

    @property(cc.Node)
    payType: cc.Node = undefined;  //  支付方式    仅存在代理消息中

    @property(cc.Label)
    payTitle: cc.Label = undefined;


    @property(cc.Button)
    payButton: cc.Button = undefined;

    @property(cc.Node)
    content: cc.Node = undefined;

    @property(cc.Sprite)
    cardIcon: cc.Sprite = undefined;

    @property([cc.SpriteFrame])
    cardIconSps: cc.SpriteFrame[] = [];

    @property(cc.Node)
    invalidTip: cc.Node = undefined;

    @property(cc.Node)
    ndRebateTip: cc.Node = undefined;

    @property(cc.Node)
    payCardTip: cc.Node = undefined;

    @property([cc.Color])
    titleColors: cc.Color[] = [];

    @property([cc.SpriteFrame])
    payCardBgSps: cc.SpriteFrame[] = [];

    @property(cc.Node)
    copyBt: cc.Node = undefined;

    @property(cc.Label)
    testLabel: cc.Label = undefined;

    @property(cc.Node)
    loading: cc.Node = undefined;

    @property(cc.Node)
    imgloading: cc.Node = undefined;

    @property([cc.SpriteFrame])
    codeSpriteFrame: cc.SpriteFrame[] = [];

    //消息发送失败提示
    @property(cc.Label)
    statusLabel: cc.Label = null;

    setChatLbStr(content: string) {
        this.chatLb.overflow = cc.Label.Overflow.NONE;
        this.chatLb.string = content;
        this.content.getComponent(cc.Sprite).enabled = true;
        this.content.getComponent(cc.Sprite).enabled = true;
        this.testLabel.string = content;
        (this.testLabel as any)._forceUpdateRenderData(true);
        (this.chatLb as any)._forceUpdateRenderData(true);
        let maxLenth = 492
        let outWidth = 540
        console.log("this.chatLb.node.width==>", this.chatLb)
        if (this.chatLb.node.width > maxLenth) {
            console.log("字超长")
            this.chatLb.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
            this.chatLb.node.width = maxLenth;
        } else {
            console.log("一行")
            this.content.width = this.chatLb.node.width + (outWidth - maxLenth)
        }
    }
    resetChatLabel() {
        this.testLabel.string = "";
        this.chatLb.string = "";
        this.chatLb.overflow = cc.Label.Overflow.NONE;
        (this.chatLb as any)._forceUpdateRenderData(true);
        (this.testLabel as any)._forceUpdateRenderData(true);
        this.content.getComponent(cc.Layout).paddingTop = 10;
        this.content.getComponent(cc.Layout).paddingBottom = 10;
        this.node.opacity = 255;
    }

    setCopyBtState(show: boolean) {
        this.copyBt.active = show;
    }

    adaptiveChatLabel() {
        if (!this.testLabel) {
            return;
        }

        if (this.chatLb.node.height > 50) {  // 有两行
            this.chatLb.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            if (!this.copyBt || !this.copyBt.active) {
                this.content.width = this.chatLb.node.width + 48;
            }
        } else {
            this.chatLb.overflow = cc.Label.Overflow.NONE;
            this.chatLb.fontSize = this.chatLb.fontSize;
            this.content.width = this.testLabel.node.width + 48;
            if (this.payButton && this.payButton.node.active && this.payButton.node.width > this.testLabel.node.width) {
                this.content.width = this.payButton.node.width + 25;
            }
            if (this.copyBt && this.copyBt.active && !this.payButton.node.active) {
                this.copyBt.x = this.testLabel.node.width + 10;
                this.content.width = this.testLabel.node.width + 135;
            }
            if (this.image && this.image.node.active) {
                this.content.width = this.image.node.width + 40;
                // this.content.height =
            }
        }

        if (this.loading && this.loading.active) {
            this.loading.y = 0;
            this.loading.x = - this.content.width;
        }

        if (this.imgloading && this.imgloading.active) {
            this.imgloading.y = - this.image.node.height / 2;
            this.imgloading.x = - this.image.node.width - 40;
        }
    }


    setPayTitle(title: string) {
        this.payTitle.string = title;
    }

    setLoadingActive(isShow: boolean, code?: number) {
        let ani1 = this.loading.getComponent(cc.Animation)
        let ani2 = this.imgloading.getComponent(cc.Animation)
        let sp = this.loading.getComponent(cc.Sprite)
        let imgSp = this.imgloading.getComponent(cc.Sprite)
        ani2.enabled = ani1.enabled = true
        imgSp.spriteFrame = sp.spriteFrame = this.codeSpriteFrame[0]
        if (code && code === 15007) {
            ani2.enabled = ani1.enabled = false;
            imgSp.spriteFrame = sp.spriteFrame = this.codeSpriteFrame[1]
        } else if (code && code === 15019) {
            ani2.enabled = false
            imgSp.spriteFrame = this.codeSpriteFrame[2]
        }
        this.loading.active = isShow;
        this.imgloading.active = isShow;
    }

    setIndex(index: number) {
        this.cardIcon.spriteFrame = this.cardIconSps[index];
        this.payButton.getComponent(cc.Sprite).spriteFrame = this.payCardBgSps[index];
        this.content.getComponent(cc.Sprite).enabled = false;
    }
    setImageBtCustomData(data: string) {
        this.image.node.getComponent(cc.Button).clickEvents[0].customEventData = data;
    }

    setPayButtonCustomData(data: string) {
        this.payButton.clickEvents[0].customEventData = data;
        this.invalidTip.active = data === "expired";
        this.node.opacity = data === "expired" ? 200 : 255;
    }

    // 设置该选项的返利信息
    setPayItemRebateInfo() {
        if (!agentUtil.rechargeRebateInfo) return;
        let types = agentUtil.rechargeRebateInfo.rechargeChannels;
        let isContainChat = false;
        types.forEach(type => {
            if (type.includes("official_pay")) {
                isContainChat = true;
            }
        })
        if (agentUtil.rechargeRebateInfo && agentUtil.rechargeRebateInfo.onGoing && isContainChat) {
            this.ndRebateTip.active = true;
            // let rebate = +agentUtil.rechargeRebateInfo.interest * 100;
            let rebate = "返利1%";
            let lblRebate = this.ndRebateTip.getChildByName("rebate").getComponent(cc.Label);
            if (lblRebate) lblRebate.string = rebate;
        }
    }

    setTimeLbStr(time: number) {
        this.timeLb.string = util.formatTimeStr("m", time);
    }
    setIconSp(gender: number, avatar: number, avatarFrame?: number) {
        this.iconSp.spriteFrame = getAvatar(gender === 1 ? true : false, avatar);
        if (avatarFrame) {
            getAvatarFrame(avatarFrame, this.iconBGSp);
        }
    }
    setImage(tsp: cc.SpriteFrame) {
        this.image.spriteFrame = tsp;
        this.content.getComponent(cc.Sprite).enabled = false;
        this.content.getComponent(cc.Layout).paddingTop = 0;
        this.content.getComponent(cc.Layout).paddingBottom = 0;

        let spsize: cc.Size = tsp.getOriginalSize();
        let scale = 0.5;
        let max = spsize.height > spsize.width ? spsize.height : spsize.width;
        if (max > 350) {
            scale = 350 / max;
        }
        this.image.node.height = spsize.height * scale;
        this.image.node.width = spsize.width * scale;
    }

    setStateLbStr(read: number) {
        if (!read) {
            this.stateLb.string = "未读";
        }
    }

    setStatusLabelString(code: number = 200) {
        if (!this.statusLabel) return;
        if (code === 200) {
            this.statusLabel.node.active = false;
            return;
        }
        let stateStr = ErrCodes.CODES[code];
        if (!stateStr) stateStr = "发送失败:" + code;
        this.statusLabel.string = "(" + stateStr + ")";
        this.statusLabel.node.active = true;
    }
}
