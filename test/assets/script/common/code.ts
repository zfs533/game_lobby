export class ErrCodes {
    static readonly NET_INSTABILITY = 505;
    static readonly NET_TIMEOUT = 506;
    static readonly FORBID_LOGIN = 9004;
    static readonly RE_LOGIN = 9008;
    static readonly UNUSUAL_LOGIN = 9011;
    static readonly BIND_CARD = "请先绑定银行卡";
    static readonly BIND_SSS = `请先绑定支付宝`;

    static readonly BAN_IP = 9014;
    static readonly CODES: { [index: number]: string } = {
        400: "请重试~",
        402: "支付通道暂不可用",
        500: "请重试~",
        505: "亲，你的网络不稳定，暂时无法连接到服务器",
        506: "服务器访问超时",
        507: "提现次数达到上限",
        1004: "游戏暂未开放",
        1005: "服务器维护中，请稍后尝试", // 服务器关闭
        1006: "服务器启动中，请稍后重试", // SERVER_IS_INIT
        1008: "服务器正忙，请稍后重试",   // HALL_IS_INIT
        2002: "非法用户名",
        2003: "名字重复",
        3001: "用户名或密码错误",
        3003: "余额不足",
        3004: "余额不足",
        3005: "余额不足",
        3006: "您正在游戏中",
        3008: "提现金额不合法",
        3014: "兑换后携带金额低于10，无法提现",
        3015: `支付宝账号已经被绑定过多次`,
        3016: "银行账号已经被绑定过多次",
        3017: "密码错误",
        3009: "兑换频繁，稍后再试",
        3011: "用户未绑定",
        //3014: "绑定超时",//20180430,阿贵说可以取消
        4001: "房间不存在",
        4003: "房间不存在",
        4004: "您要加入的房间已经满员",
        4005: "您已在其他房间",

        6003: "参数错误",
        6004: "余额不足",
        6005: "安全密码错误",
        6006: "不在范围",
        6007: "对方不存在",
        6008: "对方不是VIP，普通用户只能转给VIP号",
        6009: "对方不是正式账号",
        6012: "未开启",
        6013: "超过今日兑换总额",
        6014: "请先绑定银行卡",
        6015: "无效的收分代理",
        6016: "操作频繁，请稍后再试",

        8001: "您已经有师父了",
        8002: "不能拜自己的徒弟为师",
        8003: "不能拜自己的徒孙为师",
        8004: "用户不存在",
        8005: "对方不是正式账号",

        9001: "获取验证码频繁",
        9002: "获取验证码太频繁",
        9003: "验证码错误",
        9004: "由于您严重违反游戏规定，进行伙牌或者有刷号行为，伤害其他玩家利益，您的账号被永久封禁！",
        9005: "用户名或密码错误",
        9006: "此手机号已被绑定",
        9007: "游戏正在维护，请等待维护完毕",
        9008: "请重新登录",
        9010: "网络繁忙，请稍后再试",   // 验证失败
        9011: "当前设备不是您的常用设备，需要使用短信验证登录",
        9012: "无法绑定该手机号，请更换",
        9014: "此IP禁止登录",
        9015: "超过连续做庄次数",
        9016: "之前的玩家退出",
        9017: "金额不足",

        10002: "账号异常，无法兑换",
        10003: "今日兑换次数已达上限",

        11000: "充值金额太小",
        11001: "充值金额太大",
        11002: "充值类型错误",
        11003: "充值过于频繁",
        11004: "请重试",    // 充值通道 配置有改变
        11005: "该充值通道暂时关闭，请选择其他充值方式",

        13001: "充值金额不足",
        13002: "流水金额不足",
        13003: "您已获取会员码",
        13004: "会员码已发放完毕",

        14001: "获取订单失败",
        14002: "打开订单失败",
        14003: "当前充值人数较多，排队中，请等待一小会儿",
        14004: "还未添加常用代理",
        14005: "删除代理失败",
        14006: "添加代理失败",
        14007: "消息不能为空",
        14008: "消息发送异常",
        14009: "评价失败",
        14010: "代理不在线或者暂离",
        14011: "聊天失败",
        14012: "举报失败",
        14013: "已是常用代理",
        14014: "该订单已取消",
        14015: "最多只能添加三个常用代理哦~",


        15001: "协议错误",
        15002: "执行失败",
        15003: "配置错误",
        15004: "用户不存在",
        15005: "代理匹配失败",
        15006: "会话无效",
        15007: "代理离线",
        15008: "请休息一下哦～",
        15009: "会话已经结束",
        15010: "会话未结束",
        15011: "数据库重复",
        15012: "未完成订单已达到上限",
        15013: "用户不存在",
        15014: "关闭订单上限已满",
        15015: "获取未完成订单数量有误",
        15016: "您已经举报过一次了",
        15018: "评价失败，请稍后重试",
        15019: "该支付凭证已使用过",
        15020: "修改评分错误",
        15021: "该代理不存在",
        15022: "密码错误",
        15023: "登陆失败",
        15024: "该代理不在线",

        15025: "获取订单失败，请稍后重试～",
        15026: "图片上传失败，请稍后重试～",
        15027: "订单创建失败，请稍后重试～",
        15028: "图片类型错误，请稍后重试～",

        15029: "玩家和商人平台不一致",
        15030: "打开会话失败",
        15031: "玩家在黑名单",

        13006: "活动即将来临",
        13007: "活动已结束",
        13008: "已拥有该奖品",
        13009: "抽奖次数不够",
        13010: "活动未激活",
        13011: "获取当前玩家抽奖信息失败",
        13012: "未在领取时间内",
        13013: "下注金额不够",
        13014: "没有资格领取",
        13015: "请拿到5活跃点之后再使用免费次数",
        13016: "刷新次数不够",
        13017: "抽奖卷不足",
        13018: "任务刷新时间间隔",
        13019: "任务刷新时间间隔",
        17001: "当前没有客服在线",
    }
    static KEFU: {
        NO_SERVER: 17001    //当前没有客服在线
    }
    static getErrStr(code: number | string, preFix?: string) {
        if (typeof code === "string") {
            return preFix + "，" + code;
        }
        let errDesc = this.CODES[code] || `未知错误：${code}`;
        if (preFix && errDesc.length + preFix.length <= 15) {
            errDesc = preFix + "，" + errDesc
        }
        return errDesc;
    }
}