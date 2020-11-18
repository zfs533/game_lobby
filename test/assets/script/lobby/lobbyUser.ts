import User from "../common/user";
import { toCNMoney, parseLocation } from "../common/util";
import { getAvatar, getAvatarFrame } from "../common/ui";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LobbyUser extends cc.Component {
    @property(cc.Button)
    private btnAvatar: cc.Button = undefined;

    @property(cc.Node)
    private avatarBg: cc.Node = undefined;

    @property(cc.Label)
    private labID: cc.Label = undefined;

    @property(cc.Label)
    private labNick: cc.Label = undefined;

    @property(cc.Label)
    private labCash: cc.Label = undefined;

    @property(cc.Label)
    private labBankGold: cc.Label = undefined;

    @property(cc.Label)
    private labLocation: cc.Label = undefined;

    @property(cc.Label)
    labvip: cc.Label = undefined;

    vipData: ps.HallHallHandlerGetUserVipInfo_VipInfo;

    get getAvatar() {
        return this.btnAvatar.node;
    }

    get getAvatarBg() {
        return this.avatarBg;
    }

    onLoad() {
        window.pomelo.on("updateOwnLocation", this.onLocationUpdate.bind(this));
    }

    private onLocationUpdate(data: { location: string }) {
        User.location = data.location;
        this.refreshUserInfos();
    }

    start() {
        console.log(" lobby start");
        this.refreshUserInfos();
    }

    refreshUserInfos() {
        let user = User;
        this.btnAvatar.getComponent(cc.Sprite).spriteFrame = getAvatar(user.isMale, user.avatarId);
        let frame = this.avatarBg.getComponent(cc.Sprite);
        getAvatarFrame(user.avatarFrameId, frame);
        this.labID.string = user.uid.toString();
        this.labNick.string = user.nick;
        this.labCash.string = (toCNMoney(user.money.toString())).toString();
        this.labLocation.string = parseLocation(user.location);
        if (user.bankMoney && (new window.Decimal(user.bankMoney).gt(0))) {
            this.labBankGold.string = (toCNMoney(user.bankMoney.toString())).toString();
        } else {
            this.labBankGold.string = (toCNMoney(0 + '')).toString();
        }
        let vipLv = user.vipLevel.toString();
        this.labvip.string = vipLv ? vipLv : "0";
    }

    protected onDestroy() {
        window.pomelo.off("recharge");
        window.pomelo.off("userMoney");
        window.pomelo.off("hasNewMail");
        window.pomelo.off("updateOwnLocation");
    }
}
