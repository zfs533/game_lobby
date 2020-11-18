import * as util from "../common/util";

const { ccclass, property } = cc._decorator;
interface ListMsg {
    date?: number, //当前时间
    msg?: string, //消息
    number?: number, //排队序号
    type?: number //消息类型
}

@ccclass
export default class ListItem extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = undefined;

    @property(cc.Label)
    messgerLabel: cc.Label = undefined;

    @property(cc.Label)
    numLabel: cc.Label = undefined;

    @property(cc.Label)
    timeLabel: cc.Label = undefined;

    public setMessgeAction(data: ListMsg) {
        let time = util.formatTimeStr('m', data.date);
        this.timeLabel.string = time;
        this.numLabel.string = data.number + '人';
    }

}
