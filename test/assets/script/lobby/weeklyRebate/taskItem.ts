// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class TaskItem extends cc.Component {

    @property({ type: cc.Label, tooltip: "任务名字" })
    taskName: cc.Label = null;

    @property({ type: cc.Label, tooltip: "进度" })
    scheduleLabel: cc.Label = null;


    @property({ type: cc.Label, tooltip: "活跃度" })
    activityLabel: cc.Label = null;


    @property({ type: cc.Label, tooltip: "任务描述" })
    taskContent: cc.Label = null;

    @property({ type: cc.Sprite, tooltip: "完成状态" })
    type_icon: cc.Sprite = null;


    @property({ type: [cc.SpriteFrame], tooltip: "状态纹理数组" })
    type_iconSP: Array<cc.SpriteFrame> = [];


    setData(data: any) {
        this.taskName.string = data.name;
        this.taskContent.string = data.name + "可完成";
        this.scheduleLabel.string = data.finishQuantity + "/" + data.quantity;
        this.activityLabel.string = data.activeScore;
        this.type_icon.spriteFrame = this.type_iconSP[data.status];
    }

}
