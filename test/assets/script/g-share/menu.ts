import Game from "./game";
import GameHelp from "./gameHelp";
import { Setting } from "../lobby/setting";
import { showTip, showConfirm, showLoading, hideLoading } from "../common/ui";
import { setInteractable, getCommonRatio } from '../common/util';
import PopActionBox from "../lobby/popActionBox";

const typeName = "cardTypes"
const { ccclass, property } = cc._decorator

@ccclass
export default class Menu extends cc.Component {

    @property(cc.Button)
    protected btnBack: cc.Button = undefined;

    @property(cc.Button)
    protected btnList: cc.Button = undefined;

    @property(cc.Button)
    protected btnSetting: cc.Button = undefined;

    @property(cc.Button)
    protected btnChangeDesk: cc.Button = undefined;

    @property(cc.Button)
    protected btnHelp: cc.Button = undefined;

    @property(cc.Button)
    protected btnCards: cc.Button = undefined;

    @property(cc.Node)
    protected bg: cc.Node = undefined;

    @property(cc.Prefab)
    private gameHelp: cc.Prefab = undefined;

    @property(cc.Prefab)
    private setting: cc.Prefab = undefined;

    private game: Game;
    private _bgPlayingAnim: boolean;
    public isClickBackBtn: boolean;   // 是否点击退出按钮

    init(game: Game) {
        this.game = game;
    }

    onEnable() {
        // init logic
        let ratio = getCommonRatio();
        if (ratio - 1 > 0.15) {     // 当处于长屏手机时, 避开刘海
            let w = this.node.width * ratio - 132;
            this.node.setContentSize(w, 640);
        }
        this.bg.active = false;
        this.btnBack.node.active = true;
        this.btnList.node.active = true;

    }
    onBackClick() {
        this.isClickBackBtn = true;
        let str: string | undefined
        let me = this.game.plyMgr.me
        if (this.game.gaming && me && !me.isLooker) {
            str = "亲，退出后会被托管至本局结束，确定要退出吗？"
        }
        if (str) {
            let confirm = showConfirm(str, "确定", "取消")
            confirm.okFunc = () => {
                this.game.leaveGame()
            }
            confirm.cancelFunc = () => {
                this.isClickBackBtn = false;
            }
        } else {
            this.game.leaveGame()
        }
    }

    private onListClick() {
        if (this._bgPlayingAnim) {
            return;
        }
        this._bgPlayingAnim = true;
        let node = this.bg;
        if (node.active) {
            // node.runAction(cc.sequence(cc.fadeOut(0.2), cc.callFunc(() => {
            //     node.active = false;
            //     this._bgPlayingAnim = false;
            // })));
            cc.tween(node)
                .to(0.2, { opacity: 0 })
                .call(
                    () => {
                        node.active = false;
                        this._bgPlayingAnim = false;
                    }
                ).start();
        } else {
            node.active = true;
            // node.runAction(cc.sequence(cc.fadeIn(0.2), cc.callFunc(() => {
            //     this._bgPlayingAnim = false;
            // })));
            cc.tween(node)
                .to(0.2, { opacity: 255 })
                .call(() => { this._bgPlayingAnim = false; })
                .start();
        }
    }
    private onSettingClick() {
        let node = cc.instantiate(this.setting)
        let canvas = cc.find("Canvas")
        canvas.addChild(node)
        node.active = true
        node.setPosition(0, 0)
        let setting = node.getComponent(Setting)
        setting.hideReLogin()
    }
    private onChangeClick() {
        this.game.chgRoom();
        this.onListClick();
    }
    private onHelpClick() {
        let node = cc.instantiate(this.gameHelp);
        let canvas = cc.find("Canvas");
        canvas.addChild(node);
        node.active = true;
        node.setPosition(0, 0);
        let gameHelp = node.getComponent(GameHelp);
        gameHelp.showContent(this.game.helpDesc);
    }

    private seeingCard = false;
    private onCardsClick() {
        if (this.seeingCard) {
            return;
        }
        if (!this.game.cardTypesBox) {
            showTip("无牌型");
            return
        };
        this.seeingCard = true;
        let canvas = cc.find("Canvas");
        let node = canvas.getChildByName(typeName);
        if (!node) {
            showLoading("加载牌型");
            node = cc.instantiate(this.game.cardTypesBox);
            node.name = typeName;
            canvas.addChild(node);
            node.active = true;
            node.setPosition(0, 0);
            node.once("open", () => {
                hideLoading();
                this.seeingCard = false;
            });
        } else {
            node.scale = 1;
            this.seeingCard = false;
            let box = node.getComponent(PopActionBox);
            box.openAnim();
        }
    }

    //按钮状态
    updateBtnState() {
        //按钮可点状态
        let me = this.game.plyMgr.me;
        if (me) {
            if (me.isLooker) {
                this.btnChangeDesk.node.opacity = 255;
                setInteractable(this.btnChangeDesk, true);
                return;
            }
        }
        if (this.game.gaming) {
            this.btnChangeDesk.node.opacity = 155;
            setInteractable(this.btnChangeDesk, false);
        } else {
            this.btnChangeDesk.node.opacity = 255;
            setInteractable(this.btnChangeDesk, true);
        }
    }

    hideChangeBtn() {
        this.btnChangeDesk.node.opacity = 155;
        setInteractable(this.btnChangeDesk, false);
    }
}
