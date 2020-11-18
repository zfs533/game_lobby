import BCBMCarLog from "./bcbmCarLog";
const { ccclass, property } = cc._decorator;
@ccclass
export default class BCBMRecord extends cc.Component {
    @property(cc.Node)
    private carLogNode: cc.Node = undefined;

    @property(cc.Prefab)
    private logItem: cc.Node = undefined;
    private logList: any[] = [];
    private logPosList: cc.Vec2[] = [];
    public recordListRd: ps.LocInfo[] = [];
    /* test */
    start() {
        // let dt = [
        //     { loc: 10, area: 3, awardType: 1 },
        //     { loc: 10, area: 3, awardType: 1 },
        //     { loc: 10, area: 3, awardType: 1 },
        //     { loc: 10, area: 3, awardType: 1 },
        // ]
        // this.initListData(dt);
        // this.schedule(() => {
        //     this.setCurrentData({ loc: 10, area: 2, awardType: 1 })
        // }, 2);
    }

    /**
     * 初始化车标list
     */
    async init() {
        await this.setBaseLogList();
    }

    refreshListData(locInfo: ps.LocInfo) {
        this.recordListRd.push(locInfo);
        // this.initData();
        this.setCurrentData(locInfo);
    }

    initListData(records: ps.LocInfo[]) {
        this.recordListRd = records;
        this.initData();
    }

    /**
     * 初始化数据
     * @param records
     */
    async initData() {
        let records = this.recordListRd;
        await this.setBaseLogList();
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
        }
    }

    /**
     * 生成固定数量的车标模版
     */
    setBaseLogList(): any {
        return new Promise(resolve => {
            if (this.carLogNode.childrenCount < 1) {
                for (let i = 0; i < 12; i++) {
                    let log = cc.instantiate(this.logItem);
                    let v2 = new cc.Vec2(-(log.width / 2 + (log.width - 10) * i), -2);
                    log.setPosition(v2.x, v2.y);
                    log.active = false;
                    log.scale = 0.6;
                    this.carLogNode.addChild(log);
                    this.logPosList.push(v2);
                    this.logList.push(log);
                }
            }
            resolve();
        });
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
        // lastLog.setPosition(this.logPosList[0]);
        // lastLog.runAction(cc.moveTo(0.5, this.logPosList[0]));
        cc.tween(lastLog).then(cc.moveTo(0.5, this.logPosList[0])).start();
        lastLog.getComponent(BCBMCarLog).setLogInfo(locInfo);
        /* 重新排序 */
        let temp = [];
        temp.push(lastLog);
        this.logList.forEach((item, index) => {
            if (index < length - 1) {
                // item.setPosition(this.logPosList[index + 1]);
                temp.push(item);
                let moveTo = cc.moveTo(0.5, this.logPosList[index + 1]);
                // item.runAction(moveTo);
                cc.tween(item).then(moveTo).start();
            }
        });
        this.logList = temp;
    }
}
