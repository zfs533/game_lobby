import { CARD_SHAPE } from "./ddzCardTypes";
import DdzGame from "./ddzGame";

const { ccclass, property } = cc._decorator;

export enum DCB {
    rocket = 0,
    boom = 1,
    airport = 2,
    same = 3,
    samelist = 4,
    three = 5,
}

@ccclass
export default class DdzCombinaiton extends cc.Component {

    @property([cc.Button])
    optButtons: cc.Button[] = [];

    private ddzGm: DdzGame;
    private rocketArr = [];
    private bombArr = [];
    private threeArr = [];
    private sameArr = [];
    private sameListArr = [];
    private airportArr = [];
    private index: number = 0;
    private currentType: string = "";
    init(game: DdzGame) {
        this.ddzGm = game;
        this.node.active = false;
    }

    onDisable() {
        this.optButtons.forEach(btn => {
            btn.interactable = false;
        });
    }

    handleButtonClick(event: any, type: string) {
        if (this.currentType != type) {
            this.currentType = type;
            this.index = 0;
        }
        this.jugementAirPort();
        switch (Number(type)) {
            case DCB.rocket:
                this.ddzGm.touchMgr.setHoldsSort(this.rocketArr[this.index]);
                this.ddzGm.touchMgr.setAllowPlayStatus();
                this.setIndexValue(this.rocketArr.length);
                break;

            case DCB.boom:
                this.ddzGm.touchMgr.setHoldsSort(this.bombArr[this.index]);
                this.ddzGm.touchMgr.setAllowPlayStatus();
                this.setIndexValue(this.bombArr.length);
                break;

            case DCB.airport:
                this.ddzGm.touchMgr.setHoldsSort(this.airportArr[this.index]);
                this.ddzGm.touchMgr.setAllowPlayStatus();
                this.setIndexValue(this.airportArr.length);
                break;

            case DCB.same:
                this.ddzGm.touchMgr.setHoldsSort(this.sameArr[this.index]);
                this.ddzGm.touchMgr.setAllowPlayStatus();
                this.setIndexValue(this.sameArr.length);
                break;

            case DCB.samelist:
                this.ddzGm.touchMgr.setHoldsSort(this.sameListArr[this.index]);
                this.ddzGm.touchMgr.setAllowPlayStatus();
                this.setIndexValue(this.sameListArr.length);
                break;

            case DCB.three:
                this.ddzGm.touchMgr.setHoldsSort(this.threeArr[this.index]);
                this.ddzGm.touchMgr.setAllowPlayStatus();
                this.setIndexValue(this.threeArr.length);
                break;
        }
    }

    setIndexValue(len: number) {
        this.index++;
        if (this.index >= len) {
            this.index = 0;
        }
    }

    onEnable() {
        this.optButtons.forEach(btn => {
            btn.interactable = false;
        });

        this.rocketArr = this.jugementRocket();
        if (this.rocketArr.length > 0) {
            this.optButtons[0].interactable = true;
        }

        this.bombArr = this.jugementBomb();
        if (this.bombArr.length > 0) {
            this.optButtons[1].interactable = true;
        }

        this.threeArr = this.jugementThreeTakeCard();
        if (this.threeArr.length > 0) {
            this.optButtons[5].interactable = true;
        }

        this.sameArr = this.jugementSameCard();
        if (this.sameArr.length > 0) {
            this.optButtons[3].interactable = true;
        }

        this.sameListArr = this.jugementSameListCard();
        if (this.sameListArr.length > 0) {
            this.optButtons[4].interactable = true;
        }

        this.airportArr = this.jugementAirPort();
        if (this.airportArr.length > 0) {
            this.optButtons[2].interactable = true;
        }
    }

    /**
     * 获取并判断炸弹
     */
    private jugementBomb() {
        return this.getCardByType(DCB.boom);
    }
    /**
     * 获取并判断火箭
     */
    private jugementRocket() {
        return this.getCardByType(DCB.rocket);
    }

    /**
     * 获取三带牌
     */
    private jugementThreeTakeCard() {
        return this.getCardByType(DCB.three);
    }

    /**
     * 获取连对
     */
    private jugementSameCard() {
        return this.getCardByType(DCB.same);
    }

    /**
     * 获取顺子
     */
    private jugementSameListCard() {
        return this.getCardByType(DCB.samelist);
    }

    /**
     * 获取飞机
     */
    private jugementAirPort() {
        return this.getCardByType(DCB.airport);
    }

    //临时测试数据连对，炸弹,火箭，飞机，三代，顺子
    getTempCardList() {
        let cards = [
            CARD_SHAPE.BLACK_JOKER,
            CARD_SHAPE.RED_JOKER,
            CARD_SHAPE.SPADES_K,
            CARD_SHAPE.HEART_J,
            CARD_SHAPE.PLUM_3,
            CARD_SHAPE.DIAMOND_3,
            CARD_SHAPE.PLUM_4,
            CARD_SHAPE.SPADES_4,
            CARD_SHAPE.DIAMOND_4,
            CARD_SHAPE.PLUM_5,
            CARD_SHAPE.DIAMOND_5,
            CARD_SHAPE.SPADES_5,
            CARD_SHAPE.DIAMOND_6,
            CARD_SHAPE.DIAMOND_7,
            CARD_SHAPE.DIAMOND_8,
            CARD_SHAPE.DIAMOND_9,
            CARD_SHAPE.DIAMOND_10,
        ]
        return cards;
    }

    /**
     * 获取符合类型的牌型
     * @param type
     */
    private getCardByType(type: number) {
        let selfCardArr = this.ddzGm.touchMgr._holdsCardData;
        let promptCardPointArr;
        switch (type) {
            case DCB.rocket:
                promptCardPointArr = this.ddzGm.touchMgr.cardTools.findRocketCard(this.getSelfCardData());
                break;
            case DCB.boom:
                promptCardPointArr = this.ddzGm.touchMgr.cardTools.findAllBombCard(this.getSelfCardData());
                break;

            case DCB.airport:
                let parr = [0, 0, 0, 1, 1, 1];
                let dbThree = this.ddzGm.touchMgr.cardTools.promptCard11(this.getSelfCardData(), parr, 0);
                let parr1 = [0, 0, 0, 1, 1, 1, 2, 3];
                let dbThreeOne = this.ddzGm.touchMgr.cardTools.promptCard11(this.getSelfCardData(), parr1, 0);
                let parr2 = [0, 0, 0, 1, 1, 1, 2, 2];
                let dbThreeTwo = this.ddzGm.touchMgr.cardTools.promptCard12(this.getSelfCardData(), parr2, 0);
                if (dbThree !== undefined) {
                    promptCardPointArr = dbThree;
                }
                if (dbThreeOne !== undefined) {
                    if (promptCardPointArr !== undefined) {
                        promptCardPointArr = promptCardPointArr.concat(dbThreeOne);
                    }
                    else {
                        promptCardPointArr = dbThreeOne;
                    }
                }
                if (dbThreeTwo !== undefined) {
                    if (promptCardPointArr !== undefined) {
                        promptCardPointArr = promptCardPointArr.concat(dbThreeTwo);
                    }
                    else {
                        promptCardPointArr = dbThreeTwo;
                    }
                }
                break;

            case DCB.same:
                let pcardArr = [0, 0, 0, 0, 0, 0];
                promptCardPointArr = this.ddzGm.touchMgr.cardTools.promptCard5(this.getSelfCardData(), pcardArr, 0);
                if (promptCardPointArr) {
                    for (let i = 0; i < 4; i++) {
                        pcardArr.push(0);
                        pcardArr.push(0);
                        let arr = this.ddzGm.touchMgr.cardTools.promptCard5(this.getSelfCardData(), pcardArr, 0);
                        if (arr) {
                            promptCardPointArr = promptCardPointArr.concat(arr);
                        }
                    }
                }
                break;

            case DCB.samelist:
                let pdArr = [0, 0, 0, 0, 0];
                promptCardPointArr = this.ddzGm.touchMgr.cardTools.promptCard4(this.getSelfCardData(), pdArr, 0);
                if (promptCardPointArr) {
                    for (let i = 0; i < 10; i++) {
                        pdArr.push(0);
                        let arr = this.ddzGm.touchMgr.cardTools.promptCard4(this.getSelfCardData(), pdArr, 0);
                        if (arr) {
                            promptCardPointArr = promptCardPointArr.concat(arr);
                        }
                    }
                }
                break;

            case DCB.three:
                let three = this.ddzGm.touchMgr.cardTools.findThreeTakeCard(this.getSelfCardData(), 0);
                let threeOne = this.ddzGm.touchMgr.cardTools.findThreeTakeCard(this.getSelfCardData(), 0, this.ddzGm.touchMgr.cardTools.SINGLE_NUM);
                let threeTwo = this.ddzGm.touchMgr.cardTools.findThreeTakeCard(this.getSelfCardData(), 0, this.ddzGm.touchMgr.cardTools.DOUBLE_NUM);
                if (three !== undefined) {
                    promptCardPointArr = three;
                }
                if (threeOne !== undefined) {
                    if (promptCardPointArr != undefined) {
                        promptCardPointArr = promptCardPointArr.concat(threeOne);
                    }
                    else {
                        promptCardPointArr = threeOne;
                    }
                }
                if (threeTwo !== undefined) {
                    if (promptCardPointArr != undefined) {
                        promptCardPointArr = promptCardPointArr.concat(threeTwo);
                    }
                    else {
                        promptCardPointArr = threeTwo;
                    }
                }
                break;
        }
        if (promptCardPointArr !== undefined) {
            // 将计算得到的点数还原成原始数据
            let promptCardData: number[][] = [];
            for (let i = 0; i < promptCardPointArr.length; i++) {
                let cardPoints = promptCardPointArr[i];
                cardPoints.sort((a, b) => { return b - a })// 手牌是降序
                let cardData: number[] = [];
                let sameNum = 0;
                for (let j = 0; j < selfCardArr.length; j++) {
                    let data = selfCardArr[j];
                    let point = this.ddzGm.touchMgr.cardTools.getCardPoint(data);
                    let promptPoint = cardPoints[sameNum];
                    if (point === promptPoint) {
                        sameNum += 1;
                        cardData.push(data);
                        if (sameNum >= cardPoints.length) {
                            break;
                        }
                    }
                }
                promptCardData.push(cardData);
            }
            return promptCardData;
        }
        return [];
    }

    /**
     * 将数据转换成3，4，5，6，7，8....
     */
    private getSelfCardData() {
        let selfCardArr = this.ddzGm.touchMgr._holdsCardData;
        let selfCardPoints = [];
        for (let data of selfCardArr) {
            selfCardPoints.push(this.ddzGm.touchMgr.cardTools.getCardPoint(data));
        }
        return selfCardPoints;
    }
}
