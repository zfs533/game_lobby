import { GAME_NAME } from "./cfg";
import net from "./net";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Marquee extends cc.Component {
    @property(cc.RichText)
    private richContent: cc.RichText = null

    @property
    private showAd = false// 跑马灯是否显示广告

    private speed = 1
    private noticeInterval = 2// 间隔时间
    private adsInterval = 3// 间隔时间
    private ads: string[] = []
    private notices: { content: string, level: string }[] = []
    private adIndex = 0
    private shouldMove = false
    private showingNotice = false

    protected async onLoad() {
        this.node.active = false
        if (this.showAd) {
            let data = await net.request("hall.hallHandler.getAds");
            if (data.code !== 200 || !data.ads) return
            this.ads = []
            data.ads.forEach(a => {
                let s = this.convertFromLaya(a)
                this.ads.push(s)
            })
            this.showAds()
        }
        net.on("globalNotice", this.onReceiveNotice.bind(this))
    }
    private convertFromLaya(str: string) {
        str = str.replace(/(.*)>(.*)\|(.*)<(.*)/g, "$1>$2$3<$4")
        return str.replace(/<span color='(.*?)'>(.*?)<\/span>/g, "<color=$1>$2</c>")
    }
    private onReceiveNotice(data: { content: string, level: string }) {
        let newAnnouncement = data.content
        let reg = /\^\w+\^/g
        let match = data.content.match(reg)
        if (match && match.length > 0) {
            let content = match[0]
            // 用gid来获取游戏名
            let gid = content.substr(1, content.length - 2);
            let name = GAME_NAME[gid] ? GAME_NAME[gid] : "";
            newAnnouncement = data.content.replace(reg, name)
        }
        data.content = newAnnouncement

        if (this.showingNotice) {
            if (this.notices.length >= 10) {
                return
            }
            if (this.notices.some(a => a.content === data.content)) {
                return
            }
            this.notices.push(data)
            return
        }
        this.richContent.string = this.convertFromLaya(data.content)
        this.showingNotice = true
        this.resetRich()
    }

    private showNextNotice() {
        if (!this.notices || this.notices.length === 0) {
            return
        }
        this.notices.sort((a, b) => {
            return +a.level - +b.level
        })
        let notice = this.notices.shift()
        this.onReceiveNotice(notice)
    }

    private showAds() {
        if (!this.ads || this.ads.length === 0) {
            return
        }
        let ad = this.ads[this.adIndex]
        if (this.adIndex >= this.ads.length) {
            this.adIndex = 0
            ad = this.ads[this.adIndex]
        }
        this.adIndex++
        this.richContent.string = ad
        this.resetRich()
    }

    private resetRich() {
        this.node.active = true
        this.node.stopAllActions()
        this.node.opacity = 0
        // this.node.runAction(cc.fadeIn(1))
        cc.tween(this.node).to(1, { opacity: 255 }).start();
        let node = this.richContent.node
        let parent = node.parent
        node.x = parent.width / 2 + 20 * this.speed
        this.shouldMove = true
    }

    protected update() {
        if (!this.shouldMove) {
            return
        }
        let node = this.richContent.node
        let parent = node.parent
        node.x -= this.speed
        if (node.x + node.width < -parent.width / 2) {
            this.shouldMove = false

            let action
            if (this.showAd) {
                if (!this.showingNotice) {
                    action = cc.sequence(
                        cc.fadeOut(1),
                        cc.delayTime(this.adsInterval),
                        cc.callFunc(this.showAds, this)
                    )
                } else {
                    this.showingNotice = false
                    if (!this.notices || this.notices.length === 0) {
                        action = cc.sequence(
                            cc.fadeOut(1),
                            cc.delayTime(this.noticeInterval),
                            cc.callFunc(this.showAds, this)
                        )
                    } else {
                        action = cc.sequence(
                            cc.fadeOut(1),
                            cc.delayTime(this.noticeInterval),
                            cc.callFunc(this.showNextNotice, this)
                        )

                    }
                }
            } else {
                action = cc.fadeOut(1)

            }
            //this.node.runAction(action)
            cc.tween(this.node).then(action).start();
        }
    }

    protected onDestroy() {
        window.pomelo.off("globalNotice")
    }
}