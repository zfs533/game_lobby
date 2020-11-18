import JDNNGame from "./jdnnGame"
import QznnGame from "./qznnGame"

const { ccclass, property } = cc._decorator

@ccclass
export default class NNInfo extends cc.Component {

    @property(cc.Node)
    private nodeBets: cc.Node = undefined

    @property(cc.Label)
    private lblBets: cc.Label = undefined

    @property(cc.Label)
    private spPrompt: cc.Label = undefined;

    private game: JDNNGame | QznnGame
    private gameName: string
    private descFor:string[] = ["","抢庄开始，请选择分数抢庄...","请选择压分的倍数...","请选择三张牌来斗牛牛...","请等待其他玩家押分"];

    init(game: JDNNGame | QznnGame, gameName: string) {
        this.game = game
        this.gameName = gameName
    }

    onLoad() {
        // init logic
        this.nodeBets.active = false
        this.spPrompt.node.parent.active = false;

    }

    updateBetsPool() {
        let str = this.gameName + "    底分" + this.game.baseScore
        this.nodeBets.active = true
        this.lblBets.string = ''+this.game.baseScore
    }

    showPrompt(pr: number) {
        this.spPrompt.node.parent.active = true;
        this.spPrompt.string = this.descFor[pr];
    }

    hidePrompt() {
        this.spPrompt.node.parent.active = false;
    }
}
