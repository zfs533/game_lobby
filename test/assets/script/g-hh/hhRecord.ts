import { Shape, SHAPE_NAME } from "./hhGame";

const MAX_RECORD_CNT = 20;

const { ccclass, property } = cc._decorator;
@ccclass
export default class HHRecord extends cc.Component {
    @property(cc.Node)
    private nodeCircleMgr: cc.Node = undefined;

    @property(cc.Node)
    private winItem: cc.Node = undefined;

    @property(cc.Node)
    private nodeShapeMgr: cc.Node = undefined;

    @property(cc.Node)
    private shapeItem: cc.Node = undefined;

    @property([cc.SpriteFrame])
    private sfCircle: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    private sfShapeBg: cc.SpriteFrame[] = [];

    private records: ps.Hh_EnterBalance_WinLoseInfo[] = [];

    setRecord(records: ps.Hh_EnterBalance_WinLoseInfo[]) {
        this.records = records;
        this.updateRecord();
    }

    updateRecord() {
        let circleArr = this.nodeCircleMgr.children;
        let shapeArr = this.nodeShapeMgr.children;

        let recordsLength = this.records.length;
        // 主界面的胜负记录是有限的
        let lastRecords = (recordsLength > MAX_RECORD_CNT) ? this.records.slice(recordsLength - MAX_RECORD_CNT, recordsLength) : this.records.concat();
        lastRecords.reverse();
        //console.log("lastRecord:  ", lastRecords);
        // 牌型记录比胜负记录少，所以取末尾的胜负记录来显示牌型记录
        let shapeNum = 0;
        for (let idx = 0; idx < lastRecords.length; idx++) {
            let record = lastRecords[idx];
            //console.log("record:  ", record);

            // 记录红黑输赢
            let circle: cc.Node;
            //console.log("circle  idx: n%, circleArr.length: n%  ", idx, circleArr.length);
            if (idx < circleArr.length) {
                circle = circleArr[idx]
            } else {
                circle = cc.instantiate(this.winItem);
                this.nodeCircleMgr.addChild(circle);
                circle.setPosition(0, 0);
            }
            circle.active = true;
            let sprite = circle.getComponent(cc.Sprite);
            sprite.spriteFrame = (record.redWin === 1) ? this.sfCircle[1] : this.sfCircle[0];

            // 记录牌型
            //console.log("shape  idx: d%, circleArr.length: d%  ", idx, shapeArr.length);
            if (idx < shapeArr.length) {
                let shape = shapeArr[shapeNum];
                let labColor: cc.Color;
                let shapeBg: cc.SpriteFrame;
                if (record.winShape < Shape.ShapePairSmall) {
                    labColor = (new cc.Color).fromHEX("#b38f43");
                    shapeBg = this.sfShapeBg[0];
                } else {
                    labColor = (new cc.Color).fromHEX("#693d23");
                    shapeBg = this.sfShapeBg[1];
                }

                if (labColor && shapeBg) {
                    shape.active = true;
                    let lab = shape.getComponentInChildren(cc.Label);
                    let sprite = shape.getComponent(cc.Sprite);
                    lab.string = SHAPE_NAME[record.winShape];
                    sprite.spriteFrame = shapeBg;
                    shapeNum += 1;

                    shape.stopAllActions();
                    shape.setScale(1, 1);
                    if (idx === 0) {
                        let actions = cc.sequence(
                            cc.scaleTo(0.8, 1.2, 1.2).easing(cc.easeBackOut()),
                            cc.scaleTo(0.2, 1, 1),
                        )
                        // shape.runAction(actions);
                        cc.tween(shape).then(actions).start();
                    }
                }
            }


        }
    }
}