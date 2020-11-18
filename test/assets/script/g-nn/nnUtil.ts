//扑克点数
enum Num {
    a = 1, n2 = 2, n3 = 3, n4 = 4, n5 = 5, n6 = 6, n7 = 7, n8 = 8, n9 = 9, n10 = 10, j = 11, q = 12, k = 13, P_bjoker = 18, P_rjoker = 20,
}

//扑克花色
enum Suit {
    diamonds,         //方片♦️
    clubs,            //梅花♣️
    hearts,           //红心♥️
    spades,          //黑桃♠️
}
//组合牌值
function makeCard(color: number, point: number) { return color << 8 | point; }

enum BullType { bull0, bull1, bull2, bull3, bull4, bull5, bull6, bull7, bull8, bull9, bull10, bullBoom, bullFlower, bullSmall }
interface CardInfo {
    num: number,
    suit: number
}
export function getCards(cardNum: number) {
    return this.cards.splice(0, cardNum)
}
function getCardPoint(card: number) {
    return card & 0x000000ff
}
function getCardSuit(card: number) {
    return card >> 8
}
export function getBullTypeBg(bullType: number) {
    let idx = 0;
    if (bullType === 0) {
        idx = 0;
    } else if (bullType < 7) {
        idx = 1;
    } else if (bullType < 10) {
        idx = 2;
    } else if (bullType < 12) {
        idx = 3;
    } else {
        idx = 4;
    }
    return idx;
}
export function getBullType(cards: number[]) {
    let infos = cards.map(card => { return { num: getCardPoint(card), suit: getCardSuit(card) } })
    infos.sort((a, b) => {
        if (a.num === b.num) {
            return b.suit - a.suit
        } else return b.num - a.num
    })
    return getBullTypeInfo(infos)
}
/**
 * 把牌分成3+2，或炸弹牛顺序
 * @param cards
 */
let idx3: number[]//3张牌的idx
export function sortCards(cards: number[]): number[] {
    if (!cards) return
    let infos = cards.map(card => { return { num: getCardPoint(card), suit: getCardSuit(card) } })
    //炸弹牛
    if (getBullType(cards) === BullType.bullBoom) {
        let idx4 = []
        let otheridx = 0
        let sameNum = 0
        infos.sort((a, b) => {
            if (a.num === b.num) {
                return b.suit - a.suit
            } else return b.num - a.num
        })
        cc.log('infos========', infos)
        //两种情况：5,2,2,2,2或2,2,2,2,1
        if (infos[0].num === infos[1].num) {
            sameNum = infos[0].num
        } else {
            sameNum = infos[1].num
        }
        cards.forEach((card, idx) => {
            if (sameNum === getCardPoint(card)) {
                idx4.push(idx)
            } else {
                otheridx = idx
            }
        })
        cc.log("return=", idx4.concat(otheridx))
        return idx4.concat(otheridx)
    }
    //其他牛
    idx3 = []
    function _hasBull(infos: CardInfo[]) {
        combinations(infos, 3, (indexes) => {
            let totalNum: number = 0
            for (let v of indexes) {
                let num = infos[v].num
                if (num > 10) totalNum += 10
                else totalNum += num
            }
            if (totalNum % 10 === 0) {
                idx3 = indexes
                return true
            }
        })
    }
    _hasBull(infos)
    if (idx3.length === 3) {
        let otherIdxs = [0, 1, 2, 3, 4].filter(val => idx3.indexOf(val) === -1)
        return idx3.concat(otherIdxs)
    }
}

function getBullTypeInfo(infos: CardInfo[]) {
    if (isBullSmall(infos)) return BullType.bullSmall
    if (isBullFlower(infos)) return BullType.bullFlower
    if (isBullBoom(infos)) return BullType.bullBoom
    if (hasBull(infos)) {
        let totalNum: number = 0
        for (let card of infos) {
            if (card.num > 10) totalNum += 10
            else totalNum += card.num
        }
        if (totalNum % 10 === 0) return BullType.bull10
        else return totalNum % 10
    } else return BullType.bull0
}
function hasBull(infos: CardInfo[]) {
    let idxes: number[]
    combinations(infos, 3, (indexes) => {
        let totalNum: number = 0
        for (let v of indexes) {
            let num = infos[v].num
            if (num > 10) totalNum += 10
            else totalNum += num
        }
        if (totalNum % 10 === 0) {
            idxes = indexes
            return true
        }
        return false
    })
    return !!idxes
}
function isBullSmall(infos: CardInfo[]) {
    let totalNum: number = 0
    for (let card of infos) {
        if (card.num > 5) return false
        totalNum += card.num
        if (totalNum > 10) return false
    }
    return true
}
function isBullFlower(infos: CardInfo[]) {
    for (let card of infos) {
        if (card.num <= 10) return false
    }
    return true
}
function isBullBoom(infos: CardInfo[]) {
    for (let i = 0; i < infos.length - 3; i++) {
        if (infos[i].num === infos[i + 3].num) return true
    }
    return false
}
//组合
//C(m,n)
export function combinations<T>(source: T[], n: number, cb: (combIndexes: number[]) => boolean) {
    let m = source.length
    let idxes: number[] = []
    let abort: boolean = false
    function inner(start, choose) {
        if (abort) return

        if (choose == 0) {
            abort = cb([...idxes])
        } else {
            for (let i = start; i <= m - choose; ++i) {
                idxes.push(i)
                inner(i + 1, choose - 1)
                idxes.pop()
            }
        }
    }
    inner(0, n)
}