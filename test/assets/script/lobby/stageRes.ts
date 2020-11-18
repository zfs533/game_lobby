import { GameId } from "../common/enum";

const { ccclass, property } = cc._decorator;

let Decimal = window.Decimal;
@ccclass
export default class StageRes extends cc.Component {
    @property([cc.SpriteFrame])
    sfBetInfo: cc.SpriteFrame[] = [];

    private _resources: cc.Node;

    get resources() {
        if (!this._resources) {
            this._resources = this.node.getChildByName("res");
        }
        return this._resources;
    }
    onLoad() {
        // init logic
    }

    private copySprite(from: cc.Node, to: cc.Node) {
        to.getComponent(cc.Sprite).spriteFrame = from.getComponent(cc.Sprite).spriteFrame;
    }

    /**
     * 创建场次卡
     */
    getStageModel(matchInfo: ps.HallRoomHandlerGetYardList_Match, gameName: GameId, idx: number) {
        let nodeGame = this.node.getChildByName(gameName)
        if (!nodeGame) {
            //除捕鱼外通用
            nodeGame = this.node.getChildByName("normal")
        }
        let model = cc.instantiate(nodeGame.getChildByName(idx.toString()))
        if (gameName === GameId.BY) {
            let bets = matchInfo.bets;
            let max1 = new Decimal(bets).mul(matchInfo.byRatio).toNumber();

            // 炮倍
            let psobeiLb = model.getChildByName("paobei").getChildByName("mul");
            // 多少元炮场
            let psoPartLb = model.getChildByName("layout").getChildByName('score');
            let partText = model.getChildByName("layout").getChildByName('bg_ydf');
            let freshText = model.getChildByName("layout").getChildByName('wz_tyc');
            if (matchInfo.byRatio === 1) {
                if (psobeiLb.getComponent(cc.Label) !== null) {
                    psobeiLb.getComponent(cc.Label).string = bets + "元";
                } else {
                    psobeiLb.getComponent(cc.RichText).string = "<size = 32>" + bets + "</size><size = 25>元</size>";
                }
                psoPartLb.active = false;
                partText.active = false;
                if (freshText) freshText.active = true;
            } else {
                if (psobeiLb.getComponent(cc.Label) !== null) {
                    psobeiLb.getComponent(cc.Label).string = bets + "-" + max1 + "元";
                } else {
                    psobeiLb.getComponent(cc.RichText).string = "<size = 32>" + bets + "-" + max1 + "</size><size = 25>元</size>";
                }
                psoPartLb.getComponent(cc.Label).string = "" + max1;
                partText.active = true;
                psoPartLb.active = true;
                if (freshText) freshText.active = false;
            }

            if (max1 > 99) {
                model.getChildByName("layout").setScale(0.85, 0.85);
            }
            if (model.getChildByName("limit").getComponent(cc.Label) !== null)
                model.getChildByName("limit").getComponent(cc.Label).string = matchInfo.minMoney + "元";
            else {
                model.getChildByName("limit").getComponent(cc.RichText).string = "<size = 32>" + matchInfo.minMoney + "</size><size = 20>元</size>";
            }

            return model
        } else if (gameName === GameId.QHB) {
            // let icon = model.getChildByName("stageIcon").getComponent(cc.Sprite)
            let bets = matchInfo.bets;
            let redBagCount = matchInfo.hongbaoCnt;
            let minLimit = matchInfo.allowGrabMinMoney;
            let maxLimit = matchInfo.allowGrabMaxMoney;

            let layout = model.getChildByName("layout");
            let minM = layout.getChildByName("min").getComponent(cc.Label);
            let maxM = layout.getChildByName("max").getComponent(cc.Label);
            let rule = model.getChildByName("info").getComponent(cc.Label);

            if (redBagCount && bets) {
                rule.string = `${redBagCount}包${bets}倍`;
            }
            if (minM && minM !== undefined) {
                minM.string = minLimit;
            }
            if (maxM && maxM !== undefined) {
                maxM.string = "-" + maxLimit + "元";
            }
            return model
        } else {  ////NIUNIU DOUDIZHU PAODEKUAI LONGHU DEZHOUPUKE HONGHEI BRNIUNIU JDNIUNIU ERRENMAJIANG JINHUA
            let score = model.getChildByName("layout").getChildByName('score').getComponent(cc.Label)
            score.string = matchInfo.bets

            if (model.getChildByName("limit").getComponent(cc.Label) !== null)
                model.getChildByName("limit").getComponent(cc.Label).string = matchInfo.minMoney + "元";
            else {
                model.getChildByName("limit").getComponent(cc.RichText).string = "<size = 35>" + matchInfo.minMoney + "</size><size = 20>元</size>";
            }

            let max = model.getChildByName("max");
            let maxDes = max.getChildByName("layout").getChildByName("betText").getComponent(cc.Label);
            let maxLab = max.getChildByName("layout").getChildByName('lb').getComponent(cc.Label);
            let unit = max.getChildByName("layout").getChildByName('unit').getComponent(cc.Label);
            if (gameName === GameId.JH) {
                maxDes.string = "全压上限";
                max.active = true;
                maxLab.string = matchInfo.allInMaxMoney
                unit.string = "元"
            } else if (gameName === GameId.DDZ) {
                maxDes.string = "倍数";
                max.active = true;
                maxLab.string = matchInfo.maxBet.toString();
                unit.string = "倍"

                if ("0.05" === score.string) {
                    model.getChildByName("layout").setScale(0.75, 0.75)
                } else if ("0.5" === score.string)
                    model.getChildByName("layout").setScale(0.9, 0.9)


            } else if (gameName === GameId.BRNN) {
                maxDes.string = "最高返奖";
                max.active = true;
                maxLab.string = matchInfo.brnnMaxBoost.toString();
                unit.string = "倍"
            } else if (gameName === GameId.DZPK) {
                let layout = model.getChildByName("layout");
                let carry = model.getChildByName("carry");
                let haveTakeMony = carry.getChildByName('bg');
                let noHaveTakeMony = carry.getChildByName('bg1');

                maxDes.string = "盲注";
                maxLab.string = `${matchInfo.bets}/${+matchInfo.bets * 2}`;
                unit.string = "元";

                layout.active = false;
                carry.active = true;

                if (matchInfo.takeMoney === "-1") {
                    haveTakeMony.active = false;
                    noHaveTakeMony.active = true;
                } else {
                    haveTakeMony.active = true;
                    noHaveTakeMony.active = false;
                    haveTakeMony.getChildByName('money').getComponent(cc.Label).string = matchInfo.takeMoney + "元";
                }
            }
            else {
                max.active = false;
            }
            return model
        }
    }
}