import PopActionBox from "../lobby/popActionBox"
import BYGame from "./byGame"
import net from "../common/net";
import { isFestivalGuns } from "./byUtil";

const { ccclass, property } = cc._decorator;



@ccclass
export default class BYGunHandbook extends PopActionBox {

    @property(cc.Node)
    private content: cc.Node = undefined

    @property(cc.Node)
    private tip: cc.Node = undefined

    @property([cc.SpriteFrame])
    sfBtn: cc.SpriteFrame[] = [];

    @property(cc.Node)
    private tips1: cc.Node = undefined


    public game: BYGame = undefined


    onLoad() {
        super.onLoad()
        let game = cc.find("game")
        this.game = game.getComponent(BYGame)
    }

    protected start() {
        this.openAnim();
    }

    openAnim() {
        super.openAnim();
        // for (let i = 1; i < this.content.children.length; i++) {
        //     let item = this.content.children[i];
        //     let label = item.getChildByName("beishu");
        //     label.getComponent(cc.Label).string = "累充" + this.game.gunCfg[i].coin + "元";
        // }
        this.init()
        this.setChangeGunLayerMoney()
    }


    async init() {
        for (let i = 0; i < this.content.children.length; i++) {
            let item = this.content.children[i];
            let btn = item.getChildByName("button")
            if (item.name === this.game.plyMgr.me.gunSpType.toString()) {
                btn.getChildByName("sy").active = false;
                btn.getChildByName("syz").active = true;
                btn.getChildByName("bgsy").active = true;
            } else {
                btn.getChildByName("sy").active = true;
                btn.getChildByName("syz").active = false;
                btn.getChildByName("bgsy").active = false;
            }
        }
        this.setButtonGray(this.game.myMaxGunSp);
        this.node.on("close", () => {
            this.game.hideChangeGunBtn();
        });
    }

    setButtonGray(garde: number) {
        for (let i = 0; i < this.content.children.length; i++) {
            let item = this.content.children[i];
            let btn = item.getChildByName("button")
            if (garde < +item.name) {
                btn.getChildByName("sy").active = false;
                btn.getChildByName("syz").active = false;
                btn.getChildByName("bgsy").active = true;
                btn.getChildByName("bgsy").getComponent(cc.Sprite).spriteFrame = this.sfBtn[0];
                btn.getChildByName("hq").active = true;
            }

        }
        if (this.game.myFestivalGuns.length > 0) {
            for (let i = 0; i < this.game.myFestivalGuns.length; i++) {
                let item = this.content.getChildByName(this.game.myFestivalGuns[i].toString());
                if (!item) continue;
                // item.getChildByName("button").getChildByName("bgsy").getComponent(cc.Sprite).spriteFrame = this.sfBtn[0];
                item.getChildByName("button").getChildByName("sy").active = true;
                item.getChildByName("button").getChildByName("hq").active = false;
                item.getChildByName("button").getChildByName("bgsy").active = false;
            }
        }
        if (this.game.plyMgr.me.gunSpType >= 12) {
            let name = this.getGunSpineIndex(this.game.plyMgr.me.gunSpType).toString();
            let item = this.content.getChildByName(name);
            let btn = item.getChildByName("button")
            btn.getChildByName("sy").active = false;
            btn.getChildByName("syz").active = true;
            let bs = btn.getChildByName("bgsy")
            bs.getComponent(cc.Sprite).spriteFrame = this.sfBtn[1];
            bs.active = true;
        }


    }

    /**
    * 在resArr获取对应炮台的index
    */
    getGunSpineIndex(type: number): number {
        let index;
        switch (type) {
            case 12:
                index = 170
                break;
            case 13:
                index = 174
                break;
            case 14:
                index = 178
                break;
            case 15:
                index = 186
                break;
            case 16:
                index = 128
                break;
            case 17:
                index = 182
                break;
            case 18:
                index = 146
                break;
            case 19:
                index = 150
                break;
            case 20:
                index = 154
                break;
            case 21:
                index = 158
                break;
            case 22:
                index = 162
                break;
            case 23:
                index = 166
                break;
            default:
                break;
        }
        return index

    }

    setChangeGunLayerMoney() {
        let moneyLabel = this.tip.getChildByName("money");
        moneyLabel.getComponent(cc.Label).string = this.game.amount
        let lvsp = this.tip.getChildByName("lvsp");
        let spx = this.game.myMaxGunSp + 2;
        if (spx > 8) {
            spx = 8;
            // this.tip.active = false;
        }
        let spxx = "s" + spx;
        lvsp.getChildByName(spxx).active = true;
    }
    // 换炮 按钮点击
    public onClickUse(event: cc.Event, gradeStr: string) {
        let grade = +gradeStr
        if ((!isFestivalGuns(grade) && +grade > this.game.myMaxGunSp)
            || (isFestivalGuns(grade) && this.game.myFestivalGuns.indexOf(grade) < 0)) {
            // 点击了获取按钮
            this.game.withdrawBtClick(grade);
            return;
        }
        let me = this.game.plyMgr.me;
        if (me) {
            me.changeGunSp(grade);
        }
        this.closeAction();
        this.game.msg.gameBYHandlerBulletStyle(grade.toString());
    }



}
