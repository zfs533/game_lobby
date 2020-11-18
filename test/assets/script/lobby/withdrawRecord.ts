import { showLoading, hideLoading, showTip } from "../common/ui";
import { ErrCodes } from "../common/code";
import { formatTimeStr } from "../common/util";
import PopActionBox from "./popActionBox"
import WithdrawDetail from "./withdrawDetail";
import net from "../common/net";
const { ccclass, property } = cc._decorator;


@ccclass
export default class WithdrawRecord extends cc.Component {

    @property(cc.Node)
    private item: cc.Node = undefined;

    @property(cc.Node)
    private listContainer: cc.Node = undefined;

    @property(cc.Prefab)
    private preWithdrawDetail: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preCustomerService: cc.Prefab = undefined;

    @property([cc.Color])
    colors: cc.Color[] = [];

    private types = ['支付宝', "银行卡", "代理兑换", "后台下分"];
    // private states = ["审核中", "审核中", "接单中", "接单中", "转账中", "完成"];

    private orders: ps.HallBillHandlerGetWithdraws_Order[];

    private lWithdrawDetail: WithdrawDetail = undefined;

    private mpage: number = 1;
    private mcount: number = 10;

    protected onLoad() {
        // init logic
        this.item.active = false;
    }

    protected onEnable() {
        this.mpage = 1;
        this.updateUI(0);
    }


    onClickLastPage() {
        if (this.mpage <= 1) {
            this.mpage = 1;
            showTip("已经是第一页了!");
            return;
        }
        this.mpage--;
        this.updateUI(-1);
    }

    onClickNextPage() {
        if (this.listContainer.childrenCount < this.mcount) {
            showTip("没有更多数据了!");
            return;
        }
        this.mpage++;
        this.updateUI(1);
    }

    async updateUI(isNext: number) {
        showLoading("加载兑换记录");
        let data = await net.request("hall.billHandler.getWithdraws", { page: this.mpage, size: this.mcount });

        hideLoading();
        if (data.code !== 200) {
            this.mpage -= isNext;
            showTip(ErrCodes.getErrStr(data.code, "获取兑换记录失败"));
        } else {
            if (!data.orders) {
                this.mpage -= isNext;
                showTip("没有更多数据了!");
                return;
            }
            this.listContainer.destroyAllChildren();
            data.orders.sort((a, b) => {
                return b.createTime - a.createTime;
            });

            this.orders = data.orders;
            for (let o of data.orders) {
                let newItem = cc.instantiate(this.item);
                this.listContainer.addChild(newItem);
                newItem.active = true;

                let type = newItem.getChildByName("type").getComponent(cc.Label);
                let amount = newItem.getChildByName("amount").getComponent(cc.Label);
                let real = newItem.getChildByName("real").getComponent(cc.Label);
                let date = newItem.getChildByName("date").getComponent(cc.Label);

                let state = newItem.getChildByName("lab").getComponent(cc.Label);
                let schedule = newItem.getChildByName("jindu").getComponent(cc.ProgressBar);
                let carryout = newItem.getChildByName("wancheng");
                let wait = newItem.getChildByName("cuidan");
                wait.getComponent(cc.Button).enableAutoGrayEffect = true;

                type.string = this.types[o.type - 1];
                amount.string = o.money;
                real.string = o.amount;
                date.string = formatTimeStr('d', o.createTime);

                let status = "已受理";
                let colour = this.colors[1];
                let load = 0.3;
                wait.active = true;
                carryout.active = false;
                if (o.state === 2) {
                    status = "审核中";
                    load = 0.6;
                } else if (o.state === 5) {
                    status = "转账中";
                    load = 0.9;
                } else if (o.state === 6) {
                    status = "兑换失败";
                    colour = this.colors[2];

                    if (!WithdrawDetail.check(o.status)) {
                        status = "兑换成功";
                        colour = this.colors[0];
                    }
                    load = 1;
                    wait.active = false;
                    carryout.active = true;
                }
                state.string = status;
                state.node.color = colour;
                schedule.progress = load;

                newItem.opacity = 0;
                newItem.scale = 0.6;
                let actions = cc.spawn(
                    cc.scaleTo(0.2, 1, 1).easing(cc.easeCircleActionOut()),
                    cc.fadeIn(0.2)
                )
                // newItem.runAction(actions);
                cc.tween(newItem).then(actions).start();
                // let tw = cc.tween;
                // tw(newItem).parallel(
                //     tw().to(0.2, { scale: 1 }, { easing: 'circOut' }),
                //     tw().to(0.2, { opacity: 255 })
                // ).start();
            }
        }
    }

    private onClickDetail(ev: cc.Event.EventTouch) {
        if (!this.lWithdrawDetail) {
            let ui = cc.instantiate(this.preWithdrawDetail);
            this.lWithdrawDetail = <WithdrawDetail>ui.getComponent(PopActionBox);
            this.lWithdrawDetail.autoDestroy = false
            cc.find("Canvas").addChild(ui);
        } else {
            this.lWithdrawDetail.openAnim();
        }

        //let index = ev.target.parent.children.indexOf(ev.target);
        let items = ev.target.parent;
        let index = items.parent.children.indexOf(items);

        let order = this.orders[index];
        this.lWithdrawDetail.setOrder(order)
    }
    private onClickUrge(even: cc.Event.EventTouch) {
        showTip("催单成功.");
        let node = even.target.getComponent(cc.Button);
        node.interactable = false;
        let cuidan = even.target.parent.getChildByName("cuidan");
        let tishi = cuidan.getChildByName("tishi");
        tishi.active = false;
        let Dianji = even.target.parent.getChildByName("Dianji");
        Dianji.active = true;
        Dianji.getComponent(cc.Animation).play();
        node.scheduleOnce(function () {
            Dianji.active = false;
            node.interactable = true;
            tishi.active = true;
        }, 2);
    }


    private onClickContactCS() {
        let node = cc.instantiate(this.preCustomerService);
        let canvas = cc.find("Canvas");
        if (!canvas) {
            return;
        }
        canvas.addChild(node, 990);
    }
}
