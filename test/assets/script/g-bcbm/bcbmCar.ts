import BCBMPath from "./bcbmPath";
import BCBMGame from "./bcbmGame";
import { showTip } from "../common/ui";
import g from "../g";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BCBMCar extends cc.Component {

    @property(cc.Node)
    body: cc.Node = null;

    @property(BCBMPath)
    cpath: BCBMPath = null;

    @property(cc.Node)
    normalCar: cc.Node = null;

    @property(cc.Node)
    speedCar: cc.Node = null;

    @property(cc.Node)
    normalEff: cc.Node = null;

    @property(cc.Node)
    speedEff: cc.Node = null;

    @property(cc.Node)
    startEff: cc.Node = null;





    private speed: number = 0;
    public isStart: boolean = true;
    private speedBase: number = 0;
    // private maxSpeed: number = 5;
    // private gap: number = 10;
    private maxSpeed: number = 1;
    private gap: number = 2;
    /* 跑的圈数 */
    private ringCount: number = 0;
    private posCount: number = 0;
    /* 计算一圈多少个点的中间变量，保证最后减速有20个点 */
    private ringGap: number = 0;
    private count: number = 0;
    /* 计算起步后走了多少个点，用于控制车子特效切换 */
    private roadCount: number = 0;
    /* 上一轮停留的终点，作为下一轮开始的起点 */
    private end1: number = 0;
    private end2: number = 1;
    /* 中奖车标位置 */
    private resultLoc: number = 0;
    private resultLocFu: number = 0;
    private resultArea: number = 0;
    private game: BCBMGame;
    private isChoumaNodeBack: boolean = false;

    start() {
        let pathArr: any[] = this.cpath.getPaths();
        this.node.setPosition(pathArr[18].x, pathArr[18].y);
        this.node.rotation = 180;
        this.end1 = 18;
        this.end2 = 19;

        this.normalCar.active = true;
        this.speedCar.active = false;
        this.normalEff.active = false;
        this.startEff.active = false;
    }

    init(game: BCBMGame) {
        this.game = game;
    }

    /**
     * 设置中奖结果，车辆最终落点
     * @param loc 车辆停止位置
     * @param area 中奖区域
     */
    public setInfo(loc: number, area: number): void {
        this.resultLocFu = loc;
        this.resultLoc = this.cpath.getDistinationLoc(loc);
        console.log(`loc===> ${loc}   resultLoc===> ${this.resultLoc}`)
        this.resultArea = area - 1;
    }

    private testcount = 1;

    /**
     * @param {iscut:boolean} 处理重连回来跑车
     */
    public startGo(iscut: boolean = false) {
        this.maxSpeed = iscut ? 0.2 : 1;
        this.gap = iscut ? 0.5 : 2;
        // this.resultLoc = Math.ceil(Math.random() * 31);
        this.count = this.end1;
        this.roadCount = 0;
        this.isChoumaNodeBack = false;
        this.posCount = 0;
        this.ringCount = 0;
        this.speedBase = 20;
        this.isStart = true;
        this.culculateDistance();
        let pathArr: any[] = this.cpath.getPaths();
        this.node.stopAllActions();
        this.startMove(pathArr, this.end1, this.end2);
    }

    /**
     * 递归跑车
     * @param pathArr
     * @param start
     * @param next
     */
    private startMove(pathArr: cc.Vec2[], start: number, next: number): void {
        let distance = pathArr[start].sub(pathArr[next]).mag();
        this.culculateDistance();
        let speed = this.speed;
        let time = distance / speed;

        /* 入弯甩尾减速 */
        // let ss = start + 1 >= pathArr.length ? 0 : start + 1;
        // let arr = [8, 9, 10, 11, 24, 24, 25, 26]
        // let bol = arr.find(item => { return item == ss })
        // let acbol = this.normalEff.active || this.speedCar.active;

        // let moveTo = cc.moveTo(time, pathArr[next]);
        // if (bol && acbol) {
        //     time += time / 2;
        //     let gap = 0;
        //     moveTo = cc.moveTo(time, pathArr[next].x + gap, pathArr[next].y + gap);
        //     if (ss > 20) {
        //         moveTo = cc.moveTo(time, pathArr[next].x - gap, pathArr[next].y - gap);
        //     }
        //     this.speedEff.getChildByName("Fire").getComponent(cc.ParticleSystem).speed = 100;
        //     this.speedEff.getChildByName("Smoke").getComponent(cc.ParticleSystem).speed = 100;
        //     this.speedEff.getChildByName("Particle").getComponent(cc.ParticleSystem).speed = 100;
        // }
        // else {
        //     this.speedEff.getChildByName("Fire").getComponent(cc.ParticleSystem).speed = 400;
        //     this.speedEff.getChildByName("Smoke").getComponent(cc.ParticleSystem).speed = 400;
        //     this.speedEff.getChildByName("Particle").getComponent(cc.ParticleSystem).speed = 400;
        // }
        /* end */

        let moveTo = cc.moveTo(time, pathArr[next]);
        if (this.isStart) {
            moveTo = cc.moveTo(time, pathArr[next]).easing(cc.easeBackIn());
            this.isStart = false;
            this.speedBase /= 4;
        }
        else {
            this.controlSpeed();
        }
        this.controlCarEffect();
        let s1 = start + 1 >= pathArr.length ? 0 : start + 1;
        let s2 = next + 1 >= pathArr.length ? 0 : next + 1;
        // let rotation = this.cpath.getCarRotation(s1, acbol);
        let rotation = this.cpath.getCarRotation(s1);
        let rotateTo = cc.rotateTo(time, rotation);
        let spaw = cc.spawn(moveTo, rotateTo);
        let callbkc = cc.callFunc(() => {
            this.count++;
            if (this.count == pathArr.length && this.ringCount < 2) {
                this.count = 0;
                this.ringCount++;
            }
            else if (this.ringCount == 2) {
                /* 根据结果计算最后一圈的偏移 */
                if (this.culculateRingGap()) {
                    if (this.count == pathArr.length - this.ringGap) {
                        this.count = 0;
                        this.ringCount++
                    }
                }
                else {
                    if (this.count == pathArr.length) {
                        this.count = 0;
                        this.ringCount++;
                    }
                }
            }
            if (this.ringCount >= 3) {
                if (s1 == this.resultLoc) {
                    this.end1 = s1;
                    this.end2 = s2;
                    if (this.game) {
                        this.game.setWinAreaEff(this.resultArea, this.resultLoc);
                        let dt: ps.LocInfo = { loc: this.resultLocFu, area: this.resultArea + 1, awardType: this.cpath.getCarLogType(this.resultLocFu) }
                        this.game.setDeskRecordList(dt);
                    }
                    console.log(`到达终点:${this.resultLoc}`)
                    return;
                }
                this.speedBase += 0.3;
                this.roadCount++;
            }
            this.startMove(pathArr, s1, s2);
        });
        cc.tween(this.node).sequence(spaw, callbkc).start();
        // this.node.runAction(cc.sequence(spaw, callbkc));
    }

    /**
     * 速度控制
     */
    private controlSpeed(): void {
        switch (this.ringCount) {
            /* 第一圈起步加速 */
            case 0:
                if (this.speedBase > this.maxSpeed + this.gap / 2) {
                    this.speedBase -= 0.3;
                }
                break;
            /* 第二圈匀速 */
            case 1:
                this.speedBase = this.maxSpeed + this.gap / 2;
                break;
            /* 第三圈超级加速*/
            case 2:
                this.game.adoMgr.playCarAdd();
                if (this.speedBase > this.maxSpeed) {
                    this.speedBase -= 0.05;
                }
                break;
            /* 第四圈隐藏加速进度条 */
            case 3:
                if (!this.isChoumaNodeBack) {
                    this.isChoumaNodeBack = true;
                    if (this.game)
                        this.game.handleChoumaNodePos();
                }
                break;
        }
    }

    /**
     * 车辆特效控制
     */
    private controlCarEffect(): void {
        if (this.ringCount < 2) {
            this.roadCount++;
        }
        if (this.roadCount > 10 && this.ringCount < 2) {
            this.normalEff.active = true;
        }
        if ((this.ringCount == 2 || this.ringCount == 1) && this.roadCount > 20) {
            if (this.ringCount == 2) {
                this.roadCount = 0;
            }
            this.normalCar.active = false;
            this.normalEff.active = false;
            this.startEff.active = false;
            this.speedCar.active = true;
        }

        if (this.ringCount == 3) {
            this.normalCar.active = true;
            this.normalEff.active = true;
            this.speedCar.active = false;
            if (this.roadCount >= 15) {
                this.game.adoMgr.stopCarAdd();
                this.game.adoMgr.playCarStop();
                this.normalEff.active = false;
            }
        }
    }

    /**
     * 起步尾气
     */
    public showStartEffect() {
        this.startEff.active = true;
    }

    /**
     *  计算当前速度
     */
    private culculateDistance(): void {
        let pathArr: cc.Vec2[] = this.cpath.getPaths();
        let dist: number = 0;
        for (let i = 0; i < pathArr.length - 1; i++) {
            let distance = pathArr[i].sub(pathArr[i + 1]).mag();
            dist += distance;
        }
        this.speed = dist / this.speedBase;
    }

    /**
     * 加速加减速位移差
     */
    private culculateRingGap(): boolean {
        this.ringGap = 20 - this.resultLoc;
        return true;
    }
}
