/* 公告 */
import net from "../common/net";
import { showLoading, hideLoading } from "../common/ui";

const { ccclass, property } = cc._decorator;

interface IContent {
    idx: number, title: string, content: string
}

@ccclass
export default class AnnouncementActivityPanel extends cc.Component {

    @property(cc.Node)
    zhifuwubao: cc.Node = undefined;

    @property(cc.Label)
    labTitle: cc.Label = undefined;

    @property(cc.RichText)
    svContent: cc.RichText = undefined;

    @property(cc.ScrollView)
    sv: cc.ScrollView = undefined;

    private notices: IContent[] = [];

    async requestContent(idxStr: string) {
        let notice: IContent = this.notices.filter(value => value.idx.toString() === idxStr)[0];
        if (notice) {
            this.showContent(notice);
            this.zhifuwubao.active = notice.title == "支付误报" ? true : false;
            this.sv.node.active = !this.zhifuwubao.active;
        } else {
            showLoading("加载公告");
            let data = await net.request("hall.hallHandler.getBulletin", { idx: +idxStr });
            hideLoading();
            if (data.code === 200 && data.bul) {
                let billboard = { idx: +idxStr, title: data.bul.title, content: data.bul.content }
                this.notices.push(billboard);
                this.showContent(billboard);
                this.zhifuwubao.active = data.bul.title == "支付误报" ? true : false;
                this.sv.node.active = !this.zhifuwubao.active;
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
        let fadein = cc.fadeIn(0.2);
        cc.tween(node).then(fadein).start();
    }
}
