const { ccclass, property } = cc._decorator;

let Decimal = window.Decimal;
@ccclass
export class Exp extends cc.Component {
    /**
     * 当前vip
     */
    @property(cc.Label)
    localVip: cc.Label = undefined;

    /**
    * 下面的提示文字vip
    */
    @property(cc.Label)
    wenziVip: cc.Label = undefined;

    /**
    * 所差金额
    */
    @property(cc.Label)
    money: cc.Label = undefined;

    /**
     * 当前经验进度
     *
     */
    @property(cc.ProgressBar)
    pbLocalExp: cc.ProgressBar = undefined;

    @property(cc.Label)
    lblMaxTip: cc.Label = undefined;

    private maxVipLevel: number;
    setMaxVipLevel(level: number) {
        this.maxVipLevel = level;
    }

    /**
     * vip进度条
     * @param curExp 当前冲了多少
     * @param limitExp 下一级差多少
     * @param level 当前vip等级
     */
    public vipMoney(curExp: string, limitExp: string, level: number) {
        this.money.string = new Decimal(limitExp).sub(curExp).toString();
        let nextVip = new Decimal(level).add(1).toNumber();
        if (nextVip > this.maxVipLevel) nextVip = this.maxVipLevel;
        this.wenziVip.string = nextVip.toString();
        this.localVip.string = level.toString();
        let progress = new Decimal(curExp).dividedBy(limitExp).toNumber()
        this.pbLocalExp.progress = progress;
        if (progress === 1) {
            this.lblMaxTip.string = "已达最大等级";
        } else {
            this.lblMaxTip.string = `${curExp}/${limitExp}`;
        }
    }
}
