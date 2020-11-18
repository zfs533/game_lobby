declare namespace ps {
    interface Where {
        gid?: string;
        mid?: string;
    }
    interface User {
        uid?: number;
        name?: string;
        avatar?: number;
        gender?: number;
        pos?: number;
        location?: string;
        bReady?: number;
        score?: number;
        money?: string;
        SSSAccount?: string;
        vip?: number;
        act?: string;
        bankCardNumber?: string;
        channel?: string;
        takeMoney?: string;
        avatarFrame?: number;
        vipLevel?: number;
        avatarBoxList?: number[];
    }
    interface HallHallHandlerEnterGame {
        code: number;
    }
    interface AddUserMoney {
        money: string;
    }
    interface ChgRoomSuc {
    }
    interface HallMailHandlerGetMails_Mail {
        _id: string;
        from: string;
        content: string;
        sendTime: number;
        bRead: number;
        type: number;
        title: string;
    }
    interface recevieReadAll {
        code: number;
    }
    interface HallMailHandlerGetMails {
        code: number;
        mails?: HallMailHandlerGetMails_Mail[];
    }
    interface Ermj_PlayerUpTile {
        pos: number;
        tile: number;
    }
    interface Ddz_GameInfo_UserInfo {
        pos: number;
        jiaoStatus?: number;
        addStatus: number;
        handCards?: number[];
        remainCount?: number;
        chgMoney?: string;
        money: string;
        tax?: string;
        totalMulti?: number;
        loc?: string;
        gender: number;
        hosted: number;
    }
    interface Ddz_GameInfo {
        status: number;
        leftTime: number;
        optPos?: number;
        cardsCounter?: number[];
        first?: number;
        lastCards?: number[];
        lastPos?: number;
        ddzCards?: number[];
        ddzPos?: number;
        users?: Ddz_GameInfo_UserInfo[];
    }
    interface Dfdc_DoLuckyInfo_ChangeIconInfo {
        row: number;
        col: number;
    }
    interface Dfdc_DoLuckyInfo {
        changeIconInfo?: Dfdc_DoLuckyInfo_ChangeIconInfo[];
    }
    interface Ebg_GameHistory_areaWin {
        area1: number;
        area2: number;
        area3: number;
    }
    interface Ebg_GameHistory {
        history?: Ebg_GameHistory_areaWin[];
    }
    interface HallRoomHandlerChgRoom {
        code: number;
    }
    interface Ebg_EnterBalance_Info {
        pos: number;
        chgMoney: string;
        tax: string;
        winCnt: number;
        totalBets: string;
    }
    interface Ebg_EnterBalance {
        player?: Ebg_EnterBalance_Info[];
        leftTime: number;
        status: number;
    }
    interface Ddz_NoBodyJiaoFen {
    }
    interface ChatClientHandlerGetPay {
        code: number;
        pays?: string[];
    }
    interface Dzpk_AppointDealer {
        smallPos: number;
        bigPos: number;
        smallBets: string;
        dealerPos: number;
        status: number;
    }
    interface ChatClientHandlerGetUnreadMsg_ChatMsg {
        chatId: string;
        type: number;
        content: string;
        createDate: number;
        aUid: number;
        uid: number;
        fromType: number;
        path?: string;
        read: number;
    }
    interface ChatClientHandlerGetUnreadMsg {
        code: number;
        chatMsgs?: ChatClientHandlerGetUnreadMsg_ChatMsg[];
    }
    interface HallBillHandlerModifyWithdrawAccount {
        code: number;
    }
    interface Brnn_GameInfo_PlayerInfo_areaBets {
        area: number;
        bets: string;
    }
    interface Brnn_GameInfo_PlayerInfo {
        pos: number;
        areaBets?: Brnn_GameInfo_PlayerInfo_areaBets[];
        winCnt: number;
        totalBets: string;
    }
    interface Brnn_GameInfo_AreaInfo {
        area: number;
        cards?: number[];
        totalBets?: string;
        bullType: number;
        isWin: number;
        boost: number;
    }
    interface Brnn_GameInfo {
        status: number;
        infos?: Brnn_GameInfo_AreaInfo[];
        dealerPos: number;
        curDealerCnt: number;
        leftTime: number;
        players?: Brnn_GameInfo_PlayerInfo[];
    }
    interface Dzpk_Check {
        pos: number;
    }
    interface Recharge_Info {
        lev: number;
        curExp?: string;
        limitExp?: string;
    }
    interface Recharge {
        money: string;
        vipInfo?: Recharge_Info;
    }
    interface HallHallHandlerChgPwd {
        code: number;
    }
    interface By_GameUserBulletRatio {
        pos: number;
        ratio: number;
    }
    interface Dzpk_InitTakeMoney {
        takeMoney: string;
    }
    interface Ermj_PlayerOutTile {
        pos: number;
        tile: number;
        isTing: number;
        otherTiles?: number[];
    }
    interface HallBillHandlerBindAli {
        code: number;
    }
    interface By_GameAutoMatic {
        pos: number;
        on: number;
        angle?: number;
    }
    interface Ebg_DealerList {
        poss?: number[];
        dealerCnt?: number;
    }
    interface Qhb_BaoHongBao_hbInfo {
        pos: number;
        money: string;
        boomNo: number;
    }
    interface Qhb_BaoHongBao {
        pos: number;
        hongBao: Qhb_BaoHongBao_hbInfo;
    }
    interface HallHallHandlerGetWeb {
        code: number;
        web?: string;
        qq?: string;
        wx?: string;
        rechargeQuestionUrl?: string;
        active?: number;
    }
    interface Ebg_DoBet {
        pos: number;
        area: number;
        bet: string;
    }
    interface ChatAgentHandlerAgentHeadSet {
        code: number;
        head?: string;
    }
    interface Qznn_DoDealer {
        pos: number;
        point: number;
    }
    interface Dfdc_DoBalance_WinIcon {
        icon: number;
        line: number;
    }
    interface Dfdc_DoBalance_JackPotInfo {
        duofu: string;
        duocai: string;
        duoxi: string;
        duoshou: string;
    }
    interface Dfdc_DoBalance_Infos {
        firstRow?: number[];
        secondRow?: number[];
        thirdRow?: number[];
    }
    interface Dfdc_DoBalance_FreeIcon {
        icon: number;
        cnt: number;
    }
    interface Dfdc_DoBalance {
        earnMoney: string;
        freeTime: number;
        lastBetLevel: string;
        payRate: string;
        winIcon?: Dfdc_DoBalance_WinIcon[];
        jackPot: Dfdc_DoBalance_JackPotInfo;
        bowlType: number;
        infos: Dfdc_DoBalance_Infos;
        lastBetMultiple: string;
        freeIcon: Dfdc_DoBalance_FreeIcon;
        diamondMultiple: number;
    }
    interface HallBillHandlerWithdrawEnforce_LocationWithdrawRule {
        withdrawA: number;
        withdrawB: number;
    }
    interface HallBillHandlerWithdrawEnforce {
        code: number;
        SSS?: number;
        bankCard?: number;
        agent?: number;
        rule?: HallBillHandlerWithdrawEnforce_LocationWithdrawRule;
        sssMinMoney?: string;
        sssMaxMoney?: string;
        bankCardMinMoney?: string;
        bankCardMaxMoney?: string;
        vip?: number;
        vipMinMoney?: string;
        vipMaxMoney?: string;
        bankWithdrawRate?: string;
        aliWithdrawRate?: string;
    }
    interface Ebg_CurBankerCnt {
        CardsOrg: number;
    }
    interface EventEventHandlerGetEventTimes {
        code: number;
        remainTimes?: number;
    }
    interface ChatClientHandlerChgPayAct_Chat_ChatMsg {
        msgId: string;
        aUid: number;
        uid: number;
        fromType: number;
        createDate: number;
        type: number;
        content: string;
    }
    interface ChatClientHandlerChgPayAct_Chat {
        chatId: string;
        msgs?: ChatClientHandlerChgPayAct_Chat_ChatMsg[];
    }
    interface ChatClientHandlerChgPayAct {
        code: number;
        chat?: ChatClientHandlerChgPayAct_Chat;
    }
    interface ChatAgentHandlerActiveGreetCfg {
        code: number;
    }
    interface Jh_GameInfo_uInfo {
        pos: number;
        totalBets: string;
        curMoney: string;
        isFaceUp: number;
        isAllin: number;
        handCards?: number[];
        cardType: number;
    }
    interface Jh_GameInfo {
        status: number;
        leftTime: number;
        curMinBets: string;
        totalBets: string;
        round: number;
        dealerPos: number;
        curOptPos?: number;
        player?: Jh_GameInfo_uInfo[];
        lastOpt?: number;
    }
    interface Ddz_JiaoFen {
        point: number;
        pos: number;
    }
    interface HallCsHandlerSetComment {
        code: number;
    }
    interface EventEventHandlerCloseLottery {
        code: number;
    }
    interface ChatClientHandlerReadChatMsg {
        code: number;
    }
    interface UpdateOwnLocation {
        location: string;
    }
    interface Dzpk_DealHandCard {
        handPai?: number[];
        status: number;
    }
    interface Ermj_PlayerPengTile {
        pos: number;
        type: number;
        tile: number;
    }
    interface HallEventHandlerGetCode {
        code: number;
    }
    interface Pdk_UsersPlayCards {
        pos: number;
        cards?: number[];
        shape: number;
    }
    interface Ebg_ChangeDealer {
        rPos: number;
        chgInfo?: number;
    }
    interface HasNewMail {
    }
    interface ChatClientHandlerMatchAgent_Agents_Pays {
        payFType?: string;
        payCTypes?: string[];
    }
    interface ChatClientHandlerMatchAgent_Agents {
        aUid: string;
        name: string;
        head?: string;
        score: string;
        scoreCount: number;
        pays?: ChatClientHandlerMatchAgent_Agents_Pays[];
        welcomeMsg?: string;
    }
    interface ChatClientHandlerMatchAgent {
        code: number;
        agents?: ChatClientHandlerMatchAgent_Agents[];
        type?: number;
        isReconect?: number;
        wsUrl?: string;
        fileServerUrl?: string;
        wssUrl?: string;
    }
    interface GameEnd {
        startKickTime?: number;
    }
    interface HallBillHandlerWithdraw {
        code: number;
        userMoney?: string;
        withdrawTimes?: number;
    }
    interface Dzpk_Fold {
        pos: number;
    }
    interface ChatClientHandlerGetPlatOrder {
        code: number;
        orderId?: string;
    }
    interface Lh_EnterDealCard {
        leftTime: number;
        status: number;
        cards?: number[];
    }
    interface BankMoney {
        bankMoney: string;
    }
    interface UserRecome {
        user: User;
    }
    interface ChatAgentHandlerCloseChat {
        code: number;
    }
    interface Qhb_ChangeStatus {
        status: number;
        time: number;
    }
    interface Ermj_TingNextTiles {
        nextTiles?: number[];
    }
    interface HallRoomHandlerJoin {
        code: number;
        where?: Where;
    }
    interface HallBillHandlerGetWithdrawAgents_Agent {
        name?: string;
        qq?: string;
        wx?: string;
        hot?: number;
    }
    interface HallBillHandlerGetWithdrawAgents {
        agents?: HallBillHandlerGetWithdrawAgents_Agent[];
    }
    interface Brnn_EnterBalance_Info {
        pos: number;
        chgMoney: string;
        tax: string;
        winCnt: number;
        totalBets: string;
    }
    interface Brnn_EnterBalance {
        player?: Brnn_EnterBalance_Info[];
        leftTime: number;
        status: number;
    }
    interface Qhb_GetHongBaoList_hbInfo {
        pos: number;
        money: string;
        boomNo: number;
    }
    interface Qhb_GetHongBaoList {
        pos: number;
        hongBaoList?: Qhb_GetHongBaoList_hbInfo[];
    }
    interface OpenChat_Msgs_Rcgs {
        recType: string;
        recStr: string;
    }
    interface OpenChat_Msgs {
        uid?: number;
        createDate?: number;
        msgType?: number;
        content?: string;
        img?: string;
        rcgTypes?: OpenChat_Msgs_Rcgs[];
        read?: number;
    }
    interface OpenChat {
        _id: string;
        aUid: number;
        aName: string;
        msgs?: OpenChat_Msgs[];
        evaluation: number;
        createDate: number;
        gender: number;
        avatar: number;
    }
    interface Jh_DealCards {
    }
    interface Ddz_EnterJiaoFen {
        leftTime: number;
        pos: number;
    }
    interface Ddz_EnterDouble {
        leftTime: number;
    }
    interface Dfdc_UserOpenEgg {
        openIcon: number;
        idx: number;
    }
    interface HallCsHandlerRead_Question {
        questionTime: number;
        question: string;
        answerTime?: number;
        answer?: string;
        comment?: number;
    }
    interface HallCsHandlerRead {
        code: number;
        question?: HallCsHandlerRead_Question;
    }
    interface HallUserHandlerSetBirthday {
        code: number;
    }
    interface ChatClientHandlerGetContact_Info {
        accountType: string;
        accountId: string;
        agentName: string;
        qrCode?: string;
    }
    interface ChatClientHandlerGetContact {
        code: number;
        isWhite?: number;
        info?: ChatClientHandlerGetContact_Info;
    }
    interface StartFreeTick {
        leftTime: number;
    }
    interface HallCsHandlerGetQuestions_Question {
        id: string;
        questionTime: number;
        answerTime?: number;
        comment?: number;
        read?: number;
    }
    interface HallCsHandlerGetQuestions {
        code: number;
        questions?: HallCsHandlerGetQuestions_Question[];
    }
    interface Jdnn_EnterBalance_Info {
        pos: number;
        job: number;
        dealerPnt: number;
        betPnt: number;
        chgMoney: string;
        tax: string;
        boost: number;
    }
    interface Jdnn_EnterBalance {
        player?: Jdnn_EnterBalance_Info[];
    }
    interface HallHallHandlerGetPopularize {
        code: number;
        wxs?: string[];
    }
    interface UserEnter {
        user: User;
    }
    interface Dfdc_JackPotInfo {
        duofu: string;
        duocai: string;
        duoxi: string;
        duoshou: string;
    }
    interface By_GameDeathMassive {
        deathMassive?: number[];
    }
    interface HallEventHandlerChkChannel_Info {
        recharge?: string;
        chgMoney?: string;
        betMoney?: string;
        taxMoney?: string;
        get?: number,
        phaseId?: number

    }
    interface HallEventHandlerChkChannel {
        code: number;
        st?: number;
        ed?: number;
        cfgCondition?: HallEventHandlerChkChannel_Info[];
        curCondition?: HallEventHandlerChkChannel_Info;
        get?: number;
    }
    interface SaveMoneyNotify {
        code: number;
        money?: string;
        bankMoney?: string;
    }
    interface Pdk_UsersNotPlay {
        pos: number;
    }
    interface Dfdc_JackPotHistory_WinnerInfo {
        uid: number;
        gender: number;
        avatar: number;
        ipLocation: string;
        winMoney: string;
        winDate: string;
    }
    interface Dfdc_JackPotHistory {
        winnerInfo?: Dfdc_JackPotHistory_WinnerInfo[];
    }
    interface Lh_GameInfo_PlayerInfo_areaBets {
        area: number;
        bets: string;
    }
    interface Lh_GameInfo_PlayerInfo {
        pos: number;
        areaBets?: Lh_GameInfo_PlayerInfo_areaBets[];
        winCnt: number;
        totalBets: string;
    }
    interface Lh_GameInfo_AreaInfo {
        area: number;
        totalBets?: string;
    }
    interface Lh_GameInfo {
        status: number;
        leftTime: number;
        infos?: Lh_GameInfo_AreaInfo[];
        players?: Lh_GameInfo_PlayerInfo[];
        cards?: number[];
        winArea: number;
        record?: number[];
    }
    interface StopKickTimer {
    }
    interface Dzpk_DealCards {
        cards?: number[];
        round: number;
        leftTime: number;
        status: number;
        pools?: number[];
    }
    interface Pdk_UserAuto {
        pos: number;
        isAuto: number;
    }
    interface Dzpk_DoBalance_UserInfo {
        pos: number;
        tax: string;
        chgMoney: string;
        userMoney: string;
        isWinner: number;
        cardType: number;
        maxCards?: number[];
        handCards?: number[];
        backMoney: string;
    }
    interface Dzpk_DoBalance {
        userInfo?: Dzpk_DoBalance_UserInfo[];
        pools?: number[];
    }
    interface EventEventHandlerMergeFragment_Info {
        eventGoodsId: number;
        type: number;
        skinTatterId: number;
        skinTatterCnt: number;
        avatarBoxTatterId: number;
        avatarBoxTatterCnt: number;
        tatterLotteryCnt: number;
    }
    interface EventEventHandlerMergeFragment {
        code: number;
        info?: EventEventHandlerMergeFragment_Info;
    }
    interface Dfdc_Bets {
        betLevel: string;
        betMultiple: string;
        success: number;
    }
    interface EventEventHandlerGetWREventTimes {
        code: number;
        remainTimes?: number;
    }
    interface Brnn_PlayerHistory_playerHistory {
        uid: number;
        startTime: string;
        win: string;
        tax: string;
    }
    interface Brnn_PlayerHistory {
        history?: Brnn_PlayerHistory_playerHistory[];
    }
    interface Brnn_DoBet {
        pos: number;
        area: number;
        bet: string;
    }
    interface Jdnn_DoHandout {
        pos: number;
        bullType: number;
        cards?: number[];
        boost: number;
    }
    interface Dzpk_Opt {
        pos: number;
        time: number;
        curRoundAddCnt: number;
    }
    interface ChatClientHandlerRecharge {
        code: number;
        time?: number;
    }
    interface ChatClientHandlerCloseOrder {
        code: number;
    }
    interface EventEventHandlerRefreshEventTask_Info {
        finishQuantity: string;
        status: number;
        quantity: string;
        name: string;
        activeScore: number;
    }
    interface EventEventHandlerRefreshEventTask {
        code: number;
        info?: EventEventHandlerRefreshEventTask_Info[];
        lastRefreshDate?: number;
        refreshTimes?: number;
    }
    interface HallBillHandlerGetWithdraws_Order {
        money: string;
        createTime: number;
        state: number;
        amount: string;
        type: number;
        status: number;
        SSSAccount?: string;
        SSSRealName?: string;
        bankCardNumber?: string;
        bankCardRealName?: string;
    }
    interface HallBillHandlerGetWithdraws {
        code: number;
        orders?: HallBillHandlerGetWithdraws_Order[];
    }
    interface Lh_DoBet {
        pos: number;
        area: number;
        bet: string;
    }
    interface Ddz_EnterPlayCards {
        leftTime: number;
        pos: number;
        first: number;
    }
    interface Qznn_GameInfo_Info {
        pos: number;
        job: number;
        dealerPnt: number;
        betPnt: number;
        isDealer: number;
        isbet: number;
        isHandouted: number;
        bullType?: number;
        cards?: number[];
    }
    interface Qznn_GameInfo {
        status: number;
        timer: number;
        playerInfo?: Qznn_GameInfo_Info[];
    }
    interface ChatClientHandlerReportPayError {
        code: number;
    }
    interface By_GameLock {
        pos: number;
        on: number;
        fishId?: number;
        massId?: number;
    }
    interface Dzpk_StatusChange {
        status: number;
        leftTime: number;
    }
    interface Dfdc_DoLuckyBalance_WinIcon {
        icon: number;
        lian: number;
    }
    interface Dfdc_DoLuckyBalance_JackPotInfo {
        duofu: string;
        duocai: string;
        duoxi: string;
        duoshou: string;
    }
    interface Dfdc_DoLuckyBalance_ChangeIconInfo {
        row: number;
        col: number;
    }
    interface Dfdc_DoLuckyBalance_Infos {
        firstRow?: number[];
        secondRow?: number[];
        thirdRow?: number[];
    }
    interface Dfdc_DoLuckyBalance {
        earnMoney: string;
        freeTime: number;
        lastBetLevel: string;
        payRate: string;
        winIcon?: Dfdc_DoLuckyBalance_WinIcon[];
        jackPot: Dfdc_DoLuckyBalance_JackPotInfo;
        bowlType: number;
        infos: Dfdc_DoLuckyBalance_Infos;
        lastBetMultiple: string;
        freeIcon: Dfdc_DoLuckyBalance_WinIcon;
    }
    interface ChatClientHandlerGetPayRecords_Chat {
        payType: string;
        aUid?: number;
        aName?: string;
        orderId: string;
        createDate?: string;
        finishDate?: string;
        money: string;
        state?: number;
    }
    interface ChatClientHandlerGetPayRecords {
        code: number;
        chats?: ChatClientHandlerGetPayRecords_Chat[];
    }
    interface HallBillHandlerSetWithdrawAccount {
        code: number;
    }
    interface HallRoomHandlerGetYardList_Match {
        id: string;
        idx: number;
        color: number;
        bets: string;
        minMoney: string;
        maxMoney: string;
        allInMaxMoney?: string;
        fanMaxLimit?: number;
        brnnMaxBoost?: number;
        byRatio?: number;
        maxBet?: number;
        takeMoney?: string;
        hongbaoCnt?: number;
        allowGrabMinMoney?: string;
        allowGrabMaxMoney?: string;
    }
    interface HallRoomHandlerGetYardList {
        code: number;
        matches?: HallRoomHandlerGetYardList_Match[];
    }
    interface TransferNotify_Info {
        lev: number;
        curExp?: string;
        limitExp?: string;
    }
    interface TransferNotify {
        money: string;
        bankMoney: string;
        vipInfo?: TransferNotify_Info;
    }
    interface Qznn_StatusChange {
        status: number;
        timer: number;
    }

    interface reqRedEnvelopeInfo {
        actId: number;
    }

    interface HallBillHandlerBindCard {
        code: number;
    }
    interface HallBankHandlerChgPwd {
        code: number;
    }
    interface HallHallHandlerGetBulletinTitle_BulletinTitle {
        idx: number;
        title: string;
    }
    interface HallHallHandlerGetBulletinTitle {
        code: number;
        titles?: HallHallHandlerGetBulletinTitle_BulletinTitle[];
    }
    interface Dfdc_EggInfo {
        eggIcons?: number[];
        winEggIcon: number;
        eggTime: number;
    }
    interface AgentLost {
        code: number;
    }
    interface AuthAuthHandlerLoginCode {
        code: number;
    }
    interface ChatAgentHandlerGetGreetCfg {
        code: number;
        active?: number;
        greet?: string;
    }
    interface Dzpk_InitUsers_UserInfo {
        pos: number;
        money: string;
        gender: number;
        loc: string;
        avatar: number;
        avatarFrame?: number;
        vipLevel?: number;
    }
    interface Dzpk_InitUsers {
        users?: Dzpk_InitUsers_UserInfo[];
    }
    interface Hh_DoBet {
        pos: number;
        area: number;
        bet: string;
    }
    interface HallBillHandlerPayEnforce_LocationRechargeRule {
        rechargeOnline: number;
        rechargePerson: number;
        rechargeAgent: number;
    }
    interface HallBillHandlerPayEnforce_RechargeEnforce {
        srTimesLLmit: number;
        srTotalLLimit: string;
        srOnlyShowAgentRate: string;
        srConNoBillTimes: number;
        srDecRate: string;
        saOnlyShowAgentRate: string;
        saConNoBillTimes: number;
        saDecRate: string;
        perACIncRate: string;
        limitOtherChannelMaxMoney: number;
        otherChannelMaxMoney: string;
    }
    interface HallBillHandlerPayEnforce_Msgs {
        type: number;
        content: string;
    }
    interface HallBillHandlerPayEnforce_Types {
        idx?: number;
        payType?: string;
    }
    interface HallBillHandlerPayEnforce {
        code: number;
        payEnforce?: number;
        payTypes?: HallBillHandlerPayEnforce_Types[];
        onlineRechargeOKTimes?: number;
        onlineRecharge?: string;
        agentOKTimes?: number;
        re?: HallBillHandlerPayEnforce_RechargeEnforce;
        locationRule?: HallBillHandlerPayEnforce_LocationRechargeRule;
        banVip?: number;
        newAgentSwitch?: number;
        vipSwitch?: number;
        rechargeMsgs?: HallBillHandlerPayEnforce_Msgs[];
        agentVipSwitch?: number;
    }
    interface UpdateUserLocation {
        pos: number;
        location: string;
    }
    interface ChatAgentHandlerGetPayAct_Pay {
        payId: string;
        type: string;
        active: number;
        act?: string;
        name?: string;
        bank?: string;
        qrCode?: string;
        feeRate?: string;
        content?: string;
    }
    interface ChatAgentHandlerGetPayAct {
        code: number;
        total?: number;
        pays?: ChatAgentHandlerGetPayAct_Pay[];
    }
    interface UserReady {
        pos: number;
    }
    interface Qznn_DoHandout {
        pos: number;
        bullType: number;
        cards?: number[];
        boost: number;
    }
    interface HallEventHandlerGetEvents_Info {
        actId: number;
        name: string;
        idx: number;
        onGoing: number;
        eventType: string;
        types?: string[];
        interest: string;
    }
    interface HallEventHandlerGetEvents {
        code: number;
        result?: HallEventHandlerGetEvents_Info[];
    }
    interface Dzpk_Raise {
        pos: number;
        bets: string;
        userMoney: string;
        totalBets: string;
    }
    interface EventEventHandlerReceiveRebate {
        code: number;
    }
    interface HallHallHandlerGetUserVipInfo_VipInfo_Priviliege {
        lev?: number;
        detail?: string;
        avatar?: number;
        avatarFrame?: number;
        bullet?: number;
        cond?: string;
    }
    interface HallHallHandlerGetUserVipInfo_VipInfo {
        vipLevel?: number;
        curExp?: string;
        limitExp?: string;
        privis?: HallHallHandlerGetUserVipInfo_VipInfo_Priviliege[];
    }
    interface HallHallHandlerGetUserVipInfo {
        code: number;
        vipInfo?: HallHallHandlerGetUserVipInfo_VipInfo;
    }
    interface HallBillHandlerGetBankCardInfo {
        code: number;
        info?: string;
    }
    interface Dfdc_WaitDouble {
        gameStatus: string;
    }
    interface Ebg_GameInfo_PlayerInfo_areaBets {
        area: number;
        bets: string;
    }
    interface Ebg_GameInfo_PlayerInfo {
        pos: number;
        areaBets?: Ebg_GameInfo_PlayerInfo_areaBets[];
        winCnt: number;
        totalBets: string;
    }
    interface Ebg_GameInfo_AreaInfo {
        area: number;
        cards?: number[];
        totalBets?: string;
        ebgType: number;
        isWin: number;
        boost: number;
    }
    interface Ebg_GameInfo {
        status: number;
        infos?: Ebg_GameInfo_AreaInfo[];
        dealerPos: number;
        curDealerCnt: number;
        leftTime: number;
        players?: Ebg_GameInfo_PlayerInfo[];
        OldCards?: number[];
        dealerQuit: number;
    }
    interface ChatClientHandlerOrderTrack_Orders {
        _id: string;
        orderId?: string;
        gold: string;
        aName: string;
        state: number;
        createDate: number;
        evaluation?: number;
    }
    interface ChatClientHandlerOrderTrack {
        code: number;
        orders?: ChatClientHandlerOrderTrack_Orders[];
    }
    interface HallHallHandlerGetBindCode {
        code: number;
    }
    interface StopStartTimer {
        reason: number;
    }
    interface ChatAgentHandlerGetBlackUserList_List {
        uid: number;
        createDate: number;
    }
    interface ChatAgentHandlerGetBlackUserList {
        code: number;
        total?: number;
        list?: ChatAgentHandlerGetBlackUserList_List[];
    }
    interface ChatClientHandlerEnter {
        code: number;
    }
    interface EventEventHandlerDoLottery_Info {
        prizeId: number;
        prizeType: number;
        prizeName: string;
        prizeQuantity: string;
        remainTimes?: number;
        date: number;
    }
    interface EventEventHandlerDoLottery {
        code: number;
        info?: EventEventHandlerDoLottery_Info;
    }
    interface By_GameUserHit {
        pos: number;
        massId?: number;
        fishId: number;
        gainMoney: string;
    }
    interface ChatAgentHandlerDeleteOrder {
        code: number;
    }
    interface EventEventHandlerGetEventReward_Info {
        recharge?: string;
        chgMoney?: string;
        taxMoney?: string;
        betMoney?: string;
        get: number;
        prizeType: number;
        prizeName: string;
        prizeQuantity: string;
        rank?: number;
        score?: string;
        nickName?: string;
        phaseId: number;
    }
    interface EventEventHandlerGetEventReward_CurCondition {
        recharge?: string;
        chgMoney?: string;
        taxMoney?: string;
        betMoney?: string;
    }
    interface EventEventHandlerGetEventReward {
        code: number;
        st?: number;
        ed?: number;
        cfgCondition?: EventEventHandlerGetEventReward_Info[];
        curCondition?: EventEventHandlerGetEventReward_CurCondition;
        description?: string;
        playerClassification?: number;
    }
    interface Brnn_EnterBet {
        leftTime: number;
        status: number;
    }
    interface ConnectorEntryHandlerAgentEnter {
        code: number;
        rCode?: number;
    }
    interface ChatAgentHandlerAddPayAct {
        code: number;
    }
    interface HallCsHandlerGetQuestionOrderInfo_Info {
        createTime: number;
        money: string;
        type: number;
        state: number;
        id: string;
    }
    interface HallCsHandlerGetQuestionOrderInfo {
        code: number;
        infos?: HallCsHandlerGetQuestionOrderInfo_Info[];
    }
    interface Ermj_DealTile {
        dealerPos: number;
        tiles?: number[];
        quanFeng: number;
        menFeng: number;
    }
    interface Lh_EnterBet {
        leftTime: number;
        status: number;
    }
    interface Dfdc_FreeInfo {
        freeTime: number;
        lastBetLevel: string;
        lastBetMultiple: string;
        bowlType: number;
    }
    interface ChatImgCreate {
        chatId: string;
        proof: string;
    }
    interface Jh_Result_showCards {
        pos: number;
        cards?: number[];
        cardType: number;
    }
    interface Jh_Result_uInfo {
        pos: number;
        money: string;
        handCards?: number[];
        cardType: number;
        isWinner: number;
    }
    interface Jh_Result {
        userInfo?: Jh_Result_uInfo[];
        resShowCards?: Jh_Result_showCards[];
        resultType: number;
        cmpPos?: number[];
    }
    interface HallHallHandlerEnter_Game {
        gid: string;
        idx: number;
        active: number;
        show: number;
    }
    interface HallHallHandlerEnter_Bonus {
        money?: string;
    }
    interface HallHallHandlerEnter_EventData {
        actId: number;
        name: string;
        idx: number;
        onGoing: number;
        eventType: string;
        rechargeChannels?: string[];
    }
    interface HallHallHandlerEnter_GuideCfg {
        gid: string;
        isForce: number;
    }
    interface HallHallHandlerEnter_Report {
        active?: number;
        bonus?: string;
        wx?: string;
    }
    interface HallHallHandlerEnter {
        code: number;
        user?: User;
        newbieBonus?: HallHallHandlerEnter_Bonus;
        where?: Where;
        withdrawSwitch?: number;
        rechargeSwitch?: number;
        channelStatus?: number;
        report?: HallHallHandlerEnter_Report;
        userFlag?: number;
        bindBonus?: HallHallHandlerEnter_Bonus;
        games?: HallHallHandlerEnter_Game[];
        ips?: string[];
        eventData?: HallHallHandlerEnter_EventData[];
        guideCfg?: HallHallHandlerEnter_GuideCfg;
        csWorkTime?: HallHallHandlerEnter_WorkTime;
        popUps: PopUp[];
        gameCates: GameCategory[];
    }

    export interface GameCategory {
        name: string; //类别名称
        active: number; //是否显示
        idx: number; //排序id
        games: string[]; //分类下的子游戏
    }

    export interface PopUp {
        popType: string; //弹窗类型
        idx: number//排序id
    }


    interface HallHallHandlerEnter_WorkTime {
        startTime?: string;
        endTime?: string;
    }
    interface Dzpk_GameInfo_UserInfo {
        pos: number;
        money: string;
        gender: number;
        location: string;
        handPai?: number[];
        isFold: number;
        isDealer: number;
        isSmallBlind: number;
        isBigBlind: number;
        isAllIn: number;
        totalBets: string;
        curRoundBets: string;
        isCurRoundSpeak: number;
        curRoundAddBetCnt: number;
    }
    interface Dzpk_GameInfo {
        leftTime: number;
        status: number;
        totalBets: string;
        curRoundMaxBets: string;
        curOptUser: number;
        commonCards?: number[];
        userInfo?: Dzpk_GameInfo_UserInfo[];
        pools?: number[];
    }
    interface Qhb_GrabHongBao {
        pos: number;
        isGrabbed: number;
        money: string;
    }
    interface ChatAgentHandlerGetOnlineChats_Chat {
        chatId: string;
        uid: number;
        name: string;
        pid: string;
        createDate: number;
    }
    interface ChatAgentHandlerGetOnlineChats {
        code: number;
        chat?: ChatAgentHandlerGetOnlineChats_Chat[];
    }
    interface Ddz_SendCard {
        handCards?: number[];
    }
    interface HallHallHandlerGetNewbieBonus {
        code: number;
        money?: string;
    }
    interface Brnn_GameHistory_areaWin {
        area1: number;
        area2: number;
        area3: number;
        area4: number;
    }
    interface Brnn_GameHistory {
        history?: Brnn_GameHistory_areaWin[];
    }
    interface Pdk_UsersStartCards {
        leftTime: number;
        pos: number;
        isFirst: number;
    }
    interface By_GameMassiveCreate_Fishes {
        massiveId: number;
        massiveType: number;
    }
    interface By_GameMassiveCreate {
        fishes?: By_GameMassiveCreate_Fishes[];
    }
    interface Ermj_PlayerChiTile {
        pos: number;
        tile: number;
        chiTile: number;
    }
    interface Jdnn_AppointDealer_Info {
        pos: number;
        dealerPnt: number;
        job: number;
    }
    interface Jdnn_AppointDealer {
        players?: Jdnn_AppointDealer_Info[];
    }
    interface ChatClientHandlerSendMsg {
        code: number;
        chatId?: string;
        msgId?: string;
        traderId?: string;
        playerId?: string;
        proof?: string;
    }
    interface NewChat_Chat {
        chatId: string;
        uid: number;
        name: string;
        createDate: number;
        pid: string;
    }
    interface NewChat {
        code: number;
        chat: NewChat_Chat;
    }
    interface HallBillHandlerPurchase {
        code: number;
    }
    interface Dzpk_AllIn {
        pos: number;
        bets: string;
        userMoney: string;
        totalBets: string;
    }
    interface ChatAgentHandlerUpdatePayAct {
        code: number;
    }
    interface ChatToClientMsg_Msgs_Rcgs {
        recType: string;
        recStr: string;
    }
    interface ChatToClientMsg_Msgs {
        uid: number;
        createDate: number;
        msgType: number;
        content: string;
        img: string;
        rcgTypes?: ChatToClientMsg_Msgs_Rcgs[];
        read?: number;
    }
    interface ChatToClientMsg {
        _id: string;
        uid: number;
        msgs: ChatToClientMsg_Msgs;
    }
    interface HallUserHandlerChgName {
        code: number;
    }
    interface Brnn_ChangeDealer {
        rPos: number;
        chgInfo?: number;
    }
    interface Jdnn_DoBet {
        pos: number;
        bets: number;
    }
    interface Ermj_PlayerHu {
        pos: number;
        tile: number;
    }
    interface Ddz_BroadcastDiZhu {
        cards?: number[];
        pos: number;
    }
    interface ChatAgentHandlerGetChatHistory_ChatMsg {
        msgId: string;
        aUid: number;
        uid: number;
        fromType: number;
        createDate: number;
        read: number;
        type: number;
        content?: string;
        path?: string;
    }
    interface ChatAgentHandlerGetChatHistory_Chat {
        chatId: string;
        aUid: number;
        aName: string;
        createDate: number;
        pid: string;
    }
    interface ChatAgentHandlerGetChatHistory_TypeDate {
        type?: string;
        date?: number;
    }
    interface ChatAgentHandlerGetChatHistory {
        code: number;
        chat?: ChatAgentHandlerGetChatHistory_Chat;
        msgs?: ChatAgentHandlerGetChatHistory_ChatMsg[];
        payTypes?: string[];
        online?: number;
        gender?: number;
        avatar?: number;
        typesDate?: ChatAgentHandlerGetChatHistory_TypeDate[];
    }
    interface ChatAgentHandlerEnter_Info {
        uid: number;
        name: string;
        state: number;
        gender: number;
        avatar: number;
        gold: string;
        pid: string;
        todayOrderCnt: number;
        todayOrderedCnt: number;
        greetActive: number;
        greet?: string;
        timeLimit?: number;
    }
    interface ChatAgentHandlerEnter {
        code: number;
        info?: ChatAgentHandlerEnter_Info;
    }
    interface Ermj_PlayerWaitOutTile {
        curOptPos: number;
        lastOutTile: number;
        leftTime: number;
    }
    interface MsgReaded {
        code: number;
        chatId: string;
    }
    interface HallBillHandlerGetAgent_Agent {
        name: string;
        qq?: string;
        wx?: string;
        hot?: number;
    }
    interface HallBillHandlerGetAgent {
        code: number;
        agents?: HallBillHandlerGetAgent_Agent[];
    }
    interface Jh_DoBets {
        pos: number;
        bets: string;
        userTotalBets: string;
        gameTotalBets: string;
        curMinBets: string;
        opt: number;
    }
    interface Qznn_EnterDoDealer {
        cards?: number[];
    }
    interface StartTimer {
        timerSecond: number;
    }
    interface By_GameCreateFish_Fishes {
        fishId: number;
        fishType: number;
        routeId: number;
        offsetId: number;
        aliveTime: number;
    }
    interface By_GameCreateFish {
        fishes?: By_GameCreateFish_Fishes[];
    }
    interface Dfdc_JackPotWinner {
        name: string;
        eggWinMoney: string;
        winEggIcon: number;
        initEggMoney: string;
        location?: string;
    }
    interface Ermj_PlayerGangTile {
        pos: number;
        tile: number;
        type: number;
    }
    interface EventEventHandlerGetEventConfig_Info {
        id: number;
        name: string;
        type: number;
        quantity: string;
    }
    interface EventEventHandlerGetEventConfig {
        code: number;
        config?: EventEventHandlerGetEventConfig_Info[];
    }
    interface By_GameUserGetRemainPoints_GamerRemainPointsInfo {
        pos: number;
        remainPoints: string;
    }
    interface By_GameUserGetRemainPoints {
        gamerRemainPointsInfo?: By_GameUserGetRemainPoints_GamerRemainPointsInfo[];
    }
    interface By_ReturnMoney {
        backMoney: string;
        pos: number;
    }
    interface Ddz_EnterResult_ResultInfo {
        pos: number;
        chgScore: string;
        totalMulti: string;
        remainCards?: number[];
        tax: string;
    }
    interface Ddz_EnterResult {
        ur?: Ddz_EnterResult_ResultInfo[];
        bombNum: number;
        spring: number;
        freeCards?: number[];
    }
    interface By_BroadcastState {
        state: number;
        time: number;
    }
    interface UserAuto {
        pos: number;
    }
    interface Ebg_PlayerHistory_playerHistory {
        uid: number;
        startTime: string;
        win: string;
        tax: string;
    }
    interface Ebg_PlayerHistory {
        history?: Ebg_PlayerHistory_playerHistory[];
    }
    interface HallCsHandlerCsUrlRequest {
        code: number;
        csUrl?: string;
        fileServerUrl?: string;
    }
    interface Qznn_EnterBalance_Info {
        pos: number;
        job: number;
        dealerPnt: number;
        betPnt: number;
        chgMoney: string;
        tax: string;
        boost: number;
    }
    interface Qznn_EnterBalance {
        player?: Qznn_EnterBalance_Info[];
    }
    interface ConnConnHandlerEnter {
        code: number;
        result?: string;
    }
    interface HallBillHandlerGetVipInfo_VipInfo {
        vipUid: number;
        uid: number;
        money: string;
        dateTime: number;
        state: number;
        status: number;
        orderId: string;
    }
    interface HallBillHandlerGetVipInfo {
        code: number;
        vipInfo?: HallBillHandlerGetVipInfo_VipInfo[];
    }
    interface By_GameUserCastSkillMsg {
        pos: number;
        castFishIds?: number[];
        gainMoney?: string;
        frozenTime?: number;
        skillType: number;
    }
    interface GameRoomHandlerGetRoomData {
        code: number;
        users?: User[];
        leftTime?: number;
        isGaming?: number;
        bets?: string;
        gid?: string;
        config?: string;
        pos?: number;
        startKickTime?: number;
        maxUserCount?: number;
        gameNo?: string;
    }
    interface Dfdc_Auto {
        auto: number;
        autoTime: number;
    }
    interface ChatClientHandlerGetAgentHead {
        code: number;
        head?: string;
    }
    interface ChatClientHandlerDeleteContact {
        code: number;
    }
    interface MsgIsRead {
        _id: string;
    }
    interface Jh_AppointDealer {
        pos: number;
        round: number;
    }
    interface HallCsHandlerGetFaq_Faq {
        question: string;
        answer: string;
    }
    interface HallCsHandlerGetFaq {
        code: number;
        faq?: HallCsHandlerGetFaq_Faq[];
    }
    interface Dzpk_Follow {
        pos: number;
        bets: string;
        userMoney: string;
        totalBets: string;
    }
    interface EventEventHandlerGetRebateEventInfo_CfgConditions {
        activeScore: string;
        get: number;
        phaseId: number;
        type: number;
        quantity: string;
        name: string;
    }
    interface EventEventHandlerGetRebateEventInfo_ScoreInfo {
        lotteryRoll: number;
        activeScore: number;
        refreshTimes: number;
        cumulativeWinLose: string;
        rebateRate: string;
        cumulativeAvailable: string;
        freeLotteryTimes: number;
        skinTatterId?: number;
        skinTatterCnt?: number;
        avatarBoxTatterId?: number;
        avatarBoxTatterCnt?: number;
        tatterLotteryCnt?: number;
        finishCnt: number;
        lastRefreshDate?: number;
        hasSkin: number;
        hasAvatarBox: number;
    }
    interface EventEventHandlerGetRebateEventInfo_TaskInfo {
        finishQuantity: string;
        status: number;
        quantity: string;
        name: string;
        activeScore: number;
    }
    interface EventEventHandlerGetRebateEventInfo {
        code: number;
        taskInfo?: EventEventHandlerGetRebateEventInfo_TaskInfo[];
        scoreInfo?: EventEventHandlerGetRebateEventInfo_ScoreInfo;
        cfgConditions?: EventEventHandlerGetRebateEventInfo_CfgConditions[];
    }
    interface EventRefreshLuckyUsers {
        prizeId: number;
        prizeType: number;
        userName: string;
        prizeQuantity: string;
        prizeName: string;
        date: number;
    }
    interface HallBankHandlerSaveMoney {
        code: number;
    }
    interface Qznn_DealLastCard {
        pos: number;
        card: number;
    }
    interface ChatAgentHandlerSendMsg {
        code: number;
        chatId?: string;
        msgId?: string;
    }
    interface HallCsHandlerSubmit {
        code: number;
    }
    interface Ebg_EnterDealCard_Info {
        area: number;
        cards?: number[];
        ebgType: number;
        isWin: number;
        boost: number;
    }
    interface Ebg_EnterDealCard {
        cards?: Ebg_EnterDealCard_Info[];
        leftTime: number;
        status: number;
        isAllKillOrLose: number;
    }
    interface Ddz_Hosted {
        pos: number;
        state: number;
    }
    interface AgentState {
        code: number;
    }
    interface Ddz_Double {
        add: number;
        pos: number;
    }
    interface Jdnn_GameInfo_Info {
        pos: number;
        job: number;
        dealerPnt: number;
        betPnt: number;
        isDealer: number;
        isbet: number;
        isHandouted: number;
        bullType?: number;
        cards?: number[];
    }
    interface Jdnn_GameInfo {
        status: number;
        timer: number;
        playerInfo?: Jdnn_GameInfo_Info[];
    }
    interface StartGame {
        users?: User[];
        willChangeRoom?: number;
        gameNo?: string;
    }
    interface Dfdc_Info {
        firstRow?: number[];
        secondRow?: number[];
        thirdRow?: number[];
    }
    interface HallBankHandlerGetMoney {
        code: number;
    }
    interface Ermj_GameResult_Result {
        huTile?: number;
        pos: number;
        handTile?: number[];
        chgMoney: string;
    }
    interface Ermj_GameResult {
        results?: Ermj_GameResult_Result[];
        leftTime: number;
        huType?: number[];
    }
    interface HallCsHandlerShowRechargeQuestion {
        code: number;
        show?: number;
    }
    interface Hh_EnterBalance_WinLoseInfo {
        redWin: number;
        winShape: number;
    }
    interface Hh_EnterBalance_Info {
        pos: number;
        chgMoney: string;
        winCnt: number;
        totalBets: string;
    }
    interface Hh_EnterBalance {
        players?: Hh_EnterBalance_Info[];
        leftTime?: number;
        status?: number;
        winShape: number;
        redWin: number;
        winLoseRecord?: Hh_EnterBalance_WinLoseInfo[];
    }
    interface EventEventHandlerReceiveReward_Info {
        name: string;
        type: number;
        quantity: string;
    }
    interface EventEventHandlerReceiveReward {
        code: number;
        info?: EventEventHandlerReceiveReward_Info;
    }
    interface ChatAgentHandlerGetValidOrders_Order {
        chatId: string;
        orderId: string;
        uid: number;
        name: string;
        pid: string;
        createDate: number;
        orderDate?: number;
        finishDate?: number;
        paidMoney?: string;
        proof?: string;
    }
    interface ChatAgentHandlerGetValidOrders {
        code: number;
        order?: ChatAgentHandlerGetValidOrders_Order[];
    }
    interface Ddz_NoPlay {
        pos: number;
    }
    interface BillHandlerRecharge {
        code: number;
        url?: string;
        errorCode?: number;
        reqId?: number;
    }
    interface HallHallHandlerBind {
        code: number;
        act?: string;
        bindBonus?: string;
        money?: string;
    }
    interface EventEventHandlerGetLotteryEventInfo_LuckyUsers {
        prizeId: number;
        prizeType: number;
        userName: string;
        prizeQuantity: string;
        prizeName: string;
        date: number;
    }
    interface EventEventHandlerGetLotteryEventInfo_Info {
        betMoney?: string;
        chgMoney?: string;
        recharge?: string;
        taxMoney?: string;
        remainTimes: number;
    }
    interface EventEventHandlerGetLotteryEventInfo_Records {
        prizeId: number;
        prizeType: number;
        prizeQuantity: string;
        prizeName: string;
        date: number;
    }
    interface EventEventHandlerGetLotteryEventInfo {
        code: number;
        info?: EventEventHandlerGetLotteryEventInfo_Info;
        luckyUsers?: EventEventHandlerGetLotteryEventInfo_LuckyUsers[];
        personRecords?: EventEventHandlerGetLotteryEventInfo_Records[];
        day?: number;
        isShowDay?: number;
        startDate?: number;
    }
    interface ChatAgentHandlerDeletePayAct {
        code: number;
    }
    interface Qhb_GameInfo_hbInfo {
        pos: number;
        money: string;
        boomNo: number;
    }
    interface Qhb_GameInfo_curHBInfo {
        pos: number;
        money: string;
    }
    interface Qhb_GameInfo_uInfo {
        pos: number;
        isGrabbed: number;
        isMaster: number;
        isBoom: number;
        totalSendMoney: string;
        noBoomCnt: number;
        money: string;
        chgMoney: string;
    }
    interface Qhb_GameInfo {
        status: number;
        leftTime: number;
        userInfo?: Qhb_GameInfo_uInfo[];
        hongbaoList?: Qhb_GameInfo_hbInfo[];
        curHongBao?: Qhb_GameInfo_curHBInfo;
    }
    interface EventEventHandlerCheckEventState_Info {
        actId: number;
        name: string;
        idx: number;
        onGoing: number;
        eventType: string;
        rechargeChannels?: string[];
    }
    interface EventEventHandlerCheckEventState {
        code: number;
        result?: EventEventHandlerCheckEventState_Info[];
    }
    interface Brnn_EnterDealCard_Info {
        area: number;
        cards?: number[];
        bullType: number;
        isWin: number;
        boost: number;
    }
    interface Brnn_EnterDealCard {
        cards?: Brnn_EnterDealCard_Info[];
        leftTime: number;
        status: number;
    }
    interface Dzpk_DoPot {
        pos: number;
        pot: string;
        userMoney: string;
        totalBets: string;
    }
    interface EventEventHandlerGetPrize_Info {
        name: string;
        type: number;
        quantity: string;
    }
    interface EventEventHandlerGetPrize {
        code: number;
        info?: EventEventHandlerGetPrize_Info;
    }
    interface Jdnn_DealCards {
        pos: number;
        cards?: number[];
    }
    interface By_GameUserFire {
        fireMsg: number;
    }
    interface ChatRechargeNotify {
        money: string;
    }
    interface Lh_EnterBalance_Info {
        pos: number;
        chgMoney: string;
        tax: string;
        winCnt: number;
        totalBets: string;
    }
    interface Lh_EnterBalance {
        player?: Lh_EnterBalance_Info[];
        leftTime: number;
        status: number;
        winLoseRecord?: number[];
    }
    interface Brnn_DealerList {
        poss?: number[];
        dealerCnt?: number;
    }
    interface UserLeave {
        pos: number;
        reason?: number;
    }
    interface Jh_ChallengeRes {
        curPos: number;
        coverPos: number;
        failPos: number;
        failHandCards?: number[];
        cardType: number;
        failChgMoney?: string;
    }
    interface Ermj_UserAuto {
        isAuto: number;
    }
    interface By_GameUserChgButtleStyle {
        pos: number;
        bulletStyle: number;
    }
    interface HallBillHandlerGetOrderCnt {
        ali: number;
        union: number;
        code?: number;
    }
    interface PayErrNotify {
        payType: string;
    }
    interface Qhb_CurHongBaoInfo_hbInfo {
        pos: number;
        money: string;
        boomNo: number;
    }
    interface Qhb_CurHongBaoInfo_curHBInfo {
        pos: number;
        money: string;
    }
    interface Qhb_CurHongBaoInfo {
        status: number;
        leftTime: number;
        curHB: Qhb_CurHongBaoInfo_curHBInfo;
        hongBaoList?: Qhb_CurHongBaoInfo_hbInfo[];
    }
    interface CreateOrder {
        chatId: string;
        orderId: string;
        uid: number;
        proof: string;
    }
    interface ChatAgentHandlerUpdateAgentState {
        code: number;
    }
    interface HallHallHandlerReceiveGift {
        code: number;
        money?: string;
    }
    interface HallBillHandlerRecharge {
        code: number;
        url?: string;
        errorCode?: number;
        reqId?: number;
        mode?: string
    }
    interface ChatClientHandlerSetChatEval {
        code: number;
        score?: string;
    }
    interface EventEventHandlerDoWRLottery_Info {
        prizeId: number;
        prizeType: number;
        prizeName: string;
        prizeQuantity: string;
        date: number;
        lotteryRoll: number;
        rebateRate: string;
        freeLotteryTimes: number;
        skinTatterId: number;
        skinTatterCnt: number;
        avatarBoxTatterId: number;
        avatarBoxTatterCnt: number;
        tatterLotteryCnt: number;
        eventGoodsId?: number;
    }
    interface EventEventHandlerDoWRLottery {
        code: number;
        info?: EventEventHandlerDoWRLottery_Info;
    }
    interface Dfdc_EggBalance_JackPotInfo {
        duofu: string;
        duofuMax: string;
        duocai: string;
        duocaiMax: string;
        duoxi: string;
        duoxiMax: string;
        duoshou: string;
        duoshouMax: string;
    }
    interface Dfdc_EggBalance_OpenedEgg {
        openIcon: number;
        idx: number;
    }
    interface Dfdc_EggBalance {
        winEggIcon: number;
        eggWinMoney: string;
        bowlType: number;
        openedEgg?: Dfdc_EggBalance_OpenedEgg[];
        jackPotInfo: Dfdc_EggBalance_JackPotInfo;
    }
    interface AutoCloseOrder {
        orderId: string;
    }
    interface Jh_FaceUp {
        pos: number;
        handCards?: number[];
        cardType: number;
    }
    interface ChatAgentHandlerSendPayAct {
        code: number;
    }
    interface HallHallHandlerLeaveGame {
        code: number;
    }
    interface HallHallHandlerGetAds {
        code: number;
        ads?: string[];
    }
    interface HallUserHandlerGetDictionary {
        code: number;
        dictionary?: string;
    }
    interface By_GameDeathFish {
        deathFish?: number[];
    }
    interface UserMoney {
        money: string;
    }
    interface UserLost {
        pos: number;
    }
    interface GetMoneyNotify {
        code: number;
        money?: string;
        bankMoney?: string;
    }
    interface ConnConnHandlerPrepare {
        code: number;
        s?: string;
    }
    interface Dfdc_Double {
        result: number;
        doubleScore: string;
        doubleCount: number;
    }
    interface GlobalNotice {
        level: number;
        content: string;
    }
    interface Qhb_DoBalance_uInfo {
        pos: number;
        grabMoney: string;
        chgMoney: string;
        payMoney: string;
        isBoom: number;
        isWinner: number;
        isSending: number;
        isMaxHB: number;
        totalSendMoney: string;
        noBoomCnt: number;
        payForMaster?: string;
        payForMasterSubTax?: string;
        lastMoney?: string;
    }
    interface Qhb_DoBalance_hbInfo {
        pos: number;
        money: string;
        boomNo: number;
    }
    interface Qhb_DoBalance {
        userInfo?: Qhb_DoBalance_uInfo[];
        boomNo?: number;
    }
    interface Hh_EnterBet {
        leftTime: number;
        status: number;
    }
    interface ChatClientHandlerOpenChat_Chat_ChatMsg {
        msgId: string;
        aUid: number;
        uid: number;
        fromType: number;
        createDate: number;
        type: number;
        content: string;
    }
    interface ChatClientHandlerOpenChat_Chat_Pays {
        payFType?: string;
        payCTypes?: string[];
    }
    interface ChatClientHandlerOpenChat_Chat {
        chatId: string;
        aUid: number;
        aName: string;
        gender?: number;
        avatar?: number;
        msgs?: ChatClientHandlerOpenChat_Chat_ChatMsg[];
        pays?: ChatClientHandlerOpenChat_Chat_Pays[];
    }
    interface ChatClientHandlerOpenChat {
        code: number;
        chat?: ChatClientHandlerOpenChat_Chat;
    }
    interface HallBankHandlerGetChgPwdCode {
        code: number;
    }
    interface Hh_EnterDealCard_cardsInfo {
        area: number;
        cards?: number[];
        shape: number;
    }
    interface Hh_EnterDealCard {
        leftTime: number;
        status: number;
        cardsInfo?: Hh_EnterDealCard_cardsInfo[];
    }
    interface Ermj_GameInfo_ermjUser_PengGangInfo {
        type: number;
        tile: number;
    }
    interface Ermj_GameInfo_ermjUser {
        pos: number;
        deskTile?: number[];
        pgInfos?: Ermj_GameInfo_ermjUser_PengGangInfo[];
        userState?: number;
        huTile?: number;
        isTing?: number;
        jiaBeiTile?: number[];
        jiaBeiTilePos?: number[];
        menFeng?: number;
        location?: string;
        avatar?: number;
        gender?: number;
        money?: string;
        chgMoney?: string;
        handTile?: number[];
        avatarFrame?: number;
        vipLevel?: number;
    }
    interface Ermj_GameInfo_PGHInfo {
        chi: number;
        peng: number;
        gang: number;
        hu: number;
    }
    interface Ermj_GameInfo {
        gameStatus: number;
        leftTime: number;
        dealerPos?: number;
        handTile?: number[];
        nextHandTile?: number[];
        quanFeng?: number;
        curOptPos?: number;
        curInTile?: number;
        lastOutTile?: number;
        lastOutTilePos?: number;
        huType?: number[];
        users?: Ermj_GameInfo_ermjUser[];
        pghInfo?: Ermj_GameInfo_PGHInfo;
        remainTileCount?: number;
    }
    interface HallHallHandlerGetIpList {
        code: number;
        ips?: string[];
    }
    interface GameRoomHandlerUserReady {
        code: number;
    }
    interface Ermj_HuPass {
        pos: number;
        passHuCnt: number;
        tile: number;
    }
    interface Jh_Fold {
        pos: number;
        handCards?: number[];
        cardType: number;
    }
    interface HallBillHandlerGetIAPInfo_Product {
        id: string;
        money: number;
        price: number;
    }
    interface HallBillHandlerGetIAPInfo {
        code: number;
        product?: HallBillHandlerGetIAPInfo_Product[];
    }
    interface ChatAgentHandlerGetUserOrders_Order {
        chatId: string;
        orderId: string;
        uid: number;
        name: string;
        pid: string;
        createDate: number;
        orderDate?: number;
        finishDate?: number;
        paidMoney?: string;
        proof?: string;
    }
    interface ChatAgentHandlerGetUserOrders {
        code: number;
        order?: ChatAgentHandlerGetUserOrders_Order[];
    }
    interface HallBankHandlerEnter {
        code: number;
        money?: string;
        bankMoney?: string;
    }
    interface ChatClientHandlerLeave {
        code: number;
    }
    interface HallMailHandlerCheckNew {
        code: number;
        hasNew?: number;
    }
    interface Pdk_DealCard {
        firstPos: number;
        cards?: number[];
    }
    interface HallBillHandlerGetPayInfoByType_Info {
        channel: string;
        minMoney?: string;
        maxMoney?: string;
        moneyRange?: number[];
        isFix?: number;
        isSmallAmt?: number;
        extra?: string;
        payType: string;
        floatExchangeRate: string;
    }
    interface HallBillHandlerGetPayInfoByType {
        code: number;
        largeAmt?: HallBillHandlerGetPayInfoByType_Info;
        smallAmt?: HallBillHandlerGetPayInfoByType_Info;
    }
    interface Jh_NextRound {
        round: number;
    }
    interface HallMailHandlerDelete {
        code: number;
    }
    interface AutoCloseChat {
        chatId: string;
    }
    interface Jh_opt {
        pos: number;
        time: number;
    }
    interface HallHallHandlerGetChgPwdCode {
        code: number;
    }
    interface ChatAgentHandlerUpdateContact_Info {
        accountType: string;
        accountId: string;
        agentName: string;
        qrCode?: string;
    }
    interface ChatAgentHandlerUpdateContact {
        code: number;
        info?: ChatAgentHandlerUpdateContact_Info;
    }
    interface Hh_GameInfo_PlayerInfo_areaBets {
        area: number;
        bets: string;
    }
    interface Hh_GameInfo_PlayerInfo {
        pos: number;
        areaBets?: Hh_GameInfo_PlayerInfo_areaBets[];
        winCnt: number;
        totalBets: string;
    }
    interface Hh_GameInfo_WinLoseInfo {
        redWin: number;
        winShape: number;
    }
    interface Hh_GameInfo_AreaInfo {
        area: number;
        totalBets?: string;
    }
    interface Hh_GameInfo_CardsInfo {
        area: number;
        cards?: number[];
        shape: number;
    }
    interface Hh_GameInfo {
        status: number;
        leftTime: number;
        AreaInfos?: Hh_GameInfo_AreaInfo[];
        winLoseRecord?: Hh_GameInfo_WinLoseInfo[];
        players?: Hh_GameInfo_PlayerInfo[];
        cards?: Hh_GameInfo_CardsInfo[];
        redWin: number;
    }
    interface HallHallHandlerGetBulletin_Bulletin {
        idx: number;
        title: string;
        subTitle: string;
        content: string;
    }
    interface HallHallHandlerGetBulletin {
        code: number;
        bul?: HallHallHandlerGetBulletin_Bulletin;
    }
    interface Qznn_DoBet {
        pos: number;
        bets: number;
    }
    interface Ebg_EnterBet {
        leftTime: number;
        status: number;
        dicePoint?: number[];
        GameTurns: number;
    }
    interface ChatMsg {
        code: number;
        chatId: string;
        msgId: string;
        type: number;
        content: string;
        createDate: number;
        aUid: number;
        uid: number;
        fromType: number;
        path?: string;
    }
    interface By_GameInfo_LockTarget {
        massId?: number;
        fishId: number;
    }
    interface By_GameInfo_RegularInfos {
        fishId: number;
        fishType: number;
        routeId: number;
        offsetId: number;
        aliveTime: number;
    }
    interface By_GameInfo_GamerInfos {
        pos: number;
        ratio: number;
        autoAngle?: number;
        remainPoints: string;
        bulletStyle: number;
        lockTarget?: By_GameInfo_LockTarget;
    }
    interface By_GameInfo_MassInfos {
        massId: number;
        type: number;
        aliveTime: number;
        liveTime: number;
        fishes?: number[];
    }
    interface By_GameInfo {
        state: number;
        phaseTimer: number;
        maxBulletStyle: number;
        diffAmount: string;
        gamerInfos?: By_GameInfo_GamerInfos[];
        regularInfos?: By_GameInfo_RegularInfos[];
        massInfos?: By_GameInfo_MassInfos[];
        skinList?: number[];
    }
    interface Ddz_PlayCards {
        pos: number;
        cards?: number[];
        shape: number;
    }
    interface Pdk_UserReslut_Result {
        pos: number;
        money: string;
        remainCards?: number[];
        isClosed: number;
    }
    interface Pdk_UserReslut {
        payForAllPos: number;
        result?: Pdk_UserReslut_Result[];
    }
    interface Jdnn_StatusChange {
        status: number;
        timer: number;
    }
    interface ChatAgentHandlerActivePayAct {
        code: number;
    }
    interface Pdk_GameInfo_UserInfo {
        pos: number;
        money: string;
        remainCount: number;
        gender: number;
        hosted: number;
        loc: string;
        bombMoney: string;
    }
    interface Pdk_GameInfo {
        isShow: number;
        isFirst: number;
        status: number;
        leftTime: number;
        curPlayPos: number;
        beforePos: number;
        beforeCards?: number[];
        handCards?: number[];
        alreadyCards?: number[];
        userInfo?: Pdk_GameInfo_UserInfo[];
    }
    interface Ermj_ChiPengGangHu {
        chi: number;
        peng: number;
        gang: number;
        hu: number;
        leftTime: number;
    }
    interface Jdnn_DoDealer {
        pos: number;
        point: number;
    }
    interface Pdk_BombGetMoney_bombData {
        pos: number;
        bombMoney: string;
    }
    interface Pdk_BombGetMoney {
        bomb?: Pdk_BombGetMoney_bombData[];
    }
    interface Qznn_AppointDealer_Info {
        pos: number;
        dealerPnt: number;
        job: number;
    }
    interface Qznn_AppointDealer {
        players?: Qznn_AppointDealer_Info[];
    }
    interface ChatAgentHandlerUpdateBlackUser {
        code: number;
    }

    interface HallHallHandlerGetClientUrl {
        code: number;
        url: string;

    }
    interface EventEventHandlerEnterDGGame {
        code: number;
        token?: string;
        domains?: string;

    }
    interface EventEventHandlerLeaveDGGame {
        code: number;
    }
    interface HallHallHandlerEnterIM {
        code: number;
        url?: string;
    }
    /*-----bcbm-----*/
    interface LocInfo {
        loc: number,
        area: number,
        awardType: number,
    }
    interface BetInfo {
        area: number,
        money: number,
    }
    interface enterBetData {
        leftTime: number,
        status: number,
        canDupBet: number,
        dupBets: BetInfo[]
    }
    interface doBetData {
        pos: number,
        area: number,
        bet: string,
    }

    interface enterDealData {
        time: number,
        status: number,
        area: number,
        loc: number,
    }

    interface infoItem {
        pos: number,
        money: string,
        chgMoney: string,
        tax: string,
        winCnt: number,
        totalBets: string,
    }

    interface enterBalanceData {
        player: infoItem[],
        time: number,
        status: number,
        winLoc: LocInfo,
        // canDupBet: number,
    }

    interface areaInfoItem {
        area: number,
        totalBets: string,
        rate: number,
    }

    interface areaBetsItem {
        area: number,
        bets: string,
    }
    interface playerInfoItem {
        pos: number,
        areaBets: areaBetsItem[],
        winCnt: number,
        totalBets: string,
    }

    interface gameInfoData {
        status: number,
        leftTime: number,
        infos: areaInfoItem[],
        players: playerInfoItem[],
        locs: LocInfo[],
        area: number,
        winLoseRecords: LocInfo[],
        loc: number,
        canDupBet: number,
        dupBets: BetInfo[]
    }
    /*-----bcbm end-----*/


    interface HallHallHandlerEnterBGGame {
        code: number;
        token?: string;
        domains?: string;
    }
    interface EventEventHandlerLeaveDGGame {
        code: number;
    }
    interface HallHallHandlerEnterIM {
        code: number;
        url?: string;
    }
    interface FQZS_DoBet {
        pos: number;
        area: number;
        bet: string;
    }
    interface FQZS_EnterStart {
        time: number;
        state: number;
    }
    interface FQZS_EnterBet {
        time: number;
        state: number;
        isCanDupBet: number;//是否可以续压
    }

    interface Fqzs_EnterResult_WinInfo {
        animal: number;
        startIcon: number;
        stopIcon: number;
    }
    interface FQZS_EnterResult {
        state: number;
        time: number;
        players?: Fqzs_EnterResult_PlayerInfo[];
        info: Fqzs_EnterResult_WinInfo;
    }
    interface FQZS_GameInfo {
        state: number;
        leftTime: number;
        curIcon: number;
        infos?: Fqzs_GameInfo_AreaInfo[];
        players?: Fqzs_GameInfo_PlayerInfo[];
        winRecords?: Fqzs_GameInfo_WinInfo[];
        animStatis?: Fqzs_GameInfo_AnimalStatis[];
        cateStatis?: Fqzs_GameInfo_CategoryStatis[];
    }

    interface Fqzs_GameInfo_AnimalStatis {
        animal: number;
        count: number;
    }
    interface Fqzs_GameInfo_PlayerInfo_areaBet {
        area: number;
        bet: string;
    }
    interface Fqzs_GameInfo_PlayerInfo {
        pos: number;
        isBet: number;
        isCanDupBet: number;//是否可以续压
        isDupBet: number;//是否续压
        bets?: Fqzs_GameInfo_PlayerInfo_areaBet[];
        winCnt: number;
        totalBet: string;
        winMoney: string;//本次输赢
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
    interface Fqzs_GameInfo_AreaInfo {
        area: number;
        totalBet?: string;
    }
    interface Fqzs_EnterResult_PlayerInfo {
        pos: number;
        winMoney: string;//本次输赢
        isBet: number;//是否下注
        winCnt: number;//连赢次数
        totalBets: string;//本次总下注
    }

    interface Fqzs_DupBet {
        isDupBet: number;
    }
    //超时退钱给发包玩家接口
    interface Hbsl_TimeOutReturnMoney_uInfo {
        pos: number;
        chgMoney: string;
        money: string;
    }
    interface Hbsl_TimeOutReturnMoney {
        userInfo?: Hbsl_TimeOutReturnMoney_uInfo;
    }

    //游戏信息接口
    interface Hbsl_GameInfo_hbSendInfo {
        money: string;
        boomNo: number;
        totalCount: number;
        hongBaoIndex: number;
        odds: string;
    }
    interface Hbsl_GameInfo_hbInfo {
        area: number;
        money: string;
        boomNo: number;
        totalCount: number;
        leftCount: number;
        whoSend: number;
        hongBaoIndex: number;
        isGrabbed: number;
        isBoom: number;
        grabMoney: string;
        payMoney: string;
    }
    interface Hbsl_GameInfo_uInfo {
        pos: number;
        noBoomCount: number;
        sendHongBaoCount: number;
    }
    interface Hbsl_GameInfo {
        hongBaoList?: Hbsl_GameInfo_hbInfo[];
        hongBaoCount?: number;
        userInfo?: Hbsl_GameInfo_uInfo[];
        hbSendList?: Hbsl_GameInfo_hbSendInfo[];
        queueLength?: number;
    }

    //抢红包结算接口
    interface Hbsl_GrabBalance_uInfo {
        pos: number;
        chgMoney: string;
        money: string;
        noBoomCount: number;
        sendHongBaoCount: number;
    }
    interface Hbsl_GrabBalance {
        graberInfo?: Hbsl_GrabBalance_uInfo;
        masterInfo?: Hbsl_GrabBalance_uInfo;
        area?: number;
        hbMoney?: string;
        grabMoney?: string;
        isBoom?: number;
        leftCount?: number;
    }
    //包红包回复接口
    interface Hbsl_BaoHongBao_hbSendInfo {
        money: string;
        boomNo: number;
        totalCount: number;
        hongBaoIndex: number;
        odds: string;
    }
    interface Hbsl_BaoHongBao {
        pos?: number;
        hbSendList?: Hbsl_BaoHongBao_hbSendInfo[];
        money?: string;
        queueLength?: number;
    }
    //更好红包信息接口
    interface Hbsl_ChangeHongBao_hbInfo {
        area: number;
        money: string;
        boomNo: number;
        totalCount: number;
        leftCount: number;
        whoSend: number;
        hongBaoIndex: number;
    }
    interface Hbsl_ChangeHongBao {
        changeHonBao?: Hbsl_ChangeHongBao_hbInfo;
        queueLength?: number;
    }

    interface Hbsl_BackBalance_uInfo {
        pos: number;
        chgMoney: string;
        money: string;
    }
    interface Hbsl_BackBalance {
        userInfo?: Hbsl_BackBalance_uInfo;
    }


}
