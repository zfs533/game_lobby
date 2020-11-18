import ActivityModel, { ActivityBtnData, EventType } from "../lobby/activityModel";
import { WeeklyRebateModel } from "../lobby/weeklyRebate/weeklyRebateModel";
import ActivityPanel from "./activityPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActivityBtnItem extends cc.Component {

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.Label)
    title1: cc.Label = null;

    @property(cc.Node)
    normal: cc.Node = null;

    @property(cc.Node)
    select: cc.Node = null;

    @property(cc.Node)
    redPoint: cc.Node = null;

    public data: ActivityBtnData = null

    private activityPanel: ActivityPanel = null;

    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.activityPanel.onEvtActivityItemChangeStatus(this.data);
        });
        this.redPoint.active = false;
    }

    setData(data: ActivityBtnData, actPanel: ActivityPanel) {
        this.activityPanel = actPanel;
        this.data = data;
        this.title.string = data.title;
        this.title1.string = data.title;
        this.handleRedTips(data);
    }

    /**
     * 处理红点提示
     * @param data
     */
    handleRedTips(data: ActivityBtnData) {
        if (data.originData.eventType == EventType.waterRebate) {
            if (WeeklyRebateModel.instance().isActiveLobbyRed) {
                this.redPoint.active = true;
            }
            else {
                this.redPoint.active = false;
            }
        }
    }

    changeStatus(isSelect: boolean) {
        this.select.active = isSelect;
        this.normal.active = !isSelect;
    }

    getIdx(): number {
        return this.data.idx;
    }
}
