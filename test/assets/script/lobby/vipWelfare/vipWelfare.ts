
import Lobby from "../lobby";
import User from "../../common/user";
import PopActionBox from "../popActionBox";
import { showLoading, hideLoading, showConfirm } from "../../common/ui";
import * as util from "../../common/util"
import Debug from "../../start/debug";
let Decimal = window.Decimal;
const { ccclass, property } = cc._decorator;

interface GetVipRed_Info {
    id: string; //红包id
    money: string; //红包金
}

interface ReceiveVipRed {
    code: number;
    money?: string;

}


@ccclass
export default class VIPWelfare extends PopActionBox {


    @property(cc.Node)
    beforeReceNode: cc.Node = null; //领取之前

    @property(cc.Node)
    afterReceNode: cc.Node = null; //领取之后




    Lobby_script: Lobby; //大厅脚本

    red_ID: string = null; //红包ID

    red_Money: string; //红包金额

    isSecess: boolean = false

    initData(data: GetVipRed_Info) {
        this.red_ID = data.id;
        this.red_Money = data.money;
    }

    onLoad() {
        super.onLoad();
    }

    //点击开红包按钮
    onClickeOpenButtonAction(e, argsdate) {
        let sendData = {
            id: this.red_ID,
        }
        let btnnode = e.target;
        btnnode.getComponent(cc.Button).interactable = false;
        showLoading("领取中...")
        util.setGray(btnnode, true)
        window.pomelo.request("event.eventHandler.receiveVipRed", sendData, (data: ReceiveVipRed) => {
            Debug.log("红包领取返回====>" + JSON.stringify(data));

            btnnode.getComponent(cc.Button).interactable = true;
            util.setGray(btnnode, false)
            hideLoading();
            this.btnClose.node.active = true
            if (data.code !== 200) {
                //util.showTip("领取失败:" + data.code);
                showConfirm("领取失败:" + data.code);
                return;
            }
            this.isSecess = true;
            this.beforeReceNode.active = false;
            this.afterReceNode.getChildByName("moneyNode")
                .getChildByName("moneyLabel")
                .getComponent(cc.Label)
                .string = data.money ? data.money : this.red_Money;
            this.afterReceNode.active = true;

            //User.instance.money = util.add(data.money, User.instance.money).toNumber();
            User.money = new Decimal(data.money).add(User.money).toString();
            this.Lobby_script.lUser.refreshUserInfos();

        })
    }

    onDestroy() {
        console.log("销毁了=====");
        if (!this.isSecess) return
        this.Lobby_script.requestVIP_RedAction();

    }


}
