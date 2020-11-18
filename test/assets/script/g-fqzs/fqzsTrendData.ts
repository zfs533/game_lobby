import { Animal, getAnimalTypeEare, FQZSGameState } from "./fqzsConf"
import { EventCenter } from "./EventManager"
interface Fqzs_GameInfo_AnimalStatis {
    animal: number;
    count: number;
}


interface Fqzs_GameInfo_CategoryStatis {
    area: number;
    count: number;
}
interface Fqzs_GameInfo_WinInfo {
    animal: number;
    startIcon?: number;
    stopIcon?: number;
}

export enum AnimalType {
    Bird = 10,
    Boeast = 11
}


export class AnimalTypeData {
    juIndex: number;

    dataArr: Array<number> = []
    constructor() {
        this.juIndex = -1;
        //根据动物的id来初始化
        for (let i = Animal.Chicken; i <= Animal.Gold; i++) {
            this.dataArr.push(-1);
        }
        for (let j = AnimalType.Bird; j <= AnimalType.Boeast; j++) {
            this.dataArr.push(-1);
        }
    }
}
export const NOTICE_ALL_UPDATE: string = "update_allItem"
export const NOTICE_NOLASTITEM_UPDATE: string = "update_without_last"
export const MAXCOUNT = 200
export class FQZSTrendData {
    private static _instance: FQZSTrendData = null;
    private constructor() {

    }
    public static release() {
        if (!FQZSTrendData._instance) {
            FQZSTrendData._instance = null;
            console.log("释放了单利模式");
        }
    }
    public static get Instance() {
        if (!FQZSTrendData._instance) {
            FQZSTrendData._instance = new FQZSTrendData();
        }
        return FQZSTrendData._instance;
    }
    private _gameState: FQZSGameState = FQZSGameState.STATUS_WAIT;//当前游戏的状态
    public set gameState(state: FQZSGameState) {
        this._gameState = state;
    }
    public get gameState() {
        return this._gameState;
    }


    private animalStatis: Fqzs_GameInfo_AnimalStatis[] = [];
    private records: Fqzs_GameInfo_WinInfo[] = [];
    private categoryStatis: Fqzs_GameInfo_CategoryStatis[] = [];
    private animalWinData: AnimalTypeData[] = []

    private isShowLast: boolean = true;//是否显示结果的最后原生

    setRecords(records: Fqzs_GameInfo_WinInfo[], animalStatis: Fqzs_GameInfo_AnimalStatis[], categoryStatis: Fqzs_GameInfo_CategoryStatis[]) {
        this.records = records ? records : [];
        this.animalStatis = animalStatis ? animalStatis : [];
        this.categoryStatis = categoryStatis ? categoryStatis : [];
        this.animalWinData = [];
        this.initAnimalTypeData();
    }

    getRecords() {
        return this.records;
    }

    addRecord(record: Fqzs_GameInfo_WinInfo) {
        if (this.records.length == 200) {
            this.records.shift();
        }
        if (this.animalWinData.length <= 0) {
            this.animalWinData.push(this.getFirstItemData_Animal(null, null, record));
            //console.log("first data input");
        } else {
            let item = this.getItemDataByLast_Animal(this.getLastTypeData(), record);
            if (this.animalWinData.length >= MAXCOUNT) {
                this.animalWinData = this.animalWinData.slice(this.animalWinData.length - MAXCOUNT, this.animalWinData.length);
                //console.log("slice length==", this.animalWinData.length)
            }
            this.animalWinData.push(item);
            //console.log("now length==", this.animalWinData.length)
        }
        this.records.push(record)
        this.isShowLast = false;
    }


    /**
     * 通知监听者更新显示
     */
    noticeUpdate() {
        if (this.animalWinData.length <= 0) return;
        this.isShowLast = true;
        //let item: AnimalTypeData = this.animalWinData[this.animalWinData.length - 1]
        EventCenter.instance.fire(NOTICE_ALL_UPDATE, this.animalWinData);
    }
    /**
        * 通知监听者更新显示上局的数据
        */
    noticeUpdateLastJu() {
        if (this.animalWinData.length <= 0) return;
        this.isShowLast = false
        //let item: AnimalTypeData = this.animalWinData[this.animalWinData.length - 1]
        EventCenter.instance.fire(NOTICE_NOLASTITEM_UPDATE, this.animalWinData);
    }

    getAnimalTypeData(): AnimalTypeData[] {
        if (this._gameState != FQZSGameState.STATUS_RESULT || this.isShowLast) {
            console.log("最后200局")
            return this.animalWinData.length >= MAXCOUNT ? this.animalWinData.slice(this.animalWinData.length - MAXCOUNT) : this.animalWinData;
        } else {
            console.log("去掉最后局")
            if (this.animalWinData.length <= 0) return []
            return this.animalWinData.slice(0, this.animalWinData.length - 1)
        }
    }

    getTrendData() {
        if (this._gameState != FQZSGameState.STATUS_RESULT || this.isShowLast) {
            console.log("最后200局2")
            return this.records;
        } else {
            console.log("去掉最后局2")
            if (this.records.length <= 0) return []
            return this.records.slice(0, this.records.length - 1)
        }
    }

    getLastTypeData() {
        if (this.animalWinData.length <= 0) return null
        return this.animalWinData[this.animalWinData.length - 1]
    }
    initAnimalTypeData() {
        for (let i = 0; i < this.records.length; i++) {
            if (i === 0) {
                this.animalWinData.push(this.getFirstItemData_Animal(this.animalStatis, this.categoryStatis, null));
                continue;//第一个元素的数据在 Fqzs_GameInfo_AnimalStatis中
            }
            this.animalWinData.push(this.getItemDataByLast_Animal(this.animalWinData[this.animalWinData.length - 1], this.records[i]));
        }
    }

    getFirstItemData_Animal(data: Fqzs_GameInfo_AnimalStatis[], edata: Fqzs_GameInfo_CategoryStatis[], recordItem: Fqzs_GameInfo_WinInfo): AnimalTypeData {
        let item = new AnimalTypeData();
        //动物类别
        if (!data || data.length <= 0) {
            //把第一把的数据结算作为第一个数据
            if (this.records.length > 0) {
                let recordONE = this.records[0];
                item.dataArr[recordONE.animal] = 0;
            } else {
                if (!recordItem) return
                item.dataArr[recordItem.animal] = 0;
            }
        } else {
            for (let inx = 0; inx < data.length; inx++) {
                let animalIdx = data[inx].animal;
                if (animalIdx < item.dataArr.length) {
                    item.dataArr[animalIdx] = data[inx].count;
                }
            }
        }
        //类别
        if (!edata || edata.length <= 0) {
            //把第一把的数据结算作为第一个数据
            if (this.records.length > 0) {
                let record = this.records[0]
                let typearea = getAnimalTypeEare(record.animal)
                if (typearea <= 1)
                    item.dataArr[typearea === 0 ? AnimalType.Bird : AnimalType.Boeast] = 0;
            } else {
                if (!recordItem) return
                let typearea = getAnimalTypeEare(recordItem.animal)
                if (typearea <= 1)
                    item.dataArr[typearea === 0 ? AnimalType.Bird : AnimalType.Boeast] = 0;
            }
        } else {
            //飞禽走兽的处理飞禽为8，走兽为0
            for (let inx = 0; inx < edata.length; inx++) {
                let animalArea = edata[inx].area;
                if (animalArea === 8) {
                    item.dataArr[AnimalType.Bird] = edata[inx].count;
                } else if (animalArea === 0) {
                    item.dataArr[AnimalType.Boeast] = edata[inx].count;
                }
            }
        }
        return item;
    }
    getItemDataByLast_Animal(last: AnimalTypeData, judate: Fqzs_GameInfo_WinInfo): AnimalTypeData {
        let item = new AnimalTypeData();
        for (let i = Animal.Chicken; i <= AnimalType.Boeast; i++) {
            item.dataArr[i] = (last.dataArr[i] < 0 ? 1 : last.dataArr[i]) + 1;
        }
        //动物类别
        item.dataArr[judate.animal] = 0;
        //类型类别
        let typearea = getAnimalTypeEare(judate.animal)
        if (typearea <= 1) {
            item.dataArr[typearea === 0 ? AnimalType.Bird : AnimalType.Boeast] = 0;
        }
        return item;
    }

}
