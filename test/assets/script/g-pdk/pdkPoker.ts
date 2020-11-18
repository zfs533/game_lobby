import Poker from "../g-dp/dpPoker";
const { ccclass, property } = cc._decorator;

@ccclass
export default class PdkPoker extends Poker {
    private nodeNewBack: cc.Node = undefined

    onLoad() {
        super.onLoad();
        this.nodeNewBack = this.node.getChildByName("back");
        this.setPokerBack(false);
    }

    setPokerBack(visible: boolean) {
        this.nodeNewBack.active = visible;
    }
}
