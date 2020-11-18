import PopActionBox from "../lobby/popActionBox"
import { showTip } from "../common/ui"
import User from "../common/user"
import { ErrCodes } from "../common/code"
import net from "../common/net";
const { ccclass, property } = cc._decorator

@ccclass
export default class Rename extends PopActionBox {
    @property(cc.EditBox)
    private ebNick: cc.EditBox = undefined
    private static banNicks: string

    protected onLoad() {
        super.onLoad()
        this.getBanNicks()
    }

    private async onClickOk() {
        let nick = this.ebNick.string.trim()
        if (!nick) {
            showTip("昵称不能为空！");
            return;
        }
        //昵称不能以"U"开头
        let reg = /^U[1-9][0-9]*$/
        if (reg.test(nick)) {
            showTip("昵称不不符合规则！")
            return
        }
        if (this.getNickLength(nick) > 10) {
            showTip("长度超限！请输入5个汉字或10个字符。")
            return
        }
        let validateNick = nick.replace(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5\ ]/, "")
        if (validateNick !== nick) {
            showTip("您输入的昵称包含违禁字符！")
            return
        }
        let testNick = nick.toLowerCase()
        let testNickR = testNick.split("").reverse().join("")
        if (Rename.banNicks) {
            for (let banNick of Rename.banNicks) {
                let reg = new RegExp(banNick.split("").join(".*"))
                if (reg.test(testNick) || reg.test(testNickR)) {
                    showTip("您输入的昵称包含禁用词！")
                    return
                }
            }
        }

        let data = await net.request("hall.userHandler.chgName", { name: nick });
        this.ebNick.stayOnTop = false
        if (data.code === 200) {
            User.nick = nick
            this.user.refreshUserInfos()
            showTip("修改昵称成功！")
            this.closeAction()
        } else {
            showTip(ErrCodes.getErrStr(data.code, "修改昵称失败"))
        }
    }

    private getNickLength(str: any) {
        if (str === null) { return 0 }
        if (typeof str !== "string") {
            str += ""
        }
        return str.replace(/[^\x00-\xff]/g, "01").length
    }

    private async getBanNicks() {
        if (Rename.banNicks)
            return
        let data = await net.request("hall.userHandler.getDictionary", {})
        if (data.code === 200) {
            Rename.banNicks = data.dictionary
        }
    }
}
