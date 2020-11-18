import * as util from "../common/util";
import agentUtil from "./agentUtil";
import ImageNode from "./imageNode";
import { getAvatar } from "../common/ui";


const { ccclass, property } = cc._decorator;


interface ChatMsg {
    uid?: number,
    name?: string,
    date?: number,
    contentType?: number,
    msg?: string,
    type?: number   // 1 系统消息   2 客服消息
}

@ccclass
export default class ChatItem extends cc.Component {



    @property(cc.Sprite)
    iconSp: cc.Sprite = undefined;   // 头像

    @property(cc.Label)
    timeLb: cc.Label = undefined;   // 厉害记录时间

    @property(cc.Label)
    ctmSvName: cc.Label = undefined;   // 仅在客服聊天中使用

    @property(cc.Sprite)
    image: cc.Sprite = undefined;   // 玩家截图 仅存在玩家消息中



    @property(cc.Node)
    copyBt: cc.Node = undefined;

    @property(cc.Label)
    testLabel: cc.Label = undefined;

    @property(cc.Node)
    content: cc.Node = undefined;

    @property(cc.Label)
    chatLb: cc.Label = undefined;  // 聊天文字


    @property(cc.Label)
    chatTimeLabel: cc.Label = undefined; //每条信息时间


    @property(cc.Node)
    loseNode: cc.Node = undefined; //失败图片

    @property(cc.Node)
    imgNode: cc.Node = undefined; //图片放大节点

    setChatMessger(data: ChatMsg) {
        let time = util.formatTimeStr('m', data.date);
        this.chatTimeLabel.string = time;
        if (data.contentType == 2) {
            return;
        }
        // console.log('发了文字----', data.msg);
        this.chatLb.string = data.msg;
        if (agentUtil.getSupportNewAgentChatRcg()) {
            this.chatLb.overflow = cc.Label.Overflow.NONE;
            this.chatLb.string = data.msg;
            this.content.getComponent(cc.Sprite).enabled = true;
            this.testLabel.string = data.msg;
            (this.testLabel as any)._forceUpdateRenderData(true);
            (this.chatLb as any)._forceUpdateRenderData(true);
            // console.log("this.testLabel.fontSize", this.testLabel.fontSize);
        }
    }

    /**
     *
     */
    resetChatLabel() {
        if (agentUtil.getSupportNewAgentChatRcg()) {
            this.testLabel.string = "";
            this.chatLb.string = "";
            this.chatLb.overflow = cc.Label.Overflow.NONE;
            (this.chatLb as any)._forceUpdateRenderData(true);
            (this.testLabel as any)._forceUpdateRenderData(true);
            let maxLenth = 492
            let outWidth = 540
            console.log("this.chatLb.node.width==>", this.chatLb.node.width)
            if (this.chatLb.node.width > maxLenth) {
                console.log("字超长")
                this.chatLb.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
                this.chatLb.node.width = maxLenth;
            } else {

                let width = this.chatLb.node.width + (outWidth - maxLenth)
                this.content.width = width > 160 ? width : 160 + (outWidth - maxLenth)
                console.log("chatitem一行", this.content.width)
            }
            this.content.getComponent(cc.Layout).paddingTop = 10;
            this.content.getComponent(cc.Layout).paddingBottom = 10;
            this.node.opacity = 255;
        }
    }

    /**
     * 设置图片时间颜色
     */
    setChatTimeLabelColor() {
        this.chatTimeLabel.node.color = (new cc.Color).fromHEX("#5E5757");
    }

    setCopyBtState(show: boolean) {
        this.copyBt.active = show;
    }
    adaptiveChatLabel(bb?: number) {
        if (agentUtil.getSupportNewAgentChatRcg()) {
            if (!this.testLabel) {
                return;
            }
            if (this.chatLb.node.height > 35) {  // 两行以上包括两行
                // this.chatLb.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
                // if (!this.copyBt.active) {
                //     this.content.width = this.chatLb.node.width + 48;
                // }
            } else {
                // this.chatLb.overflow = cc.Label.Overflow.NONE;
                // this.chatLb.fontSize = this.chatLb.fontSize;
                // if (bb) {
                //     if (bb === 1) {
                //         this.content.width = this.testLabel.node.width + 48;
                //     } else if (bb === 2) {
                //         this.setLaftContent();
                //     }
                // } else {
                //     this.content.width = this.testLabel.node.width + 48;
                // }
                // if (this.payButton && this.payButton.node.active && this.payButton.node.width > this.testLabel.node.width) {
                //     this.content.width = this.payButton.node.width + 25;
                // }

                if (this.copyBt && this.copyBt.active) {
                    if (bb) {
                        if (bb === 1) {
                            // this.copyBt.x = this.testLabel.node.width + 10;
                            this.content.width = this.testLabel.node.width + 48;
                        } else if (bb === 2) {
                            this.setLaftContent();
                        }
                    } else {
                        // if (!this.payButton.node.active) {
                        //     this.copyBt.x = this.testLabel.node.width + 10;
                        //     this.content.width = this.testLabel.node.width + 135;
                        // }

                    }

                }

                if (this.image && this.image.node.active) {
                    this.content.width = this.image.node.width + 40;
                    // this.content.height =
                }

                if (this.content.width <= 190) {
                    this.content.width = 190;
                }

                if (bb === 1) {
                    this.copyBt.position = cc.v3(-(this.content.width + this.copyBt.width / 2 - 20), 0);
                    this.loseNode.position = cc.v3(-(this.content.width + this.loseNode.width / 2 - 20), 0);
                } else if (bb === 2) {
                    this.copyBt.position = cc.v3(this.content.width - 20, 0);
                }
            }

        }
    }


    /**
     * 设置客服content长度
     */
    setLaftContent() {
        if (this.ctmSvName.node.width > this.testLabel.node.width) {
            this.content.width = this.ctmSvName.node.width + 48;
        } else {
            this.content.width = this.testLabel.node.width + 48;
        }
    }

    setImageBtCustomData(data: string) {
        this.image.node.getComponent(cc.Button).clickEvents[0].customEventData = data;
    }

    setTimeLbStr(time: number) {
        this.timeLb.string = util.formatTimeStr("m", time);
    }
    setIconSp(gender: number, avatar: number) {
        this.iconSp.spriteFrame = getAvatar(gender === 1 ? true : false, avatar);
    }
    setImage(tsp: cc.SpriteFrame) {
        this.image.spriteFrame = tsp;
        if (agentUtil.getSupportNewAgentChatRcg()) {
            this.content.getComponent(cc.Sprite).enabled = false;
            this.content.getComponent(cc.Layout).paddingTop = 0;
            this.content.getComponent(cc.Layout).paddingBottom = 0;
        }
        let spsize: cc.Size = tsp.getOriginalSize();
        let scale = 1;
        let max = spsize.height > spsize.width ? spsize.height : spsize.width;
        if (max > 350) {
            scale = 350 / max;
        }
        this.image.node.height = spsize.height * scale;
        this.image.node.width = spsize.width * scale;
        this.content.width = this.image.node.width + 20;
        this.content.height = this.image.node.height + 20;
    }

    // 设置
    setCtmSvNameLabel(name: string) {
        this.ctmSvName.string = name;
    }

    resetCopyBtShow(isshow: boolean) {
        this.copyBt.active = isshow;
        // this.copyBt.position = this.copyBtPos;
        // console.log('this.copyBt.active', this.copyBt.position);
    }

    /**
     * 点击放大图片
     */
    onclickImageButtonAction() {
        this.imgNode.getComponent(ImageNode).showImageAction(this.image.spriteFrame);
    }

    /**
     * 消息发送失败
     * @param isTrue
     */
    setLoseNodeVisbel(isTrue: boolean) {
        this.loseNode.active = isTrue;
    }

}
