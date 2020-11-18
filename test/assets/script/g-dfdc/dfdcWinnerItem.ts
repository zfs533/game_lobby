const { ccclass, property } = cc._decorator;

@ccclass
export default class DFDCWinnerItem extends cc.Component {

    public itemID: number = 0;

    updateItem(itemID: number) {
        this.itemID = itemID;
    }
}
