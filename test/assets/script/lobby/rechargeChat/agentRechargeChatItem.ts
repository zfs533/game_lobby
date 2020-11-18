import agentUtil from "../agentUtil";

const { ccclass, property } = cc._decorator;

@ccclass

export default class AgentRechargeChatItem extends cc.Component {
    @property(cc.Label)
    chatLb: cc.Label = undefined;  // 聊天文字

    @property(cc.Sprite)
    image: cc.Sprite = undefined;   // 玩家截图 仅存在玩家消息中

    @property(cc.Sprite)
    spAgent: cc.Sprite = undefined; // 新版代充代理发送的图片

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

    messageId: string = "";

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
        //console.log("this.chatLb.node.width==>", this.chatLb)
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

    /**
     * 设置信息状态提示
     * @param isShow 是否显示
     * @param status i:载入动画  w:红色感叹号  e:红色叉
     */
    setLoadingActive(isShow: boolean, status?: 'i' | 'w' | "e") {
        let ani1 = this.loading.getComponent(cc.Animation);
        let ani2 = this.imgloading.getComponent(cc.Animation);
        let sp = this.loading.getComponent(cc.Sprite);
        let imgSp = this.imgloading.getComponent(cc.Sprite);
        ani1.enabled = ani2.enabled = true;
        imgSp.spriteFrame = sp.spriteFrame = this.codeSpriteFrame[0];
        if (status === 'i') {
            ani1.enabled = ani2.enabled = false;
        } else if (status === 'w') {
            ani1.enabled = ani2.enabled = false;
            imgSp.spriteFrame = sp.spriteFrame = this.codeSpriteFrame[1];
        } else if (status === 'e') {
            ani2.enabled = false;
            imgSp.spriteFrame = this.codeSpriteFrame[2];
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
            if (type.includes("chat")) {
                isContainChat = true;
            }
        })
        if (agentUtil.rechargeRebateInfo && agentUtil.rechargeRebateInfo.onGoing && isContainChat) {
            this.ndRebateTip.active = true;
            // let rebate = +agentUtil.rechargeRebateInfo.interest * 100;
            let rebate = "返利1%";
            let lblRebate = this.ndRebateTip.getChildByName("rebate").getComponent(cc.Label);
            if (lblRebate) lblRebate.string = `返利${rebate}%`;
        }
    }

    setImage(isMyself: boolean, tsp: cc.SpriteFrame) {
        let imageSp;
        if (isMyself) imageSp = this.image;
        else imageSp = this.spAgent;
        imageSp.spriteFrame = tsp;
        this.content.getComponent(cc.Sprite).enabled = false;
        this.content.getComponent(cc.Layout).paddingTop = 0;
        this.content.getComponent(cc.Layout).paddingBottom = 0;

        let spsize: cc.Size = tsp.getOriginalSize();
        let scale = 1;
        let max = spsize.height > spsize.width ? spsize.height : spsize.width;
        if (max > 350) {
            scale = 350 / max;
        }

        imageSp.node.height = spsize.height * 0.5;
        imageSp.node.width = spsize.width * 0.5;
    }

    setStateLbStr(read: number) {
        if (!read) {
            // TODO:消息读取状态
        }
    }
}
