import { DpAlgorithm, CARD_TYPE } from "./dpAlgorithm";
import DpGame from "./dpGame"
import DpPoker from './dpPoker';
import { GameId } from "../common/enum";
import g from "../g";
import { GAME_NAME } from "../common/cfg";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class DpTouchMgr<T extends DpPoker> extends cc.Component {
    @property(cc.Node)
    protected nodeCard: cc.Node = undefined;

    @property(cc.Node)
    protected nodeTouch: cc.Node = undefined;

    protected curPoker: { new(): T };

    abstract game: DpGame;
    abstract cardTools: DpAlgorithm;
    protected DEALER_CARD_NUM = 20;
    public _holdsCardData: number[] = [];
    protected _playerCardData: number[] = [];

    protected _isSlideOpt: boolean;
    protected _isFirstPlay: boolean;
    protected _isAllowTouch: boolean = true;

    // 提示
    protected _promptData: number[][] = [];
    protected _currPromptIdx: number = 0;

    protected _CARD_SCALE = 1.0;

    getCardNum() {
        return this._holdsCardData.length;
    }

    start() {
        this.nodeCard.removeAllChildren();
        for (let idx = 0; idx < this.DEALER_CARD_NUM; idx++) {
            let card = this.game.pkrGame.getPoker(0);
            card.setScale(this._CARD_SCALE, this._CARD_SCALE);
            this.nodeCard.addChild(card);
            card.addComponent(this.curPoker);
            card.active = false;
        }

        this.nodeTouch.on(cc.Node.EventType.TOUCH_START, this.touchStartEvent);
        this.nodeTouch.on(cc.Node.EventType.TOUCH_MOVE, this.touchMoveEvent);
        this.nodeTouch.on(cc.Node.EventType.TOUCH_END, this.touchEndEvent);
    }

    addGame(game: DpGame) {
        this.game = game;
    }

    initCards(cards: number[]) {
        this._holdsCardData = cards;
        this.setHoldsSort();
        this._isAllowTouch = true;
    }

    setCardBack(visible: boolean) {
        for (let idx = 0; idx < this.nodeCard.childrenCount; idx++) {
            let card = this.nodeCard.children[idx];
            let poker = <T>card.getComponent(this.curPoker);
            poker.setBack(visible);
        }
        this._isAllowTouch = !visible;
    }

    stopCardAnimation(c: cc.Node) {
        c.stopAllActions();
        c.opacity = 255;
        c.y = 0;
    }

    sendCardsAnimation() {
        this._isAllowTouch = false;

        this.nodeCard.children.filter(card => {
            return card.active;
        }).forEach((card, i, arr) => {
            card.y += 30;
            card.opacity = 0;
            let actions = cc.sequence(
                cc.delayTime(i * .05),
                cc.spawn(
                    cc.moveBy(.1, 0, - 30),
                    cc.fadeIn(.1)
                ),
                cc.callFunc(() => {
                    if (i === arr.length - 1) {
                        this._isAllowTouch = true;
                    }
                })
            )
            //card.runAction(actions);
            cc.tween(card).then(actions).start();
        });
    }

    clearCards() {
        this._holdsCardData = [];
        this.setHoldsSort();
        this._isAllowTouch = false;
    }

    /**
     * 设置上家的牌信息
     * @param cardData
     */
    setPlayerData(cardData?: number[]) {
        this._isFirstPlay = !cardData;

        // 第一首出牌不用提示
        this._playerCardData = cardData ? cardData : undefined;
        this.findPromptData(this._holdsCardData);
        this.setAllowPlayStatus();
    }

    /**
     * 依次给出提示
     */
    setPromptCard() {
        if (!this._promptData || this._promptData.length === 0) {
            return;
        }
        let isAllow = this.isAllowPlay();
        if (this._promptData.length === 1 && isAllow) {
            return;
        }

        if (this._currPromptIdx >= this._promptData.length) {
            this._currPromptIdx = 0;
        }
        let promptData = this._promptData[this._currPromptIdx];
        this.setHoldsSort(promptData);
        this.setAllowPlayStatus();
        this._currPromptIdx += 1;
    }

    /**
     * 获取最后一张牌
     */
    getFinalCard(): number {
        return this._holdsCardData[0];
    }

    /**
     * 准备打出牌的信息
     */
    getReadyDisCardsInfo(): { cardType: CARD_TYPE, cardData: number[] } {
        let readyDisCards = this.getReadyCardData();
        if (readyDisCards.length !== 0) {
            let info = this.cardTools.getCardType(readyDisCards);
            return { cardType: info.cardType, cardData: readyDisCards };
        }
        return;
    }

    enableCards(enabled: boolean) {
        this._isAllowTouch = enabled;

        for (const c of this.nodeCard.children) {
            let pkr = <T>c.getComponent(this.curPoker);
            pkr.setEnabled(enabled);
        }
    }

    /**
     * 将不可以打出的牌置灰
     */
    public setUserfullCard() {
        for (const c of this.nodeCard.children) {
            let pkr = <T>c.getComponent(this.curPoker);
            pkr.setEnabled(false);
        }
        let func = (dt: number) => {
            for (const c of this.nodeCard.children) {
                let pkr = <T>c.getComponent(this.curPoker);
                if (dt == pkr.cardData) {
                    pkr.setEnabled(true);
                }
            }
        }
        let list = this._promptData;
        for (let i = 0; i < list.length; i++) {
            for (let j = 0; j < list[i].length; j++) {
                func(list[i][j]);
            }
        }
    }

    /**
     * 获取准备打出的牌集合
     */
    protected getReadyCardData() {
        let readyDisCardData: number[] = [];
        for (let idx = 0; idx < this._holdsCardData.length; idx++) {
            let card = this.nodeCard.children[idx];
            let poker = <T>card.getComponent(this.curPoker);
            if (poker.isReadyDiscard) {
                readyDisCardData.push(poker.cardData);
            }
        }
        return readyDisCardData;
    }

    /**
     * 根据是否可以出牌改变操作按钮
     */
    public setAllowPlayStatus() {
        let isAllow = this.isAllowPlay();
        this.game.setPlayCardBtn(isAllow);
    }

    protected abstract isAllowPlay();

    /**
     * 查找需要提示的牌
     * @param selfCardData
     */
    private findPromptData(selfCardData: number[]) {
        if (selfCardData.length === 0) {
            this.game.showOptPanel(false);
            return;
        }

        // 是否需要提示
        let prompt = this.cardTools.findPromptCard(selfCardData, this._playerCardData);
        if (prompt && prompt.length > 0) {
            this.game.showOptPanel(true);

            this._currPromptIdx = 0;
            this._promptData = prompt;
            /* 置灰不能出的牌 */
            if (g.gameVal.lastGame == GameId.DDZ) {
                if (this._isFirstPlay) {
                    this.enableCards(true);
                }
                else {
                    this.setUserfullCard()
                }
            }
        } else {
            this.game.showOptPanel(false);
        }
    }

    /**
     * 手牌重新排序
     * @param playerCardData
     */
    setHoldsSort(playerCardData?: number[]) {
        if (!this._holdsCardData) {
            return;
        }

        this._holdsCardData.sort(this.pointSort);
        if (playerCardData) {
            playerCardData.sort(this.pointSort);
        }
        let sameNum = 0;
        for (let idx = 0; idx < this.nodeCard.childrenCount; idx++) {
            let card = this.nodeCard.children[idx];
            if (idx < this._holdsCardData.length) {
                card.active = true;
                this.stopCardAnimation(card);

                let cardData = this._holdsCardData[idx];
                if (cardData === undefined) {
                    break;
                }

                let poker = <T>card.getComponent(this.curPoker);
                poker.cardData = cardData;
                poker.resetCardStatus();
                if (this.game.gameName === GameId.DDZ) {
                    this.game.pkrGame.setDdzCard(card, cardData);
                    if (this.game.plyMgr.me.isDealer && idx === this._holdsCardData.length - 1) {
                        poker.setDealerLogo(true);
                    } else {
                        poker.setDealerLogo(false);
                    }
                } else if (this.game.gameName === GameId.PDK) {
                    this.game.pkrGame.setPoker(card, cardData);
                }

                // 把提示牌筛选出来
                if (playerCardData && (sameNum < playerCardData.length)) {
                    if (cardData === playerCardData[sameNum]) {
                        poker.setCardMoveStatus();
                        sameNum += 1;
                    }
                }
            } else {
                card.active = false;
            }
        }
        this.adjustCardPos();
    }

    /**
     * 手牌降序
     * @param aData
     * @param bData
     */
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

    /**
     * 根据手牌个数来调整手牌位置
     */
    private adjustCardPos() {
        this.nodeCard.x = 0;
        this.nodeCard.getComponent(cc.Layout).spacingX = Math.min(-50, -90 + (20 - this._holdsCardData.length) * 2);
    }

    /**
     * 移除打出的牌
     * @param outCardData
     */
    removePlayCards(outCardData: number[]) {
        for (let idx = 0; idx < outCardData.length; idx++) {
            let cardData = outCardData[idx];
            let i = this._holdsCardData.indexOf(cardData);
            this._holdsCardData.splice(i, 1);
        }
        this.setHoldsSort();
    }

    /**
     * 点击、拖选卡牌
     */
    private touchStartEvent = (event: cc.Event.EventTouch) => {
        if (!this._isAllowTouch) {
            return;
        }
        this._isSlideOpt = false;
    }

    private touchMoveEvent = (event: cc.Event.EventTouch) => {
        if (!this._isAllowTouch) {
            return;
        }
        this._isSlideOpt = true;

        let startInCardsPos = this.nodeCard.convertToNodeSpaceAR(event.getStartLocation());
        let currInCardsPos = this.nodeCard.convertToNodeSpaceAR(event.getLocation());

        let startX = startInCardsPos.x;
        let currLocX = currInCardsPos.x;
        let minMoveX = startX < currLocX ? startX : currLocX;
        let moveDistance = Math.abs(currLocX - startX);

        if (this.isTouchCards(currInCardsPos)) {
            let touchRect = cc.rect(minMoveX, 0, moveDistance, 0);
            for (let idx = this._holdsCardData.length - 1; idx >= 0; idx--) {
                let card = this.nodeCard.children[idx];
                let poker = <T>card.getComponent(this.curPoker);
                let cardRect = cc.rect(card.x - card.width * 0.5, card.y - card.height * 0.5, card.width * 0.4, card.height);
                // 处于滑动区域内的卡牌
                if (cardRect.intersects(touchRect)) {
                    poker.setSelected(true);
                } else {
                    poker.setSelected(false);
                }
            }
        }
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
                        let poker = <T>card.getComponent(this.curPoker);
                        poker.setSelected(false);
                        if (!poker.isReadyDiscard) {
                            let playerType = this.cardTools.getCardType(this._playerCardData);
                            if (playerType.cardType === CARD_TYPE.CT_THREE_TAKE_ONE || playerType.cardType === CARD_TYPE.CT_THREE_TAKE_TWO) {
                                poker.setCardMoveStatus();
                            } else {
                                let cards = this.cardTools.findTouchPrompt(this._holdsCardData, this._playerCardData, idx);
                                if (cards) {
                                    this.setHoldsSort(cards);
                                } else {
                                    poker.setCardMoveStatus();
                                }
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
                let poker = <T>card.getComponent(this.curPoker);
                if (poker.isSelected) {
                    selectedCards.push(poker.cardData);
                }
            }

            // 先判断是否第一首出牌,若否则再从选到的牌中找出最合适的牌集合
            if (this._isFirstPlay) {
                isTouchCard = true;

                let promptCards = this.cardTools.findFirstPromptCard(selectedCards);
                let readyDisCards = this.getReadyCardData();
                // 单张除外并且当前没有已选好的牌
                if (promptCards && promptCards[0].length !== 1 && readyDisCards.length === 0) {
                    this.setHoldsSort(promptCards[0]);
                } else {
                    this.moveSelectedCards();
                }
            } else {
                if (selectedCards.length > 0) {
                    isTouchCard = true;
                }

                let cardType = this.cardTools.getCardType(selectedCards).cardType;
                // 若滑动区域的牌有大于玩家牌的牌集合，则选中其中最小的组合
                let promptData = this.cardTools.findPromptCard(selectedCards, this._playerCardData);
                if (promptData && promptData.length > 0) {
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

    protected moveSelectedCards() {
        for (let idx = 0; idx < this._holdsCardData.length; idx++) {
            let card = this.nodeCard.children[idx];
            let poker = <T>card.getComponent(this.curPoker);
            if (poker.isSelected) {
                poker.setSelected(false);
                poker.setCardMoveStatus();
            }
        }
    }

    /**
     * 是否点击在可操作区
     * @param touchPos
     */
    protected isTouchCards(touchPos: cc.Vec2) {
        let cardsWith = this.nodeCard.width * this._CARD_SCALE;
        let cardsHeight = this.nodeCard.height;
        let cardsRect = cc.rect(-cardsWith * 0.5, -cardsHeight * 0.5, cardsWith, cardsHeight);
        return cardsRect.contains(touchPos);
    }

    /**
    * 是否点击到牌面上
    * @param card
    * @param touchPos
    */
    protected isTouchCard(card: cc.Node, touchPos: cc.Vec2) {
        let cardsWith = card.width * card.scaleX;
        let cardsHeight = card.height * card.scaleY;
        let cardsRect = cc.rect(card.x - cardsWith * 0.5, card.y - cardsHeight * 0.5, cardsWith, cardsHeight);
        return cardsRect.contains(touchPos);
    }

}
