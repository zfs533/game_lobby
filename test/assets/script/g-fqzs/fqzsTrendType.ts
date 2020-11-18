
const { ccclass, property } = cc._decorator;

import { FQZSGameState } from "./fqzsConf"
import { showLoading, hideLoading } from "../common/ui";
import { FQZSTrendTypeItem } from "./fqzsTrendTypeItem"
import { FQZSTrendData, NOTICE_ALL_UPDATE, NOTICE_NOLASTITEM_UPDATE } from "./fqzsTrendData"
import { EventCenter } from "./EventManager"


@ccclass
export class FQZSTrendType extends cc.Component {

    @property({ tooltip: "动物图片，按id放置", type: [cc.SpriteFrame] })
    animalList = [];

    @property(cc.Prefab)
    preListItem: cc.Prefab = null;
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    @property(cc.Node)
    content: cc.Node = null;

    private cellWidth: number = 0;
    private maxShowCount: number = 20;
    onLoad() {
        this.cellWidth = this.preListItem.data.width + this.content.getComponent(cc.Layout).spacingX;
        EventCenter.instance.addListener(NOTICE_ALL_UPDATE, this.loadUI, this);
        EventCenter.instance.addListener(NOTICE_NOLASTITEM_UPDATE, this.loadUI, this);
    }

    onDestroy() {
        EventCenter.instance.removeListener(NOTICE_ALL_UPDATE, this)
        EventCenter.instance.removeListener(NOTICE_NOLASTITEM_UPDATE, this)
    }

    onEnable() {
        this.updateUI();
    }
    onDisable() {

    }
    updateUI() {
        showLoading("获取中");
        let startTime = Date.now();
        this.loadUI();
        hideLoading();
        let endTime = Date.now();
        console.log("加载UI列表需要的时间===", endTime - startTime);
    }
    onScrollDataList(scroll: cc.ScrollView, eventType: cc.ScrollView.EventType, data: any) {
        if (eventType === cc.ScrollView.EventType.SCROLLING) {
            if (this.content.childrenCount > this.maxShowCount) {
                let maxlength = this.content.getContentSize().width;
                let curLength = this.content.position.x;
                //当前的位置
                let per = Math.abs(curLength / maxlength)
                //一般情况下，content下的节点数只会少于数据长度
                let startIndex = Math.floor(per * this.content.childrenCount) + Math.floor(this.maxShowCount / 2)
                //console.log("showContentstart==>", startIndex);
                let end1 = (startIndex - this.maxShowCount) < 0 ? 0 : (startIndex - this.maxShowCount)
                for (let i = 0; i < end1; i++) {
                    let item = this.content.children[i]
                    if (item) item.getComponent(FQZSTrendTypeItem).setRenderMode(false)
                }
                let maxrenderCount = startIndex
                for (let inx = end1; inx < maxrenderCount; inx++) {
                    let item = this.content.children[inx]
                    if (item) {
                        item.getComponent(FQZSTrendTypeItem).setRenderMode(true)
                    } else {
                        break
                    }
                }
                for (let inx = startIndex; inx < this.content.childrenCount; inx++) {
                    let item = this.content.children[inx]
                    if (item) {
                        item.getComponent(FQZSTrendTypeItem).setRenderMode(false)
                    } else {
                        break;
                    }
                }
            }
        }
    }
    scrollContent() {
        let width = this.scroll.node.getContentSize().width;
        let totalwidth = (this.cellWidth) * this.content.childrenCount
        if (totalwidth >= width) {
            console.log("类别向右滑动")
            setTimeout(() => {
                this.scroll.scrollToRight();
            })
        }
    }

    /**加载已经处理好的UI数据 */
    loadUI() {
        if (!this.node.active) return;
        let allData = FQZSTrendData.Instance.getAnimalTypeData()
        let startIndx = allData.length > 200 ? allData.length - 200 : 0;
        for (let i = startIndx; i < allData.length; i++) {
            let item = this.content.children[i];
            let itemComp: FQZSTrendTypeItem = null;
            if (item) {
                itemComp = item.getComponent(FQZSTrendTypeItem);
            } else {
                item = cc.instantiate(this.preListItem);
                itemComp = item.getComponent(FQZSTrendTypeItem);
                this.content.addChild(item)
            }
            itemComp.setItemData(allData[i])
            itemComp.updateItemIndex(i + 1);
        }
        if (allData.length > 1) {
            for (let i = 0; i < allData.length; i++) {
                if (i === allData.length - 1) {
                    this.content.children[i].getComponent(FQZSTrendTypeItem).setNewJuSign()
                    //最新
                    continue;
                }
                let curComp = this.content.children[i].getComponent(FQZSTrendTypeItem);
                let nextComp = this.content.children[i + 1].getComponent(FQZSTrendTypeItem);
                curComp.drawLineTo(nextComp.getChoosePiont());
            }
        }
        this.scrollContent()
        setTimeout(() => {
            this.onScrollDataList(this.scroll, cc.ScrollView.EventType.SCROLLING, null)
        }, 1)
    }


}
