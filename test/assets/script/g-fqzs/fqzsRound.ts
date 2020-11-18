import { RoundId, rangeSize } from "./fqzsConf"
import { EventCenter } from "./EventManager";
import { FQZSRoundItem } from "./fqzsRoundItem";
import * as SpeedCanvas from "./SpeedUtil"
const { ccclass, property } = cc._decorator;



/**
 * 抽奖功能，开始动画后，停止动画给出目标点后停止。如果断网就不停止
 */

@ccclass
export class FQZSRound extends cc.Component {

    @property({ tooltip: "动画节点数组", type: [cc.Node] })
    animalNodes = []




    //////////////////////////////////////动画控制参数///////////////////////////////////////
    private roundAniConfig: SpeedCanvas.RoundConfig = null;//当前动画配置

    private cheduleCall: any = null;
    private curIndex: number = 0;//当前选中位置
    private curSpeed: number = 0;//当前速度

    //圈数3.5圈  加速/加速
    ///////////////////////////////////////////////////////////////////////////////////////////
    onLoad() {
        this.initItems();
    }
    /**
     * 测试使用，初始化抽奖界面显示
     */
    initItems() {
        for (let i = 0; i < this.animalNodes.length; i++) {
            this.animalNodes[i].getComponent(FQZSRoundItem).initItem(i)
        }
    }

    initItemsState() {
        for (let i = 0; i < this.animalNodes.length; i++) {
            this.animalNodes[i].getComponent(FQZSRoundItem).setChooseState(false)
        }
    }

    setStartItem(iconIndex: number) {
        console.log("默认的选中的位置==", iconIndex)
        if (iconIndex === undefined) {
            iconIndex = 0;
        }
        //this.initItemsState();
        this.animalNodes[iconIndex].getComponent(FQZSRoundItem).setChooseState(true)
    }

    setTartgetItem(iconIndex: number, showAni: boolean = false) {

        this.animalNodes[iconIndex].getComponent(FQZSRoundItem).setTargetChoose(showAni)
    }
    /**
     *获取时间点上的速度值，执行时间
     * @param sclie 切片索引位置
     * @param slow 是否为加速(返回值有大到小)
     */
    getSpliceTime(func: Function, sclie: number, slow: boolean) {
        let maxSclie = this.roundAniConfig.spliceCount;//最大切片
        sclie = sclie < 0 ? 0 : (sclie > maxSclie ? maxSclie : sclie)
        let perTi = sclie / maxSclie
        let point = func ? func(perTi) : SpeedCanvas.easeInCubic(perTi);
        let speed = 0;
        if (slow) {
            //由慢变快
            speed = this.roundAniConfig.littleSpeed - (this.roundAniConfig.littleSpeed - this.roundAniConfig.maxSpeed) * point;
        } else {
            //由快变慢
            speed = this.roundAniConfig.maxSpeed + (this.roundAniConfig.littleSpeed - this.roundAniConfig.maxSpeed) * point;
        }
        return speed;
    }

    /**
         *获取时间点上的速度值，一定时间后的速度
         * @param sclie 切片索引位置
         * @param slow 是否为加速(返回值有大到小)
         * @param useTime 已经使用的时间
         */
    getSpliceTimeFirst(func: Function, sclie: number, slow: boolean, useTime: number = 0) {
        let maxSclie = this.roundAniConfig.spliceCount;//最大切片
        let speed = 0;
        let runcount = 0;
        while (useTime > 0) {
            sclie = sclie < 0 ? 0 : (sclie > maxSclie ? maxSclie : sclie)
            let perTi = sclie / maxSclie
            let point = func ? func(perTi) : SpeedCanvas.easeInCubic(perTi);
            if (slow) {
                //由慢变快
                speed = this.roundAniConfig.littleSpeed - (this.roundAniConfig.littleSpeed - this.roundAniConfig.maxSpeed) * point;
            } else {
                //由快变慢
                speed = this.roundAniConfig.maxSpeed + (this.roundAniConfig.littleSpeed - this.roundAniConfig.maxSpeed) * point;
            }
            useTime -= speed;
            if (useTime > 0) {
                runcount++;
                sclie++;
            }
        }
        return {
            speed: speed,//当前的速度
            sclie: sclie,//当前的位置
            runcount: runcount,//过了几个位置
        };
    }



    setAnimationClip() {
        //清除所有的标记
        this.initItemsState();
        //随机一个动画配置
        let readinx = Math.floor(Math.random() * SpeedCanvas.RoundConfigData_length);
        this.roundAniConfig = SpeedCanvas.RoundConfigData[0]//SpeedCanvas.RoundConfigData[readinx];
    }

    /**
     *
     * @param startInx
     * @param useableTime 当前可以使用的时间
     * @param scale 当前执行动画比例
     */
    startRoundAni(startInx: number) {
        return new Promise((resolve) => {
            this.unschedule(this.cheduleCall);
            let useableTime = this.roundAniConfig.keepMaxTime;
            let times = this.roundAniConfig.startAniCount;
            let data = this.getSpliceTimeFirst(this.roundAniConfig.addSpeedRunc, times, true, 0);
            this.curSpeed = data.speed;
            times = data.sclie;
            this.curIndex = (startInx + data.runcount) % rangeSize;
            useableTime = useableTime - this.curSpeed
            this.cheduleCall = () => {
                this.showItemAnimation(this.curIndex, false);
                this.curIndex = (this.curIndex + 1) % rangeSize;
                times++
                this.curSpeed = this.getSpliceTime(this.roundAniConfig.addSpeedRunc, times, true);
                useableTime = useableTime - this.curSpeed
                if (times > this.roundAniConfig.spliceCount) {
                    if (useableTime <= 0) {
                        this.unschedule(this.cheduleCall);
                        resolve()
                        return;
                    }
                }
                this.unschedule(this.cheduleCall)
                this.schedule(this.cheduleCall, this.curSpeed);
            }
            this.schedule(this.cheduleCall, this.curSpeed);
        })
    }

    /**
     *
     * @param stopIndex
     * @param useableTime  动画剩余时间
     */
    stopRoundAnmation(stopIndex: number) {
        return new Promise((reslove) => {
            this.unschedule(this.cheduleCall);
            //计算目标点停止的位置
            let times = this.roundAniConfig.spliceCount;
            let chainx = stopIndex - (times % rangeSize)
            let indx = chainx < 0 ? chainx + rangeSize : chainx;
            let slowDown = false;
            this.curSpeed = this.roundAniConfig.maxSpeed;
            let Testtimes = 0
            this.cheduleCall = () => {
                this.curIndex = (this.curIndex + 1) % rangeSize;
                this.showItemAnimation(this.curIndex, slowDown);
                if (slowDown) {
                    Testtimes++
                    this.curSpeed = this.getSpliceTime(this.roundAniConfig.lessSpeedFunc, Testtimes, false);
                    if (Testtimes >= this.roundAniConfig.spliceCount) {
                        //console.log("max==>", Testtimes);
                        if (this.curIndex === stopIndex) {
                            this.unschedule(this.cheduleCall)
                            this.setTartgetItem(this.curIndex, true)
                            reslove();
                            return;
                        }
                    }
                }
                if (!slowDown && this.curIndex === indx) {
                    slowDown = true;
                }
                this.unschedule(this.cheduleCall)
                this.schedule(this.cheduleCall, this.curSpeed);
            }
            this.schedule(this.cheduleCall, this.curSpeed);
        })
    }


    showItemAnimation(inx: number, isLook: boolean = false) {
        let indexItem = this.animalNodes[inx];
        if (!indexItem) {
            console.warn("无此动画节点");
            return;
        }
        //通知所有的Item当前节点
        EventCenter.instance.fire("onChooseIndex", inx, isLook)
    }

    /**
     *
     * @param stayIndex停止动画
     */
    stopAllAnimation(stayIndex: number) {
        this.unschedule(this.cheduleCall)
        this.setTartgetItem(stayIndex)
        for (let i = 0; i < this.animalNodes.length; i++) {
            this.animalNodes[i].getComponent(FQZSRoundItem).showLookAt(false, 0)
        }
    }
}
