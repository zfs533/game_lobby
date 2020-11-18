
const { ccclass, property } = cc._decorator;

@ccclass
export default class PayPageItem extends cc.Component {
    @property(cc.Label)
    lblMoney: cc.Label = undefined;

    @property(cc.Button)
    btnMoney: cc.Button = undefined;

    @property(cc.Sprite)
    private sfBtn: cc.Sprite = undefined;
    @property(cc.Node)
    private clickPay: cc.Node = undefined;


    @property([cc.SpriteFrame])
    private sfBtns: cc.SpriteFrame[] = [];

    public isClick: boolean = false;
    public money: string = "";
    public channel: string = "";
    public payType: string = "";
    public isSmall: number = 0;
    public isSmallFix: number = 0;
    init(money: number, channel?: string, payType?: string, isSmall?: number, isSmallFix?: number) {
        if (!money) return;
        this.money = money.toString();
        this.channel = channel;
        this.payType = payType;
        this.isSmall = (isSmall === undefined) ? 0 : 1;
        this.isSmallFix = (isSmallFix === undefined) ? 0 : 1;
        this.setInfo();
    }

    setInfo() {
        // this.sfBtn.spriteFrame = this.sfBtns[0];
        this.clickPay.active = false
        if (this.payType == "usdt_pay") {
            this.lblMoney.string = this.money + 'usdt';
        }
        else {
            this.lblMoney.string = this.money + '元';
        }
        this.btnMoney.clickEvents[0].customEventData = this.money;
    }

    resetBtnSF() {
        if (this.isClick) {
            // this.sfBtn.spriteFrame = this.sfBtns[1];
            this.clickPay.active = true
        } else {
            this.clickPay.active = false
        }
    }

    changeBtnSF() {
        // this.sfBtn.spriteFrame = this.sfBtns[1];
        this.clickPay.active = true
    }
}
