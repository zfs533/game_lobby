import { tar } from "../../../packages/hot-update-tools/core/compressing";
import user from "../common/user";
import BYGame from "./byGame";
import { getFishRateBytype } from "./byUtil";

const { ccclass, property } = cc._decorator;

export enum optionType {
    youxian = "0",//优先攻击
    suoding = "1",//锁定攻击
    tesu = "2",//特殊鱼
    cancelAll = "3",
    selectAll = "4",
}

@ccclass
export default class ByFishSmart extends cc.Component {

    @property(cc.Toggle)
    bulletToggle: cc.Toggle = undefined;

    @property(cc.EditBox)
    bulletEdit: cc.EditBox = undefined;

    @property(cc.Node)
    vip6Mask: cc.Node = undefined;

    @property(cc.Node)
    helpNode: cc.Node = undefined;

    /* 高倍鱼 */
    @property(cc.Node)
    content1: cc.Node = undefined;

    /* 低倍鱼 */
    @property(cc.Node)
    content2: cc.Node = undefined;

    private typeList: number[] = [];

    private byGm: BYGame;

    private attackType: string = "0";
    private specialList: number[] = [];
    private bulletNum: number = 0;

    onLoad() {
        this.helpNode.active = false;
        for (let i = 0; i < this.content1.children.length; i++) {
            let item = this.content1.children[i];
            item.getChildByName('lightbg').active = false;
            item.getChildByName('gougou').active = false;
            let btn = item.getChildByName("btn");
            btn.on(cc.Node.EventType.TOUCH_END, this.onclickhight, this);
        }

        for (let i = 0; i < this.content2.children.length; i++) {
            let item = this.content2.children[i];
            item.getChildByName('lightbg').getComponent(cc.Sprite).enabled = false;
            item.getChildByName('lightbg').getChildByName('gougou').active = false;
            let btn = item.getChildByName('lightbg').getChildByName('btn');
            btn.on(cc.Node.EventType.TOUCH_END, this.onclickless, this);
        }

        this.vip6Mask.active = user.vipLevel >= 6 ? false : true;
    }

    /**
     * 点击高倍鱼
     * @param evt
     */
    onclickhight(evt: cc.Event) {
        let item = evt.currentTarget.parent;
        if (item.getChildByName('lightbg').active) {
            item.getChildByName('lightbg').active = false;
            item.getChildByName('bg').active = true;
            item.getChildByName('gougou').active = false;
        }
        else {
            item.getChildByName('bg').active = false;
            item.getChildByName('lightbg').active = true;
            item.getChildByName('gougou').active = true;
        }
        this.addTypeList(item.name);
    }

    /**
     * 点击低倍鱼
     * @param evt
     */
    onclickless(evt: cc.Event) {
        let item = evt.currentTarget.parent;
        if (item.getComponent(cc.Sprite).enabled) {
            item.getComponent(cc.Sprite).enabled = false;
            item.getChildByName('gougou').active = false;
        }
        else {
            item.getComponent(cc.Sprite).enabled = true;
            item.getChildByName('gougou').active = true;
        }
        this.addTypeList(item.parent.name);
    }

    /**
     * 将所选鱼种加入列表
     * @param type
     */
    private addTypeList(type: string) {
        let tp = Number(type);
        for (let i = 0; i < this.typeList.length; i++) {
            if (this.typeList[i] == tp) {
                this.typeList.splice(i, 1);
                return;
            }
        }
        this.typeList.push(tp);
    }

    /**
     * VIP6开启功能
     */
    handleVip6Toggle(event: cc.Event) {
        console.log(this.bulletToggle.isChecked);
    }

    addBullet() {
        this.bulletNum++;
        this.bulletEdit.string = this.bulletNum.toString();
    }

    subBullet() {
        this.bulletNum--;
        this.bulletEdit.string = this.bulletNum.toString();
    }

    /**
     * 智慧捕鱼功能选择
     * @param evt
     * @param type
     */
    handleOptionToggle(evt, type: string) {
        switch (type) {
            case optionType.youxian:
                this.attackType = optionType.youxian;
                break;

            case optionType.suoding:
                this.attackType = optionType.suoding;
                break;

            case optionType.tesu:
                this.attackType = optionType.tesu;
                break;

            case optionType.cancelAll:
                this.handleAll(false);
                break;

            case optionType.selectAll:
                this.handleAll(true);
                break;

            default: break;
        }
    }

    /**
     * 全选或者全部取消
     * @param bool
     */
    handleAll(bool: boolean) {
        this.typeList.splice(0);
        for (let i = 0; i < this.content1.children.length; i++) {
            let item = this.content1.children[i];
            item.getChildByName('lightbg').active = bool;
            item.getChildByName('gougou').active = bool;
            item.getChildByName('bg').active = !bool;
            if (bool) {
                this.addTypeList(item.name);
            }
        }

        for (let i = 0; i < this.content2.children.length; i++) {
            let item = this.content2.children[i];
            item.getChildByName('lightbg').getComponent(cc.Sprite).enabled = bool;
            item.getChildByName('lightbg').getChildByName('gougou').active = bool;
            if (bool) {
                this.addTypeList(item.name);
            }
        }
    }

    /**
     * 打开帮助
     */
    openhelpUI() {
        this.helpNode.active = true;

    }

    /**
     * 打开界面动画
     * @param cb
     */
    openAnim(bGame: BYGame) {
        this.byGm = bGame;
        this.bulletEdit.string = this.byGm.bulletNum.toString();
        this.typeList.splice(0);
        this.node.active = true;
        this.node.position = cc.v3()
        let animTime = 0.3;
        this.node.scale = 0;
        let actions = cc.sequence(
            cc.scaleTo(animTime, 1, 1).easing(cc.easeBackOut()),
            cc.callFunc(() => {

            }),
        )
        cc.tween(this.node).then(actions).start();
    }

    /**
     * 关闭界面动画
     * @param cb
     */
    closeAction(cb?: Function) {
        this.typeList.sort((a, b) => { return b - a });
        this.makeSureResult();
        this.byGm.startFishSmart();
        let animTime = 0.3;
        let actions = cc.sequence(
            cc.scaleTo(animTime, 0).easing(cc.easeBackIn()),
            cc.callFunc(() => {
                this.node.active = false;
                this.node.destroy();
            }))
        cc.tween(this.node).then(actions).start();
    }

    /**
     * 确定选择结果
     */
    makeSureResult() {
        this.specialList.splice(0);
        let temp: { type: number, rate: number }[] = [];
        for (let i = 0; i < this.typeList.length; i++) {
            let item = getFishRateBytype(this.typeList[i]);
            if (this.typeList[i] == 91 || this.typeList[i] == 92 || this.typeList[i] == 94) {
                this.specialList.push(this.typeList[i]);
            }
            if (item) {
                temp.push({ type: item.type, rate: item.rate });
            }
        }
        if (this.attackType == optionType.youxian || this.attackType == optionType.suoding) {
            temp.sort((a, b) => { return b.rate - a.rate });
        }
        this.byGm.smartList = temp;
        this.byGm.speciallist = this.specialList;
        this.byGm.attackType = this.attackType;
        this.byGm.bulletNum = 0;
        if (this.bulletToggle.isChecked) {
            this.byGm.bulletNum = this.bulletNum;
        }
    }

    editboxEditingDidEnded() {
        this.bulletNum = Number(this.bulletEdit.string);
    }
};
