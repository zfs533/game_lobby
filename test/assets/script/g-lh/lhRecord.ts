const { ccclass, property } = cc._decorator;

const MAX_RECORD_CNT = 20;

@ccclass
export default class LhRecord extends cc.Component {
    @property(cc.Node)
    private nCircleMgr: cc.Node = undefined;

    @property(cc.Node)
    private nItem: cc.Node = undefined;

    @property([cc.SpriteFrame])
    private sfCircle: cc.SpriteFrame[] = [];

    private records: number[] = [];

    onLoad() {
        this.records = [];
        this.updateRecord();
    }

    setRecord(records: number[]) {
        this.records = records;
        this.updateRecord();
    }

    updateRecord() {
        let circleArr = this.nCircleMgr.children;

        let recordsLength = this.records.length;
        // 主界面的胜负记录是有限的
        let lastRecords = (recordsLength > MAX_RECORD_CNT) ? this.records.slice(recordsLength - MAX_RECORD_CNT, recordsLength) : this.records.concat();
        lastRecords.reverse();

        // 牌型记录比胜负记录少，所以取末尾的胜负记录来显示牌型记录
        for (let idx = 0; idx < MAX_RECORD_CNT; idx++) {
            let circle;
            if (idx < circleArr.length) {
                circle = circleArr[idx]
            } else {
                circle = cc.instantiate(this.nItem);
                this.nCircleMgr.addChild(circle);
                circle.active = true;
            }
            let sprite = circle.getComponent(cc.Sprite);
            sprite.spriteFrame = this.sfCircle[lastRecords[idx]];
        }
    }
}