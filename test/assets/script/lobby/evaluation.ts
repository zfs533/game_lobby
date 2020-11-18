
import PopActionBox from "./popActionBox"
import net from "../common/net";
import OrderTrack from "./orderTrack";
import { showTip, showLoading, hideLoading } from "../common/ui";
import { ErrCodes } from "../common/code";

const { ccclass, property } = cc._decorator;

@ccclass
export default class evaluation extends PopActionBox {

    // LIFE-CYCLE CALLBACKS:
    @property(cc.Label)
    private loc: cc.Label = undefined;

    @property(cc.Sprite)
    public icon: cc.Sprite = undefined;

    @property([cc.SpriteFrame])
    starSpriteFrame: cc.SpriteFrame[] = [];

    @property(cc.Node)
    starPar: cc.Node = undefined;

    @property(cc.Label)
    reputationLab: cc.Label = undefined;

    @property(cc.EditBox)
    private ebAli: cc.EditBox = undefined;
    public orderTrack: OrderTrack = undefined;
    reputationLabAll: string[] = ["很差", "一般", "满意", "非常满意", "无可挑剔"]
    reputationLabAllColo: string[] = ["#FF0000", "#000000", "#1591CF", "#19B491", "#FF9E0E"]
    orderItemArr: cc.Node[] = [];

    public orderData: ps.ChatClientHandlerGetPayRecords_Chat[] = [];
    private starNum = 5;

    public order: ps.ChatClientHandlerGetPayRecords_Chat = undefined;
    private orderidx: number = 0;

    // onLoad () {}
    start() {
        super.start();
        for (let index = 0; index < this.starPar.childrenCount; index++) {
            let btn = this.starPar.children[index].getComponent(cc.Button);
            if (btn.clickEvents.filter(e => e.handler === 'onReputationStar').length === 0) {
                let handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = cc.js.getClassName(this);
                handler.customEventData = (index + 1).toString();
                handler.handler = "onReputationStar";
                btn.clickEvents.push(handler);
            }
        }
        this.showReputationLab(5);
    }

    initData(name: string, orderidx: number, order: ps.ChatClientHandlerGetPayRecords_Chat, orderTrack: OrderTrack) {
        this.loc.string = name;
        this.order = order;
        this.orderidx = orderidx;
        this.orderTrack = orderTrack;
        this.showReputationLab(5);
    }

    /**
     *点击确定评价
     */
    async onClickReputation() {
        let ebali = this.ebAli.string;
        let orderItem = this.orderItemArr[this.orderidx];
        showLoading("请稍等");
        let data = await net.request("chat.clientHandler.setChatEval", {
            aUid: this.order.aUid,
            orderId: this.order.orderId,
            score: this.starNum.toString(),
            scoreText: ebali
        });
        hideLoading();
        if (data.code === 200) {
            this.closeAction();
            orderItem.removeFromParent();
            orderItem.destroy();
            this.destroyOrderTrack();
            // orderItem.getChildByName("btn").getChildByName("EvaluationBtn").active = false;
            // orderItem.getChildByName("state").getComponent(cc.Label).string = "已评价";
            showTip("评价成功");
        } else {
            showTip(ErrCodes.getErrStr(data.code));
        }
    }


    /**
     *删除已经评价的订单
     */
    destroyOrderTrack() {
        if (this.orderTrack.orderData.length > 0) {
            this.orderTrack.orderData.splice(this.orderidx, 1)
            if (this.orderTrack.orderData.length <= 0) {
                this.orderTrack.mpage = 0;
                this.orderTrack.getPayRecords(1, 0);
            }
        } else {
            this.orderTrack.getPayRecords(1, 0);
        }
    }

    /***
     *评价的星星
     */
    onReputationStar(ev: cc.Event.EventTouch, num: string) {
        this.starNum = +num;
        for (let index = 0; index < this.starPar.childrenCount; index++) {
            let sprite = this.starPar.children[index].getComponent(cc.Sprite);
            sprite.spriteFrame = this.starSpriteFrame[0];
        }
        for (let index = 0; index < +num; index++) {
            let sprite = this.starPar.children[index].getComponent(cc.Sprite);
            sprite.spriteFrame = this.starSpriteFrame[1];
        }
        this.showReputationLab(+num);
    }

    /**
     * 评价等级文字
     * @param num
     */
    showReputationLab(num: number) {
        this.reputationLab.string = this.reputationLabAll[num - 1];
        let color = cc.Color.BLACK;
        let colorString = this.reputationLabAllColo[num - 1];
        this.reputationLab.node.color = color.fromHEX(colorString);
    }

    // update (dt) {}
}
