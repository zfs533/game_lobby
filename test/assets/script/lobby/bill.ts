import User from "../common/user";
import { formatTimeStr } from "../common/util";
import PopActionBox from "./popActionBox";
import BillDetail from "./billDetail";
import { showLoading, hideLoading } from "../common/ui";
import net from "../common/net";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bill extends PopActionBox {
    @property(cc.ScrollView)
    svContent: cc.ScrollView = undefined;

    @property(cc.Node)
    contentItem: cc.Node = undefined;

    @property(cc.Label)
    labTips: cc.Label = undefined;

    @property(cc.Prefab)
    preDetail: cc.Prefab = undefined;

    transfers: gameIface.TransferRecrod[] = [];

    page = 0;

    onLoad() {
        super.onLoad();
        this.svContent.node.active = false;
    }

    start() {
        this.svContent.content.removeAllChildren();
        this.openAnim(() => {
            this.svContent.node.active = true;
        });
    }

    showContent() {
        this.loadRec(true);
    }

    async loadRec(first = false) {
        first && showLoading("");
        let data = await net.request("hall.billHandler.getVipData", { page: this.page++ });

        first && hideLoading();
        if (data.vipInfo) {
            this.transfers.push(...data.vipInfo);
            this.labTips.node.active = false;

            data.vipInfo.forEach(transferInfo => {
                let item = cc.instantiate(this.contentItem);
                let bgRed = item.getChildByName("bgRed");
                let bgGreen = item.getChildByName("bgGreen");
                let transfer = item.getChildByName("transfer").getComponent(cc.Label);
                let labId = item.getChildByName("id").getComponent(cc.Label);
                let labMoney = item.getChildByName("money").getComponent(cc.Label);
                let labDate = item.getChildByName("date").getComponent(cc.Label);
                let labState = item.getChildByName("state").getChildByName("status").getComponent(cc.Label);

                let transferOut = (transferInfo.uid === User.uid)
                bgRed.active = false;
                bgGreen.active = false;
                if (transferOut) {
                    bgRed.active = true;
                    transfer.string = "转出";
                    labId.string = transferInfo.vipUid.toString();
                } else {
                    bgGreen.active = true;
                    transfer.string = "转入";
                    labId.string = transferInfo.uid.toString();
                }
                labMoney.string = transferInfo.money;
                let dateStr = formatTimeStr('m', transferInfo.dateTime);
                labDate.string = dateStr;

                labState.string = "延迟到账";
                labState.node.parent.color = (new cc.Color).fromHEX('#FF9900');
                if (transferInfo.state === 6) {
                    labState.string = "失败";
                    labState.node.parent.color = (new cc.Color).fromHEX('#FF0101');
                    if (transferInfo.status & 0x2000) {
                        labState.string = "成功";
                        labState.node.parent.color = (new cc.Color).fromHEX('#037C05');
                    }
                }

                this.svContent.content.addChild(item);
            });
        } else {
            this.labTips.node.active = first;
        }
    }

    svDidScroll(ev: any, eventType: cc.ScrollView.EventType) {
        if (cc.ScrollView.EventType.SCROLL_TO_BOTTOM === eventType) {
            this.loadRec()
        }
    }

    onClickDetail(ev: cc.Event.EventTouch) {
        let ui = cc.instantiate(this.preDetail);
        let Canvas = cc.find("Canvas");
        Canvas.addChild(ui);
        let idx = this.svContent.content.children.indexOf(ev.target);
        ui.getComponent(BillDetail).showContent(this.transfers[idx]);
    }
}
