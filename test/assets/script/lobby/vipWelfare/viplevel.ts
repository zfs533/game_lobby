import { getAvatarFrame, getFort } from "../../common/ui";
import VipVideo from "./vipVideo";
import user from "../../common/user";

let Decimal = window.Decimal;
const { ccclass, property } = cc._decorator;

@ccclass
export default class VipLevel extends cc.Component {

    @property(cc.Sprite)
    vipBox: cc.Sprite = undefined;

    @property(cc.Sprite)
    vipBook: cc.Sprite = undefined;

    @property(cc.Node)
    ndVipMsgParent: cc.Node = undefined;

    @property(cc.Node)
    vipMessage: cc.Node = undefined;

    @property(cc.Label)
    vipMoney: cc.Label = undefined;

    @property(cc.Label)
    vipLevel: cc.Label = undefined;

    @property(cc.Label)
    vipUnLockLevel: cc.Label = undefined;

    /**
     * 炮台动画节点
     */
    @property(cc.Node)
    videOpos: cc.Node = undefined;

    /**
     * 炮台动画
     */
    @property(cc.Prefab)
    vipVideo: cc.Prefab = undefined;

    @property(cc.Node)
    closeBtn: cc.Node = undefined;

    private videoId: number = 0;
    private gunLevel: number = 0;

    onLoad() {
        this.videOpos.active = false;
        this.closeBtn.active = false;
        this.vipMessage.active = false;
    }

    public initVipBox(idx: number) {
        getAvatarFrame(idx, this.vipBox);
    }

    public initVipBook(idx: number) {
        if (idx > 11) idx = 11;
        if (idx < 0) idx = 0;
        this.vipBook.spriteFrame = getFort(idx);
    }

    public initVipMessage(level: string) {
        let arr;
        if (level.indexOf("<br/") < 0) {
            arr = level.split("/")
        } else {
            arr = level.split("<br/>")
        }
        // this.vipMessage.string = level;
        let item: cc.Node;
        for (let i = 0; i < arr.length; i++) {
            if (this.ndVipMsgParent.childrenCount <= i) {
                item = cc.instantiate(this.vipMessage);
                this.ndVipMsgParent.addChild(item);
            } else {
                item = this.ndVipMsgParent.children[i];
            }
            item.active = true;
            item.getChildByName("content").getComponent(cc.RichText).string = arr[i];
            item.getChildByName("idx").getComponent(cc.RichText).string = (i + 1).toString();
        }
    }
    public initVipMoney(level: string) {
        this.vipMoney.string = level;
    }

    public initVipLevel(level: string) {
        this.vipLevel.string = level;
        this.unlockTipsCtr(level);
    }

    unlockTipsCtr(level: string) {
        if (user.vipLevel >= +level) {
            this.vipUnLockLevel.node.parent.active = false;
        } else {
            this.vipUnLockLevel.node.parent.active = true;
            if (+level >= 8 && +level % 2 === 0) {    // 产品需求，重复的炮台解锁要显示上一级
                let realGunStyle = new Decimal(this.gunLevel).add(1).toNumber();
                this.initVipBook(realGunStyle);
                this.vipUnLockLevel.string = new Decimal(level).add(1).toString();
                return;
            }
        }
        this.vipUnLockLevel.string = level;
    }

    setVideoId(id: number) {
        this.videoId = id;
    }

    setGunLevel(level: number) {
        this.gunLevel = level;
    }

    onClickIntitVideo() {
        if (!this.videOpos.getChildByName("byVideo")) {
            let video = cc.instantiate(this.vipVideo);
            let videoSrc = video.getComponent(VipVideo);
            this.videOpos.addChild(video);
            if (+this.videoId >= 8 && +this.videoId % 2 === 0 && new Decimal(user.vipLevel).lt(this.videoId)) {
                let realGunStyle = new Decimal(this.videoId).add(1).toNumber();
                videoSrc.changeGun(realGunStyle);
            } else {
                videoSrc.changeGun(this.videoId);
            }
            videoSrc.playByAnimation();
            this.videOpos.active = true;
            this.closeBtn.active = true;
            this.vipUnLockLevel.node.parent.active = false;
        }
    }

    public onClickColseVideo() {
        if (!this.videOpos.active) return;
        let byVideo = this.videOpos.getChildByName("byVideo");
        if (this.videOpos.getChildByName("byVideo")) {
            let videoSrc = byVideo.getComponent(VipVideo);
            videoSrc.stopByAnimation();
            this.videOpos.active = false;
            this.closeBtn.active = false;
            if (this.videoId > user.vipLevel) this.vipUnLockLevel.node.parent.active = true;
            byVideo.destroy();
        }
    }
}
