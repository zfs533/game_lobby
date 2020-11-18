import JHGame from "./jhGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JHInfo extends cc.Component {

    @property(cc.Label)
    private betsPoolInfo: cc.Label = undefined;

    @property(cc.Label)
    private singlebetsPoolInfo: cc.Label = undefined;

    @property(cc.Node)
    private leftInfo: cc.Node = undefined;

    @property(cc.Node)
    private rightInfo: cc.Node = undefined;

    @property(cc.Sprite)
    private spBlindTurn: cc.Sprite = undefined;

    game: JHGame;

    onLoad() {
        // init logic
        this.leftInfo.active = false;
        this.rightInfo.active = false;

        this.betsPoolInfo.node.parent.active = false;
        this.singlebetsPoolInfo.node.parent.active = false;
        this.spBlindTurn.node.active = false;
    }

    /**
     * @description 更新总注、当前单注
     * @returns
     * @memberof JHInfo
     */
    updateBetsPool() {
        this.betsPoolInfo.node.parent.active = true;
        this.singlebetsPoolInfo.node.parent.active = true;
        if (this.game.curSingleBet === undefined || this.game.totalBets === undefined) {
            this.betsPoolInfo.string = "--"
            this.singlebetsPoolInfo.string = "--"
            return;
        }
        this.betsPoolInfo.string = this.game.totalBets.toString();
        this.singlebetsPoolInfo.string = this.game.curSingleBet.toString();
    }

    /**
     * @description 显示房间底分
     * @memberof JHInfo
     */
    updateLeft() {
        let game = this.game;
        let lblBaseScore = this.getInfoComp(cc.Label, this.leftInfo, "baseScore");
        lblBaseScore.string = "底分 " + this.game.baseScore;
        this.leftInfo.active = true;
    }

    /**
     * @description 更新轮数
     * @memberof JHInfo
     */
    updateRound() {
        let game = this.game;
        let lblRound = this.getInfoComp(cc.Label, this.rightInfo, "round");
        if (game.round === undefined) {
            lblRound.string = "轮数 " + "-/-";
        } else {
            lblRound.string = "轮数 " + game.round + "/" + (game.totalRound || 20);
        }
    }

    updateRight() {
        this.updateRound();
        this.rightInfo.active = true;
    }

    private getInfoComp<T extends cc.Component>(type: { prototype: T }, parent: cc.Node, name: string) {
        let node = parent.getChildByName(name);
        if (!node) {
            if (type.constructor === cc.Label.constructor) {
                let exam = parent.getChildByName("example");
                if (exam) {
                    exam.active = false;
                    node = cc.instantiate(exam);
                    node.name = name;
                    node.active = true;
                    parent.addChild(node);
                }
            }
            if (!node) {
                return;
            }
        }
        node.active = true;
        return node.getComponent(type);
    }

    /**
     * @description 更新闷牌显示
     * @returns
     * @memberof JHInfo
     */
    updateBlindIcon() {
        if (!this.spBlindTurn || !this.spBlindTurn.isValid) {
            return;
        }
        let node = this.spBlindTurn.node;
        let me = this.game.plyMgr.me;
        if (!me.isLooker && !this.game.canLookCard && !me.isLooked) {
            node.active = true;
        } else {
            node.active = false;
        }
    }
}
