/**
 * File: ItemScript
 * 抽奖记录条目模版脚本
 */

import * as TanType from "./TanType";
import TanabataMgr from "./TanabataMgr";

const { ccclass, property } = cc._decorator;


@ccclass
export default class ItemScript extends cc.Component {
    @property(cc.Node)
    ndBG: cc.Node = undefined;

    @property(cc.Label)
    lab_date: cc.Label = undefined;

    @property(cc.Label)
    lab_UserName: cc.Label = undefined;

    @property(cc.Label)
    lab_name: cc.Label = undefined;

    @property(cc.Label)
    lab_money: cc.Label = undefined;

    @property
    mType: number = 0;

    /**
     * 半自动处理 ,前提是已在组件属性区设置过 mType 属性
     * @param data 数据
     * @param index 当前显示索引
     */
    setItem(data: any, index: number) {
        this.ndBG.active = (index % 2 == 0);
        switch (this.mType) {
            case 1: this.setItemLucky(data); break;
            case 2: this.setItemErsonal(data); break;
            case 3: this.setItemAward(data); break;
            default:
                break;
        }
    }

    /** 设置幸运玩家数据*/
    setItemLucky(data: TanType.LuckyData) {
        this.lab_date.string = this.getDateString(data.date);;
        this.lab_UserName.string = TanabataMgr.Instance.halfName(data.userName);
        this.lab_name.string = data.prizeName;
        if (data.prizeQuantity) {
            this.lab_money.string = data.prizeQuantity;
        }
        else {
            this.lab_money.string = "0";
        }
    }

    /** 设置个人记录数据*/
    setItemErsonal(data: TanType.PersonData) {
        this.lab_date.string = this.getDateString(data.date);;
        this.lab_name.string = data.prizeName;
        if (data.prizeQuantity) {
            this.lab_money.string = data.prizeQuantity;
        }
        else {
            this.lab_money.string = "0";
        }
    }

    /** 设置实物奖励数据*/
    setItemAward(data: TanType.AwardData) {
        this.lab_date.string = this.getDateString(data.date);;
        this.lab_UserName.string = TanabataMgr.Instance.halfName(data.userName);
        this.lab_name.string = data.prizeName;
        this.lab_money.string = "1";//当前指代数量
    }

    /**
     * 格式化时间
     * @param time 时间戳
     */
    getDateString(time: number) {
        let date = new Date(time);
        let y = date.getFullYear();
        let mo = date.getMonth();
        let d = date.getDate();
        let str = "" + y + "." + (mo + 1) + "." + d;
        return str;
    }
}
