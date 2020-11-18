import StageRes from "./stageRes";
import BaseLobbyUi from "./baseLobbyUi";
import { showTip, showLoading, hideLoading } from '../common/ui';
import { ErrCodes } from '../common/code';
import g from "../g";
import Lobby from "./lobby";
import { ItemNames, GameId } from "../common/enum";
import net from "../common/net";
import { getCommonRatio } from "../common/util";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Stage extends BaseLobbyUi {
    @property({ type: cc.Node, override: true })
    nodeLeft: cc.Node = undefined;

    @property({ type: cc.Node, override: true })
    nodeRight: cc.Node = undefined;


    @property(cc.Label)
    labNoTips: cc.Label = undefined;

    @property(cc.ScrollView)
    stageLists: cc.ScrollView = undefined;

    @property(cc.Layout)
    stageContent: cc.Layout = undefined;

    @property(cc.Node)
    nodeTop: cc.Node = undefined;

    @property(cc.Node)
    nodeTitle: cc.Node = undefined;

    @property(cc.Prefab)
    preStage: cc.Prefab = undefined;

    @property(cc.Prefab)
    private preFreshGuide: cc.Prefab = undefined;

    @property([cc.SpriteFrame])
    sfTitle: cc.SpriteFrame[] = [];

    private _stageRes: StageRes;
    private gameId: GameId;

    get stageRes() {
        if (!this._stageRes) {
            this._stageRes = cc.instantiate(this.preStage).getComponent(StageRes);
        }
        return this._stageRes;
    }

    onLoad() {
        super.onLoad();

        let ratio = getCommonRatio();
        let width = this.nodeRight.width;
        this.nodeRight.setContentSize(width * ratio, 640);
        this.nodeTop.setContentSize(width * ratio, 640);

        this.nodeTop.active = false;
        this.labNoTips.node.active = false;
    }

    async beforeShow(gameID: GameId) {
        this.gameId = gameID;
        showLoading("加载房间列表");
        let ok = await this.createList();
        hideLoading();
        return ok;
    }

    show() {
        super.show();
        let duration = 0.5;
        this.nodeTop.active = true;
        this.nodeTop.opacity = 0;
        //this.nodeTop.runAction(cc.fadeIn(duration));
        cc.tween(this.nodeTop).to(duration,{opacity:255}).start();

        let sfTitle = this.sfTitle;
        let sf = sfTitle[0];
        if (this.gameId === GameId.JH) {
            sf = sfTitle[0];
        } else if (this.gameId === GameId.QZNN) {
            sf = sfTitle[1];
        } else if (this.gameId === GameId.ERMJ) {
            sf = sfTitle[2];
        } else if (this.gameId === GameId.BRNN) {
            sf = sfTitle[3];
        } else if (this.gameId === GameId.DDZ) {
            sf = sfTitle[4];
        } else if (this.gameId === GameId.BY) {
            sf = sfTitle[5];
        } else if (this.gameId === GameId.PDK) {
            sf = sfTitle[6];
        } else if (this.gameId === GameId.JDNN) {
            sf = sfTitle[7];
        } else if (this.gameId === GameId.DZPK) {
            sf = sfTitle[8];
        } else if (this.gameId === GameId.QHB) {
            sf = sfTitle[9];
        }
        this.nodeTitle.getComponent(cc.Sprite).spriteFrame = sf;
    }

    hide() {
        super.hide();
        this.nodeTop.active = false;
    }

    async createList() {
        let yards = g.hallVal.saveGameRoomList[this.gameId];
        if (!yards) {
            yards = await Stage.getYardList(this.gameId);
            if (!yards) return;
            g.hallVal.saveGameRoomList[this.gameId] = yards;
        }
        return new Promise((resolve: (ok: boolean) => void) => {
            this.labNoTips.node.active = false;
            this.labNoTips.node.active = !yards || yards.length === 0;

            let lobby = cc.find("lobby");
            let listView = this.stageLists;
            listView.node.active = true;
            listView.content.removeAllChildren();

            let wid = 200;
            for (let idx = 0; idx < yards.length; idx++) {
                let yardInfo = yards[idx];
                //生成场次按钮
                let newIdx = idx + 1;
                if (this.gameId === GameId.BY) {    // 捕鱼预制为5个，但可配置为4个
                    if (yards.length > 4) newIdx = idx + 1;
                    else newIdx = idx + 2;
                }
                let stage = this.stageRes.getStageModel(yardInfo, this.gameId, newIdx);
                if (!stage) {
                    continue;
                }
                wid = stage.getContentSize().width;
                listView.content.addChild(stage);
                if (this.gameId === GameId.QHB) {
                    stage.setPosition(0, 80);
                } else {
                    stage.setPosition(0, -80);
                }

                let guideCfg = g.hallVal.guideCfg.gid ? g.hallVal.guideCfg.gid : GameId.DDZ;
                if (this.gameId === guideCfg && cc.sys.localStorage.getItem(ItemNames.guideState) !== '2' && !idx) {
                    cc.sys.localStorage.setItem(ItemNames.guideState, 2);
                    let guidePre = cc.instantiate(this.preFreshGuide);
                    stage.addChild(guidePre);
                    guidePre.setPosition(0, 300);
                }

                let btn = stage.addComponent(cc.Button);
                (btn as cc.Button).transition = cc.Button.Transition.SCALE;
                (btn as cc.Button).zoomScale = 1.05
                let handler = new cc.Component.EventHandler();
                handler.target = lobby;
                handler.component = cc.js.getClassName(Lobby);
                handler.handler = "onClickState";
                handler.customEventData = JSON.stringify({ ...yardInfo, rid: this.gameId });
                btn.clickEvents.push(handler);
            }

            let allWid = this.nodeRight.width;
            let spac = (allWid - wid * yards.length) / (yards.length + 1);

            this.stageContent.spacingX = spac;
            this.stageContent.paddingLeft = spac;

            // if (this.gameId === GameId.BY) {
            //     this.stageContent.paddingLeft = 20;
            //     this.stageContent.spacingX = 10;
            // }
            resolve(true);
        });
    }

    static async getYardList(gameId: GameId) {
        let data = await net.request("hall.roomHandler.getYardList", { gid: gameId });
        if (!data || data.code !== 200) {
            let errStr;
            if (data.code === 1004 || 400) {
                errStr = "游戏暂未开放";
            } else {
                errStr = ErrCodes.getErrStr(data.code, "获取房间列表失败");
            }
            showTip(errStr);
            return;
        }

        let yards = data.matches;
        if (yards) {
            yards.sort((a, b) => {
                if (a.idx === b.idx) {
                    if (a.allInMaxMoney !== undefined && b.allInMaxMoney !== undefined) {
                        return +a.allInMaxMoney - (+b.allInMaxMoney);
                    } else {
                        return 1;
                    }
                } else {
                    return a.idx - b.idx;
                }
            });
            return yards;
        }
        else {
            let errStr;
            errStr = "游戏暂未开放";
            showTip(errStr);
            return;
        }
    }
}
