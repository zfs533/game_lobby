import LoginHelper from "../start/loginHelper";
import PopActionBox from "./popActionBox"
import User from "../common/user";
import Audio from "../g-share/audio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BindTip extends PopActionBox {
    @property(cc.Label)
    content: cc.Label = undefined;

    @property(cc.Button)
    btnRegister: cc.Button = undefined;

    @property(cc.Button)
    btnHasAccount: cc.Button = undefined;


    @property(cc.Prefab)
    preRegister: cc.Prefab = undefined;

    start() {
        super.start();
        let bindBonus = User.bindBonus;
        this.content.string = bindBonus || "3";
    }

    onClickLogin() {
        Audio.PlayClick()
        LoginHelper.returnToLogin();
    }
    onClickGoRegister() {
        Audio.PlayClick()
        let parent = this.node.parent;
        this.closeAction(() => {
            let node = this.openAction(parent, this.preRegister);
            node.name = "bind";
            node.once("close", () => {
                cc.log("close bind");
            });
        });
    }
}
