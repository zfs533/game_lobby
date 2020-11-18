import DpTouchMgr from "../g-dp/dpTouchMgr"
import DdzGame from "./ddzGame";
import { DdzCardTools, CARD_TYPE } from "./ddzCardTools";
import DdzPoker from './ddzPoker';


const { ccclass, property } = cc._decorator;

@ccclass
export default class DdzTouchMgr extends DpTouchMgr<DdzPoker> {
    game: DdzGame;
    cardTools: DdzCardTools;

    curPoker = DdzPoker;

    start() {
        this.cardTools = new DdzCardTools();
        super.start();
    }

    /**
     * 添加地主牌
     * @param cards
     */
    async addDealerCard(cards: number[]) {
        cards.forEach(card => {
            this._holdsCardData.push(card);
        });
        this.setHoldsSort();

        // 从手牌中展示地主牌
        this._isAllowTouch = false;
        let promiseArr: Promise<{}>[] = [];
        cards.forEach(data => {
            for (let idx = 0; idx < this._holdsCardData.length; idx++) {
                const cardData = this._holdsCardData[idx];
                if (data === cardData) {
                    let nodeCard = this.nodeCard.children[idx];
                    let initPos = nodeCard.getPosition();
                    let pro = new Promise(resolve => {
                        let moveTime = 0.2;
                        let actions = cc.sequence(
                            cc.moveTo(moveTime, initPos.x, initPos.y + 30),
                            cc.delayTime(0.5),
                            cc.moveTo(moveTime, initPos.x, initPos.y),
                            cc.callFunc(() => {
                                resolve(true);
                            }),
                        )
                        //nodeCard.runAction(actions);
                        cc.tween(nodeCard).then(actions).start();
                    });
                    promiseArr.push(pro);
                    break;
                }
            }
        });
        await Promise.all(promiseArr);
        this._isAllowTouch = true;
    }

    setPlayerData(cardData?: number[]) {
        super.setPlayerData(cardData);
        this.game.setFirstPlayPanel(!this._isFirstPlay);
    }

    isAllowPlay() {
        let readyDisCards = this.getReadyCardData();
        let isAllow: boolean;
        if (readyDisCards.length !== 0) {
            if (this._isFirstPlay) {
                isAllow = this.cardTools.isAllowPlayCard(readyDisCards);
            } else {
                isAllow = this.cardTools.isAllowPlayCard(readyDisCards, this._playerCardData);
            }
        } else {
            isAllow = false;
        }
        return isAllow;
    }

    protected touchEndEvent = (event: cc.Event.EventTouch) => {
        if (!this._isAllowTouch) {
            return;
        }
        if (this._isSlideOpt) {
            let startInCardsPos = this.nodeCard.convertToNodeSpaceAR(event.getStartLocation());
            let currInCardsPos = this.nodeCard.convertToNodeSpaceAR(event.getLocation());
            if (Math.floor(startInCardsPos.x) === Math.floor(currInCardsPos.x)
                && Math.floor(startInCardsPos.y) === Math.floor(currInCardsPos.y)) {
                this._isSlideOpt = false;
            }
        }

        let isTouchCard = false;
        if (!this._isSlideOpt) {
            // 没滑动则判断为点击操作
            let touchInCardsPos = this.nodeCard.convertToNodeSpaceAR(event.getLocation());
            if (this.isTouchCards(touchInCardsPos)) {
                for (let idx = this._holdsCardData.length - 1; idx >= 0; idx--) {
                    let card = this.nodeCard.children[idx];
                    if (this.isTouchCard(card, touchInCardsPos)) {
                        isTouchCard = true;
                        let poker = card.getComponent(this.curPoker);
                        poker.setSelected(false);
                        if (!poker.isReadyDiscard) {
                            let cards = this.cardTools.findTouchPrompt(this._holdsCardData, this._playerCardData, idx);
                            if (cards) {
                                this.setHoldsSort(cards);
                            } else {
                                poker.setCardMoveStatus();
                            }
                        } else {
                            poker.resetCardStatus();
                        }
                        break;
                    }
                }
            }
        } else {
            // 找出被滑动到的牌
            let selectedCards: number[] = [];
            for (let idx = 0; idx < this._holdsCardData.length; idx++) {
                let card = this.nodeCard.children[idx];
                let poker = card.getComponent(this.curPoker);
                if (poker.isSelected) {
                    selectedCards.push(poker.cardData);
                }
            }

            // 先判断是否第一首出牌,若否则再从选到的牌中找出最合适的牌集合
            if (this._isFirstPlay) {
                isTouchCard = true;

                let threeStraightCards = this.cardTools.selectThreeStraight(selectedCards);
                if (threeStraightCards.length > 0) {
                    this.setHoldsSort(threeStraightCards);
                } else {
                    //查找是否有连对
                    let doubleStraightCards = this.cardTools.selectDoubleStraight(selectedCards);
                    if (doubleStraightCards.length > 0) {
                        this.setHoldsSort(doubleStraightCards);
                    } else {
                        //查找是否有顺子
                        let straightCards = this.cardTools.selectStraight(selectedCards);
                        if (straightCards && straightCards.length > 0) {
                            this.setHoldsSort(straightCards);
                        } else {
                            this.moveSelectedCards();
                        }
                    }
                }
            } else {
                if (selectedCards.length > 0) {
                    isTouchCard = true;
                }

                let cardType = this.cardTools.getCardType(selectedCards).cardType;
                // 若滑动区域的牌有大于玩家牌的牌集合，则选中其中最小的组合
                let promptData = this.cardTools.findPromptCard(selectedCards, this._playerCardData);
                if (cardType !== CARD_TYPE.CT_ROCKET && promptData && promptData.length > 0) {
                    this.setHoldsSort(promptData[0]);
                } else {
                    this.moveSelectedCards();
                }
            }
        }

        // 没点击到出牌区域则重新整理手牌
        if (!isTouchCard) {
            this.setHoldsSort();
        }
        this.setAllowPlayStatus();
    }
}
