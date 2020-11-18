
import { ItemNames } from "../common/enum";
import * as util from "../common/util";
import User from "../common/user";
import { ErrCodes } from "../common/code";
import CustomerServiceChat from "./customerServiceChat";

const { ccclass, property } = cc._decorator;
interface EvaltionInfo {
    evaluation?: number, //评价选择 1.差评 2.好评
    chatId?: string, //客服id
    msg?: string, //评价内容
    token?: string //token

}

@ccclass
export default class EvalItem extends cc.Component {
    /**
     * 提交按钮
     */
    @property(cc.Button)
    sendButton: cc.Button = undefined; //提交按钮

    @property(cc.EditBox)
    evalautionEdit: cc.EditBox = undefined;  // 评价的输入框

    @property(cc.Toggle)
    item_1: cc.Toggle = undefined;

    @property(cc.Toggle)
    item_2: cc.Toggle = undefined;

    @property(cc.Node)
    chatService: cc.Node = undefined;

    @property(cc.Node)
    layouMask: cc.Node = undefined;

    @property(cc.Node)
    evaBigen: cc.Node = undefined; //评价

    @property(cc.Node)
    evaResut: cc.Node = undefined;//评价结束

    @property(cc.Label)
    evalLabel: cc.Label = undefined;//评价结果



    private chatId: string = ""; //当前客服id

    private evaluation: number = 2;

    /**
     * 提交按钮实现方法
     */
    onClickSendBunttoAction() {


        // this.evaBigen.active = false;
        // this.evaResut.active = true;

        console.log('点击提交');
        let data: EvaltionInfo = {};

        console.log('this.chatId===>', this.chatId);
        data.chatId = this.chatId;

        console.log("this.evaluation====>", this.evaluation);
        data.evaluation = this.evaluation;
        data.msg = this.evalautionEdit.string;
        let accessToken = localStorage.getItem(ItemNames.token);
        let uid = User.uid;
        data.token = md5(accessToken + uid + this.chatId + this.evaluation);
        let params = JSON.stringify(data);
        let self = this;

        console.log("this.chatService===>", this.chatService);
        this.chatService.getComponent(CustomerServiceChat).sendEvaluation(params, function (isSuccess: boolean) {
            if (isSuccess) {
                console.log('评价成功！');
                // self.sendButton.node.color = cc.Color.GRAY;
                // self.sendButton.node.getChildByName('lb').getComponent(cc.Label).string = "已提交";
                // self.sendButton.enabled = false;
                // self.layouMask.active = true;
                // self.evalautionEdit.enabled = false;

                self.evaBigen.active = false;
                self.evaResut.active = true;

                console.log('self.evaluation====', self.evaluation);
                if (self.evaluation == 1) {
                    self.evalLabel.string = '已评价：不满意'
                } else if (self.evaluation == 2) {
                    self.evalLabel.string = '已评价：满意'
                }

            } else {
                console.log('评价失败');
            }

        })
    }

    /**
     * 评价选择器
     * @param event
     * @param info
     */
    onClickEvaletionSelector(event: cc.Event, info: string) {
        console.log('选择===》', info)

        this.evaluation = +info;


    }


    /**
     * 设置客服id
     * @param chatId
     */
    setChatId(chatId: string) {

        console.log('chatId==>', chatId)
        this.chatId = chatId;
    }


}
