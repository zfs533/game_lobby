import { setClipboard } from "../common/util";
import { showTip, showLoading, hideLoading } from "../common/ui";
import { isAppInstalled, openApp } from "../common/app";
import PopActionBox from "./popActionBox"
import net from "../common/net";
import g from "../g";
import Lobby from "./lobby";
import { ErrCodes } from "../common/code";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Popularize extends PopActionBox {
    @property(cc.Node)
    private item: cc.Node = undefined;

    @property(cc.Node)
    private newItem: cc.Node = undefined;

    @property(cc.Node)
    private notice: cc.Node = undefined;

    @property(cc.Label)
    tipsLabel: cc.Label = undefined;

    @property(cc.ScrollView)
    sv: cc.ScrollView = undefined;

    lobby: Lobby = undefined;

    onLoad() {
        super.onLoad();
        this.sv.node.active = false;
    }

    start() {
        if (this.tipsLabel && g.hallVal.csworkTime) {
            this.tipsLabel.string = "服务时间：" + g.hallVal.csworkTime.startTime + "-" + g.hallVal.csworkTime.endTime
        }
        this.openAnim(async () => {
            this.sv.node.active = true;
            await this.reqCsUrl();
            if (g.customerServiceUrl) {
                let item = cc.instantiate(this.newItem)
                item.active = true;

                this.sv.content.addChild(item);
                this.sv.content.getComponent(cc.Layout).enabled = false;
                let posY = this.sv.content.height;
                item.setPosition(0, -posY / 2);
                this.notice.active = false;
            } else {
                await this.createWxItem;
            }
        });
    }

    async createWxItem() {
        let data = await net.request("hall.hallHandler.getPopularize");
        if (data.code === 200) {
            if (data.wxs) {
                this.sv.content.getComponent(cc.Layout).enabled = true;
                for (let idx = 0; idx < data.wxs.length; idx++) {
                    const wx = data.wxs[idx];
                    let item = <cc.Node>cc.instantiate(this.item);
                    item.active = true;
                    this.sv.content.addChild(item);
                    item.x = 0;
                    let name = item.getComponentInChildren(cc.Label);
                    name.string = wx;

                    let btn = item.getComponentInChildren(cc.Button);
                    let handler = new cc.Component.EventHandler();
                    handler.target = this.node;
                    handler.component = cc.js.getClassName(this);
                    handler.handler = "onClickCopy";
                    handler.customEventData = wx;
                    btn.clickEvents.push(handler);
                }
            }
            this.notice.active = !data.wxs;
        }
    }

    onClickCopy(ev: cc.Event.EventTouch, str: string) {
        if (!str) return
        let success = setClipboard(str)
        if (success) {
            let install = isAppInstalled('wx')
            showTip("微信已拷贝到剪切板")
            if (install) {
                openApp('wx')
            }
        } else {
            showTip("微信号拷贝失败")
        }
    }

    // 打开客服聊天界面匹配代理客服
    async onOpenCsPlat() {
        this.closeAction(() => {
            if (!this.lobby) {
                let lobby = cc.find("lobby");
                if (lobby) {
                    let tLobby = lobby.getComponent(Lobby)
                    if (tLobby) this.lobby = tLobby;
                } else {
                    showTip("敬请期待！");
                    return;
                }
            }
            if (!g.customerServiceUrl) {
                showTip("敬请期待！");
                return;
            };
            let platUrl = g.customerServiceUrl + "&protoType=2&pType=203"  // 链接代理客服，pType=203
            this.lobby.onClickOnlineCustomerService(true, platUrl);
        });
    }

    async reqCsUrl() {
        showLoading();
        let data = await net.request("hall.csHandler.csUrlRequest", { type: 2 });
        hideLoading();
        if (data.code === 200) {
            if (data.csUrl) {
                g.customerServiceUrl = data.csUrl;
                g.customerFileServerUrl = data.fileServerUrl;
                return;
            }
        } else {
            showTip(ErrCodes.CODES[data.code]);
        }
        g.customerServiceUrl = "";
    }
}
