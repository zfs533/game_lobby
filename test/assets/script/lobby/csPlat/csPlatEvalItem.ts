import CustomerServicePlat from "./customerServicePlat";

let Decimal = window.Decimal;
const { ccclass, property } = cc._decorator;

@ccclass
export default class CsPlatEvalItem extends cc.Component {
    /**
     * 提交按钮
     */
    @property(cc.Button)
    sendButton: cc.Button = undefined; // 提交按钮

    @property(cc.EditBox)
    evalautionEdit: cc.EditBox = undefined;  // 评价的输入框

    @property(cc.Node)
    evaStarParent: cc.Node = undefined; // 评价五星父级

    @property(cc.Node)
    chatServiceNode: cc.Node = undefined;

    @property(cc.Node)
    evaBigen: cc.Node = undefined; // 评价

    @property(cc.Node)
    evaResut: cc.Node = undefined;// 评价结束

    @property(cc.Label)
    evalLabel: cc.Label = undefined;// 评价结果

    chatService: CustomerServicePlat = undefined;

    private evaluation: number = 3;

    private evaStartList: cc.Node[] = [];    // 评价五星

    init() {
        this.chatService = this.chatServiceNode.getComponent(CustomerServicePlat);
        let len = this.evaStarParent.childrenCount;
        for (let i = 0; i < len; i++) {
            let item = this.evaStarParent.children[i];
            let btn = item.getComponent(cc.Button);
            let handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = cc.js.getClassName(this);
            handler.handler = "onClickEvaletionSelector";
            handler.customEventData = i.toString();
            btn.clickEvents.push(handler);
            this.evaStartList.push(item);
        }
    }

    onEditingDidBegan() {
        this.chatService.bottomInputBannerNode.active = false;
    }

    onEditingDidEnd() {
        this.chatService.bottomInputBannerNode.active = true;
    }

    /**
     * 提交按钮实现方法
     */
    onClickSendBunttoAction() {
        let content = this.evalautionEdit.string;
        let score = this.evaluation;
        this.chatService.sendEvaluation(content, score);
        this.evaBigen.active = false;
        this.evaResut.active = true;
        this.chatService.chgBannedTipShowState(false, false);
        this.chatService.hideEditBoxNode(false);
        this.evalLabel.string = `已评价：${this.evaluation}分`;
    }

    /**
     * 评价选择器
     * @param event
     * @param info
     */
    onClickEvaletionSelector(event: cc.Event, info: string) {
        for (let i = 0; i < this.evaStartList.length; i++) {
            let star = this.evaStartList[i];
            let light = star.getChildByName("light")
            if (i > +info) {
                light.active = false;
            } else {
                light.active = true;
            }
        }
        this.evaluation = new Decimal(info).add(1).toNumber();
    }
}
