
export class WeeklyRebateModel {

    actId: number = 26; //任务ID

    isGoing: number = 0; //任务开启状态
    isActive: boolean = false; //服务器是否配置返利活动
    code: number = 500;
    scoreInfo: ps.EventEventHandlerGetRebateEventInfo_ScoreInfo = undefined;
    taskInfo: any = undefined;
    cfgConditions: any = undefined;

    freeLotteryTimes: number = 0; //免费抽奖次数

    LotteryRoll: number = 0;//抽奖券

    tatterLotteryCnt: number = 0;//多余的碎片抽奖次数


    refreshTimes: number = 0; //任务剩余刷新次数

    lastRefreshDate: number = 0; //任务最后刷新时间

    isActiveLobbyRed: boolean = false; //是否需要显示大厅活动图标红点

    isSynthesis: boolean = false; //是否有道具可以合成

    isGift: boolean = false;//是否有礼包可以领取

    isChouJiang: boolean = false;//是否有可抽奖次数

    //记录之前的返点
    oldRebateRate: number = 0;

    /**
     * 设置数据，并做数据处理
     * @param data
     */
    setData(data: ps.EventEventHandlerGetRebateEventInfo) {
        this.isGift = false;
        this.isActiveLobbyRed = false;
        this.isChouJiang = false;
        this.code = data.code;
        this.scoreInfo = data.scoreInfo;
        this.taskInfo = data.taskInfo;
        this.cfgConditions = data.cfgConditions;
        this.freeLotteryTimes = data.scoreInfo.freeLotteryTimes;
        this.LotteryRoll = data.scoreInfo.lotteryRoll;
        this.tatterLotteryCnt = data.scoreInfo.tatterLotteryCnt;
        this.refreshTimes = data.scoreInfo.refreshTimes;
        this.lastRefreshDate = data.scoreInfo.lastRefreshDate || 0;
        if (!!data.scoreInfo) {
            if ((data.scoreInfo.skinTatterCnt >= 30 && data.scoreInfo.hasSkin === 0) || (data.scoreInfo.avatarBoxTatterCnt >= 30 && data.scoreInfo.hasAvatarBox === 0)) {
                //此时有可以合成的道具
                this.isSynthesis = true;
            } else this.isSynthesis = false;
        }

        if (!!data.cfgConditions) {
            for (let index = 0; index < data.cfgConditions.length; index++) {
                const element = data.cfgConditions[index];
                if (element.get === 0 && +element.activeScore <= data.scoreInfo.activeScore) {
                    this.isGift = true;
                    break;
                }
            }
        }

        if (this.isGift || this.isSynthesis || this.freeLotteryTimes > 0 || this.LotteryRoll >= 5 || this.tatterLotteryCnt > 0) {
            this.isActiveLobbyRed = true;
        }
        if (this.freeLotteryTimes > 0 || this.LotteryRoll >= 5 || this.tatterLotteryCnt > 0) {
            this.isChouJiang = true;
        }
    }



    /**
     * 任务是否全部完成
     */
    theTaskIsAllCompleted(): boolean {

        for (let index = 0; index < this.taskInfo.length; index++) {
            let element = this.taskInfo[index];
            if (element.status === 0) {//任务还没有完成
                return false;
            }
        }
        return true;
    }





    private static _instance: WeeklyRebateModel;
    public static instance(): WeeklyRebateModel {
        if (!this._instance) {
            this._instance = new WeeklyRebateModel();
        }
        return this._instance;
    }

}
