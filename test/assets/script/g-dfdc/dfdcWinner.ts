import { winnerInfo } from "./dfdcMsg"
import { parseLocation, setGray } from "../common/util";
import { getAvatar, showTip } from "../common/ui";
//import { Gender } from "../common/enum";
import { Gender } from "../common/enum";
import DFDCAudio from "./dfdcAudio";
import DFDCGame from "./dfdcGame";
import DFDCWinnerItem from "./dfdcWinnerItem";
const { ccclass, property } = cc._decorator;

@ccclass
export default class DFDCWinner extends cc.Component {
    @property(cc.Node)
    private oSvContent: cc.Node = undefined;

    @property(cc.Node)
    private oSvItem: cc.Node = undefined;

    @property([cc.SpriteFrame])
    private ranks: cc.SpriteFrame[] = [];
    private audioMgr: DFDCAudio;
    private game: DFDCGame;
    @property([cc.Node])
    public btnWinnerColorPools: cc.Node[] = [];
    @property(cc.ScrollView)
    private cScrollView: cc.ScrollView = undefined;

    @property(cc.SpriteFrame)
    private newItemBg: cc.SpriteFrame = undefined;

    @property(cc.SpriteFrame)
    private normalItemBg: cc.SpriteFrame = undefined;

    private data: winnerInfo[] = [];
    //动态列表参数
    private spawnCount: number = 15; // 刚开始生成多少备用item
    private totalCount: number = 0;
    private spacing: number = 10; // item间距
    private bufferZone: number = 400; // when item is away from bufferZone, we relocate it
    private updateTimer = 0;
    private updateInterval = 0.2;
    private lastContentPosY = 0;
    private items: cc.Node[] = [];



    onLoad() {
        this.updateTimer = 0;
        this.updateInterval = 0.2;
        this.lastContentPosY = 0;
        this.totalCount = this.spawnCount;

        this.oSvContent.height = this.totalCount * (this.oSvItem.height + this.spacing) + this.spacing; // get total content height
        for (let i = 0; i < this.spawnCount; ++i) { // spawn items, we only need to do this once
            let item = cc.instantiate(this.oSvItem);
            item.getComponent(DFDCWinnerItem).updateItem(i);
            this.oSvContent.addChild(item);
            item.setPosition(0, -item.height * i - this.spacing * (i + 1));
            item.active = false;
            this.items.push(item);
        }
    }

    update(dt: number) {
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) return; // we don't need to do the math every frame
        this.updateTimer = 0;
        let items = this.items;
        let buffer = this.bufferZone;
        let isDown = this.oSvContent.y < this.lastContentPosY; // scrolling direction
        let offset = (this.oSvItem.height + this.spacing) * items.length;
        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            if (isDown) {
                // if away from buffer zone and not reaching top of content
                if (viewPos.y < -buffer && items[i].y + offset < 0) {
                    items[i].y = items[i].y + offset;
                    let item = items[i].getComponent(DFDCWinnerItem);
                    let itemId = item.itemID - items.length; // update item id
                    item.updateItem(itemId);
                    this.setItem(items[i], itemId);
                }
            } else {
                // if away from buffer zone and not reaching bottom of content
                if (viewPos.y > buffer && items[i].y - offset > -this.oSvContent.height) {
                    items[i].y = items[i].y - offset;
                    let item = items[i].getComponent(DFDCWinnerItem);
                    let itemId = item.itemID + items.length;
                    item.updateItem(itemId);
                    this.setItem(items[i], itemId);
                }
            }
        }
        // update lastContentPosY
        this.lastContentPosY = this.oSvContent.y;
    }

    private getPositionInView(item: cc.Node) { // get item position in scrollview's node space
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.cScrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    }

    // 开始按钮下注按钮置灰控制
    private gameBtnCtr(id: number) {
        for (let index = 0; index < this.btnWinnerColorPools.length; index++) {
            if (index === id) {
                this.game.setNodeGray(this.btnWinnerColorPools[index], false);
                setGray(this.btnWinnerColorPools[index], false);
                let obj = this.btnWinnerColorPools[index].getChildByName("lab");
                obj.opacity = 255;
            }
            else {
                this.game.setNodeGray(this.btnWinnerColorPools[index], true);
                setGray(this.btnWinnerColorPools[index], true);
                let obj = this.btnWinnerColorPools[index].getChildByName("lab");
                obj.opacity = 128;
            }
        }
    }

    //打开排行榜
    show(data: winnerInfo[], sfTitle: number, audioMgr: DFDCAudio, game: DFDCGame) {
        this.data = data;
        this.audioMgr = audioMgr;
        this.game = game;
        this.node.active = true;
        for (let i = 0; i < this.items.length; ++i) {
            this.items[i].active = false;
        }
        this.cScrollView.scrollToTop(0.01);
        this.gameBtnCtr(sfTitle);
        this.oSvItem.active = false;
        if (!data || data.length === 0) {
            this.cScrollView.node.active = false;
            showTip("暂无历史获奖信息～");
            return;
        }
        this.cScrollView.node.active = true;

        this.totalCount = data.length;
        this.oSvContent.height = this.totalCount * (this.oSvItem.height + this.spacing) + this.spacing;
        for (let i = 0; i < this.items.length; ++i) {
            let item = this.items[i];
            let winneritem = item.getComponent(DFDCWinnerItem);
            winneritem.updateItem(i);
            if (i < this.totalCount) {
                item.active = true;
                this.setItem(item, i);
            }
            item.setPosition(0, -item.height * i - this.spacing * (i + 1));
        }
    }

    private setItem(item: cc.Node, idx: number) {
        if (!this.data || idx >= this.data.length) {
            return;
        }
        let playerInfo = this.data[idx];
        let rank = item.getChildByName("rank").getComponent(cc.Sprite);
        let head = item.getChildByName("def1").getComponentInChildren(cc.Sprite);
        let loc = item.getChildByName("loc").getComponent(cc.Label);
        let winMoney = item.getChildByName("bg").getComponentInChildren(cc.Label);
        let winDate = item.getChildByName("winDate").getComponent(cc.Label);

        //设置背景颜色
        if (idx > 0) {
            item.getComponent(cc.Sprite).spriteFrame = this.normalItemBg;
        } else {
            item.getComponent(cc.Sprite).spriteFrame = this.newItemBg;
        }


        if (idx < 6) {
            rank.node.active = true;
            rank.spriteFrame = this.ranks[idx];
            item.getChildByName("rank1").active = false;
        } else {
            rank.node.active = false;
            let rank1 = item.getChildByName("rank1").getComponent(cc.Sprite);
            rank1.node.active = true;
            //rank1.spriteFrame = this.ranks[6];
            let sort = rank1.node.getChildByName("sort").getComponent(cc.Label);
            sort.string = idx.toString();
        }
        head.spriteFrame = getAvatar((playerInfo.gender === Gender.MALE), playerInfo.avatar);
        loc.string = parseLocation(playerInfo.ipLocation) ? parseLocation(playerInfo.ipLocation) : "--";
        let gold = +playerInfo.winMoney;
        winMoney.string = gold.toFixed(2).toString();
        // winDate.string = formatTimeStr('m', playerInfo.winDate);
        winDate.string = this.current(playerInfo.winDate);
    }

    current(date: string) {
        let d: Date;
        if (date) {
            d = new Date(date);
        } else {
            d = new Date();
        }
        var year = d.getFullYear();       //年
        var month = d.getMonth() + 1;     //月
        var day = d.getDate();            //日

        var hh = d.getHours();            //时
        var mm = d.getMinutes();          //分
        var ss = d.getSeconds();           //秒

        var clock = year + "-";

        if (month < 10)
            clock += "0";

        clock += month + "-";

        if (day < 10)
            clock += "0";

        clock += day + " ";
        clock += "\n  ";
        if (hh < 10)
            clock += "0";
        clock += hh + ":";
        if (mm < 10) clock += '0';
        clock += mm + ":";

        if (ss < 10) clock += '0';
        clock += ss;
        return (clock);
    }
    hide() {
        if (this.audioMgr) {
            this.audioMgr.playButtonClickSound();
        }
        for (let i = 0; i < this.oSvContent.childrenCount; ++i) {
            this.oSvContent.children[i].active = false;
        }
        this.node.active = false;
    }

}
