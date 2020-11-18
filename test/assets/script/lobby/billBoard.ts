import PopActionBox from "./popActionBox"
import net from "../common/net";
import Loading from "../common/loading";

interface IContent {
    idx: number, title: string, content: string
}

const { ccclass, property } = cc._decorator;

@ccclass
export class BillBoard extends PopActionBox {
    @property(cc.Label)
    labTitle: cc.Label = undefined;

    @property(cc.ToggleContainer)
    tgBtn: cc.ToggleContainer = undefined;

    @property(cc.Node)
    tBtn: cc.Node = undefined;

    @property(cc.Node)
    svNode: cc.Node = undefined;

    @property(cc.RichText)
    svContent: cc.RichText = undefined;

    @property(Loading)
    prefabLoading: Loading = undefined;

    private notices: IContent[] = [];
    private sv: cc.ScrollView;

    onLoad() {
        super.onLoad();
        this.svNode.active = false;
        this.sv = this.svNode.getComponent(cc.ScrollView);
        this.svContent.node.opacity = 0;
    }

    start() {
        this.openAnim(() => {
            let node = this.svNode;
            node.active = true;
            node.stopAllActions();
            node.opacity = 0;
            // node.runAction(cc.fadeIn(0.2));
            cc.tween(node).to(0.2,{opacity:255}).start();
        });
    }

    showBillBoard(titles: ps.HallHallHandlerGetBulletinTitle_BulletinTitle[]) {
        if (titles && titles.length > 0) {
            let scale = 1;
            if (titles.length > 5) {  // 防止页签过多超框
                scale = 0.9 - (titles.length - 5) * 0.05;
            }
            this.tgBtn.node.scale = scale;

            this.tgBtn.node.active = true;

            this.tgBtn.node.removeAllChildren();

            titles.forEach((titleInfo) => {
                let item = cc.instantiate(this.tBtn);
                this.tgBtn.node.addChild(item);

                let labBg = item.getChildByName("bg").getChildByName("lab").getComponent(cc.Label);
                let labMark = item.getChildByName("mark").getChildByName("lab").getComponent(cc.Label);
                labBg.string = titleInfo.title.toString();
                labMark.string = titleInfo.title.toString();

                let handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = "billBoard";
                handler.handler = "onClickTog";
                handler.customEventData = titleInfo.idx.toString();
                item.getComponent(cc.Toggle).checkEvents.push(handler);
            });
            this.requestContent(titles[0].idx.toString());
        }
        else {
            this.tgBtn.node.active = false;
            this.svNode.active = false;
        }
    }

    onClickTog(ev: cc.Event.EventTouch, idxStr: string) {
        this.requestContent(idxStr);
    }

    async requestContent(idxStr: string) {
        let notice: IContent = this.notices.filter(value => value.idx.toString() === idxStr)[0];
        if (notice) {
            this.showContent(notice);
        } else {
            this.showLoading("加载公告");
            let data = await net.request("hall.hallHandler.getBulletin", { idx: +idxStr });
            this.hideLoading();
            if (data.code === 200 && data.bul) {
                let billboard = { idx: +idxStr, title: data.bul.title, content: data.bul.content }
                this.notices.push(billboard);
                this.showContent(billboard);
            }
        }
    }
    showContent(notice: IContent) {
        this.labTitle.string = notice.title;

        this.sv.stopAutoScroll();
        this.sv.scrollToTop();
        this.svContent.string = notice.content;

        let node = this.svContent.node;
        node.stopAllActions();
        node.opacity = 0;
        // node.runAction(cc.fadeIn(0.2));
        cc.tween(node).to(0.2,{opacity:255}).start();
    }

    /**显示laoding */
    showLoading(info: string) {
        if (!this.prefabLoading) return;
        this.prefabLoading.show(info);
        this.prefabLoading.node.active = true;
        let temp_BlockInputEvents = this.prefabLoading.getComponent(cc.BlockInputEvents);
        if (temp_BlockInputEvents) temp_BlockInputEvents.enabled = false;
    }

    /**隐藏loading */
    hideLoading() {
        if (!this.prefabLoading) return;
        this.prefabLoading.node.active = false;
    }
}
