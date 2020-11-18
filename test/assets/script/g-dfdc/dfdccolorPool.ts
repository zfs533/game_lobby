import { jackPotInfo } from "./dfdcMsg";
import * as util from "../common/util";

const { ccclass, property } = cc._decorator;



@ccclass
export default class DFDCCOLORPOOL extends cc.Component {
    @property([cc.Label])
    public lblColorPools: cc.Label[] = [];

    @property([cc.Node])
    public ndScrollGold: cc.Node[] = [];

    @property([cc.SpriteFrame])
    public sfScrollGold: cc.SpriteFrame[] = [];

    private Pools: number[] = [];                             //彩池旧金额

    private poolsNun = 0;
    private MaxPoolsNum: number[] = [];

    // 初始化彩池金额
    public init(data: jackPotInfo, isInit: boolean) {
        this.MaxPoolsNum = [];
        for (let i = 0; i < this.lblColorPools.length; ++i) {
            let pool = this.lblColorPools[i];
            let Poolfinan = 0;
            switch (i) {
                case 0:
                    Poolfinan = parseFloat(data.duoshou);
                    break;
                case 1:
                    Poolfinan = parseFloat(data.duoxi);
                    break;
                case 2:
                    Poolfinan = parseFloat(data.duocai);
                    break;
                case 3:
                    Poolfinan = parseFloat(data.duofu);
                    break;
                default:
                    break;
            }
            //cc.log("<<<<<<<< 初始化彩池", Poolfinan);
            this.MaxPoolsNum.push(+Poolfinan);
            let amount = this.amountSetting(Poolfinan.toString());
            let goldArr = amount.split("").reverse();
            this.poolsNun = goldArr.length;
            if (+pool.string > 0) {
                this.Pools[i] = Poolfinan;
            } else {
                this.Pools[i] = 0;
                pool.string = Poolfinan.toString();
                this.setColorPoolScore(i, Poolfinan.toString());
            }
            if (isInit) {
                this.Pools[i] = 0;
                pool.string = Poolfinan.toString();
                this.setColorPoolScore(i, Poolfinan.toString());
            }
        }
        this.unschedule(this.colorPoolAddGold);
        this.schedule(this.colorPoolAddGold, 0.6);
    }
    // 设置初始金额
    public setColorPoolScore(idx: number, gold: string) {
        let amount = this.amountSetting(gold);
        let goldArr = amount.split("").reverse();
        let goldLen = goldArr.length;
        let len = this.ndScrollGold[idx].childrenCount;
        for (let k = 0; k < len / 2; ++k) {
            let child = this.ndScrollGold[idx].children[k];
            let child2 = this.ndScrollGold[idx].children[k + 10];
            if (k >= goldLen) {
                child.active = false;
                child2.active = false;
            } else if (k === 2) {
                child.active = true;
            } else {
                let gIdx = +goldArr[k];
                if (gIdx !== undefined) {
                    let sp = child.getComponent(cc.Sprite);
                    sp.spriteFrame = this.sfScrollGold[gIdx];
                    child.active = true;
                    let sp1 = child2.getComponent(cc.Sprite);
                    sp1.spriteFrame = this.sfScrollGold[gIdx];
                    child2.active = true;
                }
            }
        }
    }

    //补全小数后两位
    private amountSetting(gold: string) {
        let isDecimal = gold.split(".");
        if (isDecimal[1]) {
            let Decimal = isDecimal[1].split("");
            if (Decimal.length == 1) {
                return gold + "0";
            } else {
                return gold;
            }
        } else {
            return gold + ".00"
        }
    }

    // 翻滚动画
    private scrollGoldSpPre(nd: cc.Node, num: number, cIdx: number) {
        nd.active = true;
        let sp = nd.getComponent(cc.Sprite);
        sp.spriteFrame = this.sfScrollGold[num];

        nd.y = 0;
        // let a1 = cc.moveBy(0.5, 0, 25);
        // let func = cc.callFunc(() => {
        //     nd.y = 25;
        // });

        //return cc.sequence(a1, func);
        cc.tween(nd)
            .by(0.5, { position: cc.v2(0, 25) })
            .call(() => { nd.y = 25; })
            .start();
    }
    // 翻滚动画
    private scrollGoldSp(nd: cc.Node, num: number, cIdx: number) {
        nd.active = true;
        let sp = nd.getComponent(cc.Sprite);
        sp.spriteFrame = this.sfScrollGold[num];

        nd.y = -25;
        // let a1 = cc.moveBy(0.5, 0, 25);
        // let func = cc.callFunc(() => {
        //     nd.y = 0;
        // });

        // return cc.sequence(a1, func);
        cc.tween(nd)
            .by(0.5, { position: cc.v2(0, 25) })
            .call(() => { nd.y = 0 })
            .start()
    }
    //获取变换的图片
    private AddColorPoolScore(pIdx: number, cIdx: number, num: number) {
        let nd1 = this.ndScrollGold[pIdx].children[cIdx];
        let nd2 = this.ndScrollGold[pIdx].children[cIdx + 10];
        let preNum = num - 1;
        preNum = preNum < 0 ? 9 : preNum;
        //nd1.runAction(this.scrollGoldSpPre(nd1, num, cIdx));
        this.scrollGoldSpPre(nd1, num, cIdx)

        //nd2.runAction(this.scrollGoldSp(nd2, num, cIdx));
        this.scrollGoldSp(nd2, num, cIdx)
    }



    // 彩池每5秒上涨一分0.01
    private colorPoolAddGold() {
        let i = Math.floor(Math.random() * 4);
        let curGold = +this.lblColorPools[i].string;
        let addGold = "";
        if ((i === 0 && this.MaxPoolsNum[i] !== 10000) || (i === 1 && this.MaxPoolsNum[i] !== 30000) || (i === 2 && this.MaxPoolsNum[i] !== 60000) || (i === 3 && this.MaxPoolsNum[i] !== 100000)) {
            //addGold = util.add(curGold, 0.01).toString();
            addGold = new window.Decimal(curGold).add(0.01).toString();
            if (this.MaxPoolsNum[i] < +addGold && this.MaxPoolsNum[i] === +curGold) {
                return;
            }
            let num = this.MaxPoolsNum[i] - +addGold;
            if (num > 5) {
                addGold = this.Pools[i].toString();
            }
            if (this.MaxPoolsNum[i] < +curGold) {
                addGold = this.Pools[i].toString();
            }
            this.lblColorPools[i].string = addGold;
            let newGold = this.amountSetting(addGold);
            let oldGold = this.amountSetting(curGold.toString());
            let lastChar = "";
            for (let k = 1; k < 10; ++k) {
                if (k != 3) {
                    lastChar = this.iscarry(newGold, oldGold, k - 1);
                    if (lastChar != "no") {
                        this.AddColorPoolScore(i, k - 1, +lastChar);
                    }
                }
            }
            this.Pools[i] = 0;
        }
    }
    //是否进位
    private iscarry(newGold: string, oldGold: string, cIdx: number) {
        let hundr1 = newGold.split('').reverse();
        let hundr2 = oldGold.split('').reverse();
        if (hundr1[cIdx] == hundr2[cIdx]) {
            return "no";
        } else {
            return hundr1[cIdx];

        }
    }
    //播放动画
    public playAni(nodeAnim: cc.Node) {
        //cc.log("<<<<<<<播放动画",nodeAnim.name);
        return new Promise(resolve => {
            nodeAnim.active = true;
            let gai = nodeAnim.getChildByName("sloticons01");
            let anim = nodeAnim.getComponent(cc.Animation);
            if (!anim) {
                cc.warn("no anim");
                resolve(false);
                return;
            }
            if (anim.defaultClip) {
                anim.play();
            } else {
                let clips = anim.getClips();
                if (!clips || clips.length === 0) {
                    resolve(false);
                    return;
                }
                anim.play(clips[0].name);
            }
            if (gai) gai.active = true;
            anim.on("finished", function () {
                if (gai) gai.active = false;
                resolve(true);
            });
        });
    }



}
