import * as util from "../../common/util";


const { ccclass, property } = cc._decorator;


@ccclass
export default class CsPlatListItem extends cc.Component {
    @property(cc.Label)
    nameLabel: cc.Label = undefined;

    @property(cc.Label)
    messgerLabel: cc.Label = undefined;

    @property(cc.Label)
    numLabel: cc.Label = undefined;

    @property(cc.Label)
    timeLabel: cc.Label = undefined;

    public setMessgeAction(data: { waitCount: number }) {
        let time = util.formatTimeStr('m');
        this.timeLabel.string = time;
        this.numLabel.string = data.waitCount + '人';
    }

}
