import Lobby from "./lobby";
import PopActionBox from "../lobby/popActionBox"
import User from "../common/user";
import { setInteractable } from '../common/util';
import { ErrCodes } from "../common/code";
import { showTip, showLoading, hideLoading } from "../common/ui";
import net from "../common/net";
import g from "../g";

enum UI_NAME {
    deposit,
    draw,
    transfer,
}

const Decimal = window.Decimal
const { ccclass, property } = cc._decorator;

@ccclass
export default class Bank extends PopActionBox {

    @property(cc.ToggleContainer)
    tgBtn: cc.ToggleContainer = undefined;

    @property(cc.Label)
    labCash: cc.Label = undefined;

    @property(cc.Label)
    labDeposit: cc.Label = undefined;

    @property(cc.Node)
    nodeBtnExChange: cc.Node = undefined;

    // 存入和取出
    @property(cc.EditBox)
    ebSave: cc.EditBox = undefined;

    @property(cc.Slider)
    sldSave: cc.Slider = undefined;

    @property(cc.Node)
    savePro: cc.Node = undefined;

    @property(cc.Button)
    btnSave: cc.Button = undefined;

    @property(cc.Button)
    clearBtn: cc.Button = undefined;

    @property(cc.Label)
    lblAlert: cc.Label = undefined;

    @property(cc.Label)
    lblOpera: cc.Label = undefined;

    private isSaveOper: boolean = true;
    private sliderProWidth: number;
    private _lobby: Lobby = undefined

    onLoad() {
        super.onLoad();
        this.sliderProWidth = this.sldSave.node.width;
    }
    init(lobby: Lobby) {
        this._lobby = lobby;
    }
    showTransfer() {
        this.tgBtn.toggleItems.forEach((tog: cc.Toggle, togIdx) => {
            if ((this.tgBtn.toggleItems.length - 1) === togIdx) {
                tog.isChecked = true;
            } else {
                tog.isChecked = false;
            }
        });
        this.showUI(UI_NAME.transfer);
    }

    beforeShow(data: ps.HallBankHandlerEnter) {
        User.money = data.money;
        User.bankMoney = data.bankMoney;
        this.user.refreshUserInfos();
        this.updateEnterData(data.bankMoney);
        this.showBank()
    }

    updateEnterData(safeMoney: string) {
        User.bankMoney = safeMoney;
        this.refreshData();
    }

    refreshData() {
        this.user.refreshUserInfos();
        this.labCash.string = User.money.toString();
        this.labDeposit.string = User.bankMoney.toString();
    }

    showBank() {
        // cc.log("showBank");
        this.node.active = true;
        this.ebSave.string = "";
        this.tgBtn.toggleItems.forEach((tog: cc.Toggle, togIdx) => {
            if (0 === togIdx) {
                tog.isChecked = true;
            } else {
                tog.isChecked = false;
            }
        });
        this.showUI(UI_NAME.deposit);
        this.nodeBtnExChange.active = !User.shield && !!g.hallVal.withdrawSwitch;
    }

    chooseOpUI(ev: cc.Event.EventTouch, gameData: UI_NAME) {
        this.showUI(+gameData);
    }

    showUI(name: UI_NAME) {
        if (name === undefined)
            return
        this.ebSave.string = "";
        if (name === UI_NAME.deposit) {
            this.isSaveOper = true;
            this.lblAlert.string = "存款金额";
            this.lblOpera.string = "立即存入";
            this.ebSave.placeholder = "请输入存入金额";
        }
        else if (name === UI_NAME.draw) {
            this.isSaveOper = false;
            this.lblAlert.string = "取款金额";
            this.lblOpera.string = "立即取出";
            this.ebSave.placeholder = "请输入取出金额";
        }
        this.setSaveOrDrawMoney(this.ebSave.string);
    }

    //只在值有变化时调用，输入0.的.时不会调用
    onChangedText() {
        let ebStr = this.ebSave.string;
        if (!ebStr) return;
        let ebDcm = new Decimal(ebStr);
        let userMoney = new Decimal(User.money);
        let safeMoney = new Decimal(User.bankMoney);
        if (this.isSaveOper) {
            if (ebDcm.gt(userMoney)) {
                this.setSaveOrDrawMoney(User.money.toString());
                return;
            } else {
                this.regExpTest(ebStr);
            }
        } else {
            if (ebDcm.gt(safeMoney)) {
                this.setSaveOrDrawMoney(User.bankMoney.toString());
                return;
            } else {
                this.regExpTest(ebStr);
            }
        }

        if (this.isSaveOper) {
            if (ebDcm.gt(userMoney)) {
                ebStr = User.money.toString();
            }
        } else {
            if (ebDcm.gt(safeMoney)) {
                ebStr = User.bankMoney.toString();
            }
        }
        if (+ebStr <= 0) {
            ebStr = "";
        }
        this.setSaveOrDrawMoney(ebStr);
    }

    private regExpTest(ebStr) {
        let pattern = /^([1-9]\d{0,9}|0)([.]?|(\.\d{1,2})?)$/;
        if (!pattern.test(ebStr)) {
            this.setSaveOrDrawMoney('');
            showTip("数据格式错误");
            return;
        }
    }

    async onClickOperaBtn() {
        let money = this.ebSave.string.trim();
        if (+money <= 0) {
            if (this.isSaveOper) {
                showTip("请输入要存入的金额");
            } else {
                showTip("输入有误！请输入要取出的金额");
            }
            return;
        }
        setInteractable(this.btnSave, false);
        showLoading("");
        if (this.isSaveOper) {
            net.off("saveMoneyNotify");
            net.on("saveMoneyNotify", (data: ps.SaveMoneyNotify) => {
                hideLoading();
                if (data.code === 200) {
                    User.money = data.money;
                    if (this) {
                        User.bankMoney = data.bankMoney;
                        this.refreshData();
                    }
                    showTip("存款成功！");
                } else {
                    showTip(ErrCodes.getErrStr(data.code, "存款失败"));
                }
            });
            let data = await net.request("hall.bankHandler.saveMoney", { money: money });
            setInteractable(this.btnSave, true);
            if (data.code === 200) {
                this.setSaveOrDrawMoney('');
            } else {
                hideLoading();
                showTip(ErrCodes.getErrStr(data.code, "存款失败"));
            }
        } else {
            net.off("getMoneyNotify");
            net.on("getMoneyNotify", (data: ps.GetMoneyNotify) => {
                hideLoading();
                if (data.code === 200) {
                    User.money = data.money;
                    if (this) {
                        User.bankMoney = data.bankMoney;
                        this.refreshData();
                    }
                    showTip("取款成功！");
                } else {
                    showTip(ErrCodes.getErrStr(data.code, "取款失败"));
                }
            });
            let data = await net.request("hall.bankHandler.getMoney", { money: money });
            setInteractable(this.btnSave, true);
            if (data.code === 200) {
                this.setSaveOrDrawMoney('');
            } else {
                hideLoading();
                showTip(ErrCodes.getErrStr(data.code, "取款失败"));
            }
        }
    }

    private setSaveOrDrawMoney(m: string) {
        this.ebSave.string = m;
        let labCash: string;
        let labDeposit: string;
        if (this.isSaveOper) {
            if (+User.money == 0) {
                this.sldSave.progress = 0;
                this.savePro.width = 0;
            } else {
                this.sldSave.progress = +m / +User.money;
            }
            if (m === '') m = '0';
            labCash = new Decimal(User.money).sub(m).toString();
            labDeposit = new Decimal(User.bankMoney).add(m).toString();
        } else {
            if (+User.bankMoney == 0) {
                this.sldSave.progress = 0;
                this.savePro.width = 0;
            } else {
                this.sldSave.progress = +m / +User.bankMoney;
            }
            if (m === '') m = '0';
            labCash = new Decimal(User.money).add(m).toString();
            labDeposit = new Decimal(User.bankMoney).sub(m).toString();
        }
        this.savePro.width = this.sldSave.progress * this.sliderProWidth;
        this.labCash.string = labCash
        this.labDeposit.string = labDeposit
    }

    private onClickClearMoney() {
        this.setSaveOrDrawMoney('');
    }

    private onClickAllMoney() {
        if (this.isSaveOper) {
            this.setSaveOrDrawMoney(User.money.toString());
        } else {
            this.setSaveOrDrawMoney(User.bankMoney.toString());
        }
    }

    private onSliderMoney() {
        let val: number;
        if (this.isSaveOper) {
            val = Math.floor(this.sldSave.progress * (+User.money))
            if (+User.money - val < 1) {
                val = +User.money
            }
        } else {
            val = Math.floor(this.sldSave.progress * (+User.bankMoney))
            if (+User.bankMoney - val < 1) {
                val = +User.bankMoney
            }
        }
        this.setSaveOrDrawMoney(val.toString());
        let proWidth = Math.floor(this.sldSave.progress * this.sliderProWidth);
        this.savePro.width = proWidth;
    }

    private onClickWithdraw() {
        if (!this._lobby) {
            return;
        }
        this.closeAction()
        this._lobby.onClickWithdraw();
    }
}
