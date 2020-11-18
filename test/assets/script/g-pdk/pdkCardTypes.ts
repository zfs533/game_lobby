import PokerRes from "../g-share/pokerRes";
import { CardPoint } from "../g-dp/dpAlgorithm";
import PopActionBox from '../lobby/popActionBox';

//扑克花色
export enum CardColor {
    CARD_COLOR_NULL,
    SPADES,          //黑桃♠️
    HEART,           //红心♥️
    PLUM,            //梅花♣️
    DIAMOND,         //方片♦️
}
//组合牌值
function makeACard(color: number, point: number) { return color << 8 | point; }

enum CARD_SHAPE {
    SPADES_2 = makeACard(CardColor.SPADES, CardPoint.POINT_2),
    SPADES_3 = makeACard(CardColor.SPADES, CardPoint.POINT_3),
    SPADES_4 = makeACard(CardColor.SPADES, CardPoint.POINT_4),
    SPADES_5 = makeACard(CardColor.SPADES, CardPoint.POINT_5),
    SPADES_6 = makeACard(CardColor.SPADES, CardPoint.POINT_6),
    SPADES_7 = makeACard(CardColor.SPADES, CardPoint.POINT_7),
    SPADES_8 = makeACard(CardColor.SPADES, CardPoint.POINT_8),
    SPADES_9 = makeACard(CardColor.SPADES, CardPoint.POINT_9),
    SPADES_10 = makeACard(CardColor.SPADES, CardPoint.POINT_10),
    SPADES_J = makeACard(CardColor.SPADES, CardPoint.POINT_J),
    SPADES_Q = makeACard(CardColor.SPADES, CardPoint.POINT_Q),
    SPADES_K = makeACard(CardColor.SPADES, CardPoint.POINT_K),
    SPADES_A = makeACard(CardColor.SPADES, CardPoint.POINT_A),

    HEART_2 = makeACard(CardColor.HEART, CardPoint.POINT_2),
    HEART_3 = makeACard(CardColor.HEART, CardPoint.POINT_3),
    HEART_4 = makeACard(CardColor.HEART, CardPoint.POINT_4),
    HEART_5 = makeACard(CardColor.HEART, CardPoint.POINT_5),
    HEART_6 = makeACard(CardColor.HEART, CardPoint.POINT_6),
    HEART_7 = makeACard(CardColor.HEART, CardPoint.POINT_7),
    HEART_8 = makeACard(CardColor.HEART, CardPoint.POINT_8),
    HEART_9 = makeACard(CardColor.HEART, CardPoint.POINT_9),
    HEART_10 = makeACard(CardColor.HEART, CardPoint.POINT_10),
    HEART_J = makeACard(CardColor.HEART, CardPoint.POINT_J),
    HEART_Q = makeACard(CardColor.HEART, CardPoint.POINT_Q),
    HEART_K = makeACard(CardColor.HEART, CardPoint.POINT_K),
    HEART_A = makeACard(CardColor.HEART, CardPoint.POINT_A),

    PLUM_2 = makeACard(CardColor.PLUM, CardPoint.POINT_2),
    PLUM_3 = makeACard(CardColor.PLUM, CardPoint.POINT_3),
    PLUM_4 = makeACard(CardColor.PLUM, CardPoint.POINT_4),
    PLUM_5 = makeACard(CardColor.PLUM, CardPoint.POINT_5),
    PLUM_6 = makeACard(CardColor.PLUM, CardPoint.POINT_6),
    PLUM_7 = makeACard(CardColor.PLUM, CardPoint.POINT_7),
    PLUM_8 = makeACard(CardColor.PLUM, CardPoint.POINT_8),
    PLUM_9 = makeACard(CardColor.PLUM, CardPoint.POINT_9),
    PLUM_10 = makeACard(CardColor.PLUM, CardPoint.POINT_10),
    PLUM_J = makeACard(CardColor.PLUM, CardPoint.POINT_J),
    PLUM_Q = makeACard(CardColor.PLUM, CardPoint.POINT_Q),
    PLUM_K = makeACard(CardColor.PLUM, CardPoint.POINT_K),
    PLUM_A = makeACard(CardColor.PLUM, CardPoint.POINT_A),

    DIAMOND_2 = makeACard(CardColor.DIAMOND, CardPoint.POINT_2),
    DIAMOND_3 = makeACard(CardColor.DIAMOND, CardPoint.POINT_3),
    DIAMOND_4 = makeACard(CardColor.DIAMOND, CardPoint.POINT_4),
    DIAMOND_5 = makeACard(CardColor.DIAMOND, CardPoint.POINT_5),
    DIAMOND_6 = makeACard(CardColor.DIAMOND, CardPoint.POINT_6),
    DIAMOND_7 = makeACard(CardColor.DIAMOND, CardPoint.POINT_7),
    DIAMOND_8 = makeACard(CardColor.DIAMOND, CardPoint.POINT_8),
    DIAMOND_9 = makeACard(CardColor.DIAMOND, CardPoint.POINT_9),
    DIAMOND_10 = makeACard(CardColor.DIAMOND, CardPoint.POINT_10),
    DIAMOND_J = makeACard(CardColor.DIAMOND, CardPoint.POINT_J),
    DIAMOND_Q = makeACard(CardColor.DIAMOND, CardPoint.POINT_Q),
    DIAMOND_K = makeACard(CardColor.DIAMOND, CardPoint.POINT_K),
    DIAMOND_A = makeACard(CardColor.DIAMOND, CardPoint.POINT_A),
    BLACK_JOKER = makeACard(CardColor.SPADES, CardPoint.POINT_SMALL_JOKER),
    RED_JOKER = makeACard(CardColor.HEART, CardPoint.POINT_BIG_JOKER),
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardTypes extends PopActionBox {
    @property(cc.ScrollView)
    private svList: cc.ScrollView = undefined;

    @property(cc.Node)
    private svItem: cc.Node = undefined;

    @property(cc.Prefab)
    private prePokerRes: cc.Prefab = undefined;

    private _pokerRes: PokerRes;

    get pokerRes() {
        if (!this._pokerRes) {
            this._pokerRes = cc.instantiate(this.prePokerRes).getComponent(PokerRes);
        }
        return this._pokerRes;
    }

    onLoad() {
        super.onLoad();
        this.svList.node.active = false;
    }

    protected start() {
        let data = CARD_SHAPE.HEART_10;

        this.openAnim(() => {
            this.svList.node.active = true;

            let allInfoArr: Array<{ desc: string, paiData: Array<number> }> = [
                { desc: "炸弹", paiData: [CARD_SHAPE.HEART_A, CARD_SHAPE.DIAMOND_A, CARD_SHAPE.SPADES_A, CARD_SHAPE.PLUM_A] },
                { desc: "三条", paiData: [CARD_SHAPE.SPADES_5, CARD_SHAPE.HEART_5, CARD_SHAPE.PLUM_5] },
                { desc: "对子", paiData: [CARD_SHAPE.HEART_6, CARD_SHAPE.PLUM_6] },
                { desc: "单牌", paiData: [CARD_SHAPE.PLUM_7] },
                { desc: "三带一", paiData: [CARD_SHAPE.HEART_8, CARD_SHAPE.DIAMOND_8, CARD_SHAPE.SPADES_8, CARD_SHAPE.PLUM_9] },
                { desc: "三带二", paiData: [CARD_SHAPE.HEART_10, CARD_SHAPE.DIAMOND_10, CARD_SHAPE.SPADES_10, CARD_SHAPE.PLUM_J, CARD_SHAPE.SPADES_J] },
                { desc: "顺子", paiData: [CARD_SHAPE.SPADES_3, CARD_SHAPE.SPADES_4, CARD_SHAPE.SPADES_5, CARD_SHAPE.SPADES_6, CARD_SHAPE.SPADES_7] },
                {
                    desc: "连对", paiData: [CARD_SHAPE.HEART_3, CARD_SHAPE.DIAMOND_3, CARD_SHAPE.HEART_4, CARD_SHAPE.DIAMOND_4]
                },
                {
                    desc: "飞机", paiData: [CARD_SHAPE.HEART_3, CARD_SHAPE.DIAMOND_3, CARD_SHAPE.PLUM_3,
                    CARD_SHAPE.HEART_4, CARD_SHAPE.DIAMOND_4, CARD_SHAPE.PLUM_4]
                },
                {
                    desc: "三连带单", paiData: [CARD_SHAPE.HEART_3, CARD_SHAPE.DIAMOND_3, CARD_SHAPE.PLUM_3,
                    CARD_SHAPE.HEART_4, CARD_SHAPE.DIAMOND_4, CARD_SHAPE.PLUM_4,
                    CARD_SHAPE.HEART_5, CARD_SHAPE.HEART_6]
                },
                {
                    desc: "三连带两单", paiData: [CARD_SHAPE.HEART_3, CARD_SHAPE.DIAMOND_3, CARD_SHAPE.PLUM_3,
                    CARD_SHAPE.HEART_4, CARD_SHAPE.DIAMOND_4, CARD_SHAPE.PLUM_4,
                    CARD_SHAPE.HEART_5, CARD_SHAPE.DIAMOND_5, CARD_SHAPE.HEART_6, CARD_SHAPE.DIAMOND_6]
                },
                {
                    desc: "四带一", paiData: [CARD_SHAPE.HEART_8, CARD_SHAPE.DIAMOND_8, CARD_SHAPE.SPADES_8, CARD_SHAPE.PLUM_8,
                    CARD_SHAPE.SPADES_9]
                },
                {
                    desc: "四带二", paiData: [CARD_SHAPE.HEART_8, CARD_SHAPE.DIAMOND_8, CARD_SHAPE.SPADES_8, CARD_SHAPE.PLUM_8,
                    CARD_SHAPE.SPADES_9, CARD_SHAPE.PLUM_10]
                },
                {
                    desc: "四带三", paiData: [CARD_SHAPE.HEART_8, CARD_SHAPE.DIAMOND_8, CARD_SHAPE.SPADES_8, CARD_SHAPE.PLUM_8,
                    CARD_SHAPE.SPADES_9, CARD_SHAPE.PLUM_10, CARD_SHAPE.PLUM_J]
                },
            ];

            let content = this.svList.content;
            this.svItem.active = false;
            for (let idx = 0; idx < allInfoArr.length; idx++) {
                let allInfo = allInfoArr[idx];

                let item = cc.instantiate(this.svItem);
                item.active = true;
                content.addChild(item);
                let labDesc = item.getChildByName("lab").getComponent(cc.Label);
                labDesc.string = `${idx + 1}、${allInfo.desc}`;

                let cardsNode = item.getChildByName("cards");
                cardsNode.removeAllChildren();
                for (let paiIdx = 0; paiIdx < allInfo.paiData.length; paiIdx++) {
                    let pai = allInfo.paiData[paiIdx];
                    let model = this.pokerRes.getCard(pai);
                    model.y = 0;
                    cardsNode.addChild(model);
                }
            }

        });
    }

}
