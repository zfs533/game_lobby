import { Gender } from "../common/enum";
import User from "../common/user";
import * as util from "../common/util";
import PopActionBox from "../lobby/popActionBox"
import { addSingleEvent } from "../common/util";
import { getAvatar, showTip, getAvatarFrame, showConfirm, getdynamicAvatarBoxNode } from "../common/ui";
import UserBox from "./userBox";
import Lobby from "./lobby";
import { WeeklyRebateModel } from "./weeklyRebate/weeklyRebateModel";
import TanabataMgr from "../game-qx/TanabataMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChangeAvatar extends PopActionBox {
    @property(cc.Prefab)
    avatarItem: cc.Prefab = undefined;

    @property(cc.Prefab)
    avatarFrameItem: cc.Prefab = undefined;

    @property(cc.Node)
    avatarLayoutNode: cc.Node = undefined;

    @property(cc.Node)
    avatarFrameLayoutNode: cc.Node = undefined;

    userBox: UserBox;
    private newAvatarId: number;
    private newAvatarFrameId: number;
    private nowGender: Gender;
    private changeGender: Gender;


    private dynamicAvatarBoxList: Array<number> = [175, 179, 129, 183, 147, 151, 155, 159, 163, 167, 171, 187,120];
    private dynamicNode: cc.Node = undefined

    onLoad() {
        super.onLoad();
    }

    start() {
        this.onClickSelectAva();
        super.openAnim(() => {
            // if (this.avatarLayoutNode.children.length > 0) return
            let user = User;
            this.nowGender = user.gender;
            let realId = user.avatarId % 10;
            let realFrameId = user.avatarFrameId % 10;
            for (let idx = 0; idx < 20; idx++) {
                let avatar;
                if (idx < this.avatarLayoutNode.childrenCount) {
                    avatar = this.avatarLayoutNode.children[idx];
                } else {
                    avatar = cc.instantiate(this.avatarItem);
                    avatar.scale = 0.8
                    this.avatarLayoutNode.addChild(avatar);
                }
                let tg: cc.Toggle = avatar.getComponent(cc.Toggle);
                let isMale;
                if (idx < 10) {
                    isMale = false;
                    if (!user.isMale) if (idx === realId) tg.check();
                } else {
                    isMale = true;
                    if (user.isMale) {
                        if (idx % 10 === realId) tg.check();
                    }
                }
                let head = avatar.getChildByName("head");
                head.getComponent(cc.Sprite).spriteFrame = getAvatar(isMale, idx);

                let handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = cc.js.getClassName(this);
                handler.handler = "onToggleAvatar";
                handler.customEventData = idx.toString();
                tg.clickEvents = [];
                addSingleEvent(tg, handler);
                if (idx < 16) {
                    let avatarFrame: cc.Node;
                    if (idx < this.avatarFrameLayoutNode.childrenCount) {
                        avatarFrame = this.avatarFrameLayoutNode.children[idx];
                    } else {
                        avatarFrame = cc.instantiate(this.avatarFrameItem);
                        this.avatarFrameLayoutNode.addChild(avatarFrame);
                    }
                    avatarFrame.setScale(0.8);
                    let lock = avatarFrame.getChildByName("avaterItemvip");
                    let fTg = avatarFrame.getComponent(cc.Toggle);
                    let handler = new cc.Component.EventHandler();
                    handler.target = this.node;
                    handler.component = cc.js.getClassName(this);
                    if (idx <= user.vipLevel) {
                        if (idx === realFrameId) fTg.check();
                        handler.handler = "onToggleAvatarFrame";
                        if (lock) lock.active = false;
                    } else {
                        handler.handler = "onToggleGoPay";
                        if (lock) lock.active = true;
                    }
                    handler.customEventData = idx.toString();
                    if (user.avatarFrameId === idx) {
                        fTg.check();
                    } else {
                        fTg.uncheck();
                    }
                    // fTg.clickEvents = [];
                    addSingleEvent(fTg, handler);
                    let vipTips = lock.getChildByName("vip").getChildByName("vipgary");
                    if (vipTips) vipTips.getComponent(cc.Label).string = idx.toString();
                    let headframe = avatarFrame.getChildByName("head").getComponent(cc.Sprite);
                    // headframe.getComponent(cc.Sprite).spriteFrame = getAvatarFrame(idx);
                    getAvatarFrame(idx, headframe);
                }
            }
            //---周返利移植s
            let weeklyRebateModel = WeeklyRebateModel.instance();
            if (weeklyRebateModel.isActive) {
                if (!this.dynamicNode) {
                    this.dynamicNode = getdynamicAvatarBoxNode();
                }
                for (let index = 0; index < this.dynamicAvatarBoxList.length; index++) {
                    let nameID = this.dynamicAvatarBoxList[index];
                    let dynamicNode = this.avatarFrameLayoutNode.getChildByName(nameID.toString())
                    if (!dynamicNode) {
                        dynamicNode = this.dynamicNode.getChildByName(nameID.toString());
                        dynamicNode.width = 100;
                        dynamicNode.height = 100;
                        dynamicNode.scale = 0.65;
                    }
                    let unlockFuc = "goZFLFestival"
                    if (nameID === 120) {
                        unlockFuc = "goGqFestival"
                    }
                    this.setDyAvatarBox(dynamicNode, unlockFuc, nameID);
                }
            }
        });
        this.nowGender = User.gender;
    }



    /**
  * 动态头像框设置
  */
    setDyAvatarBox(avatarBox: cc.Node, unlockFuc: string, dyId: number) {
        avatarBox.parent = this.avatarFrameLayoutNode;
        avatarBox.zIndex = -1;
        let user = User;
        let unclock = avatarBox.getChildByName("unclock");
        let ucBtn = unclock.getComponent(cc.Button);
        if (!ucBtn) ucBtn = unclock.addComponent(cc.Button);
        //设置未解锁状态跳转周返利活动
        let handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = cc.js.getClassName(this);
        handler.handler = unlockFuc;
        addSingleEvent(ucBtn, handler);
        let tg = avatarBox.getComponent(cc.Toggle);
        if (user.avatarBoxList && user.avatarBoxList.indexOf(dyId) >= 0) {
            unclock.active = false;
            let handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = cc.js.getClassName(this);
            handler.handler = "onToggleAvatarFrame";
            handler.customEventData = dyId.toString();
            tg.clickEvents = [];
            addSingleEvent(tg, handler);
            if (dyId === User.avatarFrameId) {
                tg.check();
            }
        } else {
            // tg.interactable = false;//设置未解锁的头像框不能被点击
        }
    }
    goZFLFestival() {
        let weeklyRebateModel = WeeklyRebateModel.instance();
        let confirmnode;
        if (weeklyRebateModel.isGoing == 1) {//活动开启时
            confirmnode = showConfirm("亲，赶快去参加周返利抽奖解锁吧，现在就要离开吗？", "确定", "取消");
        } else {
            showTip("活动未开启！");
            return;
        }
        confirmnode.okFunc = () => {
            this.onClickClose();
            let nodeLobby = cc.find("lobby");
            if (!nodeLobby) {
                return;
            }
            let lobby = nodeLobby.getComponent(Lobby);
            lobby.clickTheWeeklyRebateButton();
        };

    }

    /**
        * 点击国庆头像
        */
    goGqFestival() {
        // let weeklyRebateModel = WeeklyRebateModel.instance();
        let confirmnode;
        if (TanabataMgr.Instance.onGoing == 1) {//活动开启时
            confirmnode = showConfirm("亲，赶快去参加国庆活动抽奖解锁吧，现在就要离开吗？", "确定", "取消");
        } else {
            showTip("活动未开启！");
            return;
        }
        confirmnode.okFunc = () => {
            this.onClickClose();
            let nodeLobby = cc.find("lobby");
            if (!nodeLobby) {
                return;
            }
            let lobby = nodeLobby.getComponent(Lobby);
            lobby.onClickNationalDay();
        };

    }

    setUserBox(userBox: UserBox) {
        this.userBox = userBox;
    }

    onClickSelectAva() {
        this.avatarLayoutNode.active = true;
        this.avatarFrameLayoutNode.active = false;
    }

    onClickSelectFrame() {
        this.avatarLayoutNode.active = false;
        this.avatarFrameLayoutNode.active = true;
    }

    private onToggleAvatar(ev: cc.Event.EventTouch, data: string) {
        if (data == undefined) {
            return;
        }
        let idx = +data;
        if (isNaN(idx) || idx == undefined) {
            return;
        }
        this.chgAvatarCheckState(ev.target);
        if (idx < 10) {
            this.onClickSex(Gender.FEMALE);
            this.newAvatarId = idx;
        } else {
            this.onClickSex(Gender.MALE);
            this.newAvatarId = idx % 10;
        }
        this.onClickSure();
    }

    private onToggleAvatarFrame(ev: cc.Event.EventTouch, data: string) {
        if (data == undefined) {
            return;
        }
        let idx = +data;
        if (isNaN(idx) || idx == undefined) {
            return;
        }
        this.chgAvatarFrameCheckState(ev.target);

        this.newAvatarFrameId = idx;
        console.log("点击更换头像=>", this.newAvatarFrameId);
        this.onClickSureFrame();
    }

    private onToggleGoPay() {
        this.closeAction(this.onClickRecharge);
    }

    async onClickRecharge() {
        let nodeLobby = cc.find("lobby");
        if (!nodeLobby) {
            return;
        }
        let lobby = nodeLobby.getComponent(Lobby);
        lobby.scheduleOnce(() => {
            lobby.onClickVip();
        }, 0.1);
    }

    private onClickSex(sex: Gender) {
        window.pomelo.notify("hall.userHandler.chgGender", { gender: sex === Gender.MALE ? 1 : 0 });
        this.changeGender = sex;
        User.gender = sex;
    }

    private onClickSure() {
        let user = User;
        if (this.newAvatarId !== undefined && (this.newAvatarId !== user.avatarId || this.changeGender !== this.nowGender)) {
            window.pomelo.notify("hall.userHandler.chgAvatar", { avatar: this.newAvatarId });
            User.avatarId = this.newAvatarId;
            this.user.refreshUserInfos();
            showTip("头像编辑成功！");
        }
        this.closeAction(() => {
            if (this.userBox) {
                this.userBox.sprHead.spriteFrame = getAvatar(user.isMale, user.avatarId);
            }
        });
    }

    private onClickSureFrame() {
        let user = User;
        if (this.newAvatarFrameId !== undefined && this.newAvatarFrameId !== User.avatarFrameId) {
            window.pomelo.notify("hall.userHandler.chgAvatarFrame", { avatarFrame: this.newAvatarFrameId });
            User.avatarFrameId = this.newAvatarFrameId;
            this.user.refreshUserInfos();
            console.log("更新头像框==>", User.avatarFrameId);
            showTip("头像框编辑成功！");
        }
        this.closeAction(() => {
            if (this.userBox) getAvatarFrame(user.avatarFrameId, this.userBox.sprHeadFrame);
        });
    }

    chgAvatarCheckState(newAvatar: cc.Node) {
        this.avatarLayoutNode.children.forEach(avatar => {
            let tg = avatar.getComponent(cc.Toggle);
            tg.uncheck();
        });
        newAvatar.getComponent(cc.Toggle).check();
    }

    chgAvatarFrameCheckState(newAvatar: cc.Node) {
        this.avatarFrameLayoutNode.children.forEach(avatar => {
            let tg = avatar.getComponent(cc.Toggle);
            tg.isChecked = false;
        });
        newAvatar.getComponent(cc.Toggle).isChecked = true;
    }
}