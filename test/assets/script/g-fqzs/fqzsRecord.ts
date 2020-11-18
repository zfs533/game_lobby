
import { getAnimalType, getAnimalTypeNumber, RoundId } from "./fqzsConf"
import { FQZSTrendData } from "./fqzsTrendData"
const MAX_RECORD_CNT = 20;

const { ccclass, property } = cc._decorator;
@ccclass
export default class FQZSRecord extends cc.Component {


    @property(cc.Node)
    private resultItem: cc.Node = undefined;

    @property(cc.Node)
    private content: cc.Node = undefined;
    @property([cc.SpriteFrame])
    private typeIcons: cc.SpriteFrame[] = []
    @property([cc.SpriteFrame])
    private animalIcons: cc.SpriteFrame[] = []

    private records: ps.Fqzs_GameInfo_WinInfo[] = [];
    setRecord(records: ps.Fqzs_GameInfo_WinInfo[]) {
        this.records = records;
    }


    initAllItems() {
        for (let i = 0; i < this.content.childrenCount; i++) {
            this.content.children[i].active = false;
        }
    }

    updateRecord() {
        this.initAllItems();
        this.records = FQZSTrendData.Instance.getRecords();
        let recordsLength = this.records.length;

        let lastRecords = (recordsLength > MAX_RECORD_CNT) ? this.records.slice(recordsLength - MAX_RECORD_CNT, recordsLength) : this.records.concat();
        lastRecords.reverse();


        for (let idx = 0; idx < lastRecords.length; idx++) {
            let record = lastRecords[idx];
            let item = this.content.children[idx];
            if (!item) {
                item = cc.instantiate(this.resultItem);
                this.content.addChild(item);
                item.position = cc.v2();
            }
            let typeN = getAnimalTypeNumber(record.animal)
            item.getChildByName("type").getComponent(cc.Sprite).spriteFrame = this.typeIcons[typeN];
            //item.getChildByName("type").getChildByName("name").getComponent(cc.Label).string = typestr;
            let name = RoundId[record.stopIcon].name;
            let animalIndex = RoundId[record.stopIcon].type
            item.getChildByName("animal").getComponent(cc.Sprite).spriteFrame = this.animalIcons[animalIndex]
            //item.getChildByName("animal").getChildByName("name").getComponent(cc.Label).string = name + "";
            item.active = true;
            // if (idx === 0) {
            //     item.getChildByName("new").active = true
            // } else {
            //     item.getChildByName("new").active = false
            // }
        }
    }
}