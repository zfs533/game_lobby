import PdkGame from "./pdkGame";
import { ResultShowInfo } from "./pdkMsg";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DdzResult extends cc.Component {
    @property(cc.Node)
    private infoPanel: cc.Node = undefined;

    @property(cc.Node)
    private sucPanel: cc.Node = undefined;

    @property(cc.Node)
    private failPanel: cc.Node = undefined;

    @property(cc.Node)
    private nodeBtns: cc.Node = undefined;

    @property(cc.Label)
    private prepareTime: cc.Label = undefined;

    @property(cc.Node)
    private nodeLeftCards: cc.Node = undefined;

    @property(cc.Node)
    private nodeRightCards: cc.Node = undefined;

    @property([cc.Label])
    private labLoc: cc.Label[] = [];

    @property([cc.Label])
    private labScore: cc.Label[] = [];

    @property([cc.Label])
    private labRemain: cc.Label[] = [];

    @property([cc.Label])
    private labMoney: cc.Label[] = [];

    @property([cc.Node])
    private nodePay: cc.Node[] = [];// 包赔

    private game: PdkGame;
    private _prepareEndTime: number;

    setGame(game: PdkGame) {
        this.game = game;
    }

    show(resultInfos: ResultShowInfo[]) {
        for (let i = 0; i < resultInfos.length; i++) {
            const info = resultInfos[i];
            let ur = info.ur;
            this.labLoc[i].string = info.loc ? info.loc : '--';
            this.labScore[i].string = info.minScore;
            let remainNum = ur.remainCards ? ur.remainCards.length : 0;
            this.labRemain[i].string = remainNum.toString();
            this.labMoney[i].string = ur.money.toString();

            let col = info.isMe ? (new cc.Color).fromHEX("#F5A302") : (new cc.Color).fromHEX("#D6D6D6");
            this.labLoc[i].node.color = col;
            this.labScore[i].node.color = col;
            this.labRemain[i].node.color = col;
            this.labMoney[i].node.color = col;
            this.nodePay[i].active = !!info.guan;
            if (!!info.guan) {
                this.nodePay[i].children.forEach(node => {
                    node.active = false;
                });
                let node = this.nodePay[i].getChildByName(info.guan);
                if (node) node.active = true;
            }

            if (info.isMe) {
                if (+ur.money > 0) {
                    this.game.adoMgr.playSuc();
                    this.showSucFail(this.sucPanel, 0);
                } else {
                    this.game.adoMgr.playFail();
                    this.showSucFail(this.failPanel, 1);
                }
            } else {
                let remainCards = info.remainCards;
                if (!remainCards) continue;
                remainCards.sort(this.pointSort);

                let nodeCards: cc.Node;
                if (info.isRight) {
                    nodeCards = this.nodeRightCards;
                } else {
                    nodeCards = this.nodeLeftCards;
                }
                if (!nodeCards) continue;

                nodeCards.removeAllChildren();
                for (let index = 0; index < remainCards.length; index++) {
                    const cardData = remainCards[index];
                    let card = this.game.pkrGame.getPoker(cardData);
                    if (!card) break
                    card.y = 0;
                    card.scale = 0.5;
                    nodeCards.addChild(card);
                }
            }
        }
        this.node.active = true;

        this.infoPanel.scale = 1;
        this.prepareTime.node.active = false;
        this.nodeBtns.opacity = 0;
        this.infoPanel.opacity = 0;

        // this.nodeBtns.runAction(cc.fadeTo(0.5, 255));
        cc.tween(this.nodeBtns).to(0.5, { opacity: 255 }).start();
        // this.infoPanel.runAction(cc.fadeTo(0.5, 255));
        cc.tween(this.infoPanel).to(0.5, { opacity: 255 }).start();
    }

    private showSucFail(panel: cc.Node, idx: number) {
        this.sucPanel.active = false;
        this.failPanel.active = false;
        panel.active = true;
        if (idx == 0) panel.getChildByName('tywinjs').getComponent(cc.Animation).play();
        else panel.getChildByName('tylossjs').getComponent(cc.Animation).play();
    }

    showTicker(timer?: number) {
        if (timer === undefined) {
            return;
        }
        this.prepareTime.node.active = true;
        this._prepareEndTime = Date.now() + timer;
        let t = Math.round(timer / 1000);
        this.prepareTime.string = t.toString();
        this.unschedule(this.countdownPre);
        this.schedule(this.countdownPre, 1, t, 1);
    }

    private countdownPre() {
        let now = Date.now();
        if (!this.prepareTime || !this.prepareTime.isValid || now >= this._prepareEndTime) {
            this.prepareTime.node.active = false;
            this.unschedule(this.countdownPre);
            return;
        }
        let t = Math.round((this._prepareEndTime - now) / 1000);
        this.prepareTime.node.active = true;
        this.prepareTime.string = t.toString();
    }

    hide() {
        this.node.active = false;
    }

    private onClickBack() {
        this.hide();
        this.game.menu.onBackClick();
    }

    private onClickNext() {
        this.hide();
        this.game.onClickNext();
    }

    private pointSort(aData: number, bData: number) {
        let aPoint = aData & 0xff;
        let bPoint = bData & 0xff;
        let aSuit = aData >> 8;
        let bSuit = bData >> 8;
        if (aPoint === bPoint) {
            return bSuit - aSuit;
        } else {
            return bPoint - aPoint;
        }
    }
}
