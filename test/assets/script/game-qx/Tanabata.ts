/**
 * File: Tanabata
 * 七夕活动主界面脚本
 */

import PopBasePanel from "./PopBasePanel";
import TanabataMgr from "./TanabataMgr";
import ItemScript from "./ItemScript";
import TanabataPopups from "./TanabataPopups";
import { TipsType } from "./TanType";
import { GameId } from "../common/enum";
import { showConfirm, showTip } from "../common/ui";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Tanabata extends PopBasePanel {

    /** */
    readonly JL: number = 305;

    /**跟节点 */
    @property(cc.Node)
    ndRoot: cc.Node = undefined;

    /**panel跟节点 */
    @property(cc.Node)
    panlRoot: cc.Node = undefined;

    /**开场动画 */
    @property(sp.Skeleton)
    anStart: sp.Skeleton = undefined;

    /**中奖效果*/
    @property(cc.Animation)
    anZhongJiang1: cc.Animation = undefined;

    /**灯效果 */
    @property(cc.Animation)
    anDeng: cc.Animation = undefined;

    /////////////////////////////////////////////////////////////////////////////////////////////////
    /**换图文字图库 one */
    @property(cc.SpriteFrame)
    spChangeOneLib: cc.SpriteFrame[] = [];

    /**每天换图 */
    @property(cc.Sprite)
    spChangeOne: cc.Sprite = undefined;

    /**帮助界面预制 */
    @property(cc.Prefab)
    pfTanHelp: cc.Prefab = undefined;

    /**帮助界面缓存 */
    ndHelpPanl: cc.Node = undefined;

    /**返回按钮 */
    @property(cc.Button)
    btnBank: cc.Button = undefined;

    /**帮助按钮 */
    @property(cc.Button)
    btnHelp: cc.Button = undefined;

    /**转盘指针 */
    @property(cc.Node)
    spPointer: cc.Node = undefined;

    /**抽中光晕 */
    @property(cc.Node)
    spSelect: cc.Node = undefined;

    /**转盘 */
    @property(cc.Node)
    ndZhuanpan: cc.Node = undefined;

    /**选择 */
    @property(cc.Node)
    ndselect: cc.Node = undefined;

    /**抽奖按钮 */
    @property(cc.Button)
    btnChou: cc.Button = undefined;

    /**抽奖按钮变灰的响应 */
    @property(cc.Button)
    btnUnableChou: cc.Button = undefined;

    /**转盘物品父节点 （容器） */
    @property(cc.Node)
    ndItemParent: cc.Node = undefined;

    /**转盘物品父节点 （容器） */
    @property(cc.Sprite)
    spItemArr: cc.Sprite[] = [];

    /**转盘奖励图*/
    @property(cc.SpriteFrame)
    spriteFArr: cc.SpriteFrame[] = [];

    /**转盘奖励图  没响应资源时 默认图*/
    @property(cc.SpriteFrame)
    spFDefault: cc.SpriteFrame = undefined;

    /**今日积分 */
    @property(cc.Label)
    labScore: cc.Label = undefined;

    /**当前抽奖次数 */
    @property(cc.Label)
    labCount: cc.Label = undefined;


    // @property(cc.Label)
    // labPro: cc.Label = undefined;

    //-----------滑动容器组件
    @property(cc.ScrollView)
    swTurntable1: cc.ScrollView = undefined;
    @property(cc.ScrollView)
    swTurntable2: cc.ScrollView = undefined;
    @property(cc.ScrollView)
    swTReward: cc.ScrollView = undefined;


    /**幸运玩家滑动容器 */
    @property(cc.Node)
    ndTurntableContent1: cc.Node = undefined;

    /**个人记录滑动容器 */
    @property(cc.Node)
    ndTurntableContent2: cc.Node = undefined;

    /**实物奖励滑动容器 */
    @property(cc.Node)
    ndRewardContent: cc.Node = undefined;

    /**幸运玩家背景 */
    @property(cc.Node)
    ndLuckyBg: cc.Node = undefined;

    /**幸运玩家[常态 选中态] */
    @property(cc.Node)
    ndLuckyIconArr: cc.Node[] = [];

    /**个人记录[常态 选中态] */
    @property(cc.Node)
    ndErsonalIconArr: cc.Node[] = [];

    /**个人记录背景 */
    @property(cc.Node)
    ndErsonalBg: cc.Node = undefined;

    /**幸运玩家-预制体 */
    @property(cc.Prefab)
    ndItemLucky: cc.Prefab = undefined;

    /**个人记录-预制体 */
    @property(cc.Prefab)
    ndItemErsonal: cc.Prefab = undefined;

    /**实物奖励-预制体 */
    @property(cc.Prefab)
    ndItemAward: cc.Prefab = undefined;

    /**弹窗节点 */
    @property(cc.Node)
    ndPopUpsPanel: cc.Node = undefined;

    ////////////////////////////////////

    /**转动控制 */
    timerID: any = undefined;

    /**正在抽奖旋转中 */
    isRotate: boolean = false;

    /**弹窗提示界面脚本 */
    tsc: TanabataPopups = undefined;

    /**当前选择的展示模块  0 - 幸运玩家 1-个人记录 */
    curSelectIdx: number = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        super.onLoad();

        // this.swTurntable1.enabled = false;
        this.swTurntable1.horizontal = false;
        this.swTurntable1.vertical = false;
    }

    start() {
        super.start();

        this.spSelect.active = false;

        //国庆活动不需要播放入场动画
        // if (TanabataMgr.Instance.isShowDay) {
        //     this.panlRoot.active = false;
        //     this.anStart.node.active = true;
        //     this.anStart.animation = "ruchang";
        //     this.anStart.setCompleteListener(() => {
        //         this.panlRoot.active = true;
        //         this.anStart.node.active = false;
        //     });
        // } else {
        //     this.panlRoot.active = true;
        //     this.anStart.node.active = false;
        // }
        this.panlRoot.active = true;

        TanabataMgr.Instance.tanabata_script = this;
        TanabataMgr.Instance.addExtraListeners();

        this.curSelectIdx = 0;
        this.showBtnState();
        this.showContent();

        this.rotate_init();

        this.ndPopUpsPanel.active = false;

        this.showAwardLibrary();
        this.RefreshLabel();
        this.Refresh();
        this.Refresh2();
        //换文字图
        //国庆不需要换logo
        // if (TanabataMgr.Instance.dayCount >= 1 && TanabataMgr.Instance.dayCount <= 6) {
        //     this.spChangeOne.spriteFrame = this.spChangeOneLib[TanabataMgr.Instance.dayCount - 1];
        // }
    }

    onEnable() {
        cc.log("关闭了啊。。。。。。。。。。。。。");
        TanabataMgr.Instance.curItemID = undefined;
        this.spSelect.active = false;
    }

    onDisable() {
        TanabataMgr.Instance.removeExtraListeners();

        if (this.timerID) {
            clearTimeout(this.timerID);
        }
    }

    /////////////////////////////////////////////

    /**更新抽奖按钮状态 */
    updateBtn() {
        if (TanabataMgr.Instance.remainCount <= 0) {
            if (TanabataMgr.Instance.score >= TanabataMgr.Instance.scoreArr[TanabataMgr.Instance.scoreArr.length - 1]) {
                showTip(TanabataMgr.Instance.notify[3]);
            }
            this.btnChou.interactable = false;
            this.btnUnableChou.node.active = true;
        } else {
            this.btnChou.interactable = true;
            this.btnUnableChou.node.active = false;
        }
    }

    /**显示奖励库 */
    showAwardLibrary() {
        let curLibraryKey = TanabataMgr.Instance.curLibraryKey;
        let minID = TanabataMgr.Instance.getMinID();
        let id: number;
        for (let index = 0; index < this.spItemArr.length; index++) {
            if (minID == 1) {
                id = curLibraryKey[index] - 1;
            } else {
                id = curLibraryKey[index];
            }
            if (this.spriteFArr && this.spriteFArr[id]) {
                this.spItemArr[index].spriteFrame = this.spriteFArr[id];
            }
        }
    }

    /** */
    RefreshSelect(idx: number) {
        let select;
        let nChildren = this.ndItemParent.children;
        for (let index = 0; index < nChildren.length; index++) {
            select = nChildren[index].getChildByName("select");
            if (index == idx) {
                select.active = true;
            } else {
                select.active = false;
            }
        }
    }

    /**点击抽奖 */
    clickRotate() {
        if (TanabataMgr.Instance.remainCount < 0) {
            showTip("次数不足");
            return;
        }
        TanabataMgr.Instance.doLottery();
    }

    rotateUnableTips() {
        if (TanabataMgr.Instance.remainCount <= 0) {
            if (TanabataMgr.Instance.score >= TanabataMgr.Instance.scoreArr[TanabataMgr.Instance.scoreArr.length - 1]) {
                showTip(TanabataMgr.Instance.notify[3]);
            } else {
                let confirm = showConfirm(`您当前无可用次数，请先进行游戏。`, "GO", "取消");
                confirm.okFunc = () => {
                    //TanabataMgr.Instance.tanabata_script.openTanabataPopups(false);
                    TanabataMgr.Instance.tanabata_script.closeAction();
                    TanabataMgr.Instance.lobby_script.showGameStage(GameId.BY);
                }
            }
        } else {
            this.btnUnableChou.node.active = false;
        }
    }

    //转盘打开初始化
    rotate_init() {
        this.isRotate = false;

        this.ndZhuanpan.stopAllActions();
        this.spPointer.stopAllActions();

        this.ndZhuanpan.rotation = 0;
        this.spPointer.rotation = 0;

        if (TanabataMgr.Instance.curItemID != undefined) {
            this.spSelect.active = true;
        } else {
            this.spSelect.active = false;
        }

        this.btnChou.enabled = true;

        this.btnChou.interactable = (TanabataMgr.Instance.remainCount > 0);
        this.btnUnableChou.node.active = !(TanabataMgr.Instance.remainCount > 0);
    }

    /**
     * 抽奖动画
     * @param idx
     */
    beginRotate(idx: number) {
        if (this.isRotate) {
            showTip("操作太频繁");
            return;
        }

        this.anDeng.node.active = true;
        this.anDeng.play();

        this.isRotate = true;
        this.spSelect.active = false;
        this.ndZhuanpan.stopAllActions();
        this.spPointer.stopAllActions();
        this.ndZhuanpan.rotation = 0;
        this.spPointer.rotation = 0;
        this.btnChou.enabled = false;
        this.btnChou.interactable = false;
        let a = ((idx - 1) * (360 / 10) + TanabataMgr.Instance.rotateMaxCout * 360);
        this.ndZhuanpan.runAction(cc.rotateBy(TanabataMgr.Instance.rotateTime, -a).easing(cc.easeCircleActionOut()));
        this.spPointer.runAction(cc.rotateBy(TanabataMgr.Instance.rotateTime, -a).easing(cc.easeCircleActionOut()));
        this.timerID = setTimeout(() => {
            if (TanabataMgr.Instance.hasQxStyle && TanabataMgr.Instance.isPaoTai()) {
                showTip(TanabataMgr.Instance.notify[1]);
                setTimeout(() => {
                    this.btnChou.enabled = true;
                    if (TanabataMgr.Instance.remainCount > 0) {
                        this.btnChou.interactable = true;
                    } else {
                        this.btnUnableChou.node.active = true;
                    }
                }, 1000);
            } else {
                let tipdata = TanabataMgr.Instance.getTipData(TanabataMgr.Instance.curItemID);
                this.spSelect.active = true;
                if (tipdata.type == TipsType.none) {
                    this.openTanabataPopups();
                    this.btnChou.enabled = true;
                    if (TanabataMgr.Instance.remainCount > 0) {
                        this.btnChou.interactable = true;
                    } else {
                        this.btnUnableChou.node.active = true;
                    }
                } else {
                    this.anZhongJiang1.node.active = true;
                    this.anZhongJiang1.play();
                    this.anZhongJiang1.on('finished', this.onZhongJiang.bind(this), this);
                }
            }

            this.anDeng.node.active = false;

            this.RefreshLabel();
            this.Refresh();
            this.Refresh2();

            this.isRotate = false;
        }, 5000);
    }

    //
    onZhongJiang() {
        this.openTanabataPopups();
        this.anZhongJiang1.node.active = false;
        this.btnChou.enabled = true;
        if (TanabataMgr.Instance.remainCount > 0) {
            this.btnChou.interactable = true;
        } else {
            this.btnUnableChou.node.active = true;
        }
    }

    /**刷新文本 */
    RefreshLabel() {
        this.labScore.string = TanabataMgr.Instance.score + '';
        this.labCount.string = TanabataMgr.Instance.remainCount + '';

        // this.progressBar.progress = TanabataMgr.Instance.curPro;
        // this.labPro.string = TanabataMgr.Instance.score + '';

        this.updateBtn();
    }

    /**刷新 rank */
    Refresh() {
        let info;
        let targetPrefab;
        let tchildren;
        if (this.curSelectIdx === 0) {
            info = TanabataMgr.Instance.luckyplayerList;
            targetPrefab = this.ndItemLucky;
            tchildren = this.ndTurntableContent1.children;
        } else if (this.curSelectIdx === 1) {
            info = TanabataMgr.Instance.personalRecordList;
            targetPrefab = this.ndItemErsonal;
            tchildren = this.ndTurntableContent2.children;
        }
        if (!info || info.length <= 0) {
            for (let i = 0; i < tchildren.length; ++i) {
                tchildren[i].active = false;
            }
            return;
        }
        cc.log("刷新 info = ", info);

        let count = 0;
        let item: cc.Node;
        for (let index = 0; index < info.length; index++) {
            if (tchildren[index]) {
                item = tchildren[index];
            } else {
                item = cc.instantiate(targetPrefab);
                if (this.curSelectIdx === 0) {
                    this.ndTurntableContent1.addChild(item);
                } else {
                    this.ndTurntableContent2.addChild(item);
                }
            }
            item.getComponent(ItemScript).setItem(info[index], index);
            item.active = true;
            count++;
        }

        cc.log("tchildren:" + tchildren.length + " count:" + count);
        for (let i = count; i < tchildren.length; ++i) {
            tchildren[i].active = false;
        }

        //this.swTurntable1.scrollToOffset(new cc.Vec2(0, 0));
        //this.swTurntable2.scrollToOffset(new cc.Vec2(0, 0));
    }

    /**刷新 实物奖励列表 */
    Refresh2() {
        let info = TanabataMgr.Instance.awardList;
        let tchildren = this.ndRewardContent.children;
        if (!info || info.length <= 0) {
            for (let i = 0; i < tchildren.length; ++i) {
                tchildren[i].active = false;
            }
            return;
        }
        let count = 0;
        let item: cc.Node;
        for (let index = 0; index < info.length; index++) {
            if (tchildren[index]) {
                item = tchildren[index];
            } else {
                item = cc.instantiate(this.ndItemAward);
                this.ndRewardContent.addChild(item);
            }
            item.getComponent(ItemScript).setItem(info[index], index);
            item.active = true;
            count++;
        }
        for (let i = count; i < tchildren.length; ++i) {
            tchildren[i].active = false;
        }
        this.swTReward.scrollToOffset(new cc.Vec2(0, 0));
    }

    /**
     * 显示弹窗界面
     * @param bl
     */
    openTanabataPopups(bl: boolean = true) {
        if (this.tsc) {
            if (bl) {
                this.tsc.openPanel();
            } else {
                this.tsc.btnCloseCallback();
            }
        } else {
            if (this.ndPopUpsPanel && this.ndPopUpsPanel.isValid) {
                this.tsc = this.ndPopUpsPanel.getComponent(TanabataPopups);
                if (this.tsc) {
                    if (bl) {
                        this.tsc.openPanel();
                    } else {
                        this.tsc.btnCloseCallback();
                    }
                }
            }
        }
    }


    /**显示帮助界面 */
    showhelp() {
        this.ndHelpPanl = cc.instantiate(this.pfTanHelp);
        this.ndRoot.addChild(this.ndHelpPanl, 100);
        this.ndHelpPanl.active = true;
        this.ndHelpPanl.getComponent(TanabataPopups).openPanel();
    }

    /**自关闭 */
    closeAction(cb?: Function) {
        super.closePanel(cb);

        TanabataMgr.Instance.close();
    }
    /** */
    showBtnState() {
        let bl = (this.curSelectIdx == 0);
        this.ndLuckyIconArr[0].active = !bl;
        this.ndLuckyIconArr[1].active = bl;

        this.ndErsonalIconArr[0].active = bl;
        this.ndErsonalIconArr[1].active = !bl;
    }

    /** */
    showContent() {
        this.ndLuckyBg.active = (this.curSelectIdx == 0);
        this.ndErsonalBg.active = (this.curSelectIdx != 0);

        this.swTurntable1.node.active = (this.curSelectIdx == 0);
        this.swTurntable2.node.active = (this.curSelectIdx != 0);
    }

    /**组件调用 */
    clickBtnLucky() {
        this.curSelectIdx = 0;
        this.showBtnState();
        this.showContent();

        if (!this.isRotate) {
            this.Refresh();
            TanabataMgr.Instance.getEventLotteryData();
        }
    }


    /**组件调用 */
    clickBtnErsonal() {
        this.curSelectIdx = 1;
        this.showBtnState();
        this.showContent();

        if (!this.isRotate) {
            this.Refresh();
            TanabataMgr.Instance.getEventLotteryData();
        }
    }

    /**测试1 */
    pupUpTest1() {
        //tan假数据 begin
        let minID = TanabataMgr.Instance.getMinID();
        if (TanabataMgr.Instance.curItemID == undefined) {
            TanabataMgr.Instance.curItemID = (minID == 1) ? 0 : -1;
        }
        TanabataMgr.Instance.curItemID++;

        if (TanabataMgr.Instance.curItemID > ((minID == 1) ? 10 : 9)) {
            TanabataMgr.Instance.curItemID = 0;
        }
        this.beginRotate(TanabataMgr.Instance.curItemID);
        // cc.log("--------6666-----------TanabataMgr.Instance.curItemID:",TanabataMgr.Instance.curItemID);
        //tan假数据 end
    }

    /**测试2 */
    clickTemp() {
    }
}
