/**
 * File: TanabataPopups
 * 弹窗界面脚本
 */

import { TipsType, QixiPrizeType } from "./TanType";
import TanabataMgr from "./TanabataMgr";
import PopBasePanel from "./PopBasePanel";
import { GameId } from "../common/enum";


const { ccclass, property } = cc._decorator;

/**节点型界面控制 */
@ccclass
export default class TanabataPopups extends PopBasePanel {

    @property(cc.Node)
    protected btnClose: cc.Button = undefined;

    @property(cc.RichText)
    labGo: cc.RichText = undefined;
    @property(cc.Button)
    btnGo: cc.Button = undefined;

    @property(cc.RichText)
    labTip: cc.RichText = undefined;

    @property(cc.RichText)
    prizeTip: cc.RichText = undefined;

    @property(cc.Animation)
    animBoo: cc.Animation = undefined;

    //------------------
    /**炮台皮肤字样 */
    @property(cc.Node)
    ndPaotai: cc.Node = undefined;
    /**icon */
    @property(cc.Sprite)
    spAwardImg: cc.Sprite = undefined;
    /**icon perent */
    @property(cc.Node)
    spAwardRoot: cc.Node = undefined;



    // LIFE-CYCLE CALLBACKS:


    //////////////////////////////

    /**更新界面显示 */
    updateSet() {
        if (TanabataMgr.Instance.curItemID == undefined || !this.spAwardImg) {
            return;
        }
        let cfg = TanabataMgr.Instance.getTipData(TanabataMgr.Instance.curItemID);
        cc.log("---------updateSet--cfg----------:", cfg);

        this.labTip.string = "";
        if (cfg.type == TipsType.none) {//未中奖
            this.animBoo.node.active = false;
            let str = TanabataMgr.Instance.getTipsString();
            this.labTip.string = str;
            this.spAwardRoot.active = false;
        } else {
            this.animBoo.node.active = true;
            this.spAwardImg.spriteFrame = TanabataMgr.Instance.tanabata_script.spriteFArr[cfg.id - 1];
            if (cfg.type == TipsType.gold) {
                cc.log("是金币啊");
                this.prizeTip.string = "金币X" + cfg.quantity;
            }
            else {
                cc.log("不是金币啊");
                this.prizeTip.string = "";
            }
            this.spAwardRoot.active = true;
        }

        let isPao = TanabataMgr.Instance.isPaoTai();
        this.ndPaotai.active = false;//isPao;
        if (isPao) {
            this.labGo.string = TanabataMgr.Instance.goNameArr[2];
            return;
        }

        // cc.log("----------------------------cfg.prizeType:",cfg.prizeType);
        switch (cfg.type) {
            case TipsType.none:
                this.labGo.string = TanabataMgr.Instance.goNameArr[2];
                break;
            case TipsType.gold:
                if (cfg.id == QixiPrizeType.gold_168) {
                    TanabataMgr.Instance.audioQx_script.playMusicRedP100();
                }
                else {
                    TanabataMgr.Instance.audioQx_script.playMusicZhongJiang();
                }
                this.labGo.string = TanabataMgr.Instance.goNameArr[0];
                break;
            case TipsType.skin:
                TanabataMgr.Instance.audioQx_script.playMusicPaoTai();
                this.labGo.string = TanabataMgr.Instance.goNameArr[2];
                break;
            case TipsType.avatarBox:
                TanabataMgr.Instance.audioQx_script.playMusicPaoTai();
                this.labGo.string = TanabataMgr.Instance.goNameArr[0];
                break;
            case TipsType.real:
                TanabataMgr.Instance.audioQx_script.playMusicZhongJiang();
                this.labGo.string = TanabataMgr.Instance.goNameArr[1];
                break;
            default:
                break;
        }
    }

    /**打开界面*/
    openPanel() {
        super.openPanel();
        if (TanabataMgr.Instance.curItemID != undefined && this.spAwardImg) {
            //刷新显示
            this.updateSet();
        }
    }

    /**任意点击关闭-组件调用 */
    btnCloseCallback() {
        if (this.isFullyOpen) {
            this.closePanel();
        }
    }

    /**跳转 */
    clickGo() {
        //关闭界面
        TanabataMgr.Instance.tanabata_script.openTanabataPopups(false);
        TanabataMgr.Instance.tanabata_script.closeAction();

        let tiptype = TanabataMgr.Instance.getTipType(TanabataMgr.Instance.curItemID);

        let isPao = TanabataMgr.Instance.isPaoTai();
        if (isPao) {
            TanabataMgr.Instance.lobby_script.showGameStage(GameId.BY);
            return;
        }
        switch (tiptype) {
            case TipsType.none:
                TanabataMgr.Instance.lobby_script.showGameStage(GameId.BY);
                return;
            case TipsType.avatarBox:
                TanabataMgr.Instance.lobby_script.onClickUser();
                break;
            case TipsType.real://找客服
                TanabataMgr.Instance.lobby_script.onClickCS();
                break;
            default:
                break;
        }

    }
}
