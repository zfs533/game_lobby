import PopActionBox from "../lobby/popActionBox";
import DFDCEggItem from "./dfdcEggItem";
import { DFDCEggInfo, DFDCOpenedEgg } from "./dfdcMsg"
import DFDCGame from "./dfdcGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DFDCEgg extends PopActionBox {

    @property(cc.Label)
    lblTips: cc.Label = undefined;

    @property(cc.Label)
    lblTimer: cc.Label = undefined;

    @property(cc.Animation)
    lbljinbi: cc.Animation = undefined;

    @property(cc.Node)
    ObjectPool: cc.Node = undefined;

    @property(cc.Prefab)
    goldObject: cc.Prefab = undefined;

    game: DFDCGame;

    private showTime: number = 60;
    private items: DFDCEggItem[] = [];
    private winId: number = 0;  // 最终开奖id

    public canFlip = true;
    public flipNum = 0;
    public flipedNum = 0;           // 已经翻开的次数
    public itemIds: number[] = [];  // 服务器给的id
    public openedId: number[] = [];  // 记录已开的id
    public openedItems: DFDCOpenedEgg[] = [];
    private preEggItem: cc.Node[] = [];
    private openEggItem: cc.Node[] = [];


    public pand: boolean = true;
    public endpoint: cc.Vec2[] = [cc.v2(-360, 180), cc.v2(120, 180), cc.v2(360, 180), cc.v2(-120, 0),
    cc.v2(-360, 0), cc.v2(-120, -180), cc.v2(-360, -180), cc.v2(-120, 180),
    cc.v2(120, -180), cc.v2(360, 0), cc.v2(120, 0), cc.v2(360, -180)];

    onLoad() {
        super.onLoad();
        for (let index = 0; index < 12; index++) {
            let coin = cc.instantiate(this.goldObject);
            this.ObjectPool.addChild(coin);
            this.preEggItem[index] = coin;
        }
    }



    showEgg(game: DFDCGame, data: ps.Dfdc_EggInfo) {
        this.game = game;
        this.node.active = true;
        this.lbljinbi.play();
        this.winId = data.winEggIcon;
        this.showTime = data.eggTime;
        this.randomupset(this.endpoint);
        this.pand = false;
        this.itemIds = data.eggIcons;
        this.flipNum = this.itemIds.length;
        this.openEggItem = [];
        this.game.audioMgr.playGold();
        this.initEggList();
        this.timerCount();
    }

    private randomupset(endpoint: cc.Vec2[]) {
        for (let i = endpoint.length - 1; i >= 0; i--) {
            let idns = Math.floor(Math.random() * (i + 1));
            let seca = endpoint[idns];
            endpoint[idns] = endpoint[i];
            endpoint[i] = seca;
        }
    }

    private initEggList() {
        this.clearContent();
        let ispand = true;
        let self = this;
        for (let i = 0; i < this.preEggItem.length; ++i) {
            this.scheduleOnce(function () {
                let egg: DFDCEggItem = self.preEggItem[i].getComponent(DFDCEggItem);
                if (self.openedItems && self.openedItems.length > 0) {
                    ispand = true;
                    for (let j = 0; j < self.openedItems.length; ++j) {
                        if (i === self.openedItems[j].idx) {
                            egg.init(self, i, self.openedItems[j].openIcon);
                            ispand = false;
                            break;
                        }
                    }
                    if (ispand) {
                        egg.init(self, i);
                    }
                } else {
                    egg.init(self, i);
                }
                self.items.push(egg);
                // }, i * 0.07);
            }, 0);
        }
    }

    private timerCount() {
        this.schedule(this.countDown, 1);
    }

    private countDown() {
        this.showTime--;
        if (this.showTime < 0) this.showTime = 0;
        this.lblTimer.string = this.showTime.toString();
    }

    public flipItem(icon: number, idx: number) {
        this.items[idx].flip(icon, idx, false);
    }

    public checkItems(arr: number[], index: number) {
        let obj: any = {}
        for (let i = 0; i < arr.length; ++i) {
            if (!obj[arr[i]]) {
                obj[arr[i]] = 1;
            } else {
                obj[arr[i]]++;
            }
        }
        let keys = Object.keys(obj);
        let maxNum = 0;
        let maxVal = "";
        for (let i = 0; i < keys.length; ++i) {
            if (obj[keys[i]] > maxNum) {
                maxNum = obj[keys[i]];
                maxVal = keys[i];
            }
        }

        if (this.openEggItem.length === 0) {
            this.openEggItem.push(this.preEggItem[index])
        }
        else {
            for (let i = 0; i < this.openEggItem.length; i++) {
                let icon = this.openEggItem[i].getComponent(DFDCEggItem).iconIdx
                let icon1 = this.preEggItem[index].getComponent(DFDCEggItem).iconIdx
                if (icon === icon1) {
                    // cc.log("<<<<<<<icon  ", icon);
                    let self = this;
                    this.scheduleOnce(function () {
                        self.openEggItem[i].getChildByName("quan").children[icon].active = true;
                        self.preEggItem[index].getChildByName("quan").children[icon].active = true;
                    }, 1);
                }
            }
            this.openEggItem.push(this.preEggItem[index])
        }
        //cc.log(arr, "maxNum:", maxNum, "maxVal:", maxVal, "winId:", this.winId);
        if (maxNum === 3 && +maxVal === this.winId) {
            //  console.log("已经翻到了");
            this.pand = true;
            // this.game.msg.sendDoEggEnd(User.uid);
        }
    }

    private clearContent() {
        for (let i = 0; i < this.preEggItem.length; ++i) {
            let egg: DFDCEggItem = this.preEggItem[i].getComponent(DFDCEggItem);
            egg.initia();
            this.preEggItem[i].active = false;
        }
        this.canFlip = true;
        this.flipedNum = 0;
        this.showTime = 60;
        this.lblTimer.string = this.showTime.toString();
        this.openedId = [];
        this.items = [];
    }

    public Autoremake() {
        if (this.pand) {
            return;
        }
        return new Promise(resolve => {
            let weifanann: number[] = [];
            for (let i = 0; i < this.preEggItem.length; ++i) {
                let egg: DFDCEggItem = this.preEggItem[i].getComponent(DFDCEggItem);
                if (!egg.isFlipEnd) {
                    weifanann.push(egg.itemIdx);
                }
            }
            let self = this;
            weifanann.sort();
            for (let k = 0; k < weifanann.length; ++k) {
                this.scheduleOnce(function () {
                    let eggs: DFDCEggItem = self.preEggItem[weifanann[k]].getComponent(DFDCEggItem);
                    if (!self.pand) {
                        eggs.onClickItem();
                    } else {
                        self.unscheduleAllCallbacks();
                        resolve();
                    }
                }, k * 1);
            }
        });
    }

    hide() {
        let self = this;
        this.unschedule(this.countDown);
        this.scheduleOnce(function () {
            self.node.active = false;
        }, 2);

    }
}
