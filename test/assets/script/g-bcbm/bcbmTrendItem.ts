import BCBMCarLog from "./bcbmCarLog";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BCBMTrendItem extends cc.Component {
    @property(cc.Node)
    log1: cc.Node = undefined;//奔驰（大）

    @property(cc.Node)
    log2: cc.Node = undefined;//宝马（大）

    @property(cc.Node)
    log3: cc.Node = undefined;//奥迪（大）

    @property(cc.Node)
    log4: cc.Node = undefined;//大众（大）

    @property(cc.Node)
    log5: cc.Node = undefined;//奔驰（小）

    @property(cc.Node)
    log6: cc.Node = undefined;//宝马（小）

    @property(cc.Node)
    log7: cc.Node = undefined;//奥迪（小）

    @property(cc.Node)
    log8: cc.Node = undefined;//大众（小）

    @property(cc.Node)
    lbCount: cc.Node = undefined;

    private curentIndex: number = 0;
    showTitleNumber(num: number): void {
        this.lbCount.active = true;
        this.lbCount.getComponent(cc.Label).string = (num + 1) + "";
    }

    /**
     *
     * @param data
     * {"1": 0, "2": 0, "3": 0, "4": 0,"5": 0, "6": 0, "7": 0, "8": 0,record: ps.LocInfo, isDraw: false}
     */
    showCarLog(data: any): void {
        for (let key in data) {
            if (key.length == 1) {
                let script: BCBMCarLog = this[`log${key}`].getComponent(BCBMCarLog);
                if (data[key] == 0) {
                    this.curentIndex = Number(key);
                    script.showCarLog(data.record);
                }
                else {
                    script.showNumber(data[key]);
                }
            }
        }
    }

    /**
     * 获取中奖车标坐标
     */
    getCurrentLogPos(): cc.Vec2 {
        return new cc.Vec2(this.node.x, this[`log${this.curentIndex}`].parent.getPosition().y);
    }
}