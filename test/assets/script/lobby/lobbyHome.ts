import BaseLobbyUi from "./baseLobbyUi";
import Lobby from './lobby';
import { setClipboard, getOfficialUrl, setInteractable, getCommonRatio } from '../common/util';
import { showTip } from "../common/ui";
import User from "../common/user";
import QRCode from "./qRCode";
import g from "../g";
import { ItemNames, GameId } from "../common/enum";

const HIDE_GAME_NUM = 6;
const VIEW_TURN_INTERVAL = 5;
const { ccclass, property } = cc._decorator;

@ccclass
export default class LobbyHome extends BaseLobbyUi {
    @property(cc.ScrollView)
    private svGame: cc.ScrollView = undefined;

    @property(cc.Node)
    private nodeGames: cc.Node = undefined;

    @property(cc.PageView)
    private pageView: cc.PageView = undefined;

    @property(cc.Node)
    private nodePopularize: cc.Node = undefined;// 全民代理

    @property(cc.Node)
    private nodeArrowL: cc.Node = undefined;

    @property(cc.Node)
    private nodeArrowR: cc.Node = undefined;

    @property(QRCode)
    private qRCode: QRCode = undefined;

    @property([cc.Prefab])
    private preGameSpine: cc.Prefab[] = [];

    @property(cc.Prefab)
    private preFreshGuide: cc.Prefab = undefined;

    private _lobby: Lobby;
    private _turnView: boolean = true;
    private _turnTime: number = 0;

    private commonRatio: number = 0;

    onLoad() {
        super.onLoad();
        this.initGameList();
        this.commonRatio = getCommonRatio();

        let x = this.svGame.getScrollOffset().x;
        let max = this.svGame.getMaxScrollOffset().x;
        this.nodeArrowL.active = x > 0;
        this.nodeArrowR.active = x < -max;

        this.pageView.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart);
        this.pageView.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd);
        this.pageView.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd);
    }

    onTouchStart = (event: cc.Event.EventTouch) => {
        this._turnView = false;
    }

    onTouchEnd = (event: cc.Event.EventTouch) => {
        this._turnView = true;
    }

    init(lobby: Lobby) {
        this._lobby = lobby;
    }

    private _scrollToIndex = 0;
    start() {
        this.show();

        let nodePages = this.pageView.getPages();
        this.schedule(() => {
            if (!this._turnView) {
                this._turnTime = 0;
                return;
            };

            this._turnTime += 1;
            if (this._turnTime % VIEW_TURN_INTERVAL === 0) {
                let nextPageIdx = this.pageView.getCurrentPageIndex() + 1;
                if (nextPageIdx >= nodePages.length) {
                    nextPageIdx = 0;
                }
                this.pageView.scrollToPage(nextPageIdx, 2);
                this._scrollToIndex = nextPageIdx;
            }
        }, 1);

        if (User.shieldStatus.channelApprentice) {
            this.pageView.removePage(this.nodePopularize);
        }

        this.showOrHideEventPage("ad4", g.eventsActive);

    }

    setQRContent() {
        if (g.iosPushSwitch) {
            //上传DeviceToken
            this._lobby.uplDevToken();
        }
        this.qRCode.setContent(getOfficialUrl());
    }

    onDisable() {
        this.pageView.scrollToPage(this._scrollToIndex, 0);
    }

    private initGameList() {
        // cc.log('initGameList', g.hallVal.saveGameList)
        if (!g.hallVal.saveGameList) {
            return;
        }

        for (const node of this.nodeGames.children) {
            node.active = false;
            // cc.log(node.name)
            let wait = node.getChildByName("wait");
            if (wait) {
                wait.active = false;
            }
        }
        let games = g.hallVal.saveGameList;
        console.log(games)
        games.sort((a, b) => { return a.idx - b.idx });
        for (let idx = 0; idx < games.length; idx++) {
            let gid = games[idx].gid;
            let node = this.nodeGames.getChildByName(gid);
            if (node) {
                node.active = true;
                node.setSiblingIndex(idx);
                let gameSpine = this.getGameSpine(gid)
                if (gameSpine) {
                    let cloneSpine = cc.instantiate(gameSpine)
                    node.addChild(cloneSpine)
                    cloneSpine.zIndex=-1
                }
                let gameWait = node.getChildByName(gid).getChildByName("game_wait");
                if (!games[idx].active) {
                    // 敬请期待
                    setInteractable(node.getComponent(cc.Button), false);
                    node.color = (new cc.Color).fromHEX("#706F6F");
                    node.opacity = 200;
                    if (gameWait) {
                        gameWait.opacity = 180;
                        gameWait.active = true;
                    }
                } else {
                    if (gameWait) {
                        gameWait.opacity = 255;
                        gameWait.active = false;
                    }
                }
            }
        }
        // 低于6个游戏就不用滑动
        if (this.nodeGames.childrenCount <= HIDE_GAME_NUM) {
            this.svGame.enabled = false;
        }
        //引导
        if (!cc.sys.localStorage.getItem(ItemNames.guideState)) {
            cc.sys.localStorage.setItem(ItemNames.guideState, 1);
            let guideCfg = g.hallVal.guideCfg.gid ? g.hallVal.guideCfg.gid : GameId.DDZ;
            let guideNode = this.nodeGames.getChildByName(guideCfg);
            let guidePre = cc.instantiate(this.preFreshGuide);
            guideNode.addChild(guidePre);
            guidePre.setPosition(0, 80);
        }
    }

    /**
    * 大厅活动轮播图显示控制
    * @param ad 轮播图节点名称
    * @param isShow 显示or隐藏
    */
    showOrHideEventPage(ad: string, isShow: boolean) {
        if (isShow) {
            // let content = this.pageView.node.getChildByName("view").getChildByName("content");
            // let child = content.getChildByName(ad)
            // if (child) this.pageView.removePage(child);
            let nodeEvents = this.pageView.node.getChildByName(ad);
            if (!nodeEvents) return;
            nodeEvents.removeFromParent(false);
            nodeEvents.active = true;
            this.pageView.addPage(nodeEvents);
        }
    }


    private onClickWelfare() {
        this._lobby.onClickWelfare();
    }

    //点击打开充值返利页面
    private onClickRechargeRebate() {
        this._lobby.onClickRecharge();
    }


    private onClickCopy() {
        let url = getOfficialUrl();
        if (setClipboard(url)) showTip("官网地址复制成功!");
    }

    private onClickGotoOfficial() {
        let realUrl = g.serviceCfg.web;
        if (realUrl.toString().indexOf("?") >= 0) {    // 兼容参数判断
            realUrl += "&_intro=1";
        } else {
            realUrl += "/?_intro=1";
        }
        cc.sys.openURL(realUrl);
    }

    private onClickPopularize() {
        this._lobby.onClickPopularize();
    }

    private async onClickGame(event: any, data: GameId) {
        let guideCfg = g.hallVal.guideCfg.gid ? g.hallVal.guideCfg.gid : GameId.DDZ;
        if (data === guideCfg) {
            let guide = event.target.getChildByName('xsydGame');
            if (guide) guide.active = false;
        }
        this._lobby.showGameStage(data);
    }

    private toActiveL: boolean;
    private toActiveR: boolean;
    private onScrollList(s: cc.ScrollView) {
        let now = s.getScrollOffset();
        let max = s.getMaxScrollOffset();
        if (this.toActiveL !== undefined && this.toActiveL !== now.x < 0) {
            this.nodeArrowL.stopAllActions();
        }
        if (this.toActiveR !== undefined && this.toActiveR !== now.x > -max.x) {
            this.nodeArrowR.stopAllActions();
        }
        this.toActiveL = now.x < 0;
        this.toActiveR = now.x > -max.x;
        this.switchArrow(this.nodeArrowL, this.toActiveL);
        this.switchArrow(this.nodeArrowR, this.toActiveR);
    }
    private onClickLArrow() {
        this.svGame.scrollToLeft(0.1);
        this.switchArrow(this.nodeArrowL, false);
        this.switchArrow(this.nodeArrowR, true);
    }
    private onClickRArrow() {
        this.svGame.scrollToRight(0.1);
        this.switchArrow(this.nodeArrowL, true);
        this.switchArrow(this.nodeArrowR, false);
    }
    private switchArrow(arrow: cc.Node, active: boolean) {
        if (active) {
            arrow.active = true;
        }
        // arrow.runAction(cc.sequence(
        //     cc.fadeTo(0.2, active ? 255 : 0),
        //     cc.callFunc(() => {
        //         if (!active) {
        //             arrow.active = false;
        //         }
        //     })
        // ));
        cc.tween(arrow)
            .to(0.2, { opacity: active ? 255 : 0 })
            .call(
                () => {
                    if (!active) {
                        arrow.active = false;
                    }
                }
            ).start();
    }

    private getGameSpine(gid: string) {
        let gameSpine;
        if (gid === GameId.JH) {
            gameSpine = this.preGameSpine[0];
        } else if (gid === GameId.QZNN) {
            gameSpine = this.preGameSpine[1];
        } else if (gid === GameId.ERMJ) {
            gameSpine = this.preGameSpine[2];
        } else if (gid === GameId.BRNN) {
            gameSpine = this.preGameSpine[3];
        } else if (gid === GameId.DDZ) {
            gameSpine = this.preGameSpine[4];
        } else if (gid === GameId.BY) {
            gameSpine = this.preGameSpine[5];
        } else if (gid === GameId.PDK) {
            gameSpine = this.preGameSpine[6];
        } else if (gid === GameId.JDNN) {
            gameSpine = this.preGameSpine[7];
        } else if (gid === GameId.DZPK) {
            gameSpine = this.preGameSpine[8];
        } else if (gid === GameId.QHB) {
            gameSpine = this.preGameSpine[9];
        } else if (gid === GameId.LH) {
            gameSpine = this.preGameSpine[10];
        } else if (gid === GameId.HH) {
            gameSpine = this.preGameSpine[11];
        } else if (gid === GameId.EBG) {
            gameSpine = this.preGameSpine[12];
        } else if (gid === GameId.DFDC) {
            gameSpine = this.preGameSpine[13];
        } else if (gid === GameId.IM) {
            gameSpine = this.preGameSpine[14];
        } else if (gid === GameId.DGBJL) {
            gameSpine = this.preGameSpine[15];
        } else if (gid === GameId.DGLP) {
            gameSpine = this.preGameSpine[16];
        } else if (gid === GameId.DGSB) {
            gameSpine = this.preGameSpine[17];
        } else if (gid === GameId.BCBM) {
            gameSpine = this.preGameSpine[18];
        } else if (gid === GameId.FQZS) {
            gameSpine = this.preGameSpine[19];
        } else if (gid === GameId.HBSL) {
            gameSpine = this.preGameSpine[20];
        }
        return gameSpine;
    }
}
