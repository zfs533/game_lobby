declare namespace pc {
    interface HallHallHandlerEnterGame {
    }
    interface HallMailHandlerGetMails {
        page: number;
        type: number;
    }
    interface requreReadAll {
        type: number;
    }

    interface GameBrnnHandlerLoadGameInfo {
    }
    interface ChatClientHandlerAddAgent {
        aUid: number;
    }
    interface GameErmjHandlerPlayTile {
        tile: number;
        ting: number;
    }
    interface HallRoomHandlerChgRoom {
    }
    interface ChatClientHandlerGetPay {
    }
    interface HallBillHandlerModifyWithdrawAccount {
        type: number;
        account: string;
        name: string;
        creditCard?: string;
        bankPwd: string;
    }
    interface GameLhHandlerDoBets {
        area: number;
        bets: number;
    }
    interface HallHallHandlerChgPwd {
        code: string;
        pwd: string;
    }
    interface GameErmjHandlerPeng {
    }
    interface HallBillHandlerBindAli {
        name: string;
        act: string;
    }
    interface GameJdnnHandlerDoDealer {
        dealerPoint: number;
    }
    interface HallHallHandlerGetWeb {
    }
    interface GameBrnnHandlerDoBet {
        area: number;
        bets: string;
    }
    interface HallMailHandlerRead {
        id: string;
    }
    interface ChatAgentHandlerActiveGreetCfg {
        active: number;
        greet?: string;
    }
    interface HallCsHandlerSetComment {
        id: string;
        comment: number;
    }
    interface GameByHandlerLock {
        fishId?: number;
        massId?: number;
        on: number;
    }
    interface EventEventHandlerCloseLottery {
        actId: number;
    }
    interface HallBankHandlerGetMoney {
        money: string;
    }
    interface ChatClientHandlerReadChatMsg {
        chatId: string;
    }
    interface GameBrnnHandlerDealerList {
    }
    interface GameErmjHandlerChi {
        tile: number;
    }
    interface HallEventHandlerGetCode {
        actId: number;
        phaseId: number;
    }
    interface GameBrnnHandlerDoDealer {
    }
    interface ChatClientHandlerMatchAgent {
    }
    interface HallBillHandlerWithdraw {
        money: string;
        deviceType: string;
        pwd: string;
        withdrawType: number;
        vipId?: number;
    }
    interface GameEbgHandlerRoomHistory {
    }
    interface GameByHandlerAutomatic {
        angle?: number;
        on: number;
    }
    interface ChatClientHandlerGetPlatOrder {
        traderId: string;
        playerId: string;
        proof: string;
        chatId: string;
        type: number;
    }
    interface GameByHandlerLoadGameInfo {
    }
    interface EventEventHandlerGetuserEventTaskInfo {
        actId: number;
    }
    interface GameJhHandlerDoBet {
        bets: string;
        type: number;
    }
    interface ChatAgentHandlerCloseChat {
        chatId: string;
        remarks?: string;
    }
    interface GameByHandlerHit {
        hitInfo: number;
    }
    interface GameQznnHandlerDoHandout {
    }
    interface GameJhHandlerShowCards {
    }
    interface HallRoomHandlerJoin {
        gid: string;
        mid: string;
    }
    interface GamePdkHandlerAuto {
    }
    interface HallBillHandlerGetWithdrawAgents {
    }
    interface GameQznnHandlerDoBet {
        betPoint: number;
    }
    interface GameErmjHandlerPass {
    }
    interface GameQhbHandlerLoadGameInfo {
    }
    interface ChatAgentHandlerGetGreetCfg {
    }
    interface HallCsHandlerRead {
        id: string;
    }
    interface HallUserHandlerSetBirthday {
        birthday: string;
    }
    interface HallCsHandlerGetQuestions {
        page: number;
    }
    interface HallHallHandlerGetPopularize {
    }
    interface GameJdnnHandlerDoBet {
        betPoint: number;
    }
    interface GameEbgHandlerDealerList {
    }
    interface HallEventHandlerChkChannel {
        actId: number;
    }
    interface GameDzpkHandlerUserRaise {
        bets: string;
    }
    interface EventEventHandlerMergeFragment {
        actId: number;
        eventGoodsId: number;
    }
    interface ChatClientHandlerClientMsgIsRead {
        _id: string;
        aUid: number;
    }
    interface GameDdzHandlerNoPlay {
    }
    interface ChatClientHandlerEnter {
    }
    interface ChatClientHandlerRecharge {
        aUid: number;
        gold: number;
    }
    interface ChatClientHandlerCloseOrder {
        chatId: string;
    }
    interface EventEventHandlerRefreshEventTask {
        actId: number;
    }
    interface HallBillHandlerGetWithdraws {
        page: number;
        size: number;
    }
    interface ChatClientHandlerReportPayError {
        chatId: string;
        pay: string;
    }
    interface GameEbgHandlerQuitDealer {
    }
    interface GameDdzHandlerPlayCards {
        cards?: number[];
        shape: number;
    }
    interface ChatClientHandlerGetPayRecords {
        payType: number;
        page: number;
        pageCnt: number;
    }
    interface GameJhHandlerFaceUp {
    }
    interface HallRoomHandlerGetYardList {
        gid: string;
    }
    interface ChatAgentHandlerGetContact {
    }
    interface HallBillHandlerBindCard {
        bankCardNumber: string;
        bankCardRealName: string;
        bankOfCreditCard: string;
    }
    interface HallBankHandlerChgPwd {
        code: string;
        pwd: string;
    }
    interface GameHhHandlerDoBets {
        area: number;
        bets: number;
    }
    interface HallHallHandlerGetBulletinTitle {
    }
    interface HallUserHandlerChgGender {
        gender: number;
    }
    interface AuthAuthHandlerLoginCode {
        act: string;
        pid: string;
    }
    interface EventEventHandlerCheckEventState {
    }
    interface HallBillHandlerPayEnforce {
    }
    interface GameDdzHandlerJiaoFen {
        point: number;
    }
    interface ChatAgentHandlerGetPayAct {
        act?: string;
        name?: string;
        type?: string;
        pageCnt?: number;
        page?: number;
    }
    interface HallEventHandlerGetEvents {
    }
    interface GameErmjHandlerHu {
    }
    interface GameEbgHandlerPlayerHistory {
    }
    interface EventEventHandlerReceiveRebate {
        actId: number;
    }
    interface HallHallHandlerGetUserVipInfo {
    }
    interface HallBillHandlerGetBankCardInfo {
    }
    interface HallUserHandlerChgAvatar {
        avatar: number;
    }
    interface ChatAgentHandlerLeave {
    }
    interface ChatClientHandlerOrderTrack {
        page: number;
    }
    interface HallHallHandlerGetBindCode {
        act: string;
    }
    interface ChatAgentHandlerEnter {
    }
    interface ChatAgentHandlerGetBlackUserList {
        uid?: number;
        pageCnt?: number;
        page?: number;
    }
    interface EventEventHandlerDoLottery {
        actId: number;
    }
    interface EventEventHandlerGetEventReward {
        actId: number;
    }
    interface GamePdkHandlerPlayCards {
        cards?: number[];
    }
    interface ConnectorEntryHandlerAgentEnter {
        token: string;
    }
    interface ChatAgentHandlerAddPayAct {
        type: string;
        act?: string;
        name?: string;
        bank?: string;
        qrCode?: string;
        feeRate?: string;
        content?: string;
    }
    interface HallCsHandlerGetQuestionOrderInfo {
    }
    interface GameErmjHandlerGang {
        tile: number;
    }
    interface GameHhHandlerLoadGameInfo {
    }
    interface GameByHandlerRobotFishInfo_FishInfo {
        fishId: number;
        massId?: number;
    }
    interface GameByHandlerRobotFishInfo {
        fishInfo?: GameByHandlerRobotFishInfo_FishInfo[];
    }
    interface GamePdkHandlerLoadGameInfo {
    }
    interface GameEbgHandlerDoDealer {
    }
    interface HallHallHandlerEnter {
    }
    interface ChatAgentHandlerGetOnlineChats {
    }
    interface HallHallHandlerGetNewbieBonus {
    }
    interface ChatClientHandlerDelAgent {
        aUid: number;
    }
    interface ChatAgentHandlerAgentHeadSet {
        head: string;
    }
    interface GameBrnnHandlerQuitDealer {
    }
    interface ChatClientHandlerSendMsg {
        aUid: number;
        chatId: string;
        type: number;
        content: string;
        playerId?: string;
    }
    interface HallBillHandlerPurchase {
        invoice: string;
        name?: string;
        money?: string;
        rmb?: string;
    }
    interface ChatAgentHandlerUpdatePayAct {
        payId: string;
        type?: string;
        act?: string;
        name?: string;
        bank?: string;
        qrCode?: string;
        feeRate?: string;
        content?: string;
    }
    interface EventEventHandlerGetEventLotteryTimes {
        actId: number;
    }
    interface HallUserHandlerChgName {
        name: string;
    }
    interface ChatAgentHandlerGetChatHistory {
        chatId: string;
        pageCnt?: number;
        page?: number;
    }
    interface ChatClientHandlerUpdateEvaluation {
        _id: string;
        aUid: number;
        evaluation: number;
    }
    interface ChatAgentHandlerGetValidOrders {
        orderId?: string;
        pageCnt?: number;
    }
    interface HallBillHandlerGetAgent {
    }
    interface GameDfdcHandlerOpenJackPot {
    }
    interface GameDzpkHandlerLoadGameInfo {
    }
    interface ChatAgentHandlerDeleteOrder {
        orderId: string;
    }
    interface GameJdnnHandlerLoadGameInfo {
    }
    interface ChatAgentHandlerDeleteContact {
    }
    interface GamePdkHandlerNoPlay {
    }
    interface HallCsHandlerCsUrlRequest {
        type: number;
    }
    interface ConnConnHandlerEnter {
        info: string;
    }
    interface HallBillHandlerGetVipInfo {
        page: number;
    }
    interface HallBillHandlerWithdrawEnforce {
    }
    interface ChatClientHandlerGetAgentHead {
        aUid: number;
    }
    interface GameJhHandlerLoadGameInfo {
    }
    interface GameQznnHandlerDoDealer {
        dealerPoint: number;
    }
    interface GameRoomHandlerGetRoomData {
    }
    interface HallCsHandlerGetFaq {
    }
    interface EventEventHandlerGetRebateEventInfo {
        actId: number;
    }
    interface ChatClientHandlerChgPayAct {
        chatId: string;
        type: string;
    }
    interface HallBankHandlerSaveMoney {
        money: string;
    }
    interface GameByHandlerBulletStyle {
        bulletStyle: number;
    }
    interface ChatAgentHandlerSendMsg {
        chatId: string;
        type: number;
        content: string;
    }
    interface HallCsHandlerSubmit {
        content: string;
        type: number;
    }
    interface GameDzpkHandlerUserFollow {
    }
    interface GameJhHandlerChallenge {
        coverPos: number;
    }
    interface EventEventHandlerGetWREventTimes {
        actId: number;
    }
    interface GameDdzHandlerHostedChg {
    }
    interface GameByHandlerFire {
        fireInfo: number;
    }
    interface GameByHandlerBulletRatio {
        ratio: number;
    }
    interface GameDfdcHandlerGetJackPotHistory {
        jackPotNum: number;
    }
    interface HallCsHandlerShowRechargeQuestion {
    }
    interface GameByHandlerLockTargetFishInfo_FishInfo {
        fishId: number;
        massId?: number;
    }
    interface GameByHandlerLockTargetFishInfo {
        fishInfo?: GameByHandlerLockTargetFishInfo_FishInfo[];
    }
    interface GameBrnnHandlerRoomHistory {
    }
    interface EventEventHandlerReceiveReward {
        actId: number;
        phaseId?: number;
    }
    interface GameDdzHandlerAddMulti {
        add: number;
    }
    interface GameJhHandlerAllIn {
        round: number;
    }
    interface HallHallHandlerBind {
        act: string;
        code: string;
        pwd: string;
    }
    interface EventEventHandlerGetLotteryEventInfo {
        actId: number;
    }
    interface ChatAgentHandlerDeletePayAct {
        payId: string;
    }
    interface GameDfdcHandlerGetFreeInfo {
    }
    interface GameEbgHandlerDoBet {
        area: number;
        bets: string;
    }
    interface EventEventHandlerGetPrize {
        actId: number;
        phaseId?: number;
    }
    interface ChatClientHandlerGetUnreadMsg {
    }
    interface GameDzpkHandlerUserCheck {
    }
    interface GameLhHandlerLoadGameInfo {
    }
    interface GameDzpkHandlerUserFold {
    }
    interface GameQhbHandlerBaoHongBao {
        money: string;
        boomNo: number;
    }
    interface GameErmjHandlerLoadGameInfo {
    }
    interface GameDfdcHandlerGetJackPot {
    }
    interface HallHallHanlderReceiveGift {
        giftId: number;
    }
    interface GameDdzHandlerLoadGameInfo {
    }
    interface GameDfdcHandlerLoadGameInfo {
    }
    interface HallBillHandlerGetOrderCnt {
    }
    interface ChatClientHandlerGetCommonAgent {
    }
    interface HallBillHandlerRecharge {
        billPrice: string;
        payType: string;
        deviceType: string;
        cardNumber?: string;
        cardPwd?: string;
        cardMainType?: string;
        cardSubType?: string;
        channel: string;
        useAsync?: number;
        isSmallAmt?: number;
    }
    interface ChatClientHandlerSetChatEval {
        aUid: number;
        orderId: string;
        score: string;
        scoreText: string;
    }
    interface GameQhbHandlerGrabHongBao {
    }
    interface ChatAgentHandlerSendPayAct {
        chatId: string;
        type: string;
    }
    interface ChatAgentHandlerCreateOrder {
        uid: number;
        chatId: string;
        proof: string;
    }
    interface HallHallHandlerLeaveGame {
    }
    interface HallUserHandlerChgAvatarFrame {
        avatarFrame: number;
    }
    interface HallUserHandlerGetDictionary {
    }
    interface GameEbgHandlerLoadGameInfo {
    }
    interface ChatAgentHandlerUpdateContact {
        accountType: string;
        accountId: string;
        agentName: string;
        qrCode?: string;
    }
    interface ConnConnHandlerPrepare {
        c: string;
    }
    interface GameQznnHandlerLoadGameInfo {
    }
    interface ChatClientHandlerOpenChat {
        aUid: number;
    }
    interface HallBankHandlerGetChgPwdCode {
    }
    interface GameJhHandlerDiscard {
        round: number;
    }
    interface GameDfdcHandlerOpenEgg {
        idx: number;
        openIcon: number;
    }
    interface HallHallHandlerGetIpList {
    }
    interface GameRoomHandlerUserReady {
    }
    interface HallBillHandlerGetIAPInfo {
        boundID: string;
    }
    interface ChatAgentHandlerGetUserOrders {
        uid: number;
    }
    interface HallBankHandlerEnter {
    }
    interface ChatClientHandlerLeave {
    }
    interface HallMailHandlerCheckNew {
    }
    interface HallBillHandlerGetPayInfoByType {
        type: string;
    }
    interface GameDzpkHandlerUserAllIn {
    }
    interface HallMailHandlerDelete {
        ids?: string[];
    }
    interface GameRoomHandlerStartGame {
    }
    interface HallHallHandlerGetChgPwdCode {
    }
    interface EventEventHandlerDoWRLottery {
        actId: number;
        lotteryType: number;
    }
    interface GameBrnnHandlerPlayerHistory {
    }
    interface HallHallHandlerGetBulletin {
        idx: number;
    }
    interface HallHallHandlerGetAds {
    }
    interface EventEventHandlerGetEventTimes {
        actId: number;
    }
    interface ChatAgentHandlerActivePayAct {
        payId: string;
        active: number;
    }
    interface ChatClientHandlerOrderInfo {
        _id: string;
    }
    interface GameDfdcHandlerStart {
        gameType: number;
        betLevel: string;
        betMultiple: string;
        doubleType: number;
    }
    interface GameJdnnHandlerDoHandout {
    }
    interface ChatAgentHandlerUpdateAgentState {
        state: number;
    }
    interface GameQhbHandlerGetHongBaoList {
    }
    interface EventEventHandlerGetEventConfig {
        actId: number;
    }
    interface ChatAgentHandlerUpdateBlackUser {
        uid: number;
        setBlack: number;
    }
    interface HallHallHandlerEnterIM {
    }

    interface GameFqzsHandlerLoadGameInfo {

    }
    interface GameFqzsHandlerDoBet {
        area: number;
        bet: number;
    }
    interface GameFqzsHandlerDupBet {
    }
    interface GameHbslHandlerGrabHongBao {
        area: number;
    }

    interface GameHbslHandlerLoadGameInfo {
    }

    interface GameHbslHandlerBaoHongBao {
        money: string;
        grabCount: number;
        hbCount: number;
        boomNo: number;
    }
    //自动抢红包路由
    interface GameHbslHandlerAutoGrab {
        minMoney: string;
        maxMoney: string;
        grabBoomNo?: number[];
    }

    interface GameHbslHandlerCancelAutoGrab {
    }


}
