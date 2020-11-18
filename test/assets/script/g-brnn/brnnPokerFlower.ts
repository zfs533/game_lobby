
const { ccclass, property } = cc._decorator;

@ccclass
export default class BrnnPokerFlower extends cc.Component {
    onLoad() {
        this.hideAllChildren();
    }
    onDisable() {
        this.hideAllChildren();
    }

    /**
     * 设置花色和扑克点数
     * @param origin
     * @param suit
     */
    showFlowerNumber(origin: number, suit: number) {
        origin = origin & 0x000000ff
        if (suit % 2 == 0) {//red
            let nd = this.node.getChildByName(`hong_${origin}`);
            if (nd) {
                nd.active = true;
            }
        }
        else {
            let nd = this.node.getChildByName(`hei_${origin}`);
            if (nd) {
                nd.active = true;
            }
        }
        switch (suit) {
            case 0:
                this.node.getChildByName("fk").active = true;
                break;
            case 1:
                this.node.getChildByName("mh").active = true;
                break;
            case 2:
                this.node.getChildByName("hot").active = true;
                break;
            case 3:
                this.node.getChildByName("ht").active = true;
                break;
        }
    }

    /**
     * 隐藏所有子节点
     */
    hideAllChildren() {
        let list = this.node.children;
        for (let i = 0; i < list.length; i++) {
            list[i].active = false;
        }
    }

}
