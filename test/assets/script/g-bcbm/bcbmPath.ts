import BCBMCarLog from "./bcbmCarLog";
import { genAreaLoctions } from "./bcbmEnum";
import g from "../g";

const { ccclass, property } = cc._decorator;
/**
 * 车辆跑道和内圈车标排版
 */
@ccclass
export default class BCBMPath extends cc.Component {

    /* 右圆心 */
    @property(cc.Node)
    centerRight: cc.Node = null;

    /* 左圆心 */
    @property(cc.Node)
    centerLeft: cc.Node = null;

    /* 车标预制体 */
    @property(cc.Prefab)
    preRoadCarLog: cc.Prefab = null;

    /* 跑道坐标list */
    private pathArr: any[] = [];

    /* 圆心坐标 */
    private vectRight: cc.Vec2;
    private vectLeft: cc.Vec2;

    /* 32个车标信息 */
    private locList: ps.LocInfo[] = [];


    onLoad() {
        this.initProperty();
    }

    initProperty() {
        this.setRoadPosition();
        for (let i = 0; i < 32; i++) {
            let child = this.node.getChildByName(`p${i} copy`);
            let v2: cc.Vec2 = new cc.Vec2(child.x, child.y);
            this.pathArr.push(v2);
        }
        this.vectRight = new cc.Vec2(this.centerRight.x, this.centerRight.y);
        this.vectLeft = new cc.Vec2(this.centerLeft.x, this.centerLeft.y);
    }

    start() {
        this.createBaseCarLog();

        //test
        this.scheduleOnce(() => {
            let list = genAreaLoctions();
            this.setCarLog(list);
        }, 1);
    }

    /**
     * 生成车辆赛道坐标list
     */
    setRoadPosition() {
        /* top6 -> left10 -> bottom6 -> right10 */
        let btm0 = this.node.getChildByName("btm0");
        let btm1 = this.node.getChildByName("btm1");
        let gap = 0;

        /* right */
        let offset = -50;
        let centerX = btm1.x - offset / 8;
        let centerY = 0;
        let R = 160 - offset;
        console.log("right---");
        console.log(centerX, centerY);
        this.centerRight.setPosition(centerX, centerY);
        gap = 180 / 9
        for (let i = 0; i < 10; i++) {//5-15
            let tLog = this.node.getChildByName(`p${(9 - i) + 6} copy`);
            let rota: number = 0;
            rota = (-90 + (i) * gap) * Math.PI / 180;

            let x = R * Math.cos(rota) + centerX;
            let y = R * Math.sin(rota) + centerY;
            tLog.setPosition(x, y);
        }

        /* left */
        centerX = btm0.x + offset / 8;
        console.log("left---");
        console.log(centerX, centerY);
        this.centerLeft.setPosition(centerX, centerY);
        for (let i = 0; i < 10; i++) {//21-31
            let tLog = this.node.getChildByName(`p${(9 - i) + 22} copy`);
            // tLog.active = true;
            let rota: number = (90 + (i) * gap) * Math.PI / 180;
            let x = R * Math.cos(rota) + centerX;
            let y = R * Math.sin(rota) + centerY;
            tLog.setPosition(x, y);
        }

        let l = gap * Math.PI * R / 180;
        /* top */
        let top0 = this.node.getChildByName("top0");
        // gap = l;
        gap = 55.85;
        for (let i = 0; i < 6; i++) {//0-5
            let preLog = this.node.getChildByName(`p${i} copy`);
            // preLog.active = true;
            preLog.opacity = 150;
            preLog.setPosition(top0.x + (i + 1) * gap, 160 - offset);
        }

        /* bottom */
        for (let i = 0; i < 6; i++) {//16-20
            let preLog = this.node.getChildByName(`p${(5 - i) + 16} copy`);
            // preLog.active = true;
            // preLog.opacity = 150;
            preLog.setPosition(top0.x + (i + 1) * gap, -160 + offset);
        }
    }

    /**
     * 32个车标排列
     */
    createBaseCarLog() {
        /* top6 -> right10 -> bottom6 -> left10 */
        let btm0 = this.node.getChildByName("btm0");
        let btm1 = this.node.getChildByName("btm1");
        let gap = 0;
        let scale = 0.95;

        /* right */
        let centerX = btm1.x;
        let centerY = 0;
        let offset = 0;
        let R = 160 - offset;
        gap = 180 / 9
        for (let i = 0; i < 10; i++) {//6-15
            let tLog: cc.Node = cc.instantiate(this.preRoadCarLog);
            this.node.addChild(tLog, 0, `carlog${(9 - i) + 6}`);
            tLog.scale = scale;
            let rota: number = (-90 + (i) * gap) * Math.PI / 180;
            let x = R * Math.cos(rota) + centerX;
            let y = R * Math.sin(rota) + centerY;
            tLog.setPosition(x, y);
        }

        /* left */
        centerX = btm0.x;
        for (let i = 0; i < 10; i++) {//22-31
            let tLog: cc.Node = cc.instantiate(this.preRoadCarLog);
            this.node.addChild(tLog, 0, `carlog${(9 - i) + 22}`);
            tLog.scale = scale;
            let rota: number = (90 + (i) * gap) * Math.PI / 180;
            let x = R * Math.cos(rota) + centerX;
            let y = R * Math.sin(rota) + centerY;
            tLog.setPosition(x, y);
        }
        let l = gap * Math.PI * R / 180;

        /* top */
        let top0 = this.node.getChildByName("top0");
        gap = l;
        for (let i = 0; i < 6; i++) { //0-5
            let preLog: cc.Node = cc.instantiate(this.preRoadCarLog);
            preLog.setPosition(top0.x + offset / 2 + (i + 1) * gap, 160 - offset);
            this.node.addChild(preLog, 0, `carlog${i}`);
            preLog.scale = scale;
        }

        /* bottom */
        for (let i = 0; i < 6; i++) {//16-21
            let preLog: cc.Node = cc.instantiate(this.preRoadCarLog);
            preLog.setPosition(top0.x + offset / 2 + (i + 1) * gap, -160 + offset);
            this.node.addChild(preLog, 0, `carlog${(5 - i) + 16}`);
            preLog.scale = scale;
        }
        // console.log(`中间长度=> ${Math.abs(btm0.x - btm1.x)}`);
        // console.log(`圆半径 => ${R}`);
        // console.log(`车标间距=> ${l}`);
    }

    /**
     * 获取车子赛道坐标list
     */
    public getPaths(): any[] {
        return this.pathArr;
    }

    /**
     *  模拟甩尾
     * @param index
     */
    // public getCarRotation(index: number, acbol: boolean): number {
    //     let pVect: cc.Vec2 = this.pathArr[index];
    //     let angle = 0;
    //     if (index > 0 && index < 16) {
    //         if (index < 12 && index > 7 && acbol) {
    //             angle = Math.atan2(pVect.x - this.vectLeft.x, pVect.y - this.vectLeft.y);
    //         }
    //         else {
    //             angle = Math.atan2(pVect.x - this.vectRight.x, pVect.y - this.vectRight.y);
    //         }
    //     }
    //     else {
    //         if (index > 23 && index < 27 && acbol) {
    //             angle = Math.atan2(pVect.x - this.vectRight.x, pVect.y - this.vectRight.y);
    //         }
    //         else {
    //             angle = Math.atan2(pVect.x - this.vectLeft.x, pVect.y - this.vectLeft.y);
    //         }
    //     }
    //     let rotation: number = angle * 180 / Math.PI;
    //     if (index >= 16 && index <= 21) {
    //         rotation = 180;
    //     }
    //     if (index <= 5) {
    //         rotation = 0;
    //     }
    //     this.setLightColor(index);
    //     return rotation;
    // }

    /**
    * 普通跑(预留)
    * @param index
    */
    public getCarRotation(index: number): number {
        let pVect: cc.Vec2 = this.pathArr[index];
        let angle = 0;
        if (index > 0 && index < 16) {
            angle = Math.atan2(pVect.x - this.vectRight.x, pVect.y - this.vectRight.y);
        }
        else {
            angle = Math.atan2(pVect.x - this.vectLeft.x, pVect.y - this.vectLeft.y);
        }
        let rotation: number = angle * 180 / Math.PI;
        if (index >= 16 && index <= 21) {
            rotation = 180;
        }
        if (index <= 5) {
            rotation = 0;
        }
        this.setLightColor(index);
        return rotation;
    }

    /**
     * 隐藏， 亮起当前路过车标
     * @param index
     */
    setLightColor(index: number) {
        for (let i = 0; i < 32; i++) {
            let bcbmCarLog: BCBMCarLog = this.node.getChildByName(`carlog${i}`).getComponent(BCBMCarLog);
            bcbmCarLog.hideLight();
        }
        let idx = index;
        let bcbmCarLog: BCBMCarLog = this.node.getChildByName(`carlog${idx}`).getComponent(BCBMCarLog);
        bcbmCarLog.setLight();
    }

    /**
     * 亮起中奖车标
     * @param index
     */
    setWinEffect(index: number) {
        let bcbmCarLog: BCBMCarLog = this.node.getChildByName(`carlog${index}`).getComponent(BCBMCarLog);
        bcbmCarLog.setEffect();
    }

    hideWinEffect() {
        for (let i = 0; i < 32; i++) {
            let bcbmCarLog: BCBMCarLog = this.node.getChildByName(`carlog${i}`).getComponent(BCBMCarLog);
            bcbmCarLog.hideLight();
        }
    }

    /**
     * 设置车标信息
     * @param locs
     */
    setCarLog(locs: ps.LocInfo[]): void {
        this.locList = locs;
        for (let i = 0; i < locs.length; i++) {
            let index = i;
            let bcbmCarLog: BCBMCarLog = this.node.getChildByName(`carlog${index}`).getComponent(BCBMCarLog);
            bcbmCarLog.setLogInfo(locs[i], true, true);
        }
    }

    /**
     * 根据中奖位置，获取车辆停止终点位置
     * @param loc
     */
    getDistinationLoc(loc: number): number {
        let num = 0;
        if (!this.locList || this.locList.length < 1) { return loc }
        for (let i = 0; i < this.locList.length; i++) {
            let item = this.locList[i];
            if (item.loc == loc) {
                num = i;
                break;
            }
        }
        return num;
    }

    /**
     * 获取车标类型（大标，小标）
     * @param loc
     */
    getCarLogType(loc: number): number {
        let num = 0;
        if (!this.locList || this.locList.length < 1) { return loc }
        for (let i = 0; i < this.locList.length; i++) {
            let item = this.locList[i];
            if (item.loc == loc) {
                num = item.area;
                break;
            }
        }
        return num;
    }
}

/**
 * 普通跑(预留)
 * @param index
 */
// public getCarRotation(index: number): number {
//     let pVect: cc.Vec2 = this.pathArr[index];
//     let angle = 0;
//     if (index > 0 && index < 16) {
//         angle = Math.atan2(pVect.x - this.vectRight.x, pVect.y - this.vectRight.y);
//     }
//     else {
//         angle = Math.atan2(pVect.x - this.vectLeft.x, pVect.y - this.vectLeft.y);
//     }
//     let rotation: number = angle * 180 / Math.PI;
//     console.log(index, rotation);
//     if (index >= 16 && index <= 21) {
//         rotation = 180;
//     }
//     if (index <= 5) {
//         rotation = 0;
//     }
//     this.setLightColor(index);
//     return rotation;
// }