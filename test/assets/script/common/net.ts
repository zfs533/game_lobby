import { toj } from "./util";
import { ItemNames } from "./enum";
import { ErrCodes } from "./code";
import { showLoading, hideLoading, showConfirm } from "./ui";
import LoginHelper from "../start/loginHelper";
import Debug from "../start/debug";
import g from "../g";
import { getRedEnvelopeInfo, receiveRedEnvelope } from "../activity/Redpag";

export default { handShake, connEntry, request, notify, on, off }

const pomelo = window.pomelo;
const aesjs = window.aesjs

const TIME_OUT = 100000;
const KEY = [112, 37, 87, 97, 111, 108, 121, 85, 77, 70, 105, 115, 86, 36, 114, 90]
const MASK = "$8#N5$ikaqmQql$n"

let enc_iv: string;

function registerPomelo() {
    cc.game.off(cc.game.EVENT_HIDE);
    cc.game.on(cc.game.EVENT_HIDE, function (event) {
        hideLoading();
    });

    let pomelo = window.pomelo;
    pomelo.off("onKick");
    pomelo.once("onKick", (data: { reason: string }) => {
        Debug.log("被踢下线" + "reason: " + data.reason);
        hideLoading();
        pomelo.off("disconnect");
        pomelo.disconnect();
        g.isOnKick = data.reason;
        let node;
        if (data.reason === 'kick') {
            node = showConfirm("您的帐号已在其他设备登录！请注意账号安全！", "确定");
        } else if (data.reason === "serverClosed") {
            node = showConfirm("亲，服务器正在停机维护中，已为您结算下线。", "确定");
        } else {
        }
        node.okFunc = function () {

            LoginHelper.returnToLogin();
        };
    });
    pomelo.off("disconnect");
    pomelo.on("disconnect", async function () {
        hideLoading();
        pomelo.off("disconnect");
        Debug.log("链接已断开");
        showLoading("重连中");
        await LoginHelper.reconnect();
    });
}

/**
 * 握手
 * @param url
 */
async function handShake(url: string) {
    let code = await init(url);
    if (code !== 200) return code;
    code = await preEnter();
    return code;
}

function init(url: string) {
    return new Promise<number>(resolve => {
        pomelo.off();
        pomelo.disconnect();
        let timer = setTimeout(function () {
            pomelo.off();
            pomelo.disconnect();
            resolve(ErrCodes.NET_TIMEOUT);
        }, TIME_OUT);
        function errCb(event: Event) {
            pomelo.off();
            pomelo.disconnect();
            clearTimeout(timer);
            resolve(ErrCodes.NET_INSTABILITY);
        }
        function cls(event: Event) {
            resolve(ErrCodes.NET_INSTABILITY);
        }
        pomelo.once("io-error", errCb);

        let log = (s: string) => {
            cc.log("pomolo init log = " + s);
        }
        pomelo.init({ host: url }, log, () => {
            clearTimeout(timer);
            window.pomelo.off("io-error", errCb);
            pomelo.once("close", cls);
            registerPomelo();
            resolve(200)
        });
    });
}

function preEnter() {
    return new Promise<number>(async resolve => {
        let timer = setTimeout(function () {
            resolve(ErrCodes.NET_TIMEOUT);
        }, TIME_OUT)
        function cls(event: Event) {
            resolve(ErrCodes.NET_INSTABILITY);
        }
        let c = Math.random().toFixed(8);
        let data = await request("conn.connHandler.prepare", { c: c });
        pomelo.off("close", cls);
        clearTimeout(timer);
        if (data.code !== 200 || !data.s) return resolve(data.code);
        enc_iv = md5(MASK + c + data.s).toLowerCase().substr(0, 16);
        resolve(200);
    });
}

/**
 * 链接enter
 * @param loginInfo
 */
function connEntry(loginInfo: string) {
    return new Promise(async (resolve: (ret: number) => void) => {
        function cls(event: Event) {
            resolve(ErrCodes.NET_INSTABILITY);
        }
        cc.log('connEntry loginInfo = ' + loginInfo);

        pomelo.once("close", cls);
        let enc = encrypt(loginInfo, KEY, enc_iv)
        let data = await request("conn.connHandler.enter", { info: enc });
        pomelo.off("close", cls);

        if (data.code === 200 && data.result) {
            let dec: { token: string, updateInfo: gameIface.ShowPackageInfo } = toj(decrypt(data.result, KEY, enc_iv));
            let info = dec.updateInfo;
            if (dec && dec.token && dec.token !== "undefined")
                localStorage.setItem(ItemNames.token, dec.token);
            if (info && info.isUpdate === 1) {//需要提示
                g.hallVal.showShopPackage = true;
                g.needIsUpdate = info.isUpdate
                g.updateTitel = info.title
                g.updateContent = info.content
                g.updateUrl = info.url
                g.iosDesUrl = info.desUrl
            }
        }
        resolve(data.code);
    });
}

/**
 * AES加解密
 * @param data
 * @param key
 * @param iv
 */
function encrypt(data: string, key: number[], iv: string)
function encrypt(data: string, key: number[], iv: number[])
function encrypt(data: string, key: number[], iv: number[] | string) {
    if (typeof iv === 'string') iv = aesjs.utils.utf8.toBytes(iv)
    let bytes = aesjs.utils.utf8.toBytes(data)
    bytes = aesjs.padding.pkcs7.pad(bytes)

    let cipher = new aesjs.ModeOfOperation.cbc(key, iv)
    return aesjs.utils.hex.fromBytes(cipher.encrypt(bytes)) + ""
}

function decrypt(data: string, key: number[], iv: string)
function decrypt(data: string, key: number[], iv: number[])
function decrypt(data: string, key: number[], iv: number[] | string) {
    if (typeof iv === 'string') iv = aesjs.utils.utf8.toBytes(iv)
    let encryptedBytes = aesjs.utils.hex.toBytes(data)
    let aesCbc = new aesjs.ModeOfOperation.cbc(key, iv)
    let decryptedBytes = aesCbc.decrypt(encryptedBytes)
    let paddNum = decryptedBytes[decryptedBytes.length - 1]
    decryptedBytes = decryptedBytes.slice(0, decryptedBytes.length - paddNum)
    return aesjs.utils.utf8.fromBytes(decryptedBytes) + ""
}

function request(route: "conn.connHandler.prepare", msg: pc.ConnConnHandlerPrepare): Promise<ps.ConnConnHandlerPrepare>
function request(route: "conn.connHandler.enter", msg: pc.ConnConnHandlerEnter): Promise<ps.ConnConnHandlerEnter>

function request(route: "auth.authHandler.sendLoginVerifyCode", msg: pc.AuthAuthHandlerLoginCode): Promise<ps.AuthAuthHandlerLoginCode>

function request(route: "hall.hallHandler.getIpList"): Promise<ps.HallHallHandlerGetIpList>
function request(route: "hall.hallHandler.enter"): Promise<ps.HallHallHandlerEnter>
function request(route: 'hall.hallHandler.getWeb'): Promise<ps.HallHallHandlerGetWeb>
function request(route: 'hall.hallHandler.getAds'): Promise<ps.HallHallHandlerGetAds>
function request(route: 'hall.hallHandler.getBulletin', msg: pc.HallHallHandlerGetBulletin): Promise<ps.HallHallHandlerGetBulletin>
function request(route: 'hall.hallHandler.getBulletinTitle'): Promise<ps.HallHallHandlerGetBulletinTitle>
function request(route: 'hall.hallHandler.leaveGame'): Promise<ps.HallHallHandlerLeaveGame>
function request(route: 'hall.hallHandler.enterGame'): Promise<ps.HallHallHandlerEnterGame>
function request(route: 'hall.hallHandler.getNewbieBonus'): Promise<ps.HallHallHandlerGetNewbieBonus>
function request(route: 'hall.hallHandler.getBindCode', msg: pc.HallHallHandlerGetBindCode): Promise<ps.HallHallHandlerGetBindCode>
function request(route: 'hall.hallHandler.bind', msg: pc.HallHallHandlerBind): Promise<ps.HallHallHandlerBind>
function request(route: 'hall.hallHandler.getChgPwdCode'): Promise<ps.HallHallHandlerGetChgPwdCode>
function request(route: 'hall.hallHandler.chgPwd', msg: pc.HallHallHandlerChgPwd): Promise<ps.HallHallHandlerChgPwd>
function request(route: "hall.hallHandler.getPopularize"): Promise<ps.HallHallHandlerGetPopularize>

//vip特权信息
function request(route: 'hall.hallHandler.receiveGift', msg: pc.HallHallHanlderReceiveGift): Promise<ps.HallHallHandlerReceiveGift>
function request(route: 'hall.hallHandler.getUserVipInfo'): Promise<ps.HallHallHandlerGetUserVipInfo>

function request(route: 'hall.eventHandler.getEvents'): Promise<ps.HallEventHandlerGetEvents>
function request(route: 'event.eventHandler.getEventReward', msg: pc.HallEventHandlerChkChannel): Promise<ps.HallEventHandlerChkChannel>
function request(route: 'event.eventHandler.getPrize', msg: pc.HallEventHandlerGetCode): Promise<ps.HallEventHandlerGetCode>

function request(route: 'hall.roomHandler.getYardList', msg: pc.HallRoomHandlerGetYardList): Promise<ps.HallRoomHandlerGetYardList>
function request(route: 'hall.roomHandler.join', msg: pc.HallRoomHandlerJoin): Promise<ps.HallRoomHandlerJoin>
function request(route: 'hall.roomHandler.chgRoom'): Promise<ps.HallRoomHandlerChgRoom>

function request(route: 'hall.csHandler.getFaq'): Promise<ps.HallCsHandlerGetFaq>
function request(route: 'event.eventHandler.checkEventState'): Promise<ps.HallCsHandlerGetFaq>
function request(route: 'hall.csHandler.submit', msg: pc.HallCsHandlerSubmit): Promise<ps.HallCsHandlerSubmit>
function request(route: 'hall.csHandler.read', msg: pc.HallCsHandlerRead): Promise<ps.HallCsHandlerRead>
function request(route: 'hall.csHandler.getQuestions', msg: pc.HallCsHandlerGetQuestions): Promise<ps.HallCsHandlerGetQuestions>
function request(route: 'hall.csHandler.setComment', msg: pc.HallCsHandlerSetComment): Promise<ps.HallCsHandlerSetComment>
function request(route: 'hall.csHandler.showRechargeQuestion'): Promise<ps.HallCsHandlerShowRechargeQuestion>
function request(route: 'hall.csHandler.getQuestionOrderInfo'): Promise<ps.HallCsHandlerGetQuestionOrderInfo>
function request(route: 'hall.csHandler.csUrlRequest', msg: pc.HallCsHandlerCsUrlRequest): Promise<ps.HallCsHandlerCsUrlRequest>

function request(route: 'hall.mailHandler.getMails', msg: pc.HallMailHandlerGetMails): Promise<ps.HallMailHandlerGetMails>
function request(route: 'hall.mailHandler.readAll', msg: pc.requreReadAll): Promise<ps.recevieReadAll>

function request(route: 'event.eventHandler.getRedEnvelopeInfo', msg: ps.reqRedEnvelopeInfo): Promise<getRedEnvelopeInfo>
function request(route: 'event.eventHandler.receiveRedEnvelope', msg: ps.reqRedEnvelopeInfo): Promise<receiveRedEnvelope>

function request(route: 'hall.mailHandler.deleteRead', msg: pc.requreReadAll): Promise<ps.recevieReadAll>
function request(route: 'hall.mailHandler.checkNew'): Promise<ps.HallMailHandlerCheckNew>
function request(route: 'hall.mailHandler.delete', msg: pc.HallMailHandlerDelete): Promise<ps.HallMailHandlerDelete>

function request(route: 'hall.bankHandler.enter'): Promise<ps.HallBankHandlerEnter>
function request(route: 'hall.bankHandler.getChgPwdCode'): Promise<ps.HallBankHandlerGetChgPwdCode>
function request(route: 'hall.bankHandler.chgPwd', msg: pc.HallBankHandlerChgPwd): Promise<ps.HallBankHandlerChgPwd>
function request(route: 'hall.bankHandler.saveMoney', msg: pc.HallBankHandlerSaveMoney): Promise<ps.HallBankHandlerSaveMoney>
function request(route: 'hall.bankHandler.getMoney', msg: pc.HallBankHandlerGetMoney): Promise<ps.HallBankHandlerGetMoney>

function request(route: 'hall.userHandler.chgName', msg: pc.HallUserHandlerChgName): Promise<ps.HallUserHandlerChgName>
function request(route: 'hall.userHandler.getDictionary', msg: pc.HallUserHandlerGetDictionary): Promise<ps.HallUserHandlerGetDictionary>

function request(route: 'hall.billHandler.getAgent', msg: pc.HallBillHandlerGetAgent): Promise<ps.HallBillHandlerGetAgent>
function request(route: 'hall.billHandler.getVipData', msg: pc.HallBillHandlerGetVipInfo): Promise<ps.HallBillHandlerGetVipInfo>
function request(route: 'hall.billHandler.modifyWithdrawAccount', msg: pc.HallBillHandlerModifyWithdrawAccount): Promise<ps.HallBillHandlerModifyWithdrawAccount>
function request(route: 'hall.billHandler.bindCard', msg: pc.HallBillHandlerBindCard): Promise<ps.HallBillHandlerBindCard>
function request(route: 'hall.billHandler.bindAli', msg: pc.HallBillHandlerBindAli): Promise<ps.HallBillHandlerBindAli>
function request(route: 'hall.billHandler.recharge', msg: pc.HallBillHandlerRecharge): Promise<ps.HallBillHandlerRecharge>
function request(route: 'hall.billHandler.getPayInfoByType', msg: pc.HallBillHandlerGetPayInfoByType): Promise<ps.HallBillHandlerGetPayInfoByType>
function request(route: 'hall.billHandler.payEnforce', msg: pc.HallBillHandlerPayEnforce): Promise<ps.HallBillHandlerPayEnforce>
function request(route: 'hall.billHandler.getOrderCnt', msg: pc.HallBillHandlerGetOrderCnt): Promise<ps.HallBillHandlerGetOrderCnt>
function request(route: 'hall.billHandler.getWithdrawAgents', msg: pc.HallBillHandlerGetWithdrawAgents): Promise<ps.HallBillHandlerGetWithdrawAgents>
function request(route: 'hall.billHandler.withdrawEnforce', msg: pc.HallBillHandlerWithdrawEnforce): Promise<ps.HallBillHandlerWithdrawEnforce>
function request(route: 'hall.billHandler.withdraw', msg: pc.HallBillHandlerWithdraw): Promise<ps.HallBillHandlerWithdraw>
function request(route: 'hall.billHandler.getWithdraws', msg: pc.HallBillHandlerGetWithdraws): Promise<ps.HallBillHandlerGetWithdraws>

function request(route: 'game.roomHandler.getRoomData'): Promise<ps.GameRoomHandlerGetRoomData>
function request(route: 'game.roomHandler.userReady'): Promise<ps.UserReady>

// 官方代充
function request(route: 'chat.clientHandler.openChat', msg: pc.ChatClientHandlerOpenChat): Promise<ps.ChatClientHandlerOpenChat>
function request(route: 'chat.clientHandler.getPayRecords', msg: pc.ChatClientHandlerGetPayRecords): Promise<ps.ChatClientHandlerGetPayRecords>
function request(route: 'chat.clientHandler.matchAgent', msg: pc.ChatClientHandlerMatchAgent): Promise<ps.ChatClientHandlerMatchAgent>
function request(route: 'chat.clientHandler.chgPayAct', msg: pc.ChatClientHandlerChgPayAct): Promise<ps.ChatClientHandlerChgPayAct>
function request(route: 'chat.clientHandler.sendMsg', msg: pc.ChatClientHandlerSendMsg): Promise<ps.ChatClientHandlerSendMsg>
function request(route: 'chat.clientHandler.setChatEval', msg: pc.ChatClientHandlerSetChatEval): Promise<ps.ChatClientHandlerSetChatEval>
function request(route: 'chat.clientHandler.getAgentHead', msg: pc.ChatClientHandlerGetAgentHead): Promise<ps.ChatClientHandlerGetAgentHead>
function request(route: 'chat.clientHandler.enter', msg: pc.ChatClientHandlerEnter): Promise<ps.ChatClientHandlerEnter>
function request(route: 'chat.clientHandler.reportPayError', msg: pc.ChatClientHandlerReportPayError): Promise<ps.ChatClientHandlerReportPayError>
function request(route: "chat.clientHandler.readChatMsg", msg: pc.ChatClientHandlerReadChatMsg): Promise<ps.ChatClientHandlerReadChatMsg>
function request(route: 'chat.clientHandler.getUnreadMsg'): Promise<ps.ChatClientHandlerGetUnreadMsg>

//  周返利
function request(route: 'event.eventHandler.getRebateEventInfo', msg: pc.EventEventHandlerGetRebateEventInfo): Promise<ps.EventEventHandlerGetRebateEventInfo>
function request(route: 'event.eventHandler.getWREventTimes', msg: pc.EventEventHandlerGetWREventTimes): Promise<ps.EventEventHandlerGetWREventTimes>
function request(route: 'event.eventHandler.receiveReward', msg: pc.EventEventHandlerReceiveReward): Promise<ps.EventEventHandlerReceiveReward>
function request(route: 'event.eventHandler.doWRLottery', msg: pc.EventEventHandlerDoWRLottery): Promise<ps.EventEventHandlerDoWRLottery>
function request(route: 'event.eventHandler.mergeFragment', msg: pc.EventEventHandlerMergeFragment): Promise<ps.EventEventHandlerMergeFragment>
function request(route: 'event.eventHandler.receiveRebate', msg: pc.EventEventHandlerReceiveRebate): Promise<ps.EventEventHandlerReceiveRebate>
function request(route: 'event.eventHandler.refreshEventTask', msg: pc.EventEventHandlerRefreshEventTask): Promise<ps.EventEventHandlerRefreshEventTask>

//国庆活动
function request(route: 'event.eventHandler.getLotteryEventInfo', msg: pc.EventEventHandlerGetLotteryEventInfo): Promise<ps.EventEventHandlerGetLotteryEventInfo>

// 进去IM
function request(route: 'event.eventHandler.enterIM'): Promise<ps.HallHallHandlerEnterIM>
// 退出IM
function request(route: 'hall.hallHandler.leaveIM'): Promise<ps.HallHallHandlerEnterIM>
//进入视讯
function request(route: 'event.eventHandler.enterDGGame'): Promise<ps.EventEventHandlerEnterDGGame>//玩家进入
//退出视讯
function request(route: 'event.eventHandler.leaveDGGame'): Promise<ps.EventEventHandlerLeaveDGGame>//玩家退出

function request(route: string, msg?: Object) {
    return new Promise(resolve => pomelo.request(route, msg, (data) => resolve(data)))
}
function notify(route: "hall.mailHandler.read", msg: pc.HallMailHandlerRead): void
function notify(route: "hall.userHandler.chgAvatar", msg: pc.HallUserHandlerChgAvatar): void
function notify(route: 'hall.userHandler.chgAvatarFrame', msg: pc.HallUserHandlerChgAvatarFrame)

// 经典牛牛
function notify(route: "game.jdnnHandler.loadGameInfo", msg: pc.GameJdnnHandlerLoadGameInfo): void
function notify(route: "game.jdnnHandler.doBet", msg: pc.GameJdnnHandlerDoBet): void
function notify(route: "game.jdnnHandler.doDealer", msg: pc.GameJdnnHandlerDoDealer): void
function notify(route: "game.jdnnHandler.doHandout", msg: pc.GameJdnnHandlerDoHandout): void
// 抢庄牛牛
function notify(route: "game.qznnHandler.loadGameInfo", msg: pc.GameQznnHandlerLoadGameInfo): void
function notify(route: "game.qznnHandler.doBet", msg: pc.GameQznnHandlerDoBet): void
function notify(route: "game.qznnHandler.doDealer", msg: pc.GameQznnHandlerDoDealer): void
function notify(route: "game.qznnHandler.doHandout", msg: pc.GameQznnHandlerDoHandout): void
// 百人牛牛
function notify(route: "game.brnnHandler.loadGameInfo", msg: pc.GameBrnnHandlerLoadGameInfo): void
function notify(route: "game.brnnHandler.doDealer", msg: pc.GameBrnnHandlerDoDealer): void
function notify(route: "game.brnnHandler.quitDealer", msg: pc.GameBrnnHandlerQuitDealer): void
function notify(route: "game.brnnHandler.doBet", msg: pc.GameBrnnHandlerDoBet): void
function notify(route: "game.brnnHandler.roomHistory", msg: pc.GameBrnnHandlerRoomHistory): void
function notify(route: "game.brnnHandler.playerHistory", msg: pc.GameBrnnHandlerPlayerHistory): void
function notify(route: "game.brnnHandler.dealerList", msg: pc.GameBrnnHandlerDealerList): void

function notify(route: "game.hhHandler.loadGameInfo", msg: pc.GameHhHandlerLoadGameInfo): void
function notify(route: "game.hhHandler.doBets", msg: pc.GameHhHandlerDoBets): void

function notify(route: "game.lhHandler.loadGameInfo", msg: pc.GameLhHandlerLoadGameInfo): void
function notify(route: "game.lhHandler.doBets", msg: pc.GameLhHandlerDoBets): void

//二八杠
function notify(route: "game.ebgHandler.doDealer", msg: pc.GameEbgHandlerDoDealer): void
function notify(route: "game.ebgHandler.quitDealer", msg: pc.GameEbgHandlerQuitDealer): void
function notify(route: "game.ebgHandler.doBet", msg: pc.GameEbgHandlerDoBet): void
function notify(route: "game.ebgHandler.roomHistory", msg: pc.GameEbgHandlerRoomHistory): void
function notify(route: "game.ebgHandler.playerHistory", msg: pc.GameEbgHandlerPlayerHistory): void
function notify(route: "game.ebgHandler.dealerList", msg: pc.GameEbgHandlerDealerList): void
function notify(route: "game.ebgHandler.loadGameInfo", msg: pc.GameEbgHandlerLoadGameInfo): void

// 炸金花
function notify(route: "game.jhHandler.showCards", msg: pc.GameJhHandlerShowCards): void
function notify(route: "game.jhHandler.discard", msg: pc.GameJhHandlerDiscard): void
function notify(route: "game.jhHandler.allIn", msg: pc.GameJhHandlerAllIn): void
function notify(route: "game.jhHandler.challenge", msg: pc.GameJhHandlerChallenge): void
function notify(route: "game.jhHandler.doBet", msg: pc.GameJhHandlerDoBet): void
function notify(route: "game.jhHandler.faceUp", msg: pc.GameJhHandlerFaceUp): void
// 捕鱼
function notify(route: "game.byHandler.fire", msg: pc.GameByHandlerFire): void
function notify(route: "game.byHandler.hit", msg: pc.GameByHandlerHit): void
function notify(route: "game.byHandler.automatic", msg: pc.GameByHandlerAutomatic): void
function notify(route: "game.byHandler.bulletRatio", msg: pc.GameByHandlerBulletRatio): void
function notify(route: "game.byHandler.lock", msg: pc.GameByHandlerLock): void
function notify(route: "game.byHandler.bulletStyle", msg: pc.GameByHandlerBulletStyle): void
function notify(route: "game.byHandler.robotFishInfo", msg: pc.GameByHandlerRobotFishInfo): void
function notify(route: "game.byHandler.lockTargetFishInfo", msg: pc.GameByHandlerLockTargetFishInfo): void
// 斗地主
function notify(route: "game.ddzHandler.loadGameInfo", msg: pc.GameDdzHandlerLoadGameInfo): void
function notify(route: "game.ddzHandler.JiaoFen", msg: pc.GameDdzHandlerJiaoFen);
function notify(route: "game.ddzHandler.addMulti", msg: pc.GameDdzHandlerAddMulti);
function notify(route: "game.ddzHandler.playCards", msg: pc.GameDdzHandlerPlayCards);
function notify(route: "game.ddzHandler.noPlay", msg: pc.GameDdzHandlerNoPlay);
function notify(route: "game.ddzHandler.hostedChg", msg: pc.GameDdzHandlerHostedChg);
// 跑得快
function notify(route: "game.pdkHandler.loadGameInfo", msg: pc.GamePdkHandlerLoadGameInfo): void
function notify(route: "game.pdkHandler.playCards", msg: pc.GamePdkHandlerPlayCards);
function notify(route: "game.pdkHandler.noPlay", msg: pc.GamePdkHandlerNoPlay);
function notify(route: "game.pdkHandler.auto", msg: pc.GamePdkHandlerAuto);
// 麻将
function notify(route: "game.ermjHandler.playTile", msg: pc.GameErmjHandlerPlayTile): void
function notify(route: "game.ermjHandler.chi", msg: pc.GameErmjHandlerChi): void
function notify(route: "game.ermjHandler.peng"): void
function notify(route: "game.ermjHandler.gang", msg: pc.GameErmjHandlerGang): void
function notify(route: "game.ermjHandler.hu"): void
function notify(route: "game.ermjHandler.pass"): void
// 德州
function notify(route: "game.dzpkHandler.userRaise", msg: pc.GameDzpkHandlerUserRaise);
function notify(route: "game.dzpkHandler.userCheck", msg: pc.GameDzpkHandlerUserCheck);
function notify(route: "game.dzpkHandler.userFold", msg: pc.GameDzpkHandlerUserFold);
function notify(route: "game.dzpkHandler.userFollow", msg: pc.GameDzpkHandlerUserFollow);
function notify(route: "game.dzpkHandler.userAllIn", msg: pc.GameDzpkHandlerUserAllIn);
// // 红包扫雷
function notify(route: "game.qhbHandler.baoHongBao", msg: pc.GameQhbHandlerBaoHongBao);
function notify(route: "game.qhbHandler.grabHongBao", msg: pc.GameQhbHandlerGrabHongBao);
function notify(route: "game.qhbHandler.loadGameInfo", msg: pc.GameQhbHandlerLoadGameInfo): void
function notify(route: "game.qhbHandler.getHongBaoList", msg: pc.GameQhbHandlerGetHongBaoList);
// 红包扫雷
function notify(route: "game.hbslHandler.baoHongBao", msg: pc.GameHbslHandlerBaoHongBao);
function notify(route: "game.hbslHandler.grabHongBao", msg: pc.GameHbslHandlerGrabHongBao);
function notify(route: "game.hbslHandler.loadGameInfo", msg: pc.GameQhbHandlerLoadGameInfo): void
// function notify(route: "game.hbslHandler.getHongBaoList", msg: pc.GameQhbHandlerGetHongBaoList);
function notify(route: "game.hbslHandler.autoGrab", msg: pc.GameHbslHandlerAutoGrab);
function notify(route: "game.hbslHandler.cancelAutoGrab", msg: pc.GameHbslHandlerCancelAutoGrab);
// 多福多财
function notify(route: "game.dfdcHandler.loadGameInfo", msg: pc.GameDfdcHandlerLoadGameInfo): void;
function notify(route: "game.dfdcHandler.start", msg: pc.GameDfdcHandlerStart);
function notify(route: "game.dfdcHandler.getFreeInfo", msg: pc.GameDfdcHandlerGetFreeInfo);
function notify(route: "game.dfdcHandler.getJackPot", msg: pc.GameDfdcHandlerGetJackPot);
function notify(route: "game.dfdcHandler.getJackPotHistory", msg: pc.GameDfdcHandlerGetJackPotHistory);
function notify(route: "game.dfdcHandler.openEgg", msg: pc.GameDfdcHandlerOpenEgg);

function notify(route: 'hall.billHandler.recharge', msg: pc.HallBillHandlerRecharge);
//奔驰宝马
function notify(route: "game.bcbmHandler.doBets", msg: pc.GameHhHandlerDoBets): void
function notify(route: "game.bcbmHandler.dupBets", msg: {}): void
//飞禽走兽
function notify(route: 'game.fqzsHandler.loadGameInfo', msg: pc.GameFqzsHandlerLoadGameInfo);
function notify(route: 'game.fqzsHandler.doBet', msg: pc.GameFqzsHandlerDoBet);
function notify(route: 'game.fqzsHandler.dupBet', msg: pc.GameFqzsHandlerDupBet);

function notify(route: string, msg?: Object): void {
    return pomelo.notify(route, msg)
}

function on(ev: string, fn: Function) {
    return pomelo.on(ev, fn)
}

function off()
function off(ev: string)
function off(ev?: string, fn?: Function) {
    return pomelo.off(ev, fn)
}