import { ShieldStatus } from "./shieldStatus";
import { ItemNames, Gender, GameId } from "./enum";
import Debug from "../start/debug";

class User {
    act: string;//账号
    pwd: string;
    channel: string;
    uid: number;
    avatarId: number;
    avatarFrameId: number;
    gender: Gender;
    nick: string;
    money: string;
    bankMoney: string;
    newbieBonus: string;
    bindBonus: string;
    where?: ps.Where;
    location: string;
    SSSAccount: string;
    bankAccount: string;
    shieldStatus: ShieldStatus;
    vipLevel: number;

    //动态头像
    avatarBoxList: number[] = [];

    /**
     * 是否为男性
     *
     * @readonly
     * @memberof User
     */
    get isMale() {
        return this.gender === Gender.MALE;
    }

    get shield() {
        Debug.log("user shield:" + this.shieldStatus.shield)
        return this.shieldStatus.shield;
    }

    initData(data: ps.User) {
        this.gender = data.gender;
        this.uid = data.uid;
        this.channel = data.channel;
        this.money = data.money;
        this.nick = data.name;

        if (data.act) {
            localStorage.setItem(ItemNames.account, data.act);
            this.act = data.act
        } else {
            this.act = ""
            localStorage.removeItem(ItemNames.account);
            localStorage.removeItem(ItemNames.password);
        }

        this.avatarId = data.avatar;
        this.avatarFrameId = data.avatarFrame;
        this.location = data.location;
        this.SSSAccount = data.SSSAccount;
        this.bankAccount = data.bankCardNumber;
        this.vipLevel = data.vipLevel;
        this.avatarBoxList = (data.avatarBoxList) ? data.avatarBoxList : [];
        this.initOnlyAgentRate();
    }

    /**
     * 连续只展示代理充值的时候没有充值的次数
     *
     * @type {number}
     * @memberof User
     */
    ignoreAgent: number;

    /**
     * 只展示代理充值的几率
     *
     * @type {number}
     * @memberof User
     */
    onlyAgentRate: number;

    /**
     * 减少只显示代理充值的几率值
     *
     * @type {number}
     * @memberof User
     */
    decreaseRate: number;
    /**
     * 连续只显示代理的次数
     *
     * @type {number}
     * @memberof User
     */
    onlyAgent: number;
    /**
     * 代理充值次数
     *
     * @type {number}
     * @memberof User
     */
    agentTimes: number;
    /**
     * 初始化只显示代理相关数据
     *
     * @private
     * @memberof User
     */
    private initOnlyAgentRate() {
        this.ignoreAgent = 0;
        this.onlyAgentRate = 0;
        this.decreaseRate = 0;
        this.onlyAgent = 0;
        this.agentTimes = 0;
    }
}

export default new User();