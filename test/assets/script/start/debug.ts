import { setClipboard } from "../common/util";
import { ItemNames } from "../common/enum";

const TOUCH_WIDTH = 200;
const enum COUNT { once = 1, twice }
const enum INDEX { zero, one, two, three, }

const DEV_CODE = "789852"

const { ccclass, property } = cc._decorator

@ccclass
export default class Debug extends cc.Component {
    @property(cc.Node)
    nodeInfo: cc.Node = undefined;

    @property(cc.Node)
    private content: cc.Node = undefined;

    @property(cc.Label)
    private labItem: cc.Label = undefined;

    @property(cc.EditBox)
    private nodeEb: cc.EditBox = undefined;

    @property(cc.Node)
    private btnCopy: cc.Node = undefined;

    @property(cc.Node)
    private btnSkip: cc.Node = undefined;

    @property(cc.Node)
    private btnInfo: cc.Node = undefined;

    private counts = [0, 0, 0, 0];
    private debugTime = 0;
    private page = 0;
    static _info: string = "";

    static log(str: string) {
        if (!str) return;
        let d = new Date();
        let timeStr = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
        Debug._info += timeStr + "  " + str + "\n";
        cc.log(str);
    }

    onLoad() {
        this.nodeEb.node.active = false;
        this.hideBtns()
        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            let currPos = event.getLocation();
            let size = cc.winSize;
            if (currPos.y < TOUCH_WIDTH) {
                if (currPos.x < TOUCH_WIDTH) {
                    this.check(INDEX.one);
                }
                if (currPos.x > size.width - TOUCH_WIDTH) {
                    this.check(INDEX.two);
                }
            }
            if (currPos.y > size.height - TOUCH_WIDTH) {
                if (currPos.x < TOUCH_WIDTH) {
                    this.check(INDEX.zero);
                }
                if (currPos.x > size.width - TOUCH_WIDTH) {
                    this.check(INDEX.three);
                }
            }
        });
        (<any>this.node)["_touchListener"].setSwallowTouches(false);
    }

    private check(idx: number) {
        for (let i = 0; i < idx; i++) {
            if (this.counts[i] !== COUNT.twice) {
                this.counts = [0, 0, 0, 0];
                return
            }
        }
        this.counts[idx]++;
        if (this.counts[idx] === COUNT.once) {
            this.debugTime = Date.now();
        } else if (this.counts[idx] === COUNT.twice) {
            if (Date.now() - this.debugTime > 1000) {
                this.counts = [0, 0, 0, 0];
                return
            }
            // 开发者输入框
            if (idx === INDEX.three) {
                this.counts = [0, 0, 0, 0];
                this.nodeEb.node.active = true;
            }
            // 玩家看到的界面
            if (idx === INDEX.one && cc.director.getScene().name === 'start') {
                this.btnSkip.active = false;
                this.btnCopy.active = true;
                this.btnInfo.active = false;
            }
        }
    }

    private hideBtns() {
        this.nodeEb.node.active = false;
        this.btnSkip.active = false;
        this.btnCopy.active = false;
        this.btnInfo.active = false;
    }

    refresh() {
        let dataArr = Debug._info.split("\n");
        let org = this.page;
        let end = this.page + 30;
        for (let ofs = org; ofs < end; ofs++) {
            let data = dataArr[ofs];
            this.page = ofs;
            if (!data) break;
            let item = cc.instantiate(this.labItem.node);
            this.content.addChild(item);
            item.setPosition(0, 0);
            item.getComponent(cc.Label).string = data;
        }
    }

    scroll(ev: any, et: cc.ScrollView.EventType) {
        if (cc.ScrollView.EventType.SCROLL_TO_BOTTOM === et) {
            this.refresh();
        }
    }

    private onEndEdit() {
        this.nodeEb.node.active = false;
        if (this.nodeEb.string === DEV_CODE) {
            this.btnSkip.active = true;
            this.btnCopy.active = false;
            this.btnInfo.active = true;
        } else {
            this.hideBtns()
        }
    }

    private onClickInfo() {
        this.nodeInfo.active = true
        this.nodeInfo.zIndex = 1000
        this.refresh();
        this.hideBtns()
    }

    private onClickSkip() {
        cc.sys.localStorage.setItem(ItemNames.devFlag, "1");
        this.hideBtns()
    }

    private onClickCopy() {
        setClipboard(Debug._info);
        this.hideBtns()
    }

    private onClickClose() {
        this.nodeInfo.active = false
    }
}
