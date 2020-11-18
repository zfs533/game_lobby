
import BCBMCarLog from "./bcbmCarLog";
import BCBMTrendItem from "./bcbmTrendItem";
import TingHuPai from "../g-ermj/ermjTingHuPai";
import { AreaAwardType } from "./bcbmEnum";
import g from "../g";
const { ccclass, property } = cc._decorator;
/**
 * 走势图
 */
@ccclass
export default class BCBMTrend extends cc.Component {
    @property(cc.Node)
    carLogNode: cc.Node = undefined;

    @property(cc.Prefab)
    logItem: cc.Node = undefined;

    @property(cc.ScrollView)
    trendList: cc.ScrollView = undefined;

    @property(cc.Node)
    trendItem: cc.Node = undefined;

    @property(cc.Node)
    listContent: cc.Node = undefined;

    @property(cc.Node)
    line: cc.Node = undefined;

    private logList: any[] = [];
    private trends: any[] = [];
    private datalist: any[] = [];
    private posList: cc.Vec2[] = [];
    private viewWidth: number = 0;
    private contentOringinX: number = 0;
    private count: number = 0;
    private recordList: ps.LocInfo[] = [];
    private logPosList: cc.Vec2[] = [];

    start() {
        /* test */
        // this.init();
        // let dt = []
        // for (let i = 0; i < 20; i++) {
        //     if (i > 10) {
        //         dt.push({ loc: 10, area: 3, awardType: 1 });
        //     }
        //     else {
        //         dt.push({ loc: 10, area: 1, awardType: 1 });
        //     }
        // }
        // this.initListData(dt);
        // this.schedule(() => {
        //     let t = { loc: 10, area: 1, awardType: 1 }
        //     dt.push(t);
        //     this.refreshListData(t, dt);
        // }, 2);
    }

    /**
     * 初始化车标list
     */
    async init() {
        return new Promise(async (resolve, reject) => {
            if (this.viewWidth == 0) {
                this.trendItem.active = false;
                this.viewWidth = this.listContent.width;
                this.contentOringinX = Math.floor(this.listContent.x);
                this.trendList.node.on('scrolling', this.handleScroling, this);
            }
            await this.setBaseLogList();
            resolve();
        });
    }

    handleDatafu(dt: any, locs: ps.LocInfo, key: string, list: any[], i: number) {
        let zhong: number = locs.area;
        if (Number(key) == zhong) {
            if (locs.awardType == AreaAwardType.Big) {
                dt[key] = 0;
            }
        }
        else {
            if (list.length < 1) {
                dt[key]++;
            }
            else {
                let dtforward = list[i - 1]
                dt[key] = dtforward[key] + 1;
            }
        }
    }

    async handleData() {
        return new Promise(resolve => {
            let list = this.datalist;
            let records = this.recordList;
            for (let i = 0; i < records.length; i++) {
                let dt = this.getDataModuel();
                dt.record = records[i];
                for (let key in dt) {
                    if (key.length == 1) {
                        this.handleDatafu(dt, records[i], key, list, i);
                    }
                }
                list.push(dt);
            }
            resolve();
        });
    }

    /**
     * 要记录车标未出次数，这里重新制作一下数据结构
     */
    getDataModuel(): any {
        let dt = {
            "1": 0, "2": 0, "3": 0, "4": 0,
            "5": 0, "6": 0, "7": 0, "8": 0,
            record: 0, isDraw: false
        }
        return dt;
    }

    async refreshListData(locInfo: ps.LocInfo, list: ps.LocInfo[]) {
        this.recordList = list;
        let dt = this.getDataModuel();
        dt.record = locInfo;
        for (let key in dt) {
            if (key.length == 1) {
                this.handleDatafu(dt, locInfo, key, this.datalist, this.datalist.length);
            }
        }
        this.datalist.push(dt);
        // this.initData();
        this.setCurrentData(locInfo);
        await this.initListViewData();
    }

    async initListData(records: ps.LocInfo[]) {
        this.recordList = records;
        await this.handleData();
        this.initData();
    }

    /**
     * 初始化数据
     * @param records
     */
    async initData() {
        await this.initListViewData();
        await this.setBaseLogList();
        let records = this.recordList;
        if (records.length > this.logList.length) {
            records = records.slice(records.length - this.logList.length);
        }

        let j: number = 0;
        for (let i = records.length - 1; i >= 0; i--) {
            let carLogNode: cc.Node = this.logList[j];
            let bcbmCL = carLogNode.getComponent(BCBMCarLog);
            bcbmCL.setNewNodeTag(false);
            if (j == 0) {
                bcbmCL.setNewNodeTag(true);
            }
            carLogNode.active = true;
            bcbmCL.setLogInfo(records[i]);
            j++;
            console.log(j, records[i]);
        }
    }

    /**
    * 设置本局中奖车标记录（位移方式，预留到这里先）
    * @param reIndex 本局中奖车标
    */
    async setCurrentData(locInfo: ps.LocInfo) {
        await this.init();
        let length = this.logList.length;
        let lastLog: cc.Node = this.logList[length - 1];
        lastLog.active = true;
        lastLog.setPosition(this.logPosList[0].x + 50, this.logPosList[0].y)
        lastLog.runAction(cc.moveTo(0.5, this.logPosList[0]));
        lastLog.getComponent(BCBMCarLog).setLogInfo(locInfo);
        /* 重新排序 */
        let temp = [];
        temp.push(lastLog);
        this.logList.forEach((item, index) => {
            if (index < length - 1) {
                // item.setPosition(this.logPosList[index + 1]);
                temp.push(item);
                let moveTo = cc.moveTo(0.5, this.logPosList[index + 1]);
                item.runAction(moveTo);
            }
        });
        this.logList = temp;
    }



    /**
     * 一定数量的item循环使用
     */
    async initListViewData() {
        return new Promise(async (resolve, reject) => {
            let records = this.datalist;
            this.posList.splice(0);
            for (let i = 0; i < records.length; i++) {
                let v2: cc.Vec2 = new cc.Vec2(this.trendItem.width * i + this.trendItem.width / 2, 0);
                this.posList.push(v2);
            }
            if (this.viewWidth < this.trendItem.width * records.length) {
                this.listContent.setContentSize(cc.size(this.trendItem.width * records.length, this.listContent.height));
            }
            if (this.trends.length < 14) {
                for (let i = this.trends.length; i < records.length; i++) {
                    let trendItem: cc.Node = cc.instantiate(this.trendItem);
                    trendItem.active = true;
                    trendItem.y = 0;
                    trendItem.x = trendItem.width * i + trendItem.width / 2;
                    await this.setTrendItemData(trendItem, records[i], this.trends.length);
                    this.listContent.addChild(trendItem);
                    this.trends.push(trendItem);
                    let len: number = this.trends.length;
                    if (len > 1) {
                        this.datalist[i].isDraw = true;
                        this.drawLogLine(this.trends[len - 2], this.trends[len - 1], len - 2);
                    }
                    if (this.trends.length >= 14) {
                        break;
                    }
                }
            }
            await this.trendList.scrollToRight();
            this.handleScroling();
            resolve();
        });
    }

    async setBaseLogList() {
        return new Promise(resolve => {
            if (this.carLogNode.childrenCount < 1) {
                for (let i = 0; i < 21; i++) {
                    let log = cc.instantiate(this.logItem);
                    let v2 = new cc.Vec2(this.carLogNode.width / 2 - log.width / 2 - i * (log.width - 0.5), 0)
                    log.setPosition(v2.x, v2.y);
                    log.scale = 0.7;
                    log.active = false;
                    this.logPosList.push(v2);
                    this.carLogNode.addChild(log);
                    this.logList.push(log);
                }
            }
            resolve();
        });
    }

    private async  setTrendItemData(trendItem: cc.Node, itemData: ps.LocInfo, indexRound: number) {
        return new Promise(resolve => {
            let bcbmtrenditem: BCBMTrendItem = trendItem.getComponent(BCBMTrendItem);
            bcbmtrenditem.showTitleNumber(indexRound);
            bcbmtrenditem.showCarLog(itemData);
            resolve();
        });
    }

    private async drawLogLine(trendItem1: cc.Node, trendItem2: cc.Node, nameIndex: number) {
        let bcbmtrenditem1: BCBMTrendItem = trendItem1.getComponent(BCBMTrendItem);
        let bcbmtrenditem2: BCBMTrendItem = trendItem2.getComponent(BCBMTrendItem);
        let pos1: cc.Vec2 = bcbmtrenditem1.getCurrentLogPos();
        let pos2: cc.Vec2 = bcbmtrenditem2.getCurrentLogPos();
        this.drawSpLine(pos1, pos2, nameIndex);
    }

    private drawSpLine(p1: cc.Vec2, p2: cc.Vec2, nameIndex: number) {
        let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        let rota = angle * 180 / Math.PI;
        let line = cc.instantiate(this.line);
        line.setPosition(p1);
        line.active = true;
        let distance = p1.sub(p2).mag();
        line.width = distance;
        line.height = 3;
        line.rotation = -rota;
        line.zIndex = -1;
        line.name = `line${nameIndex}`;
        this.listContent.addChild(line);
    }

    /**
     * scrollview滚动监听，计算item位移坐标
     */
    private async handleScroling() {
        if (this.trends.length < 14) {
            return;
        }
        let contentX = Math.floor(this.listContent.x);
        let distance = this.contentOringinX - contentX;
        let count = Math.floor(distance / this.trendItem.width);
        if (count < 0 || (count - 1) + this.trends.length > this.posList.length || count == this.count) {
            return;
        }
        this.count = count;
        for (let i = count; i < count + this.trends.length; i++) {
            let item = this.trends[i - count];
            item.x = this.posList[i].x;
            await this.setTrendItemData(item, this.datalist[i], i);
            /* isDraw 避免重复绘制 */
            if (i - count - 1 > -1 && i - count < 14 && !this.datalist[i].isDraw) {
                this.drawLogLine(this.trends[i - count - 1], this.trends[i - count], i - count - 1);
                this.datalist[i].isDraw = true;
            }
        }
    }

    public showSelf() {
        this.openAnim();
    }
    hide() {
        this.closeAction();
    }

    openAnim(cb?: Function) {
        this.node.active = true;
        this.node.position = cc.v3()
        let animTime = 0.3;
        let actions = cc.sequence(
            cc.scaleTo(animTime, 1, 1).easing(cc.easeBackOut()),
            cc.callFunc(async () => {
                await this.trendList.scrollToLeft(0);
                await this.trendList.scrollToRight(1);
            }),
        )
        // cc.tween(this.node).then(actions).start();
        this.node.runAction(actions);

    }

    protected closeAction(cb?: Function) {
        let animTime = 0.3;
        let actions = cc.sequence(
            cc.scaleTo(animTime, 0).easing(cc.easeBackIn()),
            cc.callFunc(() => {
                this.node.active = false;
            }))
        // cc.tween(this.node).then(actions).start();
        this.node.runAction(actions);
    }
}
