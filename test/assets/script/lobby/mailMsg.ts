import { showLoading, hideLoading, showTip } from "../common/ui";
import net from "../common/net";

const { ccclass, property } = cc._decorator;

//邮件类型
export enum MailType {
    systemNotice = 1, //系统邮件
    customerServiceReply = 2 //客服回复
}

@ccclass
export class MailMsg extends cc.Component {
    @property(cc.Node)
    spriMailPrompt: cc.Node = undefined;

    private _mails: ps.HallMailHandlerGetMails_Mail[];
    get mails() {
        if (!this._mails) {
            this._mails = new Array();
        }
        return this._mails;
    }

    onLoad() {
        this.checkNewMails();
    }

    onHasNewMail() {
        if (this.spriMailPrompt) {
            this.spriMailPrompt.active = true;
        }
    }

    async checkNewMails() {
        let data = await net.request("hall.mailHandler.checkNew");
        if (data.code === 200 && !!data.hasNew)
            this.spriMailPrompt.active = true;
        else
            this.spriMailPrompt.active = false;
    }

    async pullMails(p: number, type: number, callback: Function) {
        let data = await net.request("hall.mailHandler.getMails", { page: p, type: type });
        if (data.code === 200) {
            if (data.mails) {
                if (!p) this._mails = [];
                this._mails = this.mails.concat(data.mails);

                callback(data.mails)
            }
            else {
                this._mails = [];
                callback([]);
            }
        } else {
            showTip("拉取邮件失败！");
            return;
        }
    }

    changeMailRead(id: string, read: boolean) {
        for (let idx = 0; idx < this.mails.length; idx++) {
            let info = this.mails[idx];
            if (info._id === id) {
                info.bRead = read ? 1 : 0;
                break;
            }
        }
        this.checkUnRead();
    }

    checkUnRead() {
        let isHaveUnRead = this.mails.some((value) => {
            return !value.bRead
        });

        if (isHaveUnRead)
            this.spriMailPrompt.active = true;
        else
            this.spriMailPrompt.active = false;
    }

    async clearAllMails() {
        if (!this.mails || this.mails.length === 0) return false;
        let ids = this.mails.map((value) => {
            return value._id;
        })

        showLoading();
        let data = await net.request("hall.mailHandler.delete", { ids: ids });
        hideLoading();
        if (data.code === 200) {
            this._mails = [];
            this.checkUnRead();

            showTip("删除成功！");
            return true;
        } else {
            showTip("处理完毕！");
            return false;
        }
    }

    /**
     * 删除邮件
     */
    async delReadMails() {
        if (!this.mails || this.mails.length === 0) return false;
        let ids = this.mails.map((value) => {
            if (value.bRead)
                return value._id;
            return null;
        })

        let realIds = ids.filter((value) => {
            return value
        });

        if (realIds.length === 0) return false;

        showLoading("");
        let data = await net.request("hall.mailHandler.delete", { ids: realIds });
        hideLoading();
        if (data.code === 200) {
            this._mails = this.mails.filter((value) => {
                return !value.bRead;
            });
            showTip("删除成功！");
            return true;
        }
        else {
            showTip("处理完毕！");
            return false;
        }
    }

    async delMailInfo(mailInfo: ps.HallMailHandlerGetMails_Mail) {
        if (mailInfo === undefined) return false;

        showLoading();
        let data = await net.request("hall.mailHandler.delete", { ids: [mailInfo._id] });
        hideLoading();
        if (data.code === 200) {
            for (let idx = 0; idx < this.mails.length; idx++) {
                let info = this.mails[idx];
                if (info._id === mailInfo._id) {
                    this.mails.splice(idx, 1);
                    break;
                }
            }
            showTip("删除成功！");
            return true;
        } else {
            showTip("处理完毕！");
            return false;
        }
    }

    /**
     * 全部标记为已读
     * @param type
     */
    async readAll(type: number) {
        showLoading("");
        let data = await net.request("hall.mailHandler.readAll", { type: type });
        hideLoading();
        this.checkUnRead();
        return data.code == 200;
    }

    /**
     * 删除已读
     * @param type
     */
    async deleteRead(type: number) {
        showLoading("");
        let data = await net.request("hall.mailHandler.deleteRead", { type: type });
        hideLoading();
        this.checkUnRead();
        return data.code == 200;
    }
}
