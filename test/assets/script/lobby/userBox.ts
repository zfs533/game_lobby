import User from "../common/user";
import PopActionBox from "./popActionBox"
import LoginHelper from "../start/loginHelper";
import { Gender } from "../common/enum";
import { maskAccount, addSingleEvent, setInteractable } from "../common/util";
import { ErrCodes } from "../common/code";
import { getAvatar, showTip, getAvatarFrame } from "../common/ui";
import net from "../common/net";
import ChangeAvatar from "./changeAvatar";

enum PAGE { info = 0, avatars }

const { ccclass, property } = cc._decorator;

@ccclass
export default class UserBox extends PopActionBox {
    @property(cc.Sprite)
    sprHead: cc.Sprite = undefined;

    @property(cc.Sprite)
    sprHeadFrame: cc.Sprite = undefined;

    @property(cc.Label)
    labUserId: cc.Label = undefined;

    @property(cc.Label)
    ebNick: cc.Label = undefined;

    @property(cc.EditBox)
    ebPhone: cc.EditBox = undefined;

    @property(cc.Prefab)
    preChangePwd: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preRename: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preAvatars: cc.Prefab = undefined;

    @property(cc.Label)
    lblAli: cc.Label = undefined;

    @property(cc.Label)
    lblBank: cc.Label = undefined;

    @property(cc.Button)
    btnBindAli: cc.Button = undefined;

    @property(cc.Button)
    btnBindBank: cc.Button = undefined;

    @property(cc.Prefab)
    private preBindAli: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preBindBank: cc.Prefab = undefined;

    @property(cc.Node)
    private nodeAli: cc.Node = undefined;

    @property(cc.Node)
    private nodeBank: cc.Node = undefined;

    private curPage: PAGE = PAGE.info
    private dynamicAvatarBoxList: Array<number> = [175, 179, 129, 183, 147, 151, 155, 159, 163, 167, 171, 187];
    private dynamicNode: cc.Node = undefined

    start() {
        this.ebNick.string = User.nick;

        let phoneNo = "未绑定";
        if (User.act) {
            phoneNo = maskAccount(User.act);
        }
        this.ebPhone.string = phoneNo;
        this.labUserId.string = User.uid.toString();

        this.openAnim(() => {
            if (User.shield) {
                this.nodeAli.active = false;
                this.nodeBank.active = false;
            } else {
                this.refreshAliAndBank();
            }
        })
    }
    protected onEnable() {
        this.showPageInfo()
        this.showAvatarFrame()
    }

    onClickUpdateNick() {
        let node = cc.instantiate(this.preRename);
        this.node.addChild(node);
        node.once("close", (ev: cc.Event.EventCustom) => {
            let nick = User.nick;
            if (nick && nick !== "") {
                this.ebNick.string = nick;
            }
        });
    }


    /**
     * 换头像
     */
    onClickUpdateHead() {
        let ndChange = cc.instantiate(this.preAvatars);
        let changeAvatars = ndChange.getComponent(ChangeAvatar);
        changeAvatars.setUserBox(this);
        this.node.addChild(ndChange);
    }
    showPageInfo() {
        this.curPage = PAGE.info
        let user = User;
        this.sprHead.spriteFrame = getAvatar(user.isMale, user.avatarId);
    }

    showAvatarFrame() {
        this.curPage = PAGE.info
        let user = User;
        getAvatarFrame(user.avatarFrameId, this.sprHeadFrame);
    }

    onClickPwd() {
        let parent = this.node.parent;
        this.closeAction(() => {
            this.openAction(parent, this.preChangePwd);
        });
    }

    onClickRegister() {
        LoginHelper.returnToLogin();
    }

    onClickClose() {
        if (this.curPage === PAGE.avatars)
            this.showPageInfo()
        else
            super.onClickClose()
    }

    private onClickBindAli() {
        let canvas = cc.find("Canvas");
        let node = cc.instantiate(this.preBindAli);
        canvas.addChild(node);
        node.setPosition(0, 0);

        node.once("close", this.refreshAliAndBank.bind(this));
    }

    private onClickBindBank() {
        let canvas = cc.find("Canvas");
        let node = cc.instantiate(this.preBindBank);
        canvas.addChild(node);
        node.setPosition(0, 0);

        node.once("close", this.refreshAliAndBank.bind(this));
    }

    private async refreshAliAndBank() {
        this.lblAli.string = User.SSSAccount || ErrCodes.BIND_SSS;
        this.lblBank.string = User.bankAccount || ErrCodes.BIND_CARD;

        let data = await net.request("hall.billHandler.getOrderCnt", {});
        this.btnBindAli.node.active = !!data.ali;
        setInteractable(this.btnBindAli, !!data.ali);

        this.btnBindBank.node.active = !!data.union;
        setInteractable(this.btnBindBank, !!data.union);
    }

    private EncodeUtf8(s1: string) {
        var s = escape(s1);
        var sa = s.split("%");
        var retV = "";
        if (sa[0] != "") {
            retV = sa[0];
        }
        for (var i = 1; i < sa.length; i++) {
            if (sa[i].substring(0, 1) == "u") {
                retV += this.Hex2Utf8(this.Str2Hex(sa[i].substring(1, 5)));

            }
            else retV += "%" + sa[i];
        }

        return retV;
    }
    private Str2Hex(s: any) {
        var c = "";
        var n;
        var ss = "0123456789ABCDEF";
        var digS = "";
        for (var i = 0; i < s.length; i++) {
            c = s.charAt(i);
            n = ss.indexOf(c);
            digS += this.Dec2Dig(eval(n.toString()));

        }
        //return value;
        return digS;
    }
    private Dec2Dig(n1: any) {
        var s = "";
        var n2 = 0;
        for (var i = 0; i < 4; i++) {
            n2 = Math.pow(2, 3 - i);
            if (n1 >= n2) {
                s += '1';
                n1 = n1 - n2;
            }
            else
                s += '0';

        }
        return s;

    }
    private Dig2Dec(s: any) {
        var retV = 0;
        if (s.length == 4) {
            for (var i = 0; i < 4; i++) {
                retV += eval(s.charAt(i)) * Math.pow(2, 3 - i);
            }
            return retV;
        }
        return -1;
    }
    private Hex2Utf8(s: any) {
        var retS = "";
        var tempS = "";
        var ss = "";
        if (s.length == 16) {
            tempS = "1110" + s.substring(0, 4);
            tempS += "10" + s.substring(4, 10);
            tempS += "10" + s.substring(10, 16);
            var sss = "0123456789ABCDEF";
            for (var i = 0; i < 3; i++) {
                retS += "%";
                ss = tempS.substring(i * 8, (eval(i.toString()) + 1) * 8);
                retS += sss.charAt(this.Dig2Dec(ss.substring(0, 4)));
                retS += sss.charAt(this.Dig2Dec(ss.substring(4, 8)));
            }
            return retS;
        }
        return "";
    }

}
