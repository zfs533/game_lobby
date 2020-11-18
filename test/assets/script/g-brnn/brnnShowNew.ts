import { setInteractable } from "../common/util";
import { getBullTypeBg } from "../g-nn/nnUtil";
import BrnnGame from "./brnnGame";
import BrnnPokerFlower from "./brnnPokerFlower";

const { ccclass, property } = cc._decorator;
const Decimal = window.Decimal
@ccclass
export default class BrnnShowNew extends cc.Component {

    @property([BrnnPokerFlower])
    pokerFlower: BrnnPokerFlower[] = [];

    @property(cc.Prefab)
    nnpokerlight: cc.Prefab = undefined;

    @property([cc.Node])
    posBgs: cc.Node[] = [];

    @property([cc.Node])
    public nnTypeBgs: cc.Node[] = [];

    @property([cc.Sprite])
    private nnTypes: cc.Sprite[] = [];

    @property([cc.Label])
    private nnBoosts: cc.Label[] = [];

    @property([cc.Label])
    private finalScores: cc.Label[] = [];

    private brGm: BrnnGame = null;
    private nnTypeBtns: cc.Button[] = [];
    private originPos: cc.Vec2[] = [];
    private originPos1: cc.Vec2[] = [];

    private dtlist: ps.Brnn_EnterDealCard_Info[] = [];

    onLoad() {
        this.posBgs.forEach(item => {
            this.originPos.push(item.getPosition());
        });
        this.nnTypeBgs.forEach(item => {
            this.originPos1.push(item.parent.getPosition());
        });
    }

    init(gm: BrnnGame) {
        this.brGm = gm;
        for (let index = 0; index < this.nnTypes.length; index++) {
            let nnType = this.nnTypes[index];
            this.nnTypeBtns[index] = nnType.node.getComponent(cc.Button);
        }
    }

    onDisable() {
        this.dtlist.splice(0);
        this.posBgs.forEach((item, idx) => {
            item.removeAllChildren();
            item.setPosition(this.originPos[idx]);
        });
        this.nnTypeBgs.forEach((item, idx) => {
            item.parent.setPosition(this.originPos1[idx]);
        });
    }

    onEnable() {
        this.scheduleOnce(() => {
            this.dtlist.forEach((item, idx) => {
                if (idx != 0) {
                    if (item.isWin > 0) {
                        let moveTo = cc.moveBy(0.5, new cc.Vec2(0, 70));
                        cc.tween(this.posBgs[idx]).then(moveTo).start();
                        let moveTo1 = cc.moveBy(0.5, new cc.Vec2(0, 57));
                        if (this.nnTypeBgs[idx] && this.nnTypeBgs[idx].parent) {
                            cc.tween(this.nnTypeBgs[idx].parent).then(moveTo1).start();
                        }
                    }
                    else {
                        let moveTo = cc.moveBy(0.5, new cc.Vec2(0, -70));
                        cc.tween(this.posBgs[idx]).then(moveTo).start();
                        let moveTo1 = cc.moveBy(0.5, new cc.Vec2(0, -57));
                        console.log(idx);
                        if (this.nnTypeBgs[idx] && this.nnTypeBgs[idx].parent) {
                            cc.tween(this.nnTypeBgs[idx].parent).then(moveTo1).start();
                        }
                    }
                }
            });
        }, 1);
    }

    /**
     * 排列扑克
     * @param areaInfo
     */
    async layoutCard(areaInfo: ps.Brnn_EnterDealCard_Info) {
        this.dtlist.push(areaInfo);
        this.cardNNType(areaInfo);
        this.showNNPokerFlower(areaInfo);
        let item = this.posBgs[areaInfo.area];
        item.removeAllChildren();
        let datalist = areaInfo.cards;
        if (areaInfo.bullType) {
            datalist = await this.resortCardsData(areaInfo.cards);

        }
        datalist.forEach((cardData, idx) => {
            let node = this.brGm.pkrGame.getPoker(cardData);
            item.addChild(node);
            node.setPosition(cc.v2(idx * 50, 0));
            if (areaInfo.bullType && idx > 2) {
                let nd = cc.instantiate(this.nnpokerlight);
                nd.scale = 1;
                node.addChild(nd);
            }
        });
    }

    showNNPokerFlower(areaInfo: ps.Brnn_EnterDealCard_Info) {
        let origin: number = 0;
        let changed: number = 0;
        for (let i = 0; i < areaInfo.cards.length; i++) {
            let card = areaInfo.cards[i];
            let num = card & 0x000000ff;
            if (num > changed) {
                changed = num;
                origin = card;
            }
        }
        let suit = origin >> 8;
        this.pokerFlower[areaInfo.area].showFlowerNumber(origin, suit);

    }

    /**
     * 设置牛几展示
     * 展示牌类型和自己的输赢
     * @param areaInfo
     * @param animTime
     */
    private cardNNType(areaInfo: ps.Brnn_EnterDealCard_Info, animTime: number = 0.5) {
        let bullBgIdx = getBullTypeBg(areaInfo.bullType)
        this.nnTypeBgs[areaInfo.area].getComponent(cc.Sprite).spriteFrame = this.brGm.sfBullTypeBgs[bullBgIdx];
        this.nnTypeBgs[areaInfo.area].active = true;
        let nnType = this.nnTypes[areaInfo.area];
        nnType.node.active = true;
        nnType.spriteFrame = this.brGm.sfBullTypes[areaInfo.bullType];
        nnType.node.stopAllActions();
        nnType.node.scale = 0;
        cc.tween(nnType.node).then(cc.scaleTo(animTime, 1, 1).easing(cc.easeBounceOut())).start();

        if (!areaInfo.isWin && areaInfo.area > 0) {
            setInteractable(this.nnTypeBtns[areaInfo.area], false);
        } else {
            setInteractable(this.nnTypeBtns[areaInfo.area], true);
        }

        let areaIdx = areaInfo.area;
        if (areaInfo.area >= 0) {
            let lab_score = this.finalScores[areaIdx];
            lab_score.node.active = true;
            lab_score.string = "";
            lab_score.node.color = cc.Color.BLACK.fromHEX("#FFFFFF");
            let lab_boost = this.nnBoosts[areaIdx];
            lab_boost.node.active = true;

            let selfBet = +this.brGm._selfBets[areaIdx - 1];

            //下注了的文字
            if (selfBet > 0) {
                lab_score.fontSize = 20;
                if (areaInfo.isWin > 0) {
                    lab_score.font = this.brGm.fontScores[0];
                } else {
                    selfBet = -selfBet;
                    lab_score.font = this.brGm.fontScores[1];
                }
                lab_score.string = new Decimal(selfBet).mul(areaInfo.boost).toString();
            }
            //没下注的文字
            else {
                lab_score.font = null;
                lab_score.fontSize = 18;
                lab_score.string = "未下注";
                // lab_score.node.color = cc.Color.BLACK.fromHEX("#5E1915");
                lab_score.node.color = cc.Color.BLACK.fromHEX("#ffffff");
            }
            lab_score.node.stopAllActions();

            if (areaInfo.boost) {
                lab_boost.string = `(x${areaInfo.boost})`;
            } else {
                lab_boost.string = "";
            }
            lab_boost.node.stopAllActions();
        }
    }

    /**
     * 重新排序，将被10整除的3个排在前面
     * @param arr
     */
    resortCardsData(arr: number[]): Promise<number[]> {
        return new Promise(resolve => {
            let temp = [];
            for (let i = 0; i < arr.length - 2; i++) {
                let a = this.getCardPoint(arr[i]);
                for (let j = i + 1; j < arr.length - 1; j++) {
                    let b = this.getCardPoint(arr[j]);
                    for (let k = j + 1; k < arr.length; k++) {
                        let c = this.getCardPoint(arr[k]);
                        if ((a + b + c) % 10 == 0) {
                            temp = [arr[i], arr[j], arr[k]];
                            break;
                        }
                    }
                }
            }
            arr.forEach(item => {
                let bool = temp.find(value => value == item);
                if (!bool) {
                    temp.push(item);
                }
            });
            resolve(temp);
        });
    }

    /**
     * 扑克点数[1,2,3,4,5,6...]
     * @param card
     */
    private getCardPoint(card: number) {
        let cd = card & 0x000000ff;
        if (cd > 10) {
            cd = 10;
        }
        return cd;
    }
}
