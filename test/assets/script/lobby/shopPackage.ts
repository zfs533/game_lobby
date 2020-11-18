import PopActionBox from "./popActionBox"
import g from "../g";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShopPackage extends PopActionBox {

    @property(cc.RichText)
    content: cc.RichText = undefined;

    @property(cc.RichText)
    title: cc.RichText = undefined;

    start() {
        super.start();
    }
    onClickBg() {
        this.node.parent.removeChild(this.node);
        this.node.destroy();
    }

    onClickUpdate() {
        let url = g.updateUrl;
        cc.sys.openURL(url);
    }

    setContent(info: string) {
        this.content.string = info;
    }
    setTitle(info: string) {
        this.title.string = info;
    }
}
