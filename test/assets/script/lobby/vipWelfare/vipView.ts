import PopActionBox from "../../lobby/popActionBox"
import Lobby from "../../lobby/lobby";
import VipLevel from "./viplevel"
import user from "../../common/user";
import { Exp } from "./vipExp";



let Decimal = window.Decimal;
const { ccclass, property } = cc._decorator

@ccclass
export default class VipView extends PopActionBox {
    /**
     *经验条预置体
     */
    @property(cc.Prefab)
    preVipExp: cc.Prefab = undefined;

    /**
     * vip的头像框,炮台等信息的母体
     */
    @property(cc.Node)
    ndVipPageItem: cc.Node = undefined;

    @property(cc.Node)
    ndTitle: cc.Node = undefined;

    @property(cc.PageView)
    svGame: cc.PageView = undefined;

    @property(cc.Node)
    private nodeArrowL: cc.Node = undefined;

    @property(cc.Node)
    private nodeArrowR: cc.Node = undefined;

    private toActiveL: boolean;
    private toActiveR: boolean;
    private page: number;
    private maxVipLevel: number;
    private lPageOffset: number;
    private rPageOffset: number;

    /**
     * 所有的vip等级显示
     */
    public async vipInit(data: ps.HallHallHandlerGetUserVipInfo_VipInfo) {
        this.openAnim();
        let len = data.privis.length;
        this.maxVipLevel = data.privis[len - 1].lev
        let exp: cc.Node;
        exp = this.ndTitle.getChildByName("vipExp");
        if (!exp) {
            exp = cc.instantiate(this.preVipExp);
            this.ndTitle.addChild(exp);
        }
        let vipexp: Exp = exp.getComponent("vipExp");
        vipexp.setMaxVipLevel(this.maxVipLevel);
        vipexp.vipMoney(data.curExp, data.limitExp, data.vipLevel);
        let pages = this.svGame.getPages();
        let item: cc.Node;
        for (let i = 0; i < len; i++) {
            if (pages.length <= i) {
                item = cc.instantiate(this.ndVipPageItem);
                item.setPosition(0, 0);
                item.active = true;
                this.svGame.addPage(item);
            } else {
                item = pages[i];
            }
            let vipLv = item.getComponent(VipLevel);
            let avSp = data.privis[i].avatarFrame;
            let gunSp = data.privis[i].bullet;
            let dec = data.privis[i].detail;
            let cond = data.privis[i].cond;
            vipLv.initVipBox(avSp);
            vipLv.initVipBook(gunSp);
            if (dec) vipLv.initVipMessage(dec);
            if (!cond) cond = "0";
            vipLv.initVipMoney(cond);
            vipLv.initVipLevel(data.privis[i].lev.toString())
            vipLv.setVideoId(data.privis[i].lev);
            vipLv.setGunLevel(data.privis[i].bullet);
        }
        this.page = data.vipLevel < 2 ? 0 : data.vipLevel - 1;
        this.svGame.setCurrentPageIndex(this.page);
    }

    closeAction() {
        let self = this;
        let func = () => {
            let page = user.vipLevel < 2 ? 0 : user.vipLevel - 1;
            self.svGame.scrollToPage(page, 0);
            self.svGame.node.active = false;
        }
        super.closeAction(func);
    }


    /**
    *充值界面的跳转
    */
    async onClickRecharge() {
        let nodeLobby = cc.find("lobby");
        if (!nodeLobby) {
            return;
        }
        let lobby = nodeLobby.getComponent(Lobby);
        lobby.scheduleOnce(() => {
            lobby.onClickRecharge();
        }, 0.1);
    }

    private onScrollList(s: cc.ScrollView) {
        if (this.svGame.getCurrentPageIndex() !== this.page) {
            let pages = this.svGame.getPages();
            if (this.page < this.maxVipLevel) {
                pages[this.page].getComponent(VipLevel).onClickColseVideo();
            }
            this.page = this.svGame.getCurrentPageIndex();
            let vipLv = pages[this.page].getComponent(VipLevel);
            let vipLock = this.page + 1;
            vipLv.unlockTipsCtr(vipLock.toString());
        }

        this.lPageOffset = s.getScrollOffset().x;
        this.rPageOffset = s.getMaxScrollOffset().x;
        if (this.toActiveL !== undefined && this.toActiveL !== this.lPageOffset < 0) {
            this.nodeArrowL.stopAllActions();
        }
        if (this.toActiveR !== undefined && this.toActiveR !== this.lPageOffset > -this.rPageOffset) {
            this.nodeArrowR.stopAllActions();
        }
    }

    private onClickLArrow() {
        this.page--;
        if (this.page < 0) {
            this.page = 0;
            return;
        }
        this.svGame.getPages()[this.page + 1].getComponent(VipLevel).onClickColseVideo();
        this.svGame.scrollToPage(this.page, 0.2);
        this.switchArrow(this.nodeArrowL, false);
        this.switchArrow(this.nodeArrowR, false);
    }

    private onClickRArrow() {
        this.page++;
        if (this.page > this.maxVipLevel - 1) {
            this.page = this.maxVipLevel - 1;
            return;
        }
        this.svGame.getPages()[this.page - 1].getComponent(VipLevel).onClickColseVideo();
        this.svGame.scrollToPage(this.page, 0.2);
        this.switchArrow(this.nodeArrowL, false);
        this.switchArrow(this.nodeArrowR, false);
    }

    private switchArrow(arrow: cc.Node, active: boolean) {
        if (active) {
            arrow.active = true;
            let ani: cc.Animation = arrow.getComponent(cc.Animation);
            if (arrow === this.nodeArrowR) {
                ani.play("shakeR")
            } else if (arrow === this.nodeArrowL) {
                ani.play("shakeL")
            }
        }
        // arrow.runAction(cc.sequence(
        //     cc.fadeTo(0.2, active ? 255 : 0),
        //     cc.callFunc(() => { if (!active) { arrow.active = false; } })
        // ));
        cc.tween(arrow).to(0.2, { opacity: active ? 255 : 0 })
            .call(
                () => {
                    if (!active) { arrow.active = false; }
                }
            ).start();
    }
}
