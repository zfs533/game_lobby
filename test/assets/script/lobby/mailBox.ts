import PopActionBox from "./popActionBox"
import { MailMsg, MailType } from "./mailMsg";
import { formatTimeStr, setClipboard } from "../common/util";
import { showTip } from "../common/ui";
import net from "../common/net";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MailBox extends PopActionBox {
    @property(cc.Node)
    nodeList: cc.Node = undefined;

    @property(cc.Node)
    nodeContent: cc.Node = undefined;

    @property(cc.Node)
    btnClearAll: cc.Node = undefined;

    @property(cc.Node)
    btnDelRead: cc.Node = undefined;

    // 系统邮件列表
    @property(cc.ScrollView)
    svMail: cc.ScrollView = undefined;

    // 客服邮件列表
    @property(cc.ScrollView)
    kfMail: cc.ScrollView = undefined;

    @property(cc.Node)
    svItem: cc.Node = undefined;

    @property(cc.Node)
    labTips: cc.Node = undefined;

    // 邮件内容
    @property(cc.Label)
    labDate: cc.Label = undefined;

    @property(cc.Label)
    rtContent: cc.Label = undefined;

    @property(cc.Label)
    title: cc.Label = undefined;
    @property(cc.Label)
    fromname: cc.Label = undefined;

    @property(cc.Node)
    private nodeCopyCode: cc.Node = undefined;

    @property(cc.Node)
    private btnOpenUrl: cc.Node = undefined;

    private currMail: ps.HallMailHandlerGetMails_Mail;
    private msg: MailMsg;
    private withdrawCode: string;
    private clickUrl: string;
    private currentMailType: number = MailType.systemNotice;

    onLoad() {
        super.onLoad();
        this.mailJudge(true);
        this.svItem.active = false;
        this.svMail.node.active = false;
        this.kfMail.node.active = false;
    }

    start() {
        this.openAnim(() => {
            this.svMail.node.active = true;
        });
        this.nodeContent.active = false;
    }

    setMailMsg(msg: MailMsg) {
        this.msg = msg;
        this.msg.pullMails(0, MailType.systemNotice, () => this.showMailList(this.msg.mails))
        this.svMail.content.removeAllChildren();
    }

    /**
     * 点击系统邮件按钮
     */
    onclickSysButton() {
        this.onClickBack();
        if (this.currentMailType != MailType.systemNotice) {
            this.requestMailList(MailType.systemNotice);
        }
    }

    /**
     * 点击客服邮件按钮
     */
    onclickKfButton() {
        this.onClickBack();
        if (this.currentMailType != MailType.customerServiceReply) {
            this.requestMailList(MailType.customerServiceReply);
        }
    }

    /**
     * 请求邮件数据
     * @param type
     */
    requestMailList(type: number) {
        if (type == MailType.systemNotice) {
            this.currentMailType = MailType.systemNotice;
            this.svMail.node.active = true;
            this.kfMail.node.active = false;
            this.msg.pullMails(0, MailType.systemNotice, () => this.showMailList(this.msg.mails))
            this.svMail.content.removeAllChildren();
        }
        else {
            this.currentMailType = MailType.customerServiceReply;
            this.svMail.node.active = false;
            this.kfMail.node.active = true;
            this.msg.pullMails(0, MailType.customerServiceReply, () => this.showMailList(this.msg.mails))
            this.kfMail.content.removeAllChildren();
        }
    }

    /**
     * 滚动系统邮件列表
     * @param ev
     * @param eventType
     */
    svDidScroll(ev: cc.Event.EventTouch, eventType: cc.ScrollView.EventType) {
        if (cc.ScrollView.EventType.SCROLL_TO_BOTTOM === eventType) {
            let p = this.svMail.content.childrenCount / 20;
            if (Math.floor(p) === p)
                this.msg.pullMails(p, this.currentMailType, (mails: ps.HallMailHandlerGetMails_Mail[]) => this.showMailList(mails))
        }

    }

    /**
     * 滚动客服邮件列表
     * @param ev
     * @param eventType
     */
    kfDidScroll(ev: cc.Event.EventTouch, eventType: cc.ScrollView.EventType) {
        if (cc.ScrollView.EventType.SCROLL_TO_BOTTOM === eventType) {
            let p = this.kfMail.content.childrenCount / 20;
            if (Math.floor(p) === p)
                this.msg.pullMails(p, this.currentMailType, (mails: ps.HallMailHandlerGetMails_Mail[]) => this.showMailList(mails))
        }
    }

    mailJudge(bol: boolean) {
        this.labTips.active = bol;
    }

    /**
     * 实例化邮件列表
     * @param mailInfoArr
     */
    showMailList(mailInfoArr: ps.HallMailHandlerGetMails_Mail[]) {
        this.nodeContent.active = false;

        if (mailInfoArr && mailInfoArr.length > 0) {
            this.mailJudge(false);
            mailInfoArr.forEach((mailInfo, idx) => {
                let item = cc.instantiate(this.svItem);
                item.active = true;
                let readIcon = item.getChildByName("readIcon");
                let readedIcon = item.getChildByName("readed");
                let labContent = item.getChildByName("labContent").getComponent(cc.Label);
                let labDate = item.getChildByName("labDate").getComponent(cc.Label);

                readedIcon.active = mailInfo.bRead ? true : false;
                readIcon.active = mailInfo.bRead ? false : true;
                labContent.string = mailInfo.title;//this.getPreviewContent(mailInfo.content);
                labContent.node.opacity = mailInfo.bRead ? 160 : 255;
                let dateStr = formatTimeStr('m', mailInfo.sendTime);
                labDate.string = dateStr;
                if (this.currentMailType == MailType.systemNotice) {
                    this.svMail.content.addChild(item);
                }
                else {
                    this.kfMail.content.addChild(item);
                }

                let handler = new cc.Component.EventHandler();
                handler.target = this.node;
                handler.component = "mailBox";
                handler.handler = "showMailDetail";
                handler.customEventData = JSON.stringify(mailInfo);
                item.getComponent(cc.Button).clickEvents.push(handler);
                if (idx == 0) {
                    //默认显示第一个邮件
                    this.showMailDetail(null, JSON.stringify(mailInfo), item)
                }
            });

        } else {
            this.mailJudge(true);
        }
        if (this.currentMailType == MailType.systemNotice) {
            this.svMail.node.active = true;
            this.kfMail.node.active = false;
        }
        else {
            this.svMail.node.active = false;
            this.kfMail.node.active = true;
        }
    }

    /**
     * 展示邮件详情
     * @param ev
     * @param data
     */
    showMailDetail(ev: cc.Event.EventTouch, data: string, tgt?: cc.Node) {
        this.nodeContent.active = true;
        let mailInfo = JSON.parse(data) as ps.HallMailHandlerGetMails_Mail;
        this.title.string = mailInfo.title;
        this.fromname.string = mailInfo.from;
        this.currMail = mailInfo;
        let dateStr = formatTimeStr('m', mailInfo.sendTime);
        this.labDate.string = dateStr;
        let content = mailInfo.content;
        this.rtContent.string = content;

        this.nodeCopyCode.active = false;
        this.withdrawCode = undefined;

        let reg = /.*会员码是(.*)\n?/g;
        let s = content.match(reg);
        if (s && s.length === 1) {
            let code = s[0].replace(reg, "$1");
            this.nodeCopyCode.active = true;
            if (code.indexOf("，") != -1) {
                code = code.substring(0, code.indexOf("，"))
            }
            this.withdrawCode = code;
        }

        this.btnOpenUrl.active = false;
        this.clickUrl = undefined;
        // let content = "测试试试试试试试时候测试是车似的和，请点击下面的链接：\nhttps://eap8.sxtesc.com/  \nhttps://eap8.sxtesc.com/"
        let urlRegx = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
        let url = content.match(urlRegx);
        // console.log(url);
        if (url && url.length > 0) {
            this.clickUrl = url[0];
            this.btnOpenUrl.active = true;
            // console.log(this.clickUrl);
        }

        this.refreshSelectedStatus();
        let target = tgt ? tgt : ev.currentTarget;
        target.getChildByName("selected").active = true;
        if (!mailInfo.bRead) {
            net.notify("hall.mailHandler.read", { id: mailInfo._id });
            mailInfo.bRead = 1;
            target.getChildByName("readed").active = true;
            target.getChildByName("readIcon").active = false;
            this.msg.changeMailRead(mailInfo._id, true);
        }
    }
    refreshSelectedStatus() {
        let list1 = this.kfMail.content.children;
        for (let i = 0; i < list1.length; i++) {
            list1[i].getChildByName("selected").active = false;
        }
        let list2 = this.svMail.content.children;
        for (let i = 0; i < list2.length; i++) {
            list2[i].getChildByName("selected").active = false;
        }
    }

    private getPreviewContent(content: string) {
        let str = "";
        for (let c of content) {
            if (c === "\n") {
                break;
            }
            str += c;
            if ((str.length + 3) >= 16) {
                return str + "…";
            }
        }
        return str;
    }

    /**
     * 邮件详情界面的返回按钮
     */
    onClickBack() {

    }

    /**
     * 全部已读
     */
    async onClickReadAll() {
        let isSuccess = await this.msg.readAll(this.currentMailType);
        if (isSuccess) {
            this.requestMailList(this.currentMailType);
        }
    }

    /**
     * 删除已读
     */
    async onClickClearRead() {
        let isSuccess = await this.msg.deleteRead(this.currentMailType);
        if (isSuccess) {
            this.requestMailList(this.currentMailType);
        }
    }

    /**
     * 删除当前阅读邮件
     */
    async onClickDel() {
        let isSuccess = await this.msg.delMailInfo(this.currMail);
        if (isSuccess) {
            this.onClickBack();
            this.requestMailList(this.currentMailType);
        }
    }

    private onClickCopyCode() {
        if (!this.withdrawCode) {
            return;
        }
        let success = setClipboard(this.withdrawCode);
        if (success) {
            showTip("复制兑换码成功");
        } else {
            showTip("复制兑换码失败");
        }
    }

    private onClickOpenUrl() {
        if (!this.clickUrl) {
            return;
        }
        cc.sys.openURL(this.clickUrl);
    }
}
