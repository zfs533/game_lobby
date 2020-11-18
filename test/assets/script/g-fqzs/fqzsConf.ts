

export enum FQZSGameState {
    STATUS_WAIT,//休息时间
    STATUS_START,//开始游戏
    STATUS_BET,//开始下注
    STATUS_RESULT//游戏结算
}

export enum Animal {
    Chicken = 0, //鸡
    Ostrich, //鸵鸟
    Owl, //猫头鹰
    Eagle, //老鹰
    Rabbit, //兔子
    Monkey, //猴子
    Panda, //熊猫
    Lion, //狮子
    Silver, //银鲨
    Gold //金鲨
}


export class AnimalTrendData {
    juIndex: number;

    dataArr: Array<number> = []
    constructor() {
        this.juIndex = -1;
        //根据动物的id来初始化
        for (let i = Animal.Chicken; i <= Animal.Gold; i++) {
            this.dataArr.push(-1);
        }
    }
}
export enum TypeTrend {
    Bird = 0,
    Boeast,
    Silver,
    Gold,
}
export class TypeTrendData {
    juIndex: number;

    dataArr: Array<number> = []
    constructor() {
        this.juIndex = -1;
        //根据动物的id来初始化
        for (let i = TypeTrend.Bird; i <= TypeTrend.Gold; i++) {
            this.dataArr.push(-1);
        }
    }
}

export function GetAnimalArea(animal: Animal): Array<FQZSArea> {
    //console.log("动物===》", animal);
    if (animal === Animal.Silver || animal === Animal.Gold) {
        return [FQZSArea.Shark];
    }
    if (animal >= Animal.Chicken && animal <= Animal.Eagle) {
        let num: number = <number>animal
        return [FQZSArea.Bird, num];
    } else if (animal >= Animal.Rabbit && animal <= Animal.Lion) {
        let num: number = <number>animal
        return [FQZSArea.Beast, num];
    }
    return [];
}
export enum FQZSArea {
    Chicken = 0, //鸡
    Ostrich, //鸵鸟
    Owl, //猫头鹰
    Eagle, //老鹰
    Rabbit, //兔子
    Monkey, //猴子
    Panda, //熊猫
    Lion, //狮子
    Bird, //飞禽
    Beast,  //走兽
    Shark //鲨鱼
}
/**
 *
 * @param animalID 动物类型
 * @returns  -1 无类型，0 飞禽  1走兽， 2鲨鱼
 */
export function getAnimalType(animalID: Animal) {
    if (animalID === undefined || animalID === null) return "未知";
    if (animalID <= Animal.Eagle) {
        return "飞";
    } else if (animalID <= Animal.Lion) {
        return "兽";
    } else if (animalID <= Animal.Gold) {
        return "鲨";
    }
    return "未知";
}
/**
 *
 * @param animalID 动物类型
 * @returns  -1 无类型，0 飞禽  1走兽， 2鲨鱼
 */
export function getAnimalTypeNumber(animalID: Animal): number {
    if (animalID === undefined || animalID === null) return -1;
    if (animalID <= Animal.Eagle) {
        return 0;
    } else if (animalID <= Animal.Lion) {
        return 1;
    } else if (animalID <= Animal.Gold) {
        return 2;
    }
    return -1;
}
/**
 *
 * @param animalID 动物类型
 * @returns  -1 无类型，0 飞禽  1走兽， 2 银鲨 ，3金鲨
 */
export function getAnimalTypeEare(animalID: Animal): number {
    if (animalID === undefined || animalID === null) return -1;
    if (animalID <= Animal.Eagle) {
        return 0;
    } else if (animalID <= Animal.Lion) {
        return 1;
    } else if (animalID <= Animal.Silver) {
        return 2;
    } else if (animalID <= Animal.Gold) {
        return 3;
    }
    return -1;
}
export enum AnimalType {
    Bird = 0,
    Boeast,
    Shark
}

export function GetMutiples(animal: Animal, area: FQZSArea): number {
    switch (area) {
        case FQZSArea.Chicken:
            if (animal === Animal.Chicken) return 6
            break
        case FQZSArea.Ostrich:
            if (animal === Animal.Ostrich) return 8
            break
        case FQZSArea.Owl:
            if (animal === Animal.Owl) return 8
            break
        case FQZSArea.Eagle:
            if (animal === Animal.Eagle) return 12
            break
        case FQZSArea.Rabbit:
            if (animal === Animal.Rabbit) return 6
            break
        case FQZSArea.Monkey:
            if (animal === Animal.Monkey) return 8
            break
        case FQZSArea.Panda:
            if (animal === Animal.Panda) return 8
            break
        case FQZSArea.Lion:
            if (animal === Animal.Lion) return 12
            break
        case FQZSArea.Bird:
            if (animal === Animal.Chicken || animal === Animal.Ostrich || animal === Animal.Owl || animal === Animal.Eagle) return 2
            break
        case FQZSArea.Beast:
            if (animal === Animal.Rabbit || animal === Animal.Monkey || animal === Animal.Panda || animal === Animal.Lion) return 2
            break
        case FQZSArea.Shark:
            if (animal === Animal.Silver) return 25
            if (animal === Animal.Gold) return 51
            break
    }
    return 0
}

/**
 * 动物看的方向  0正面看，1 上面看 ， 2 右面看 ，3 下面看  ，4 左面看
 */
export enum LookDirection {
    Default = 0,
    UP,
    RIGHT,
    DOWN,
    LEFT,
}

/**
 *获取当前位置的观看方向
 * @param targetIndex 目标位置
 * @param myIndex  我的位置
 * @param checkCount  需要处理的位置差距，默认处理2个位置差距，超出的返回正面
 */
export function getAnimalLookAt(targetIndex: number, myIndex: number, checkCount: number = 2): LookDirection {
    //获取我的位置和目标位置的相对方向
    let dirtype = getBeforeAfter(targetIndex, myIndex, checkCount)
    let dirction = LookDirection.Default;
    if (dirtype === 1) {
        dirction = getMyInxDir(myIndex, 1)
    } else if (dirtype === 2) {
        dirction = getMyInxDir(myIndex, 2)
    }
    return dirction;
}
function getMyInxDir(myInx: number, dir: number): LookDirection {
    //根据方向来确定朝向的目标点
    let nextInx = dir === 1 ? (myInx + 1) % rangeSize : ((myInx - 1 < 0 ? rangeSize - 1 : myInx - 1) % rangeSize)
    //根据方向和目标点最终确定朝向
    let dirction = LookDirection.Default;
    if (dir === 1) {//顺时针
        if (nextInx <= 4) {
            dirction = LookDirection.RIGHT;
        } else if (nextInx <= 9) {
            dirction = LookDirection.DOWN;
        } else if (nextInx <= 17) {
            dirction = LookDirection.LEFT;
        } else if (nextInx <= 22) {
            dirction = LookDirection.UP;
        } else if (nextInx <= 25) {
            dirction = LookDirection.RIGHT;
        }
    } else if (dir === 2) {//逆时针
        if (nextInx <= 3) {
            dirction = LookDirection.LEFT;
        } else if (nextInx <= 8) {
            dirction = LookDirection.UP;
        } else if (nextInx <= 16) {
            dirction = LookDirection.RIGHT;
        } else if (nextInx <= 21) {
            dirction = LookDirection.DOWN;
        } else if (nextInx <= 25) {
            dirction = LookDirection.LEFT;
        }
    }
    return dirction;
}
function getBeforeAfter(targetIndex: number, myIndex: number, checkCount: number = 2) {
    //向前走相邻几个位置
    let beforecount = 0
    if (targetIndex < myIndex) {
        beforecount = targetIndex + rangeSize - myIndex;
    } else {
        beforecount = targetIndex - myIndex;
    }
    //向后走相邻几个位置
    let aftercount = 0
    if (myIndex < targetIndex) {
        aftercount = myIndex + rangeSize - targetIndex;
    } else {
        aftercount = myIndex - targetIndex;
    }
    if (beforecount > 0 && beforecount <= checkCount) {
        return 1;
    }
    if (aftercount > 0 && aftercount <= checkCount) {
        return 2;
    }
    return 0
}


export const rangeSize = 26;

export const RoundId: { [key: number]: { area: FQZSArea, type: Animal, name: string, multiple: number } } = {
    0: { area: FQZSArea.Shark, type: Animal.Gold, name: "金鲨", multiple: 51 },
    1: { area: FQZSArea.Rabbit, type: Animal.Rabbit, name: "兔子", multiple: 6 },
    2: { area: FQZSArea.Monkey, type: Animal.Monkey, name: "猴子", multiple: 8 },
    3: { area: FQZSArea.Panda, type: Animal.Panda, name: "熊猫", multiple: 8 },
    4: { area: FQZSArea.Lion, type: Animal.Lion, name: "狮子", multiple: 12 },
    5: { area: FQZSArea.Eagle, type: Animal.Eagle, name: "老鹰", multiple: 12 },
    6: { area: FQZSArea.Owl, type: Animal.Owl, name: "猫头鹰", multiple: 8 },
    7: { area: FQZSArea.Ostrich, type: Animal.Ostrich, name: "鸵鸟", multiple: 8 },
    8: { area: FQZSArea.Chicken, type: Animal.Chicken, name: "鸡", multiple: 6 },
    9: { area: FQZSArea.Lion, type: Animal.Lion, name: "狮子", multiple: 12 },
    10: { area: FQZSArea.Panda, type: Animal.Panda, name: "熊猫", multiple: 8 },
    11: { area: FQZSArea.Monkey, type: Animal.Monkey, name: "猴子", multiple: 8 },
    12: { area: FQZSArea.Rabbit, type: Animal.Rabbit, name: "兔子", multiple: 6 },
    13: { area: FQZSArea.Shark, type: Animal.Silver, name: "银鲨", multiple: 25 },
    14: { area: FQZSArea.Chicken, type: Animal.Chicken, name: "鸡", multiple: 6 },
    15: { area: FQZSArea.Ostrich, type: Animal.Ostrich, name: "鸵鸟", multiple: 8 },
    16: { area: FQZSArea.Owl, type: Animal.Owl, name: "猫头鹰", multiple: 8 },
    17: { area: FQZSArea.Eagle, type: Animal.Eagle, name: "老鹰", multiple: 12 },
    18: { area: FQZSArea.Lion, type: Animal.Lion, name: "狮子", multiple: 12 },
    19: { area: FQZSArea.Panda, type: Animal.Panda, name: "熊猫", multiple: 8 },
    20: { area: FQZSArea.Monkey, type: Animal.Monkey, name: "猴子", multiple: 8 },
    21: { area: FQZSArea.Rabbit, type: Animal.Rabbit, name: "兔子", multiple: 6 },
    22: { area: FQZSArea.Eagle, type: Animal.Eagle, name: "老鹰", multiple: 12 },
    23: { area: FQZSArea.Owl, type: Animal.Owl, name: "猫头鹰", multiple: 8 },
    24: { area: FQZSArea.Ostrich, type: Animal.Ostrich, name: "鸵鸟", multiple: 8 },
    25: { area: FQZSArea.Chicken, type: Animal.Chicken, name: "鸡", multiple: 6 }

}