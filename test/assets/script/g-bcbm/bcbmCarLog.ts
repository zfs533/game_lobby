import { AreaAwardType } from "./bcbmEnum";
import g from "../g";

const { ccclass, property } = cc._decorator;
/**
 * 车标预制体
 */
@ccclass
export default class BCBMCarLog extends cc.Component {
    @property(cc.Node)
    posNode: cc.Node = undefined;

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
    redBase: cc.Node = undefined;

    @property(cc.Node)
    redLight: cc.Node = undefined;

    @property(cc.Node)
    greenBase: cc.Node = undefined;

    @property(cc.Node)
    greenLight: cc.Node = undefined;

    @property(cc.Node)
    lbCount: cc.Node = undefined;

    @property(cc.Node)
    newNode: cc.Node = undefined;

    @property(cc.Node)
    effectNode: cc.Node = undefined;

    @property(cc.Node)
    xuanzhongAnim: cc.Node = undefined;

    private logTagIndex: number = 0;

    start() {
        if (this.xuanzhongAnim) {
            this.xuanzhongAnim.active = false;
            this.xuanzhongAnim.getComponent(cc.Animation).on('finished', () => {
                this.xuanzhongAnim.active = false;
            }, this);
        }
    }

    /* 大标用红底，小标用蓝底 */
    setLogInfo(locs: ps.LocInfo, isShowBase: boolean = true, isRotate: boolean = false): void {
        this.setLogInfo2(locs, isShowBase, isRotate);
    }

    setLogInfo2(locs: ps.LocInfo, isShowBase: boolean = true, isRotate: boolean = false): void {
        this.hideLog();
        this.greenBase.active = false;
        this.redBase.active = false;
        let index = 1;
        if (locs.area < 5) {
            this.redBase.active = true;
        }
        else {
            this.greenBase.active = true;
        }
        index = locs.area;
        this.logTagIndex = index;
        this[`log${index}`].active = true;
        if (!isShowBase) {
            this.greenBase.active = false;
            this.redBase.active = false;
        }

        if (locs.loc >= 16 && locs.loc <= 23 && isShowBase) {
            //bottom
            this.posNode.y = 2;
        }
    }

    hideLog(): void {
        for (let i = 1; i < 9; i++) {
            this[`log${i}`].active = false;
        }
        //this.redBase.active = false;
        //this.redLight.active = false;
        //this.greenBase.active = false;
        //this.greenLight.active = false;
    }

    setLight(): void {
        if (this.logTagIndex < 5) {
            //this.redLight.active = true;
        }
        else {
            //this.greenLight.active = true;;
        }
        this.xuanzhongAnim.active = true;
        this.xuanzhongAnim.getComponent(cc.Animation).play("Anim_Xuanzhong");
    }

    hideLight(): void {
        //this.greenLight.active = false;
        //this.redLight.active = false;
        this.effectNode.active = false;
    }

    /**
     *记录和走势里面的调用
    */
    showNumber(num: number): void {
        this.hideLog();
        this.lbCount.active = true;
        this.lbCount.getComponent(cc.Label).string = num + "";
    }

    showCarLog(locs: ps.LocInfo): void {
        this.lbCount.active = false;
        this.setLogInfo(locs, false);
    }

    setEffect() {
        this.effectNode.active = true;
        //this.greenLight.active = false;
        //this.redLight.active = false;
    }

    setNewNodeTag(bool: boolean) {
        // this.newNode.active = bool;
        this.newNode.active = false;
    }
}