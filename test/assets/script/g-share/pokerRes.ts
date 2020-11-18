
// 斗地主
export enum DdzCardPoint {
    POINT_3 = 3,
    POINT_4 = 4,
    POINT_5 = 5,
    POINT_6 = 6,
    POINT_7 = 7,
    POINT_8 = 8,
    POINT_9 = 9,
    POINT_10 = 10,
    POINT_J = 11,
    POINT_Q = 12,
    POINT_K = 13,
    POINT_A = 14,
    POINT_2 = 16,
    POINT_SMALL_JOKER = 18,
    POINT_BIG_JOKER = 20,

}

// 红黑,金花
export enum HHJHCardPoint {
    POINT_2 = 2,
    POINT_3 = 3,
    POINT_4 = 4,
    POINT_5 = 5,
    POINT_6 = 6,
    POINT_7 = 7,
    POINT_8 = 8,
    POINT_9 = 9,
    POINT_10 = 10,
    POINT_J = 11,
    POINT_Q = 12,
    POINT_K = 13,
    POINT_A = 14,
}

export enum Suit {
    diamonds,         //方片♦️
    clubs,            //梅花♣️
    hearts,           //红心♥️
    spades,          //黑桃♠️
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class PokerRes extends cc.Component {
    private _pokerModel: cc.Node;
    private _resources: cc.Node;
    get pokerModel() {
        if (!this._pokerModel) {
            this._pokerModel = this.node.getChildByName("poker");
        }
        return this._pokerModel;
    }

    get resources() {
        if (!this._resources) {
            this._resources = this.node.getChildByName("res");
        }
        return this._resources;
    }

    private copySprite(from: cc.Node, to: cc.Node) {
        to.getComponent(cc.Sprite).spriteFrame = from.getComponent(cc.Sprite).spriteFrame;
    }

    private getColor(suit: number) {
        if (suit === undefined) {
            return;
        }
        return suit % 2 === 0 ? "red" : "black";
    }

    private getBack() {
        let base = cc.instantiate(this.pokerModel)
        let baseFront = base.getChildByName("front")
        let baseBack = base.getChildByName("back")
        baseFront.active = false
        baseBack.active = true
        return base
    }

    private getFront() {
        let frontBg = this.resources.getChildByName("front").getChildByName("1");
        return frontBg;
    }

    private getCardPoint(card: number) {
        return card & 0x000000ff
    }
    private getCardSuit(card: number) {
        return card >> 8
    }

    updateCard(card: cc.Node, suit: number, num: number) {
        let cardColor = this.getColor(suit)     // 牌颜色（红色，黑色）

        let baseFront = card.getChildByName("front")            // 牌正面
        let baseBack = card.getChildByName("back");             // 牌背面
        let joker = baseFront.getChildByName("joker");          // 牌正面大小王
        let dealerLogo = baseFront.getChildByName("dealer");    // 用于斗地主（地主）

        let normal = baseFront.getChildByName("normal");        // 牌正面正常情况下牌要显示的元素
        let baseSuit = normal.getChildByName("suit");           // 牌正面 花色（小）
        let baseCenter = normal.getChildByName("center");       // 牌正面 图案（A-10为花色，JQK为图案）
        let baseNumber = normal.getChildByName("number");       // 牌正面 牌值（A-10，JQK）

        baseFront.active = true;
        baseBack.active = false;

        joker.active = false;
        dealerLogo.active = false;

        // 判断是否王牌
        if (num === DdzCardPoint.POINT_SMALL_JOKER || num === DdzCardPoint.POINT_BIG_JOKER) {
            joker.active = true;
            normal.active = false;
            let jokerSuit: number = num === DdzCardPoint.POINT_SMALL_JOKER ? 1 : 2; // 大小王
            let resJoker = this.resources.getChildByName("joker").getChildByName(jokerSuit.toString());
            this.copySprite(resJoker, joker);
            let magic = joker.getChildByName("magic");
            let resMagic = this.resources.getChildByName("magic").getChildByName(`joker_${jokerSuit}`);
            this.copySprite(resMagic, magic);
        } else {
            normal.active = true;
            joker.active = false;

            // suit
            let resSuit = this.resources.getChildByName("suit").getChildByName(suit.toString());
            if (baseSuit) {
                this.copySprite(resSuit, baseSuit);
            }

            // center
            let resCenter: cc.Node;
            if (num < 11) {  // A-10
                resCenter = resSuit;
            } else {    // J Q K
                resCenter = this.resources.getChildByName(`role_${cardColor}`).getChildByName(num.toString());
            }
            this.copySprite(resCenter, baseCenter);

            // number
            let resNum = this.resources.getChildByName(`num_${cardColor}`).getChildByName(num.toString());
            this.copySprite(resNum, baseNumber);
        }

        let resFront = this.getFront();
        if (baseFront.active) {
            this.copySprite(resFront, baseFront);
        }
    }

    // ------ 斗地主 ------
    getDdzCard(data: number) {
        let suit = this.getCardSuit(data);
        let num = this.getCardPoint(data);
        if (num === 0) {
            return this.getBack()
        }
        num = this.getNumber(num);
        if (suit < Suit.diamonds || suit > Suit.spades || num < 1 || num > 20) {
            console.error("错误的参数：", suit, num)
            return
        }
        let base = cc.instantiate(this.pokerModel)
        base.setPosition(0, 0)
        this.updateCard(base, suit, num);
        return base;
    }

    setDdzCard(card: cc.Node, data: number) {
        if (!card) return;
        let suit = this.getCardSuit(data);
        let num = this.getCardPoint(data);
        if (num === 0) {
            return this.getBack()
        }
        num = this.getNumber(num);
        if (suit < Suit.diamonds || suit > Suit.spades || num < 1 || num > 20) {
            console.error("错误的参数：", suit, num)
            return
        }
        this.updateCard(card, suit, num);
    }

    // ------ [红黑，金花，德州扑克(A为14，其余2-10、J、Q、K值为2-13)] ------
    // ------ [百人牛牛，经典牛牛，抢庄牛牛，龙虎(A、2-10、J、Q、K值为1-13)] ------
    getCard(data: number) {
        let suit = this.getCardSuit(data);
        let num = this.getCardPoint(data);
        if (num === 0) {
            return this.getBack()
        }
        num = this.getNumber(num);
        if (suit < Suit.diamonds || suit > Suit.spades || num < 1 || num > 13) {
            console.error("错误的参数：", suit, num)
            return
        }
        let base = cc.instantiate(this.pokerModel)
        base.setPosition(0, 0)
        this.updateCard(base, suit, num);
        return base
    }

    setCard(card: cc.Node, data: number) {
        if (!card) return;
        let suit = this.getCardSuit(data);
        let num = this.getCardPoint(data);
        if (num === 0) {
            return this.getBack()
        }
        num = this.getNumber(num);
        if (suit < Suit.diamonds || suit > Suit.spades || num < 1 || num > 13) {
            console.error("错误的参数：", suit, num)
            return
        }
        this.updateCard(card, suit, num);
    }

    getNumber(realPoint: number) {
        let cardNumber: number;
        if (realPoint === DdzCardPoint.POINT_A) { // 红黑、斗地主、炸金花、德州扑克 A的值为14，要转换成1
            cardNumber = 1;
        } else if (realPoint === DdzCardPoint.POINT_2) { // 斗地主、跑得快 2的值为16，要转换成2
            cardNumber = 2;
        } else {
            cardNumber = realPoint;
        }
        return cardNumber;
    }


}
