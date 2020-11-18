import * as def from "./def"
const CARD_COUNT = 64

export default class GameLogic {
    tileArr: number[]

    private tmpData: def.TileCounter
    private huTileStruct: def.PingHuStruct
    private userAction: def.UserAction[]
    private huType: number[]

    constructor() {
        this.tileArr = []
        this.userAction = []
        this.tmpData = new def.TileCounter()
        this.huTileStruct = new def.PingHuStruct()
    }

    addAction(action: def.UserAction) {
        this.userAction.push(action)
    }

    initUserAction() {
        this.userAction = []
    }

    getTileCnt() {
        return this.tileArr.length
    }

    //洗牌
    RandTile() {
        let index = 0
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < def.mjAllTypeCard.length; j++) {
                this.tileArr[index++] = def.mjAllTypeCard[j]
            }
        }

        for (let i = 0; i < 200; i++) {
            let pos = Math.round(Math.random() * (CARD_COUNT - 1))
            let num = i % CARD_COUNT
            let temp = this.tileArr[num]
            this.tileArr[num] = this.tileArr[pos]
            this.tileArr[pos] = temp
        }
    }

    GetATile() {
        if (this.tileArr.length > 0) {
            return this.tileArr.pop()
        } else {
            return 0
        }
    }

    getTileType(tile: number) {
        return Math.floor(tile / 10)
    }

    GetTilePt(tile: number) {
        return tile % 10
    }

    GetTilePts(tiles: number[]) {
        let tmp: number[] = []
        for (let tile of tiles) {
            tmp.push(this.GetTilePt(tile))
        }
        return tmp
    }

    counterTile(handTile: number[], lastTile?: number) {
        let counter = new def.TileCounter()
        let tmpHandTile: number[] = []
        if (lastTile) {
            tmpHandTile = handTile.concat(lastTile)
        } else {
            tmpHandTile = handTile.concat()
        }

        tmpHandTile.sort((a, b) => {
            return a - b
        })
        for (let hTile of tmpHandTile) {
            counter.Add(hTile)
        }
        return counter
    }

    canChi(handTile: number[], tile: number) {
        let counter = this.counterTile(handTile)
        let type = this.getTileType(tile)
        if (type !== def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) return false
        let tileCnt_m2 = counter.GetPaiCount(tile - 2)
        let tileCnt_m1 = counter.GetPaiCount(tile - 1)
        let tileCnt_p2 = counter.GetPaiCount(tile + 2)
        let tileCnt_p1 = counter.GetPaiCount(tile + 1)
        if (tileCnt_m2 > 0 && tileCnt_m1 > 0) return true
        if (tileCnt_m1 > 0 && tileCnt_p1 > 0) return true
        if (tileCnt_p1 > 0 && tileCnt_p2 > 0) return true
        return false
    }

    canPeng(handTile: number[], tile: number) {
        let counter = this.counterTile(handTile)
        if (counter.GetPaiCount(tile) >= 2) return true
        return false
    }

    canGang(handTile: number[], lastTile: number, gangTile: number, me: boolean, pgVec: def.ChiPengGangInfo[], Result: number[]) {
        let counter = this.counterTile(handTile, lastTile)
        let bGang = false
        if (me) {
            let hasOne = false
            for (let i = 0; i < counter.data.length; i++) {
                if (counter.data[i][0] === gangTile && counter.data[i][1] === 4) {
                    Result[0] = counter.data[i][0]
                    Result[1] = def.PingHuType.TYPE_DARK
                    bGang = true
                }
                if (counter.data[i][0] === gangTile && counter.data[i][1] === 1) {
                    hasOne = true
                }
            }
            for (let it of pgVec) {
                if (it.pingHuType === def.PingHuType.TYPE_PENG && it.tile === gangTile && hasOne) {
                    Result[0] = lastTile
                    Result[1] = def.PingHuType.TYPE_ADD
                    bGang = true
                }
            }
            if (!bGang) {
                for (let i = 0; i < counter.data.length; i++) {
                    if (counter.data[i][1] === 4) {
                        Result[0] = counter.data[i][0]
                        Result[1] = def.PingHuType.TYPE_DARK
                        bGang = true
                    } else if (counter.data[i][1] === 1) {
                        for (let it of pgVec) {
                            if (it.pingHuType === def.PingHuType.TYPE_PENG && it.tile === counter.data[i][0]) {
                                Result[0] = lastTile
                                Result[1] = def.PingHuType.TYPE_ADD
                                bGang = true
                            }
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < counter.data.length; i++) {
                if (counter.data[i][0] === lastTile && counter.data[i][1] === 4) {
                    bGang = true
                    Result[0] = counter.data[i][0]
                    Result[1] = def.PingHuType.TYPE_SHINE
                    break
                }
            }
        }

        return bGang
    }

    canOutTile(handTile: number[], outTile: number, upTile: number) {
        let counter = this.counterTile(handTile)
        if (outTile !== upTile && counter.GetPaiCount(outTile) === 0) return false
        return true
    }

    chgHandTileData(handTile: number[], huTempData: def.TileCounter) {
        for (let i = 0; i < handTile.length; i++) {
            if (handTile[i] != 0) {
                huTempData.Add(handTile[i])
            }
        }
    }

    getGangCnt(pgVec: def.ChiPengGangInfo[]) {
        let mingCnt = 0
        let anCnt = 0
        for (let pg of pgVec) {
            if (pg.pingHuType === def.PingHuType.TYPE_ADD ||
                pg.pingHuType === def.PingHuType.TYPE_SHINE) {
                mingCnt++
            } else if (pg.pingHuType === def.PingHuType.TYPE_DARK) {
                anCnt++
            }
        }
        return [mingCnt, anCnt]
    }

    checkYiSe(huTempData: def.TileCounter, pgVec: def.ChiPengGangInfo[]) {
        let firstTileType = this.getTileType(huTempData.data[0][0])
        for (let i = 1; i < huTempData.data.length; i++) {
            let type = this.getTileType(huTempData.data[i][0])
            if (def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN === firstTileType) {
                if (type !== firstTileType) return def.YI_SE.YI_SE_HUN
            } else if (def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN === firstTileType ||
                def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG === firstTileType) {
                if (type === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) return def.YI_SE.YI_SE_HUN
            } else {
                return 0
            }
        }

        for (let pgInfo of pgVec) {
            let type = this.getTileType(pgInfo.tile)
            if (def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN === firstTileType) {
                if (type !== firstTileType) return def.YI_SE.YI_SE_HUN
            } else if (def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN === firstTileType ||
                def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG === firstTileType) {
                if (type === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) return def.YI_SE.YI_SE_HUN
            } else {
                return 0
            }
        }
        let resType: number = 0
        if (firstTileType === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
            resType = def.YI_SE.YI_SE_QING
        } else if (firstTileType === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN || firstTileType === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) {
            resType = def.YI_SE.YI_SE_ZI
        }
        return resType
    }

    setAHuTileType(type: number, huTile: number[]) {
        if (this.checkHuTileType(type, huTile)) {
            return
        }
        huTile.push(type)
    }
    checkHuTileType(type: number, huTile: number[]) {
        for (let i = 0; i < huTile.length; i++) {
            if (huTile[i] === type) {
                return true
            }
        }
        return false
    }

    sortArrRemoveSame(arr: number[]) {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr.splice(i, 1)
                i--
            }
        }
    }

    checkJiuLianBaoDeng(huTempData: def.TileCounter, pgVec: def.ChiPengGangInfo[]) {
        if (pgVec.length > 0) return false
        let data = huTempData.data
        if (data[0][0] !== def.MJ_TYPE.MJ_TYPE_W1 ||
            data[data.length - 1][0] !== def.MJ_TYPE.MJ_TYPE_W9 ||
            data[0][1] < 3 ||
            data[data.length - 1][1] < 3)
            return false
        for (let i = 0; i < data.length - 1; i++) {
            if (data[i][0] + 1 !== data[i + 1][0]) return false
        }
        return true
    }

    checkYiSeShuangLongHui(handTile: number[], pgVec: def.ChiPengGangInfo[]) {
        let tmpTile = handTile.concat()
        for (let pg of pgVec) {
            if (pg.pingHuType !== def.PingHuType.TYPE_CHI) return false
            tmpTile.push(pg.tile)
            tmpTile.push(pg.tile + 1)
            tmpTile.push(pg.tile + 2)
        }

        tmpTile.sort((a, b) => {
            return a - b
        })
        let tmpCounter = new def.TileCounter()
        for (let tile of tmpTile) {
            if (this.getTileType(tile) !== def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) return false
            tmpCounter.Add(tile)
        }

        let data = tmpCounter.data
        let len = data.length
        if (data[0][0] === def.MJ_TYPE.MJ_TYPE_W1 &&
            data[1][0] === def.MJ_TYPE.MJ_TYPE_W2 &&
            data[2][0] === def.MJ_TYPE.MJ_TYPE_W3 &&
            data[3][0] === def.MJ_TYPE.MJ_TYPE_W5 &&
            data[len - 1][0] === def.MJ_TYPE.MJ_TYPE_W9 &&
            data[len - 2][0] === def.MJ_TYPE.MJ_TYPE_W8 &&
            data[len - 3][0] === def.MJ_TYPE.MJ_TYPE_W7 &&
            data[0][1] === 2 &&
            data[1][1] === 2 &&
            data[2][1] === 2 &&
            data[3][1] === 2 &&
            data[len - 1][1] === 2 &&
            data[len - 2][1] === 2 &&
            data[len - 3][1] === 2) {
            return true
        }
        return false
    }

    checkDaYuWu(huTempData: def.TileCounter, pgVec: def.ChiPengGangInfo[]) {
        for (let pai of huTempData.data) {
            if (pai[0] < def.MJ_TYPE.MJ_TYPE_W6) return false
        }
        let pgPoint: number
        for (let pg of pgVec) {
            if (pg.tile <= def.MJ_TYPE.MJ_TYPE_W5) return false
        }
        return true
    }

    checkXiaoYuWu(huTempData: def.TileCounter, pgVec: def.ChiPengGangInfo[]) {
        for (let pai of huTempData.data) {
            if (pai[0] > def.MJ_TYPE.MJ_TYPE_W4) return false
        }

        let pgPoint: number
        for (let pg of pgVec) {
            if (pg.pingHuType === def.PingHuType.TYPE_CHI) {
                if (pg.tile + 2 >= def.MJ_TYPE.MJ_TYPE_W5) return false
            } else {
                if (pg.tile >= def.MJ_TYPE.MJ_TYPE_W5) return false
            }
        }
        return true
    }

    checkDuanYao(huTempData: def.TileCounter, pgVec: def.ChiPengGangInfo[]) {
        for (let pai of huTempData.data) {
            let type = this.getTileType(pai[0])
            if (pai[0] === def.MJ_TYPE.MJ_TYPE_W1 ||
                pai[0] === def.MJ_TYPE.MJ_TYPE_W9 ||
                type === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN ||
                type === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG)
                return false
        }
        for (let pg of pgVec) {
            let type = this.getTileType(pg.tile)
            if (type === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN ||
                type === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) return false
            if (pg.pingHuType === def.PingHuType.TYPE_CHI) {
                if (pg.tile + 2 === def.MJ_TYPE.MJ_TYPE_W9) return false
                else if (pg.tile === def.MJ_TYPE.MJ_TYPE_W1) return false
            } else {
                if (pg.tile === def.MJ_TYPE.MJ_TYPE_W1 ||
                    pg.tile === def.MJ_TYPE.MJ_TYPE_W9) return false
            }
        }
        return true
    }

    checkBaiWanDan(huTile: number[], pgVec: def.ChiPengGangInfo[]) {
        let allCnt = 0
        let huTilePts = this.GetTilePts(huTile)
        for (let pt of huTilePts) {
            allCnt += pt
        }

        for (let pg of pgVec) {
            if (pg.pingHuType === def.PingHuType.TYPE_CHI) {
                let tmpPgPoint1 = this.GetTilePt(pg.tile)
                let tmpPgPoint2 = this.GetTilePt(pg.tile + 1)
                let tmpPgPoint3 = this.GetTilePt(pg.tile + 2)
                allCnt += tmpPgPoint1 + tmpPgPoint2 + tmpPgPoint3
            } else if (pg.pingHuType === def.PingHuType.TYPE_PENG) {
                let point = this.GetTilePt(pg.tile)
                allCnt += point * 3
            } else if (pg.pingHuType <= 3) {//都是杠的类型
                let point = this.GetTilePt(pg.tile)
                allCnt += point * 4
            }
        }

        if (allCnt < 100) return false
        return true
    }

    checkQiDui(pgVec: def.ChiPengGangInfo[], huTempData: def.TileCounter) {
        if (pgVec.length > 0) {
            return false
        }
        for (let i = 0; i < huTempData.data.length; ++i) {
            if (huTempData.data[i][1] == 0) {
                continue
            }
            if (huTempData.data[i][1] % 2 == 1) {
                return false
            }
        }
        return true
    }

    checkContinue(hupai: number[]) {
        let tmp = hupai.concat()
        this.sortArrRemoveSame(tmp)
        for (let i = 0; i < tmp.length - 1; i++) {
            if (tmp[i] + 1 !== tmp[i + 1]) return false
        }
        return true
    }

    checkLianQiDui(hupai: number[], huTempData: def.TileCounter) {
        for (let i = 0; i < huTempData.data.length; i++) {
            if (huTempData.data[i][1] !== 2) return false
        }
        return this.checkContinue(hupai)
    }

    checkGang(mingCount: number, anCount: number, hutype: number[]) {
        let allCount = mingCount + anCount
        if (allCount === 4) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_SI_GANG, hutype)
        } else if (allCount === 3) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_SAN_GANG, hutype)
        } else if (mingCount === 2) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_SHUANG_MING_GANG, hutype)
        } else if (anCount === 2) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_SHUANG_AN_GANG, hutype)
        } else if (mingCount === 1 && anCount === 1) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_AN_GANG, hutype)
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_MING_GANG, hutype)
        } else if (mingCount === 1) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_MING_GANG, hutype)
        } else if (anCount === 1) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_AN_GANG, hutype)
        } else if (allCount === 0) {
        } else {
            return
        }
    }

    checkSiGui(huTempData: def.TileCounter, pgVec: def.ChiPengGangInfo[]) {
        this.tmpData.Init()
        for (let tile of pgVec) {
            if (tile.pingHuType === def.PingHuType.TYPE_PENG) {
                for (let i = 0; i < 3; i++) {
                    this.tmpData.Add(tile.tile)
                }
            } else if (tile.pingHuType === def.PingHuType.TYPE_CHI) {
                this.tmpData.Add(tile.tile)
                this.tmpData.Add(tile.tile + 1)
                this.tmpData.Add(tile.tile + 2)
            }
        }

        for (let hDa of huTempData.data) {
            if (hDa[1] === 4) return true
            for (let data of this.tmpData.data) {
                if (data[1] === 4) return true
                if (hDa[0] === data[0] &&
                    hDa[1] + data[1] === 4) {
                    return true
                }
            }
        }
        return false
    }

    checkSiAnKe(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byAnKeziData.length + huTileInfo.byAnGang.length === 4) return true
        return false
    }

    checkSanAnKe(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byAnKeziData.length + huTileInfo.byAnGang.length === 3) return true
        return false
    }

    checkShuangAnKe(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byAnKeziData.length + huTileInfo.byAnGang.length === 2) return true
        return false
    }

    checkHunYaoJiu(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byAnKeziData.length + huTileInfo.byMingKeziData.length + huTileInfo.byAnGang.length + huTileInfo.byMingGang.length !== 4) return false
        let jiangType = this.getTileType(huTileInfo.byJiang)
        if (jiangType === def.MJ_TYPE_PAI.MJ_TYPE_PAI_NONE) return false
        if (jiangType === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
            if (huTileInfo.byJiang !== def.MJ_TYPE.MJ_TYPE_W1 &&
                huTileInfo.byJiang !== def.MJ_TYPE.MJ_TYPE_W9) return false
        }
        for (let kezi of huTileInfo.byMingKeziData) {
            let typ = this.getTileType(kezi)
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_NONE) return false
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (kezi !== def.MJ_TYPE.MJ_TYPE_W1 &&
                    kezi !== def.MJ_TYPE.MJ_TYPE_W9) return false
            }
        }
        for (let kezi of huTileInfo.byAnKeziData) {
            let typ = this.getTileType(kezi)
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_NONE) return false
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (kezi !== def.MJ_TYPE.MJ_TYPE_W1 &&
                    kezi !== def.MJ_TYPE.MJ_TYPE_W9) return false
            }
        }
        for (let kezi of huTileInfo.byAnGang) {
            let typ = this.getTileType(kezi)
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_NONE) return false
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (kezi !== def.MJ_TYPE.MJ_TYPE_W1 &&
                    kezi !== def.MJ_TYPE.MJ_TYPE_W9) return false
            }
        }
        for (let kezi of huTileInfo.byMingGang) {
            let typ = this.getTileType(kezi)
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_NONE) return false
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (kezi !== def.MJ_TYPE.MJ_TYPE_W1 &&
                    kezi !== def.MJ_TYPE.MJ_TYPE_W9) return false
            }
        }
        for (let kezi of huTileInfo.byAddGang) {
            let typ = this.getTileType(kezi)
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_NONE) return false
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (kezi !== def.MJ_TYPE.MJ_TYPE_W1 &&
                    kezi !== def.MJ_TYPE.MJ_TYPE_W9) return false
            }
        }
        return true
    }

    checkPengPengHe(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byShunData.length === 0) return true
        return false
    }

    checkQuanDaiYao(huTileInfo: def.HuTileInfo) {
        if (this.getTileType(huTileInfo.byJiang) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
            if (huTileInfo.byJiang !== def.MJ_TYPE.MJ_TYPE_W1 &&
                huTileInfo.byJiang !== def.MJ_TYPE.MJ_TYPE_W9) return false
        }
        for (let tile of huTileInfo.byMingGang) {
            if (this.getTileType(tile) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (tile !== def.MJ_TYPE.MJ_TYPE_W1 &&
                    tile !== def.MJ_TYPE.MJ_TYPE_W9) return false
            }
        }
        for (let tile of huTileInfo.byAnGang) {
            if (this.getTileType(tile) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (tile !== def.MJ_TYPE.MJ_TYPE_W1 &&
                    tile !== def.MJ_TYPE.MJ_TYPE_W9) return false
            }
        }
        for (let tile of huTileInfo.byAddGang) {
            if (this.getTileType(tile) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (tile !== def.MJ_TYPE.MJ_TYPE_W1 &&
                    tile !== def.MJ_TYPE.MJ_TYPE_W9) return false
            }
        }
        for (let tile of huTileInfo.byMingKeziData) {
            if (this.getTileType(tile) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (tile !== def.MJ_TYPE.MJ_TYPE_W1 &&
                    tile !== def.MJ_TYPE.MJ_TYPE_W9) return false
            }
        }
        for (let tile of huTileInfo.byAnKeziData) {
            if (this.getTileType(tile) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (tile !== def.MJ_TYPE.MJ_TYPE_W1 &&
                    tile !== def.MJ_TYPE.MJ_TYPE_W9) return false
            }
        }
        for (let tile of huTileInfo.byShunData) {
            if (this.getTileType(tile) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (tile !== def.MJ_TYPE.MJ_TYPE_W1 &&
                    tile !== def.MJ_TYPE.MJ_TYPE_W7) return false
            }
        }
        return true
    }

    checkYaoJiuKe(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byMingKeziData.length + huTileInfo.byAnKeziData.length + huTileInfo.byAddGang.length + huTileInfo.byAnGang.length + huTileInfo.byMingGang.length === 0) return false
        for (let tile of huTileInfo.byMingKeziData) {
            let typ = this.getTileType(tile)
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (tile === def.MJ_TYPE.MJ_TYPE_W1 ||
                    tile === def.MJ_TYPE.MJ_TYPE_W9) {
                    return true
                }
            } else if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN ||
                typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) {
                return true
            }
        }
        for (let tile of huTileInfo.byAnKeziData) {
            let typ = this.getTileType(tile)
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (tile === def.MJ_TYPE.MJ_TYPE_W1 ||
                    tile === def.MJ_TYPE.MJ_TYPE_W9) {
                    return true
                }
            } else if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN ||
                typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) {
                return true
            }
        }
        for (let tile of huTileInfo.byMingGang) {
            let typ = this.getTileType(tile)
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (tile === def.MJ_TYPE.MJ_TYPE_W1 ||
                    tile === def.MJ_TYPE.MJ_TYPE_W9) {
                    return true
                }
            } else if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN ||
                typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) {
                return true
            }
        }
        for (let tile of huTileInfo.byAnGang) {
            let typ = this.getTileType(tile)
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (tile === def.MJ_TYPE.MJ_TYPE_W1 ||
                    tile === def.MJ_TYPE.MJ_TYPE_W9) {
                    return true
                }
            } else if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN ||
                typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) {
                return true
            }
        }
        for (let tile of huTileInfo.byAddGang) {
            let typ = this.getTileType(tile)
            if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) {
                if (tile === def.MJ_TYPE.MJ_TYPE_W1 ||
                    tile === def.MJ_TYPE.MJ_TYPE_W9) {
                    return true
                }
            } else if (typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN ||
                typ === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) {
                return true
            }
        }
        return false
    }

    checkYiSeSiTongShun(huTileInfo: def.HuTileInfo) {
        let shunData = huTileInfo.byShunData
        if (shunData.length !== 4) return false
        if (shunData[0] !== shunData[1] ||
            shunData[1] !== shunData[2] ||
            shunData[2] !== shunData[3]) {
            return false
        }
        return true
    }

    checkYiSeSiJieGao(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byMingKeziData.length + huTileInfo.byAnKeziData.length + huTileInfo.byMingGang.length + huTileInfo.byAnGang.length + huTileInfo.byAddGang.length !== 4) return false
        let allKeZi: number[] = []
        for (let pai of huTileInfo.byMingKeziData) {
            allKeZi.push(pai)
        }
        for (let pai of huTileInfo.byAnKeziData) {
            allKeZi.push(pai)
        }
        for (let pai of huTileInfo.byMingGang) {
            allKeZi.push(pai)
        }
        for (let pai of huTileInfo.byAnGang) {
            allKeZi.push(pai)
        }
        for (let pai of huTileInfo.byAddGang) {
            allKeZi.push(pai)
        }
        allKeZi.sort((a, b) => {
            return a - b
        })
        if (allKeZi[0] + 1 !== allKeZi[1] ||
            allKeZi[1] + 1 !== allKeZi[2] ||
            allKeZi[2] + 1 !== allKeZi[3]) {
            return false
        }
        return true
    }

    checkYiSeSiBuGao(huTileInfo: def.HuTileInfo) {
        let szData = huTileInfo.byShunData
        if (szData.length !== 4) return false
        szData.sort((a, b) => {
            return a - b
        })

        if (szData[0] + 1 === szData[1] &&
            szData[1] + 1 === szData[2] &&
            szData[2] + 1 === szData[3]) {
            return true
        }

        if (szData[0] + 2 === szData[1] &&
            szData[1] + 2 === szData[2] &&
            szData[2] + 2 === szData[3]) {
            return true
        }
    }

    checkYiSeSanTongShun(huTileInfo: def.HuTileInfo) {
        let shunData = huTileInfo.byShunData
        if (shunData.length < 3) return false
        let szObj: { [sz: number]: number } = {}
        for (let sz of shunData) {
            if (szObj[sz]) {
                szObj[sz]++
                if (szObj[sz] === 3) return true
            } else {
                szObj[sz] = 1
            }
        }

        return false
    }

    checkYiSeSanJieGao(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byAnKeziData.length + huTileInfo.byMingKeziData.length + huTileInfo.byMingGang.length + huTileInfo.byAnGang.length + huTileInfo.byAddGang.length < 3) return false
        let allKeZi: number[] = []
        for (let pai of huTileInfo.byMingKeziData) {
            allKeZi.push(pai)
        }
        for (let pai of huTileInfo.byAnKeziData) {
            allKeZi.push(pai)
        }
        for (let pai of huTileInfo.byMingGang) {
            allKeZi.push(pai)
        }
        for (let pai of huTileInfo.byAnGang) {
            allKeZi.push(pai)
        }
        for (let pai of huTileInfo.byAddGang) {
            allKeZi.push(pai)
        }
        allKeZi.sort((a, b) => {
            return a - b
        })
        if (allKeZi.length === 3) {
            if (allKeZi[0] + 1 === allKeZi[1] &&
                allKeZi[1] + 1 === allKeZi[2]) {
                return true
            }
        } else if (allKeZi.length === 4) {
            this.sortArrRemoveSame(allKeZi)
            let len = allKeZi.length
            if (len < 3) return false
            if (allKeZi[0] + 1 === allKeZi[1] &&
                allKeZi[1] + 1 === allKeZi[2]) {
                return true
            }
            if (allKeZi[len - 3] + 1 === allKeZi[len - 2] &&
                allKeZi[len - 2] + 1 === allKeZi[len - 1]) {
                return true
            }
        }

        return false
    }

    checkYiSeSanBuGao(huTileInfo: def.HuTileInfo) {
        let szData = huTileInfo.byShunData.concat()
        if (szData.length < 3) return false
        szData.sort((a, b) => {
            return a - b
        })

        if (szData.length === 3) {
            if (szData[0] + 1 === szData[1] &&
                szData[1] + 1 === szData[2]) {
                return true
            }
            if (szData[0] + 2 === szData[1] &&
                szData[1] + 2 === szData[2]) {
                return true
            }
        } else if (szData.length === 4) {
            this.sortArrRemoveSame(szData)
            let len = szData.length
            if (len < 3) return false
            if (szData[0] + 1 === szData[1] &&
                szData[1] + 1 === szData[2]) {
                return true
            }
            if (szData[len - 3] + 1 === szData[len - 2] &&
                szData[len - 2] + 1 === szData[len - 1]) {
                return true
            }
            if (szData[0] + 2 === szData[1] &&
                szData[1] + 2 === szData[2]) {
                return true
            }
            if (szData[len - 3] + 2 === szData[len - 2] &&
                szData[len - 2] + 2 === szData[len - 1]) {
                return true
            }
        }
        return false
    }

    checkDaSiXi(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byAnKeziData.length + huTileInfo.byMingKeziData.length +
            huTileInfo.byAddGang.length + huTileInfo.byAnGang.length +
            huTileInfo.byMingGang.length !== 4) return false
        for (let kz of huTileInfo.byAnKeziData) {
            if (this.getTileType(kz) !== def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) return false
        }
        for (let kz of huTileInfo.byMingKeziData) {
            if (this.getTileType(kz) !== def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) return false
        }
        for (let ga of huTileInfo.byAnGang) {
            if (this.getTileType(ga) !== def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) return false
        }
        for (let ga of huTileInfo.byMingGang) {
            if (this.getTileType(ga) !== def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) return false
        }
        for (let ga of huTileInfo.byAddGang) {
            if (this.getTileType(ga) !== def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) return false
        }
        return true
    }

    checkXiaoSiXi(huTileInfo: def.HuTileInfo) {
        if (this.getTileType(huTileInfo.byJiang) !== def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) return false
        if (huTileInfo.byAnKeziData.length + huTileInfo.byMingKeziData.length +
            huTileInfo.byAddGang.length + huTileInfo.byAnGang.length +
            huTileInfo.byMingGang.length < 3) return false
        let fengCount = 0
        for (let kz of huTileInfo.byAnKeziData) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) fengCount++
        }
        for (let kz of huTileInfo.byMingKeziData) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) fengCount++
        }
        for (let ga of huTileInfo.byAnGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) fengCount++
        }
        for (let ga of huTileInfo.byMingGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) fengCount++
        }
        for (let ga of huTileInfo.byAddGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) fengCount++
        }
        if (fengCount === 3) return true
        return false
    }

    checkQingLong(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byShunData.length < 3) return false
        let pai1 = false
        let pai2 = false
        let pai3 = false
        for (let pai of huTileInfo.byShunData) {
            if (pai === def.MJ_TYPE.MJ_TYPE_W1) pai1 = true
            if (pai === def.MJ_TYPE.MJ_TYPE_W4) pai2 = true
            if (pai === def.MJ_TYPE.MJ_TYPE_W7) pai3 = true
        }
        if (pai1 && pai2 && pai3) return true
        return false
    }

    checkSanFengKe(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byAnKeziData.length + huTileInfo.byMingKeziData.length +
            huTileInfo.byAddGang.length + huTileInfo.byAnGang.length +
            huTileInfo.byMingGang.length < 3) return false
        let fengKZCount = 0
        for (let kz of huTileInfo.byMingKeziData) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) fengKZCount++
        }
        if (fengKZCount >= 3) return true
        for (let kz of huTileInfo.byAnKeziData) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) fengKZCount++
        }
        if (fengKZCount >= 3) return true
        for (let ga of huTileInfo.byAnGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) fengKZCount++
        }
        if (fengKZCount >= 3) return true
        for (let ga of huTileInfo.byMingGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) fengKZCount++
        }
        if (fengKZCount >= 3) return true
        for (let ga of huTileInfo.byAddGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_FENG) fengKZCount++
        }
        if (fengKZCount >= 3) return true
        return false
    }

    checkDaSanYuan(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byAnKeziData.length + huTileInfo.byMingKeziData.length +
            huTileInfo.byAddGang.length + huTileInfo.byAnGang.length +
            huTileInfo.byMingGang.length < 3) return false
        let jianKZCount = 0
        for (let kz of huTileInfo.byMingKeziData) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) jianKZCount++
        }
        if (jianKZCount === 3) return true
        for (let kz of huTileInfo.byAnKeziData) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) jianKZCount++
        }
        if (jianKZCount === 3) return true
        for (let ga of huTileInfo.byAnGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) jianKZCount++
        }
        if (jianKZCount === 3) return true
        for (let ga of huTileInfo.byMingGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) jianKZCount++
        }
        if (jianKZCount >= 3) return true
        for (let ga of huTileInfo.byAddGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) jianKZCount++
        }
        if (jianKZCount >= 3) return true
        return false
    }

    checkXiaoSanYuan(huTileInfo: def.HuTileInfo) {
        if (this.getTileType(huTileInfo.byJiang) !== def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) return false
        return this.checkShuangJianKe(huTileInfo)
    }

    checkShuangJianKe(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byAnKeziData.length + huTileInfo.byMingKeziData.length +
            huTileInfo.byAddGang.length + huTileInfo.byAnGang.length +
            huTileInfo.byMingGang.length < 2) return false
        let jianKZCount = 0
        for (let kz of huTileInfo.byMingKeziData) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) jianKZCount++
        }
        if (jianKZCount >= 2) return true
        for (let kz of huTileInfo.byAnKeziData) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) jianKZCount++
        }
        if (jianKZCount >= 2) return true
        for (let ga of huTileInfo.byAnGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) jianKZCount++
        }
        if (jianKZCount >= 2) return true
        for (let ga of huTileInfo.byMingGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) jianKZCount++
        }
        if (jianKZCount >= 2) return true
        for (let ga of huTileInfo.byAddGang) {
            if (this.getTileType(ga) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) jianKZCount++
        }
        if (jianKZCount >= 2) return true
        return false
    }

    checkJianKe(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byMingKeziData.length + huTileInfo.byAnKeziData.length +
            huTileInfo.byAddGang.length + huTileInfo.byAnGang.length +
            huTileInfo.byMingGang.length === 0) return false
        for (let kz of huTileInfo.byMingKeziData) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) return true
        }
        for (let kz of huTileInfo.byAnKeziData) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) return true
        }
        for (let kz of huTileInfo.byMingGang) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) return true
        }
        for (let kz of huTileInfo.byAnGang) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) return true
        }
        for (let kz of huTileInfo.byAddGang) {
            if (this.getTileType(kz) === def.MJ_TYPE_PAI.MJ_TYPE_PAI_JIAN) return true
        }
        return false
    }

    checkHeJueZhang(appearTile: number[], lastTile: number, pos: number) {
        this.tmpData.Init()
        for (let pai of appearTile) {
            this.tmpData.Add(pai)
        }
        let last_1_act = this.userAction[this.userAction.length - 2]
        if (!last_1_act) return false
        let count = 4
        if (last_1_act.pos === pos) count = 3
        for (let data of this.tmpData.data) {
            if (data[0] === lastTile && data[1] === count) return true
        }
        return false
    }

    checkPingHe(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byShunData.length !== 4 || this.getTileType(huTileInfo.byJiang) !== def.MJ_TYPE_PAI.MJ_TYPE_PAI_WAN) return false
        return true
    }

    checkErWuBaJiang(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byJiang === def.MJ_TYPE.MJ_TYPE_W2 ||
            huTileInfo.byJiang === def.MJ_TYPE.MJ_TYPE_W5 ||
            huTileInfo.byJiang === def.MJ_TYPE.MJ_TYPE_W8) {
            return true
        }
        return false
    }

    checkYaoJiuTou(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byJiang === def.MJ_TYPE.MJ_TYPE_W1 ||
            huTileInfo.byJiang === def.MJ_TYPE.MJ_TYPE_W9) {
            return true
        }
        return false
    }

    checkYiBanGao(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byShunData.length < 2) return false
        this.tmpData.Init()
        for (let sz of huTileInfo.byShunData) {
            this.tmpData.Add(sz)
        }

        for (let data of this.tmpData.data) {
            if (data[1] === 2) return true
        }
        return false
    }

    checkLianLiu(huTile: number[], pgVec: def.ChiPengGangInfo[]) {
        let tmp = huTile.concat()
        for (let pg of pgVec) {
            if (pg.pingHuType === def.PingHuType.TYPE_CHI) {
                tmp.push(pg.tile)
                tmp.push(pg.tile + 1)
                tmp.push(pg.tile + 2)
            } else {
                tmp.push(pg.tile)
            }
        }
        tmp.sort((a, b) => {
            return a - b
        })
        this.sortArrRemoveSame(tmp)
        if (tmp.length < 6) return false
        for (let i = 0; i < tmp.length - 5; i++) {
            if (tmp[i] + 1 === tmp[i + 1] &&
                tmp[i + 1] + 1 === tmp[i + 2] &&
                tmp[i + 2] + 1 === tmp[i + 3] &&
                tmp[i + 3] + 1 === tmp[i + 4] &&
                tmp[i + 4] + 1 === tmp[i + 5]) {
                return true
            }
        }
        return false
    }

    checkLaoShaoFu(huTileInfo: def.HuTileInfo) {
        if (huTileInfo.byShunData.length < 2) return false
        let sz_1WCount = 0
        let sz_7WCount = 0
        for (let sz of huTileInfo.byShunData) {
            if (sz === def.MJ_TYPE.MJ_TYPE_W1) sz_1WCount++
            else if (sz === def.MJ_TYPE.MJ_TYPE_W7) sz_7WCount++
        }
        if (sz_1WCount > 0 && sz_7WCount > 0) return true
        return false
    }

    checkBianZhang(huTileInfo: def.HuTileInfo, lastTile: number) {
        if (huTileInfo.byShunData.length === 0) return false
        if (lastTile === def.MJ_TYPE.MJ_TYPE_W3) {
            let isHas123ShunZi = false
            let isHas345ShunZi = false
            let isHas234ShunZi = false
            for (let sz of huTileInfo.byShunData) {
                if (sz === def.MJ_TYPE.MJ_TYPE_W1) {
                    isHas123ShunZi = true
                }
                if (sz === def.MJ_TYPE.MJ_TYPE_W3) {
                    isHas345ShunZi = true
                }
                if (sz === def.MJ_TYPE.MJ_TYPE_W2) {
                    isHas234ShunZi = true
                }
            }
            if (isHas123ShunZi && !isHas345ShunZi && !isHas234ShunZi) return true
        } else if (lastTile === def.MJ_TYPE.MJ_TYPE_W7) {
            let isHas789ShunZi = false
            let isHas567ShunZi = false
            let isHas678ShunZi = false
            for (let sz of huTileInfo.byShunData) {
                if (sz === def.MJ_TYPE.MJ_TYPE_W7) {
                    isHas789ShunZi = true
                }
                if (sz === def.MJ_TYPE.MJ_TYPE_W5) {
                    isHas567ShunZi = true
                }
                if (sz === def.MJ_TYPE.MJ_TYPE_W6) {
                    isHas678ShunZi = true
                }
            }
            if (isHas789ShunZi && !isHas567ShunZi && !isHas678ShunZi) return true
        }
        return false
    }

    checkKanZhang(huTileInfo: def.HuTileInfo, lastTile: number, pgVec: def.ChiPengGangInfo[], handTile: number[]) {
        if (huTileInfo.byShunData.length === 0) return false
        if (huTileInfo.byJiang !== lastTile) return false
        let isKanZhang = false
        let isOtherLastPaiSZ = false
        for (let sz of huTileInfo.byShunData) {
            if (sz + 1 === lastTile) {
                isKanZhang = true
            }
            if (sz === lastTile) {
                isOtherLastPaiSZ = true
            }
            if (sz - 2 === lastTile) {
                isOtherLastPaiSZ = true
            }
        }

        let beforePai = lastTile - 3
        let afterPai = lastTile + 3
        let isBeforeHu = false
        let isAfterHu = false
        if (this.checkIsHuTile(handTile, beforePai, pgVec)) isBeforeHu = true
        if (this.checkIsHuTile(handTile, afterPai, pgVec)) isAfterHu = true
        if (isKanZhang && !isOtherLastPaiSZ && !isBeforeHu && !isAfterHu) return true
        return false
    }

    checkDanDiaoJiang(huTileInfo: def.HuTileInfo, lastTile: number) {
        let jiang = huTileInfo.byJiang
        if (jiang !== lastTile) return false
        for (let sz of huTileInfo.byShunData) {
            if ((sz === jiang - 3 &&
                sz + 1 === jiang - 2 &&
                sz + 2 === jiang - 1) ||
                (sz === jiang + 1 &&
                    sz + 1 === jiang + 2 &&
                    sz + 2 === jiang + 3)) {
                return false
            }
        }
        return true
    }

    checkQuanFengKe(huTileInfo: def.HuTileInfo, quanFeng: number) {
        for (let kz of huTileInfo.byAnKeziData) {
            if (kz === quanFeng) return true
        }
        for (let kz of huTileInfo.byMingKeziData) {
            if (kz === quanFeng) return true
        }
        return false
    }

    checkMenFengKe(huPaiInfo: def.HuTileInfo, menFeng: number) {
        for (let kz of huPaiInfo.byAnKeziData) {
            if (kz === menFeng) return true
        }
        for (let kz of huPaiInfo.byMingKeziData) {
            if (kz === menFeng) return true
        }
        return false
    }

    canHu(handTile: number[],
        lastTile: number,
        pgVec: def.ChiPengGangInfo[],
        huType: number[],
        appearPai: number[],
        pos: number,
        pHuInfo: def.HuTileInfo[],
        quanFeng: number,
        menFeng: number) {
        let handPai: number[] = handTile.concat()
        if (lastTile != 0) {
            handPai.push(lastTile)
        }

        handPai.sort((a, b) => {
            return a - b
        })
        let bCanHu: boolean = false
        let huTempData = new def.TileCounter()
        this.chgHandTileData(handPai, huTempData)
        let gangCount = this.getGangCnt(pgVec)
        let mingCount = gangCount[0]
        let anCount = gangCount[1]
        let allCount = mingCount + anCount
        let yiSe = this.checkYiSe(huTempData, pgVec)
        let pingHuType: def.HuTileInfo[] = []
        if (this.checkQiDui(pgVec, huTempData)) {
            bCanHu = true
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_QI_DUI, huType)
            if (this.checkLianQiDui(handPai, huTempData)) {
                this.setAHuTileType(def.HU_TYPE_EX.HUPAI_LIAN_QI_DUI, huType)
            } else if (yiSe === def.YI_SE.YI_SE_QING) {
                this.setAHuTileType(def.HU_TYPE_EX.HUPAI_QING_YI_SE, huType)
            } else if (yiSe === def.YI_SE.YI_SE_ZI) {
                this.setAHuTileType(def.HU_TYPE_EX.HUPAI_ZI_YI_SE, huType)
            } else if (yiSe === def.YI_SE.YI_SE_HUN) {
                this.setAHuTileType(def.HU_TYPE_EX.HUPAI_HUN_YI_SE, huType)
            }
        }
        if (this.checkPingHu(huTempData, pgVec, pingHuType, lastTile, pos)) {
            bCanHu = true
            for (let pHu of pingHuType) {
                let tmpHuType: number[] = []
                this.checkPingHuData(pgVec, pHu)
                if (yiSe === def.YI_SE.YI_SE_QING) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_QING_YI_SE, tmpHuType)
                    if (this.checkJiuLianBaoDeng(huTempData, pgVec)) {
                        this.setAHuTileType(def.HU_TYPE_EX.HUPAI_JIU_LIAN_BAO_DENG, tmpHuType)
                    } else if (this.checkDaYuWu(huTempData, pgVec)) {
                        this.setAHuTileType(def.HU_TYPE_EX.HUPAI_DA_YU_WU, tmpHuType)
                    } else if (this.checkXiaoYuWu(huTempData, pgVec)) {
                        this.setAHuTileType(def.HU_TYPE_EX.HUPAI_XIAO_YU_WU, tmpHuType)
                    } else if (this.checkDuanYao(huTempData, pgVec)) {
                        this.setAHuTileType(def.HU_TYPE_EX.HUPAI_DUAN_YAO, tmpHuType)
                    }

                    if (this.checkBaiWanDan(handPai, pgVec)) {
                        this.setAHuTileType(def.HU_TYPE_EX.HUPAI_BAI_WAN_DAN, tmpHuType)
                    }

                    if (this.checkYiSeShuangLongHui(handPai, pgVec)) {
                        this.setAHuTileType(def.HU_TYPE_EX.HUPAI_YI_SE_SHUANG_LONG_HUI, tmpHuType)
                    }
                } else if (yiSe === def.YI_SE.YI_SE_ZI) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_ZI_YI_SE, tmpHuType)
                } else if (yiSe === def.YI_SE.YI_SE_HUN) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_HUN_YI_SE, tmpHuType)
                    if (this.checkHunYaoJiu(pHu)) {
                        this.setAHuTileType(def.HU_TYPE_EX.HUPAI_HUN_YAO_JIU, tmpHuType)
                    }
                }

                if (this.checkDaSiXi(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_DA_SI_XI, tmpHuType)
                } else if (this.checkXiaoSiXi(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_XIAO_SI_XI, tmpHuType)
                } else if (this.checkSanFengKe(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_SAN_FENG_KE, tmpHuType)
                } else if (this.checkDaSanYuan(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_DA_SAN_YUAN, tmpHuType)
                } else if (this.checkXiaoSanYuan(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_XIAO_SAN_YUAN, tmpHuType)
                } else if (this.checkShuangAnKe(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_SHUANG_AN_KE, tmpHuType)
                }

                if (this.checkJianKe(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_JIAN_KE, tmpHuType)
                } else if (this.checkYaoJiuKe(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_YAO_JIU_KE, tmpHuType)
                }

                if (this.checkSiAnKe(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_SI_AN_KE, tmpHuType)
                } else if (this.checkSanAnKe(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_SAN_AN_KE, tmpHuType)
                } else if (this.checkShuangAnKe(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_SHUANG_AN_KE, tmpHuType)
                }

                if (this.checkYiSeSiTongShun(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_YI_SE_SI_TONG_SHUN, tmpHuType)
                } else if (this.checkYiSeSiJieGao(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_YI_SE_SI_JIE_GAO, tmpHuType)
                } else if (this.checkYiSeSiBuGao(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_YI_SE_SI_BU_GAO, tmpHuType)
                } else if (this.checkYiSeSanTongShun(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_YI_SE_SAN_TONG_SHUN, tmpHuType)
                } else if (this.checkYiSeSanJieGao(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_YI_SE_SAN_JIE_GAO, tmpHuType)
                } else if (this.checkYiSeSanBuGao(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_YI_SE_SAN_BU_GAO, tmpHuType)
                } else if (this.checkYiBanGao(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_YI_BAN_GAO, tmpHuType)
                }

                if (this.checkPengPengHe(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_PENG_PENG_HE, tmpHuType)
                }
                if (this.checkQingLong(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_QING_LONG, tmpHuType)
                } else if (this.checkLianLiu(handPai, pgVec)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_LIAN_LIU, tmpHuType)
                } else if (this.checkLaoShaoFu(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_LAO_SHAO_FU, tmpHuType)
                }

                if (this.checkPingHe(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_PING_HE, tmpHuType)
                }

                if (this.checkErWuBaJiang(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_ER_WU_BA_JIANG, tmpHuType)
                } else if (this.checkYaoJiuTou(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_YAO_JIU_TOU, tmpHuType)
                }

                if (this.checkQuanDaiYao(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_QUAN_DAI_YAO, tmpHuType)
                }
                if (this.checkShuangJianKe(pHu)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_SHUANG_JIAN_KE, tmpHuType)
                }

                if (this.checkBianZhang(pHu, lastTile)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_BIAN_ZHANG, tmpHuType)
                } else if (this.checkKanZhang(pHu, lastTile, pgVec, handPai)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_KAN_ZHANG, tmpHuType)
                } else if (this.checkDanDiaoJiang(pHu, lastTile)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_DAN_DIAO_JIANG, tmpHuType)
                }


                if (this.checkQuanFengKe(pHu, quanFeng)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_QUAN_FENG_KE, tmpHuType)
                }

                if (this.checkMenFengKe(pHu, menFeng)) {
                    this.setAHuTileType(def.HU_TYPE_EX.HUPAI_MEN_FENG_KE, tmpHuType)
                }

                this.checkGang(mingCount, anCount, tmpHuType)
                pHu.fan = this.getFan(tmpHuType)
                pHu.huPaiType = tmpHuType
            }
        }
        if (huType.length > 0) {
            pingHuType.push({
                huPaiType: huType,
                fan: this.getFan(huType) //只需要这两个元素
            })
        }
        let huTypeAndInfo = this.getMaxFanTypesAndPHuInfo(pingHuType)
        huType = huTypeAndInfo.types.concat()
        pHuInfo.push(huTypeAndInfo.pHu)

        if (this.checkSiGui(huTempData, pgVec)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_SI_GUI, huType)
        }

        if (this.checkHeJueZhang(appearPai, lastTile, pos)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_HE_JUE_ZHANG, huType)
        }

        this.checkFilter(huType)
        this.huType = huType.concat()

        return huType
    }

    getMaxFanTypesAndPHuInfo(pingHuType: def.HuTileInfo[]) {
        let maxFanType: number[] = []
        let pHuInfo: def.HuTileInfo
        let maxFan = 0
        for (let pht of pingHuType) {
            if (maxFan < pht.fan) {
                maxFan = pht.fan
                maxFanType = pht.huPaiType
                pHuInfo = pht
            }
        }
        return { types: maxFanType, pHu: pHuInfo }
    }

    checkQiangGangHe(pos: number, lastTile: number) {
        let userAction = this.userAction
        if (userAction.length < 4) return false
        let huPos = userAction.length - 1
        let gangPos = userAction.length - 2
        if (userAction[huPos].action === def.Action.USER_ACTION_HU &&
            userAction[huPos].tile === lastTile &&
            userAction[huPos].pos === pos &&
            userAction[gangPos].action === def.Action.USER_ACTION_GANG &&
            userAction[gangPos].tile === lastTile &&
            userAction[gangPos].pos !== pos) {
            return true
        }
        return false
    }

    checkZiMo(pos: number, lastTile: number) {
        let userAction = this.userAction
        if (userAction.length < 2) return false
        let huPos = userAction.length - 1
        let moPos = userAction.length - 2
        if (userAction[huPos].action === def.Action.USER_ACTION_HU &&
            userAction[huPos].tile === lastTile &&
            userAction[huPos].pos === pos &&
            userAction[moPos].pos === pos &&
            userAction[moPos].action === def.Action.USER_ACTION_UP_CARD &&
            userAction[moPos].tile === lastTile) {
            return true
        }
        return false
    }

    checkMenQianQing(pos: number, lastTile: number, pgVec: def.ChiPengGangInfo[]) {
        for (let pg of pgVec) {
            if (pg.pingHuType !== def.PingHuType.TYPE_DARK) return false
        }
        let userAction = this.userAction
        if (userAction.length < 2) return false
        let huPos = userAction.length - 1
        let prePos = userAction.length - 2
        if (userAction[huPos].action === def.Action.USER_ACTION_HU &&
            userAction[huPos].tile === lastTile &&
            userAction[huPos].pos === pos &&
            (userAction[prePos].action === def.Action.USER_ACTION_OUT_CARD || userAction[prePos].action === def.Action.USER_ACTION_GANG) &&
            userAction[prePos].tile === lastTile &&
            userAction[prePos].pos !== pos) {
            return true
        }
        return false
    }

    checkBuQiuRen(pos: number, lastTile: number, pgVec: def.ChiPengGangInfo[]) {
        for (let pg of pgVec) {
            if (pg.pingHuType !== def.PingHuType.TYPE_DARK) return false
        }
        if (this.checkZiMo(pos, lastTile)) return true
        return false
    }

    checkQuanQiuRen(pos: number, lastTile: number, pgVec: def.ChiPengGangInfo[], huTileInfo: def.HuTileInfo) {
        if (!this.checkZiMo(pos, lastTile) && this.checkDanDiaoJiang(huTileInfo, lastTile)) return true
        return false
    }

    checkGangShangKaiHua(pos: number, lastTile: number) {
        let userAction = this.userAction
        if (userAction.length < 3) return false
        let huPos = userAction.length - 1
        let gangHouMoPaiPos = userAction.length - 2
        let gangPos = userAction.length - 3
        if (userAction[huPos].action === def.Action.USER_ACTION_HU &&
            userAction[huPos].tile === lastTile &&
            userAction[huPos].pos === pos &&
            userAction[gangPos].action === def.Action.USER_ACTION_GANG &&
            userAction[gangPos].pos === pos &&
            userAction[gangHouMoPaiPos].action === def.Action.USER_ACTION_UP_CARD &&
            userAction[gangHouMoPaiPos].tile === lastTile &&
            userAction[gangHouMoPaiPos].pos === pos) {
            return true
        }
        return false
    }

    checkHaiDiLaoYue(pos: number, lastTile: number) {
        if (this.tileArr.length !== 0) return false
        let userAction = this.userAction
        if (userAction.length < 2) return false
        let huPos = userAction.length - 1
        let prePos = userAction.length - 2
        if (userAction[huPos].action === def.Action.USER_ACTION_HU &&
            userAction[huPos].tile === lastTile &&
            userAction[huPos].pos === pos &&
            (userAction[prePos].action === def.Action.USER_ACTION_OUT_CARD || userAction[prePos].action === def.Action.USER_ACTION_GANG) &&
            userAction[prePos].tile === lastTile &&
            userAction[prePos].pos !== pos) {
            return true
        }
    }

    checkMiaoShouHuiChun(pos: number, lastTile: number) {
        if (this.checkZiMo(pos, lastTile) && this.tileArr.length === 0) return true
        return false
    }

    checkRenHe(pos: number, lastTile: number) {
        let userAction = this.userAction
        if (userAction.length < 2 || userAction.length > 10) return false
        let huPos = userAction.length - 1
        let prePos = userAction.length - 2
        let outPaiCount = 0
        for (let act of userAction) {
            if (act.action === def.Action.USER_ACTION_OUT_CARD) {
                outPaiCount++
            }
        }
        if (outPaiCount !== 1) return false
        if (userAction[huPos].action === def.Action.USER_ACTION_HU &&
            userAction[huPos].tile === lastTile &&
            userAction[huPos].pos === pos &&
            userAction[prePos].action === def.Action.USER_ACTION_OUT_CARD &&
            userAction[prePos].tile === lastTile &&
            userAction[prePos].pos !== pos) {
            return true
        }
        return false
    }

    checkDiHe(pos: number, lastTile: number) {
        let userAction = this.userAction
        if (userAction.length < 2 || userAction.length > 10) return false
        let huPos = userAction.length - 1
        let prePos = userAction.length - 2
        let outPaiCount = 0
        for (let act of userAction) {
            if (act.action === def.Action.USER_ACTION_OUT_CARD) {
                outPaiCount++
            }
        }
        if (outPaiCount !== 1) return false
        if (userAction[huPos].action === def.Action.USER_ACTION_HU &&
            userAction[huPos].tile === lastTile &&
            userAction[huPos].pos === pos &&
            userAction[prePos].action === def.Action.USER_ACTION_UP_CARD &&
            userAction[prePos].tile === lastTile &&
            userAction[prePos].pos === pos) {
            return true
        }
        return false
    }

    checkTianHe() {
        if (this.userAction.length === 2 && this.userAction[1].action === def.Action.USER_ACTION_HU) return true
        return false
    }

    checkTianTing(pos: number, pgVec: def.ChiPengGangInfo[]) {
        if (pgVec.length > 0) return false
        if (this.userAction.length === 0) return false
        for (let act of this.userAction) {
            if (act.pos === pos) {
                if (act.action === def.Action.USER_ACTION_OUT_CARD) return false
                if (act.action === def.Action.USER_ACTION_TING) return true
            }
        }

        return false
    }

    huTile(pos: number, lastTile: number, huType: number[], pgVec: def.ChiPengGangInfo[], huTileInfo: def.HuTileInfo, isTingPai: boolean) {
        if (this.checkQiangGangHe(pos, lastTile)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_QIANG_GANG_HE, huType)
        } else if (this.checkGangShangKaiHua(pos, lastTile)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_GANG_SHANG_KAI_HUA, huType)
        } else if (this.checkHaiDiLaoYue(pos, lastTile)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_HAI_DI_LAO_YUE, huType)
        } else if (this.checkMiaoShouHuiChun(pos, lastTile)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_MIAO_SHOU_HUI_CHUN, huType)
        }

        if (this.checkBuQiuRen(pos, lastTile, pgVec)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_BU_QIU_REN, huType)
        } else if (this.checkZiMo(pos, lastTile)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_ZI_MO, huType)
        } else if (this.checkMenQianQing(pos, lastTile, pgVec)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_MEN_QIAN_QIANG, huType)
        } else if (this.checkQuanQiuRen(pos, lastTile, pgVec, huTileInfo)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_QUAN_QIU_REN, huType)
        }

        if (this.checkRenHe(pos, lastTile)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_REN_HE, huType)
        } else if (this.checkDiHe(pos, lastTile)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_DI_HE, huType)
        } else if (this.checkTianHe()) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_TIAN_HE, huType)
        } else if (this.checkTianTing(pos, pgVec)) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_TIAN_TING, huType)
        }

        if (isTingPai) {
            this.setAHuTileType(def.HU_TYPE_EX.HUPAI_BAO_TING, huType)
            if (this.checkMenQianQing(pos, lastTile, pgVec)) {
                this.setAHuTileType(def.HU_TYPE_EX.HUPAI_LI_ZHI, huType)
            }
        }

        this.checkFilter(huType)
        return huType
    }

    checkFilter(huType: number[]) {
        huType.sort((a, b) => a - b)

        for (let i = 0; i < huType.length - 1;) {
            let ht = def.HuTypeFilter[huType[i]]
            if (huType[i] === huType[i + 1]) {
                huType.splice(i, 1)
            }
            if (!ht) {
                i++
                continue
            }

            let add = false
            for (let typ of ht) {
                let index = huType.indexOf(typ, i + 1)
                if (index !== -1) {
                    huType.splice(index, 1)
                    if (index === i + 1) add = true
                }
            }
            if (!add) {
                i++
            }
        }
    }

    getFan(huType: number[]) {
        let allFan = 0
        huType.forEach(value => {
            allFan += def.TypeFan[value]
        })
        return allFan
    }

    checkIsHuTile(handTile: number[], lastTile: number, pgVec: def.ChiPengGangInfo[]) {
        let temp = handTile.concat(lastTile)
        let counter = this.counterTile(temp)
        let isHu = false
        if (this.checkPingHu(counter, pgVec, [], lastTile, 0)) isHu = true
        else if (this.checkQiDui(pgVec, counter)) isHu = true
        return isHu
    }

    canTing(handTile: number[], upTile: number, pgVec: def.ChiPengGangInfo[], tingPaiData: { [pai: number]: number[] } = {}) {
        let tmpHandTile = handTile.concat(upTile)
        let canTing = false
        let hasCheck: { [pai: number]: boolean } = {}
        for (let outPai of tmpHandTile) {
            if (hasCheck[outPai]) continue
            let pos = tmpHandTile.indexOf(outPai)
            tmpHandTile.splice(pos, 1)
            for (let pai of def.mjAllTypeCard) {
                if (this.checkIsHuTile(tmpHandTile, pai, pgVec)) {
                    if (tingPaiData[outPai] === undefined) {
                        tingPaiData[outPai] = []
                    }
                    tingPaiData[outPai].push(pai)
                    canTing = true
                }
            }
            tmpHandTile.splice(pos, 0, outPai)
            hasCheck[outPai] = true
        }

        return canTing
    }

    checkPingHu(huTempData: def.TileCounter, pgVec: def.ChiPengGangInfo[], pingHuType: def.HuTileInfo[], lastTile: number, rPos: number) {
        this.huTileStruct.Init()
        let bHu: boolean = false
        for (let i = 0; i < huTempData.data.length; i++) {
            if (huTempData.data[i][1] < 2 || huTempData.data[i][0] == 0) {
                continue
            }
            this.huTileStruct.Init()
            huTempData.data[i][1] -= 2
            this.huTileStruct.AddData(def.PingHuType.TYPE_JIANG, huTempData.data[i][0])
            this.makePingHu(huTempData, this.huTileStruct, pgVec, pingHuType, lastTile, rPos)
            huTempData.data[i][1] += 2
        }

        return pingHuType.length > 0
    }

    changePaoTile(handTile: number[], nextHuTile: number[]) {
        let needRemoveTile: number[] = []
        for (let pai of nextHuTile) {
            for (let i = 0; i < handTile.length;) {
                if (handTile[i] === pai) {
                    handTile.splice(i, 1)
                    needRemoveTile.push(pai)
                } else {
                    i++
                }
            }
        }
        if (needRemoveTile.length === 0) return
        for (let i = 0; i < this.tileArr.length; i++) {
            let isHuTile = false
            for (let pai of nextHuTile) {
                if (pai === this.tileArr[i]) {
                    isHuTile = true
                    break
                }
            }
            if (isHuTile) continue
            if (needRemoveTile.length === 0) break
            handTile.push(this.tileArr[i])
            this.tileArr[i] = needRemoveTile[0]
            needRemoveTile.splice(0, 1)
        }
    }

    changeToTingTile(handTile: number[], pgVec: def.ChiPengGangInfo[]) {
        let tileCounter = new def.TileCounter()
        let tmpHandleTile = handTile.concat()
        tmpHandleTile.sort((a, b) => a - b)
        for (let tile of tmpHandleTile) {
            tileCounter.Add(tile)
        }
        let remainTiles: number[][] = []
        for (let i = 0; i < tileCounter.data.length; i++) {
            if (tileCounter.data[i][1] < 2 || tileCounter.data[i][0] == 0) {
                continue
            }
            tileCounter.data[i][1] -= 2
            this.makeGroup(tileCounter, remainTiles)
            tileCounter.data[i][1] += 2
        }
        if (remainTiles.length === 0) return
        let minLen = 20
        let minIndex: number
        for (let i = 0; i < remainTiles.length; i++) {
            if (remainTiles[i].length < minLen) {
                minLen = remainTiles[i].length
                minIndex = i
            }
        }
        let tmpRemainPais = remainTiles[minIndex].concat()
        if (this.tileArr.length < tmpRemainPais.length) return

        this.selectBestPaisFromArrOrg(tmpRemainPais, handTile, pgVec)
    }

    selectBestPaisFromArrOrg(remainTiles: number[], handTile: number[], pgVec: def.ChiPengGangInfo[]) {
        let tmpArrTilesCounter = new def.TileCounter()
        let tmpArr = this.tileArr.concat(remainTiles)
        tmpArr.sort((a, b) => {
            return a - b
        })
        for (let tile of tmpArr) {
            tmpArrTilesCounter.Add(tile)
        }

        let len = remainTiles.length
        let chgTiles: number[] = []
        if (len + 1 === 3) {
            if (tmpArrTilesCounter.data[tmpArrTilesCounter.data.length - 1][1] >= 3) {
                chgTiles.push(tmpArrTilesCounter.data[tmpArrTilesCounter.data.length - 1][0])
                chgTiles.push(tmpArrTilesCounter.data[tmpArrTilesCounter.data.length - 1][0])
            } else if (tmpArrTilesCounter.data[tmpArrTilesCounter.data.length - 2][1] >= 3) {
                chgTiles.push(tmpArrTilesCounter.data[tmpArrTilesCounter.data.length - 2][0])
                chgTiles.push(tmpArrTilesCounter.data[tmpArrTilesCounter.data.length - 2][0])
            } else {
                for (let i = 0; i < tmpArrTilesCounter.data.length - 2; i++) {
                    if (tmpArrTilesCounter.data[i][1] >= 3) {
                        chgTiles.push(tmpArrTilesCounter.data[i][0])
                        chgTiles.push(tmpArrTilesCounter.data[i][0])
                        break
                    } else if (tmpArrTilesCounter.data[i][0] + 1 === tmpArrTilesCounter.data[i + 1][0] &&
                        tmpArrTilesCounter.data[i][0] + 2 === tmpArrTilesCounter.data[i + 2][0] &&
                        tmpArrTilesCounter.data[i][1] > 0 &&
                        tmpArrTilesCounter.data[i + 1][1] > 0 &&
                        tmpArrTilesCounter.data[i + 2][1] > 0) {
                        chgTiles.push(tmpArrTilesCounter.data[i][0])
                        chgTiles.push(tmpArrTilesCounter.data[i + 1][0])
                        break
                    }
                }
            }
        } else if (len + 1 === 6) {
            let tmpArr: number[] = []
            for (let i = 0; i < tmpArrTilesCounter.data.length; i++) {
                if (tmpArrTilesCounter.data[i][1] >= 3) {
                    tmpArr.push(tmpArrTilesCounter.data[i][0])
                    if (tmpArr.length === 2) break
                }
            }
            if (tmpArr.length === 2) {
                chgTiles.push(tmpArr[0])
                chgTiles.push(tmpArr[0])
                chgTiles.push(tmpArr[0])
                chgTiles.push(tmpArr[1])
                chgTiles.push(tmpArr[1])
            } else if (tmpArr.length === 1) {
                for (let i = 0; i < tmpArrTilesCounter.data.length - 2; i++) {
                    if (tmpArrTilesCounter.data[i][0] + 1 === tmpArrTilesCounter.data[i + 1][0] &&
                        tmpArrTilesCounter.data[i][0] + 2 === tmpArrTilesCounter.data[i + 2][0] &&
                        tmpArrTilesCounter.data[i][1] > 0 &&
                        tmpArrTilesCounter.data[i + 1][1] > 0 &&
                        tmpArrTilesCounter.data[i + 2][1] > 0 &&
                        tmpArr[0] !== tmpArrTilesCounter.data[i][0] &&
                        tmpArr[0] !== tmpArrTilesCounter.data[i + 1][0]) {
                        chgTiles.push(tmpArrTilesCounter.data[i][0])
                        chgTiles.push(tmpArrTilesCounter.data[i + 1][0])
                        chgTiles.push(tmpArr[0])
                        chgTiles.push(tmpArr[0])
                        chgTiles.push(tmpArr[0])
                        break
                    }
                }
            } else {
                for (let i = 0; i < tmpArrTilesCounter.data.length - 2; i++) {
                    if (tmpArrTilesCounter.data[i][0] + 1 === tmpArrTilesCounter.data[i + 1][0] &&
                        tmpArrTilesCounter.data[i][0] + 2 === tmpArrTilesCounter.data[i + 2][0] &&
                        tmpArrTilesCounter.data[i][1] > 0 &&
                        tmpArrTilesCounter.data[i + 1][1] > 0 &&
                        tmpArrTilesCounter.data[i + 2][1] > 0) {
                        tmpArr.push(tmpArrTilesCounter.data[i][0])
                        tmpArr.push(tmpArrTilesCounter.data[i + 1][0])
                        tmpArr.push(tmpArrTilesCounter.data[i + 2][0])
                        tmpArrTilesCounter.data[i][1]--
                        tmpArrTilesCounter.data[i + 1][1]--
                        tmpArrTilesCounter.data[i + 2][1]--
                        if (tmpArr.length === 4) {
                            chgTiles.push(tmpArrTilesCounter.data[i][0])
                            chgTiles.push(tmpArrTilesCounter.data[i + 1][0])
                            chgTiles.push(tmpArr[0])
                            chgTiles.push(tmpArr[0])
                            chgTiles.push(tmpArr[0])
                            break
                        }
                    }
                }
            }
        } else if (len + 1 === 9) {
            let tmpArr: number[] = []
            for (let i = 0; i < tmpArrTilesCounter.data.length; i++) {
                if (tmpArrTilesCounter.data[i][1] >= 3) {
                    tmpArr.push(tmpArrTilesCounter.data[i][0])
                    if (tmpArr.length === 3) break
                }
            }
            if (tmpArr.length === 3) {
                chgTiles.push(tmpArr[0])
                chgTiles.push(tmpArr[0])
                chgTiles.push(tmpArr[0])
                chgTiles.push(tmpArr[1])
                chgTiles.push(tmpArr[1])
                chgTiles.push(tmpArr[1])
                chgTiles.push(tmpArr[2])
                chgTiles.push(tmpArr[2])
            } else if (tmpArr.length === 2) {
                for (let i = 0; i < tmpArrTilesCounter.data.length - 2; i++) {
                    if (tmpArrTilesCounter.data[i][0] + 1 === tmpArrTilesCounter.data[i + 1][0] &&
                        tmpArrTilesCounter.data[i][0] + 2 === tmpArrTilesCounter.data[i + 2][0] &&
                        tmpArrTilesCounter.data[i][1] > 0 &&
                        tmpArrTilesCounter.data[i + 1][1] > 0 &&
                        tmpArrTilesCounter.data[i + 2][1] > 0 &&
                        tmpArr[0] !== tmpArrTilesCounter.data[i][0] &&
                        tmpArr[0] !== tmpArrTilesCounter.data[i + 1][0] &&
                        tmpArr[1] !== tmpArrTilesCounter.data[i][0] &&
                        tmpArr[1] !== tmpArrTilesCounter.data[i + 1][0]) {
                        chgTiles.push(tmpArrTilesCounter.data[i][0])
                        chgTiles.push(tmpArrTilesCounter.data[i + 1][0])
                        chgTiles.push(tmpArr[0])
                        chgTiles.push(tmpArr[0])
                        chgTiles.push(tmpArr[0])
                        chgTiles.push(tmpArr[1])
                        chgTiles.push(tmpArr[1])
                        chgTiles.push(tmpArr[1])
                        break
                    }
                }
            } else {
                tmpArr = []
                for (let i = 0; i < tmpArrTilesCounter.data.length - 2; i++) {
                    if (tmpArrTilesCounter.data[i][0] + 1 === tmpArrTilesCounter.data[i + 1][0] &&
                        tmpArrTilesCounter.data[i][0] + 2 === tmpArrTilesCounter.data[i + 2][0] &&
                        tmpArrTilesCounter.data[i][1] > 0 &&
                        tmpArrTilesCounter.data[i + 1][1] > 0 &&
                        tmpArrTilesCounter.data[i + 2][1] > 0) {
                        tmpArr.push(tmpArrTilesCounter.data[i][0])
                        tmpArr.push(tmpArrTilesCounter.data[i + 1][0])
                        tmpArr.push(tmpArrTilesCounter.data[i + 2][0])
                        tmpArrTilesCounter.data[i][1]--
                        tmpArrTilesCounter.data[i + 1][1]--
                        tmpArrTilesCounter.data[i + 2][1]--
                        if (tmpArr.length === 9) {
                            for (let j = 0; j < tmpArr.length - 1; j++) {
                                chgTiles.push(tmpArr[j])
                            }
                            break
                        }
                    }
                }
            }
        } else if (len + 1 === 12) {
            let tmpArr: number[] = []
            for (let i = 0; i < tmpArrTilesCounter.data.length; i++) {
                if (tmpArrTilesCounter.data[i][1] >= 3) {
                    tmpArr.push(tmpArrTilesCounter.data[i][0])
                    if (tmpArr.length === 4) break
                }
            }
            if (tmpArr.length === 4) {
                chgTiles.push(tmpArr[0])
                chgTiles.push(tmpArr[0])
                chgTiles.push(tmpArr[0])
                chgTiles.push(tmpArr[1])
                chgTiles.push(tmpArr[1])
                chgTiles.push(tmpArr[1])
                chgTiles.push(tmpArr[2])
                chgTiles.push(tmpArr[2])
                chgTiles.push(tmpArr[2])
                chgTiles.push(tmpArr[3])
                chgTiles.push(tmpArr[3])
            } else if (tmpArr.length === 3) {
                for (let i = 0; i < tmpArrTilesCounter.data.length - 2; i++) {
                    if (tmpArrTilesCounter.data[i][0] + 1 === tmpArrTilesCounter.data[i + 1][0] &&
                        tmpArrTilesCounter.data[i][0] + 2 === tmpArrTilesCounter.data[i + 2][0] &&
                        tmpArrTilesCounter.data[i][1] > 0 &&
                        tmpArrTilesCounter.data[i + 1][1] > 0 &&
                        tmpArrTilesCounter.data[i + 2][1] > 0 &&
                        tmpArr[0] !== tmpArrTilesCounter.data[i][0] &&
                        tmpArr[0] !== tmpArrTilesCounter.data[i + 1][0] &&
                        tmpArr[1] !== tmpArrTilesCounter.data[i][0] &&
                        tmpArr[1] !== tmpArrTilesCounter.data[i + 1][0] &&
                        tmpArr[2] !== tmpArrTilesCounter.data[i][0] &&
                        tmpArr[2] !== tmpArrTilesCounter.data[i + 1][0]) {
                        chgTiles.push(tmpArrTilesCounter.data[i][0])
                        chgTiles.push(tmpArrTilesCounter.data[i + 1][0])
                        chgTiles.push(tmpArr[0])
                        chgTiles.push(tmpArr[0])
                        chgTiles.push(tmpArr[0])
                        chgTiles.push(tmpArr[1])
                        chgTiles.push(tmpArr[1])
                        chgTiles.push(tmpArr[1])
                        chgTiles.push(tmpArr[2])
                        chgTiles.push(tmpArr[2])
                        chgTiles.push(tmpArr[2])
                        break
                    }
                }
            } else {
                tmpArr = []
                for (let i = 0; i < tmpArrTilesCounter.data.length - 2; i++) {
                    if (tmpArrTilesCounter.data[i][0] + 1 === tmpArrTilesCounter.data[i + 1][0] &&
                        tmpArrTilesCounter.data[i][0] + 2 === tmpArrTilesCounter.data[i + 2][0] &&
                        tmpArrTilesCounter.data[i][1] > 0 &&
                        tmpArrTilesCounter.data[i + 1][1] > 0 &&
                        tmpArrTilesCounter.data[i + 2][1] > 0) {
                        tmpArr.push(tmpArrTilesCounter.data[i][0])
                        tmpArr.push(tmpArrTilesCounter.data[i + 1][0])
                        tmpArr.push(tmpArrTilesCounter.data[i + 2][0])
                        tmpArrTilesCounter.data[i][1]--
                        tmpArrTilesCounter.data[i + 1][1]--
                        tmpArrTilesCounter.data[i + 2][1]--
                        if (tmpArr.length === 12) {
                            for (let j = 0; j < tmpArr.length - 1; j++) {
                                chgTiles.push(tmpArr[j])
                            }
                            break
                        }
                    }
                }
            }
        }

        if (chgTiles.length !== remainTiles.length || chgTiles.length === 0 || remainTiles.length === 0) return
        for (let i = 0; i < remainTiles.length; i++) {
            let index_handle = handTile.indexOf(remainTiles[i])
            let index_remain = this.tileArr.indexOf(chgTiles[i])
            handTile[index_handle] = chgTiles[i]
            this.tileArr[index_remain] = remainTiles[i]
        }
    }

    makeGroup(tileCounter: def.TileCounter, remainTiles: number[][]) {
        let tile = 0
        let count = 0
        for (let i = 0; i < tileCounter.data.length; i++) {
            if (tileCounter.data[i][1] === 0) {
                continue
            }
            tile = tileCounter.data[i][0]
            count = tileCounter.data[i][1]
            break
        }
        let isCountSuccess = false
        let isShunZi = false
        if (count >= 3) {
            isCountSuccess = true
            tileCounter.SetPaiCount(tile, count - 3)
            this.makeGroup(tileCounter, remainTiles)
            tileCounter.SetPaiCount(tile, count)
        }
        if (tile % 10 < 8 && tileCounter.GetPaiCount(tile + 1) >= 1 && tileCounter.GetPaiCount(tile + 2) >= 1) {
            isShunZi = true
            tileCounter.SetPaiCount(tile, count - 1)
            tileCounter.SetPaiCount(tile + 1, tileCounter.GetPaiCount(tile + 1) - 1)
            tileCounter.SetPaiCount(tile + 2, tileCounter.GetPaiCount(tile + 2) - 1)

            this.makeGroup(tileCounter, remainTiles)
            tileCounter.SetPaiCount(tile, count)
            tileCounter.SetPaiCount(tile + 1, tileCounter.GetPaiCount(tile + 1) + 1)
            tileCounter.SetPaiCount(tile + 2, tileCounter.GetPaiCount(tile + 2) + 1)
        }

        if (!isCountSuccess && !isShunZi) {
            let tmpRemainCount: number[] = []
            for (let i = 0; i < tileCounter.data.length; i++) {
                if (tileCounter.data[i][1] === 1) {
                    tmpRemainCount.push(tileCounter.data[i][0])
                } else if (tileCounter.data[i][1] === 2) {
                    tmpRemainCount.push(tileCounter.data[i][0])
                    tmpRemainCount.push(tileCounter.data[i][0])
                }
            }
            remainTiles.push(tmpRemainCount)
        }
    }

    checkPingHuData(pgVec: def.ChiPengGangInfo[], pHu: def.HuTileInfo) {
        let pingHuData = pHu.pingHuStruct.pingHuData
        for (let i = 0; i < pingHuData.length; i++) {
            let tile = pingHuData[i].tile
            switch (pingHuData[i].byType) {
                case def.PingHuType.TYPE_JIANG:
                    {
                        pHu.byJiang = tile
                    }
                    break
                case def.PingHuType.TYPE_SHUN:
                    {
                        pHu.byShunData.push(tile)
                    }
                    break
                case def.PingHuType.TYPE_ANKE:
                    {
                        pHu.byAnKeziData.push(tile)
                    }
                    break
                case def.PingHuType.TYPE_MINGKE:
                    {
                        pHu.byMingKeziData.push(tile)
                    }
                    break
                default:
                    break
            }
        }

        let tile: number
        for (let it of pgVec) {
            if (it.tile == 0) {
                continue
            }

            tile = it.tile

            switch (it.pingHuType) {
                case def.PingHuType.TYPE_PENG:
                    pHu.byMingKeziData.push(tile)
                    break
                case def.PingHuType.TYPE_CHI:
                    pHu.byShunData.push(tile)
                    break
                case def.PingHuType.TYPE_DARK:
                    pHu.byAnGang.push(tile)
                    break
                case def.PingHuType.TYPE_ADD:
                    pHu.byAddGang.push(tile)
                    break
                case def.PingHuType.TYPE_SHINE:
                    pHu.byMingGang.push(tile)
                    break
            }
        }
    }

    makePingHu(tileData: def.TileCounter,
        huTilestruct: def.PingHuStruct,
        pgVec: def.ChiPengGangInfo[],
        pingHuType: def.HuTileInfo[], lastTile: number, pos: number) {
        if (tileData.GetAllPaiCount() <= 0) {
            let temp: def.PingHuStruct = new def.PingHuStruct()
            temp.load(huTilestruct)
            pingHuType.push({
                pingHuStruct: temp,
                byJiang: 0,
                byShunData: [],
                byChiData: [],
                byMingKeziData: [],
                byAnKeziData: [],
                byMingGang: [],
                byAddGang: [],
                byAnGang: [],
                huPaiType: [],
                fan: 0
            })
            return
        }
        let tile = 0
        let count = 0
        for (let i = 0; i < tileData.data.length; i++) {
            if (tileData.data[i][1] == 0) {
                continue
            }
            tile = tileData.data[i][0]
            count = tileData.data[i][1]
            break
        }

        if (count >= 3) {
            let isZimo = this.checkZiMo(pos, lastTile)
            if (tile === lastTile && !isZimo) {
                huTilestruct.AddData(def.PingHuType.TYPE_MINGKE, tile)
            } else {
                huTilestruct.AddData(def.PingHuType.TYPE_ANKE, tile)
            }

            tileData.SetPaiCount(tile, count - 3)
            this.makePingHu(tileData, huTilestruct, pgVec, pingHuType, lastTile, pos)

            tileData.SetPaiCount(tile, count)
            if (tile === lastTile && !isZimo) {
                huTilestruct.DeleteData(def.PingHuType.TYPE_MINGKE, tile)
            } else {
                huTilestruct.DeleteData(def.PingHuType.TYPE_ANKE, tile)
            }
        }
        if (tile % 10 < 8 && tileData.GetPaiCount(tile + 1) >= 1 && tileData.GetPaiCount(tile + 2) >= 1) {
            huTilestruct.AddData(def.PingHuType.TYPE_SHUN, tile)
            tileData.SetPaiCount(tile, count - 1)
            tileData.SetPaiCount(tile + 1, tileData.GetPaiCount(tile + 1) - 1)
            tileData.SetPaiCount(tile + 2, tileData.GetPaiCount(tile + 2) - 1)

            this.makePingHu(tileData, huTilestruct, pgVec, pingHuType, lastTile, pos)
            tileData.SetPaiCount(tile, count)
            tileData.SetPaiCount(tile + 1, tileData.GetPaiCount(tile + 1) + 1)
            tileData.SetPaiCount(tile + 2, tileData.GetPaiCount(tile + 2) + 1)
            huTilestruct.DeleteData(def.PingHuType.TYPE_SHUN, tile)
        }
    }

    testPrint = (...args) => {
        let params = ""
        for (let arg of args) {
            if (arg instanceof Array || arg instanceof Object) {
                params += " " + JSON.stringify(arg)
            } else {
                params += " " + arg
            }
        }
    }
}
