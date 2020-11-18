import { GameId } from "../common/enum";
import g from "../g";
const cor0 = '#084072'
const cor1 = '#6A4B52'
const cor2 = '#B64153'
const cor3 = '#FFFFFF'
export class How2Play {


    static gameHelpDesc(gameName: GameId) {
        switch (gameName) {
            case GameId.BRNN:
                return `<color=${cor0}>【下注】</c>
<color=${cor1}>    1.所有玩家可以在四个区域中重复下注。
    2.闲家下注金额不能超过自身携带金额除以该房间最大牌型的倍数。</c>
<color=${cor0}>【庄家】</c>
<color=${cor1}>    1.玩家携带的金币大于一万才能申请坐庄，坐庄与所有下注玩家对赌。
    2.游戏过程中庄家可随时申请下庄，金币不足一万将自动下庄。
    3.庄家连庄10局后自动下庄。
    4.庄家输赢金额以闲家下注金额为基础乘以对应牌型倍数。</c>
<color=${cor0}>【闲家】</c>
<color=${cor1}>    1.闲家在桌上下注，与庄家进行对赌。
    2.四个闲家区域不互相进行对比，只和庄家对比，比庄家大即为获胜。
    3.闲家输赢金额以该闲家下注金额为基数乘以对应牌型倍数。</c>
<color=${cor0}>【牌型】</c>
<color=${cor1}>    五小牛 &gt; 五花牛 &gt; 炸弹牛 &gt; 牛牛 &gt; 牛9 &gt; 牛8 &gt; 牛7 &gt; 牛6 &gt; 牛5 &gt; 牛4 &gt; 牛3 &gt; 牛2 &gt; 牛1 &gt; 无牛。</c>
<color=${cor0}>【赔率】</c>
<color=${cor1}>    1-5倍场房间：
    1.无牛到牛六：1倍。
    2.牛七、牛八、牛九：2倍。
    3.牛牛：3倍。
    4.炸弹牛：4倍。
    5.五花牛和五小牛：5倍。

    1-10倍场房间：
    1.无牛、牛一：1倍。
    2.牛二到牛九依次为：2、3、4、5、6、7、8、9倍。
    3.牛牛、炸弹牛、五花牛均为10倍。</c>
                `;
            case GameId.DDZ:
                return `<color=${cor0}>【发牌】</c>
<color=${cor1}>    叫地主阶段每人17张手牌，3张底牌。确认地主后，地主获得3张底牌。</c>
<color=${cor0}>【叫分】</c>
<color=${cor1}>    1.随机选定一个玩家开始，按逆时针轮流叫分。
    2.叫分可以选择“1分”“2分”“3分”“不叫”。三人中，叫分最高的玩家为地主。
    3.下家只能叫比上家更高的分或者不叫。有玩家叫3分则直接确定该玩家为地主。
    4.如果三人都不叫，则重新发牌。</c>
<color=${cor0}>【倍数】</c>
<color=${cor1}>    炸弹倍数：炸弹或者火箭：2倍。
    农民春天：两位农民从游戏开始到游戏结束未出一张手牌：2倍
    地主春天：地主从游戏开始到游戏结束只出过一手牌：2倍
    计算方法：倍数 = 地主叫分 x 炸弹倍数 x 春天。</c>
<color=${cor0}>【加倍】</c>
<color=${cor1}>    农民可选择加倍或不加倍，若有加倍则输赢x2。</c>
<color=${cor0}>【出牌】</c>
<color=${cor1}>    1.地主首先出牌，然后逆时针依次出牌。轮到玩家跟牌时，可选择不出或出大于上家的牌。
    2.某一玩家出完牌时结算本局。</c>
<color=${cor0}>【牌型说明】</c>
<color=${cor1}>    1.火箭最大，即双王（大王和小王）可以打任意其他的牌。
    2.炸弹比火箭小，比其他牌大，都是炸弹的时候按牌的点数比大小。
    3.除火箭和炸弹外，其他牌必须要牌型相同且总张数相同才能比大小。
    4.单牌：按牌的点数，2&gt;A&gt;K&gt;Q&gt;J&gt;10&gt;9&gt;8&gt;7&gt;6&gt;5&gt;4&gt;3，不分花色。
    5.对牌：数值相同的两张牌（如：44）。
    6.三张牌：数值相同的三张牌（如：JJJ）。
    7.三带一，三带二，按三个相同的点数比。带的牌的不影响大小。
    8.单顺子，双顺子，三顺子，按顺子的最大点数。
    9.飞机带翅膀，四带二，按其中的最大的三张，或四张点数来比大小。</c>
                `;
            case GameId.JH:
                return `<color=${cor0}>【基本规则】</c>
<color=${cor1}>    1.开局：系统自动扣除玩家底注。
    2.发牌：从庄家开始发牌，每人发三张牌。
    3.流程：2~5人，从庄家开始，逆时针轮流说话，玩家可加注、跟注、看牌、弃牌、比牌、全押。
    4.轮数：一共20轮，首轮必须闷牌。
    5.看牌：第一轮押注结束后，第二轮开始才能看牌，看牌后，跟注、加注、比牌都需要双倍筹码。
    6.弃牌：未看牌的玩家在弃牌后可以看到自己的牌。
    7.比牌：第一轮过后玩家可以比牌，获胜者继续游戏，失败者结束游戏。两家牌型大小相同时，主动比牌者负。
    8.跟注：下注跟上一个玩家同样的下注筹码。
    9.加注：下注比上一个玩家更大的下注筹码。
    10.全押：第二轮过后允许玩家全押筹码（但不超过该房间上限）。
    11.胜负：大多数情况下，每局只有一个赢家，最后胜出者赢得本局的全部筹码。
    12.庄家：本游戏不采取轮庄制。上局胜者为庄家，如庄家离开，随机选定庄家。
    公平起见，第19轮后禁止使用“全押”功能。第20轮，在场的玩家各自下1注当前注，系统强制比牌。
    特殊情况：系统强制比牌，如有多个玩家牌型相同且最大时，如有庄家，庄家胜利；如没有庄家，则该多个玩家平分全部筹码。</c>
<color=${cor0}>【牌型大小】</c>
<color=${cor1}>    1.豹子 &gt; 顺金 &gt; 金花 &gt; 顺子 &gt; 对子 &gt; 散牌。
    2.同种牌型按牌点从大到小比较。
    牌点从大到小为：A、K、Q、J、10、9、8、7、6、5、4、3、2（不分花色）。
    3.顺金、顺子：AKQ &gt; KQJ … 432 &gt; A23。
    4.豹子 &gt; 235。</c>
                `;
            case GameId.JDNN:
                return `<color=${cor0}>【牛牛算法】</c>
<color=${cor1}>    1.每人5张牌，如任意三张（JQK=10点）相加为10的倍数，即“有牛”；否则“无牛”。
    2.有牛后剩余2张牌相加的个位数是几（1～9），就是牛几；如是10的倍数，则是“牛牛”。
<color=${cor0}>【特殊牌型】</c>
<color=${cor1}>    1.五小牛：五张牌均小于5，且相加&lt;=10。
    2.五花牛：五张牌都为JQK。
    3.炸弹牛：五张牌中有4张点数相同。</c>
<color=${cor0}>【牌型大小】</c>
<color=${cor1}>    1.五小牛&gt;五花牛&gt;炸弹牛&gt;牛牛&gt;有牛&gt;无牛。
    2.点数相同比较：取最大点数那张牌来比，如点数相同，则比较花色：
    黑桃&gt;红桃&gt;梅花&gt;方块。</c>
<color=${cor0}>【倍数】</c>
<color=${cor1}>    1.无牛~牛六 x1倍。
    2.牛七~牛九 x2倍。
    3.牛牛 x3倍。
    4.炸弹牛 x4倍。
    5.五小牛、五花牛 x5倍。</c>
<color=${cor0}>【流程】</c>
<color=${cor1}>    抢庄--&gt;玩家下分--&gt;发5张牌--&gt;亮牌--&gt;与庄家比牌--&gt;结算</c>
                `;

            case GameId.ERMJ:
                return `<color=${cor0}>【麻将牌】</c>
<color=${cor1}>    1.万牌：从一万至九万，各4张，共36张。
    2.风牌：东、南、西、北，各4张，共16张。
    3.箭牌：中、发、白，各4张，共12张。</c>
<color=${cor0}>【基本规则】</c>
<color=${cor1}>    将牌：按基本牌型胡牌时必须具备的单独组合的对子。
    顺子：3张相连万牌，如：一二三万、七八九万。
    刻子：3张相同的牌。碰出的为明刻，在手牌中的是暗刻。
    对子：2张相同的牌。
    字牌：指风牌和箭牌。
    幺九牌：一万、九万、字牌。
    吃牌：指对家出牌后，吃家用2张牌和对家出的牌组合在一起成为顺子，并将此副牌亮出。
    碰牌：指对家出牌后，碰者用对子和对家出的牌组合在一起成为刻子，并将此副牌亮出。
    杠牌：将4张相同的牌，手牌中有4张相同的牌可以开杠，或用3张牌和对家出的牌组合在一起成为4张相同的牌可以开杠。
    听牌：只差所需的一张牌既能胡牌的状态。
    胡牌：符合规定的牌型条件，达到起胡标准可胡牌。
    自摸：自己抓进胡牌。
    点炮：胡对家打出来的牌。
    番种：具有一定分值的各种牌组合的形式或胡牌的方式。
    流局：每局抓完64张牌，打出后仍无人胡牌。</c>
<color=${cor0}>【翻倍】</c>
<color=${cor1}>    听牌后，能胡的牌若不胡就能对当前番数进行翻倍，即1张不胡翻2倍，2张不胡翻4倍，依此类推。</c>
            `;
            case GameId.HH:
                return `<color=${cor0}>【规则】</c>
<color=${cor1}>    游戏中分为红、黑两个大区域以及豹子、顺金、金花、顺子、对子特殊牌型区域，共3个区域。
    下注结束后展示红、黑两方牌。展示结束后，按照牌型规则进行大小比较。
    玩家押中则获得该倍率的奖励，未押中则输掉下注金币。</c>
<color=${cor0}>【牌型比较】</c>
<color=${cor1}>    1.豹子 &gt; 顺金 &gt; 金花 &gt; 顺子 &gt; 对子 &gt; 散牌
    2.豹子、金花、对子、单张的比较，按照顺序比点的规则比较大小。
    牌点从大到小为：A、K、Q、J、10、9、8、7、6、5、4、3、2。
    如果相同牌型比较花色：黑桃 &gt; 红桃 &gt; 梅花 &gt; 方片。
    3.顺金、顺子按照顺序比点。AKQ &gt; KQJ … 432 &gt; A23，若点数一样（比如：均为432）则比较花色。</c>
<color=${cor0}>【投注区域】</c>
<color=${cor1}>    1.红方：红方胜利则获得对应金额赔付。
    2.黑方：黑方胜利则获得对应金额赔付。
    3.幸运一击：场上出现幸运区的特殊牌型时，可获得对应的倍率，特殊牌型不分红黑方。</c>
            `;
            case GameId.LH:
                return `<color=${cor0}>【牌型比较】</c>
<color=${cor1}>    1.龙虎斗使用8副牌进行游戏，只比较牌点，不比较花色。
    2.牌点从大到小为：K&gt;Q&gt;J&gt;10&gt;9&gt;8&gt;7&gt;6&gt;5&gt;4&gt;3&gt;2&gt;A。
    3.牌点相同为和。
    4.玩家可押注“龙”、“虎”、“和”三个区域。</c>
<color=${cor0}>【赔率】</c>
<color=${cor1}>    1.龙：1:1赔率（和局全退）。
    2.虎：1:1赔率（和局全退）。
    3.和局：1:13赔率。</c>
                `;
            case GameId.QZNN:
                return `<color=${cor0}>【牛牛算法】</c>
<color=${cor1}>    1.每人5张牌，如任意三张（JQK=10点）相加为10的倍数，即“有牛”；否则“无牛”。
    2.有牛后剩余2张牌相加的个位数是几（1～9），就是牛几；如是10的倍数，则是“牛牛”。
<color=${cor0}>【特殊牌型】</c>
<color=${cor1}>    1.五小牛：五张牌均小于5，且相加&lt;=10。
    2.五花牛：五张牌都为JQK。
    3.炸弹牛：五张牌中有4张点数相同。</c>
<color=${cor0}>【牌型大小】</c>
<color=${cor1}>    1.五小牛&gt;五花牛&gt;炸弹牛&gt;牛牛&gt;有牛&gt;无牛。
    2.点数相同比较：取最大点数那张牌来比，如点数相同，则比较花色：
    黑桃&gt;红桃&gt;梅花&gt;方块。</c>
<color=${cor0}>【倍数】</c>
<color=${cor1}>    1.无牛~牛六 x1倍。
    2.牛七~牛九 x2倍。
    3.牛牛 x3倍。
    4.炸弹牛 x4倍。
    5.五小牛、五花牛 x5倍。</c>
<color=${cor0}>【流程】</c>
<color=${cor1}>    发4张牌--&gt;抢庄--&gt;玩家下分--&gt;发第5张牌--&gt;亮牌--&gt;与庄家比牌--&gt;结算</c>
                `;

            case GameId.PDK:
                return `<color=${cor0}>【使用的牌】</c>
<color=${cor1}>    一副牌（去掉大小王、三个2、黑桃A），共48张，每人16张。</c>
<color=${cor0}>【游戏过程】</c>
<color=${cor1}>    摸到红桃3的玩家先出牌，最先出完手中16张牌的人获胜。</c>
<color=${cor0}>【出牌规则】</c>
<color=${cor1}>    1.逆时针出牌。
    2.上家出的牌，下家有牌能压住则必须出牌。
    3.包赔：下家剩一张牌时，必须先出手牌中大于一张牌组合的牌，例如对子、三带、顺子等，否则放走下家判定为放走包赔。手牌全单的情况：从最大牌张先出，否则放走下家判定为放走包赔。
    4.炸弹：本轮出最大炸弹的玩家获得：2x5x基数的金币，其余两玩家扣除：5x基础分的金币。
    5.反关规则：
        反关：牌局结束时，若红桃3玩家只出了一手牌，则该玩家被反关，输掉：2x剩余手牌数x基数的金币。
        被关：牌局结束时，若红桃3玩家手牌出完，其余两玩家一手牌未出，则两玩家被关，输掉：2x剩余手牌数x基数的金币。
    6.提前亮牌：当领出玩家手牌全大时，三家同时亮牌，正常结算分数，提前结束牌局。</c>
<color=${cor0}>【牌型】</c>
<color=${cor1}>    1.单张：牌点从大到小为2、A、K、Q、J、10、9、8、7、6、5、4、3。
    2.对子：2张点数相同的牌，AA最大，33最小。
    3.三带n：3张同点数的牌可带2张、1张或不带，带的牌不要求同点数；接牌时，必须按上家的3带n接。
    4.顺子：5张或以上相连的牌。如：45678。
    5.连对：相连的对子。如：7788，334455。
    6.三顺：相连的3同张。如：888999。
    7.飞机带翅膀：相连的3同张。连n个3同张，则可带n张牌或者2n张牌。如：333444，可带2张牌，也可带4张牌。333444555，可带3张牌，也可带6张牌。
    8.炸弹：4张相同点数的牌。如：6666；炸弹的大小和牌点大小规则相同。
    9.四带n：当玩家选择四带n的时候，四张不算炸弹，无法获得炸弹奖励。四带n最多可带3张牌。</c>
                    `;
            case GameId.BY:
                let cor
                if (cc.director.getScene().name === g.lobbyScene) cor = cor1;
                else cor = cor3
                return `<color=${cor2}>【捕鱼须知】</c>
<color=${cor}>    1.炮倍可以通过【+】【-】来调整。获奖金币 = 所选炮倍 x 鱼的倍率
    2.【锁定】：玩家可以自主选定攻击对象，所发射的炮弹将只会攻击锁定的鱼，而不会打到其他鱼身上；倘若目标鱼被击杀或者消失，需要手动切换目标。
    3.【自动】：自动朝某一方向发射炮弹，方向由玩家调整。
    4.【换炮】：按照充值金额可以解锁更换不同的炮台。炮台越强，说不定捕鱼越厉害哦~~
    5.【特殊技能鱼】：
        冰冻水晶：将屏幕内所有鱼冻结一定时间，方便玩家捕获目标鱼哦。
        炸弹：将其范围内一定大小的鱼成群击杀。
        闪电鱼：死亡后发出闪电效果，连锁击杀附近的鱼群。
    6.【BOSS鱼】：
        黄金龙王：超丰厚的奖励。
        美人鱼：更丰厚的奖励。</c>
                    `
            case GameId.DZPK:
                return `<color=${cor0}>【基本规则】</c>
<color=${cor1}>    1.游戏参与人数2～6人。
    2.一副牌去掉大小王，共52张。
    3.从庄家开始每人发2张手牌，再发5张公共牌。
    4.玩家用自己的2张手牌和5张公共牌组合成最大牌型，与其他玩家进行比较。
    5.游戏一共押四轮注：每人发2张牌后进行第一轮押注；发3张公共牌后押第二轮注；发第4张公共牌后押第三轮注；发第5张公共牌后押第四轮注。
    6.第四轮押注结束后所有剩余玩家进行比牌，最大者赢得底池。</c>
<color=${cor0}>【游戏玩法】</c>
<color=${cor1}>    1.庄家（D）：第一局庄家位置由系统随机指定，以后每局庄家位置按顺时针方向下移一位。
    2.大小盲注：庄家的顺时针下家为小盲注，每局游戏固定下小盲注金额的底注；小盲注的下家为大盲注，每局游戏固定下大盲注金额的底注。
    3.发牌：
        第1轮：大小盲注下注后，开始发牌，从小盲注玩家开始，顺时针方向发2张手牌。第1轮发牌结束后从大盲下一家开始表态。
        第2轮：首轮表态达成一致后，开始发第二轮牌，发三张公牌（术语叫做“翻牌”）。从庄家的下一家开始表态。
        第3轮：所有玩家达成一致后，开始发第三轮牌，发一张公牌（术语叫做“转牌”）。从庄家的下一家开始表态。
        第4轮：所有玩家达成一致后，开始发第四轮牌，发最后一张公牌（术语叫做“河牌”）。从庄家的下一家开始表态。
    4.表态：一玩家结束表态后按顺时针方向下一玩家获得表态权，直到不再有人弃牌，且每人已向奖池投入相同注额。
        表态包含以下几种动作：
        a.弃牌：放弃本副牌，不再有表态权，也不会赢得本局奖池。
        b.让牌：不下注也不弃牌，让过行动权。只有在本轮还无人下注时可以让牌。（第一轮刚开始下注时视为目前的单注额为大盲注，因此第一轮下注无人可以让牌）
        c.跟注：下注等同于目前单注的注额。若玩家没有足够金额时会被迫全押（ALL-IN）。
        d.加注：下注高于目前单注的注额且至少是上个玩家下注额的两倍，若玩家没有足够金额时会被迫全押（ALL-IN）。
        e.全押（ALL-IN）：全押当前玩家携带的全部金币，任何玩家都可以选择全押。
    5.摊牌和比牌：
        比牌时，每位玩家用自己的2张手牌和5张公共牌组合成最大牌型，与其他玩家进行比较。胜者赢得底池所有筹码。若有多人获胜，则平分底池筹码。
        （注：如果除弃牌玩家外的所有玩家都ALL-IN，则公牌全部发出，然后马上比牌）
        a.基本牌型比较：皇家同花顺 &gt; 同花顺 &gt; 金刚（四条） &gt; 葫芦 &gt; 同花 &gt; 顺子 &gt; 三条 &gt; 两对 &gt; 一对 &gt; 高牌（单牌）。
        b.同种牌型，比该牌型的牌点大小（如相同则依次比较其他牌点）。如都相同，则两副牌相等。
        c.如果公牌牌面为组合的最大牌型，则不计玩家的手牌，所有在场玩家平分底池。</c>
                `;
            case GameId.QHB:
                return `<color=${cor0}>【抢红包】</c>
<color=${cor1}>    1.本游戏中，发红包的玩家为庄家，抢红包的玩家为扫雷玩家。
    2.扫雷玩家抢到红包，即可获得红包内的一部分金币。
        a.如果扫雷玩家本次获得的红包金额尾数与庄家设置的雷号不同，则避雷成功。
        b.如果扫雷玩家本次获得的红包金额尾数与庄家设置的雷号相同，则算作中雷。
    注：中雷玩家需要根据房间赔率和庄家红包金额赔付给庄家。
    3.抢红包时，自己身上携带的金币必须不少于当前红包金额才能抢红包（否则不够赔给庄家）。
    4.在规定时间内未被玩家抢完的红包超时会自动退回给庄家。</c>

<color=${cor0}>【自动抢红包】</c>
<color=${cor1}>    玩家点击自动抢按钮后，系统会帮助玩家自动抢红包，再次点击会取消自动抢红包。
    (注：玩家携带金币必须不少于房间的最小红包金额才能开启自动抢红包)</c>

<color=${cor0}>【发红包】</c>
<color=${cor1}>    1.玩家根据本房间限定金币的范围，选择任意一个红包金额和0-9中的任意一个数字作为雷号，确定发红包后即可发出红包。
    2.红包发出后进入等待列表依次发出。
    3.自己发的红包，只要自己携带的金币足够，自己也能抢，并且中雷后不赔。</c>
<color=${cor0}>【自动发红包】</c>
<color=${cor1}>    玩家点击发红包按钮，会触发自动状态，点击自动后，系统会根据您上一次的所发红包，自动将红包加入等待列表，再次点击自动会取消自动发红包。
    (注:玩家携带金币少于上一次设置的红包金额时，自动发红包将自动关闭)</c>
                `;
            case GameId.EBG:
                return `
<color=${cor0}> 【游戏玩法】：</c>
<color=${cor1}>      玩法很简单，区分为庄家( 1方 )跟闲家( 3方 )，总共四方，依此类推。</c>
<color=${cor0}> 【基础规则】：</c>
<color=${cor1}>      参与游戏后，玩家若提前退出或掉线，则系统托管至当局结束。
      游戏牌型从一筒到九筒，加上白板共40张牌。
	下注
        1、玩家可在天门、地门、顺门三个区域内重复下注。
        2、玩家最大下注金额不能超过庄家最大赔付金额。
        3、玩家最小下注金额为当前房间限制底注。
        4、玩家下注时间为10秒。

	庄家
        1、初始为系统庄家，玩家携带金币达到一万时，即可申请上庄，若金币不够一万，则下一局自动下庄。
        2、游戏中若玩家携带金币足够，坐满五局庄家自动下庄，轮换下一位玩家为庄家。
        3、玩家下庄之后，若申请上庄列表中有玩家申请上庄，则按玩家申请的时间顺序上庄，若无玩家申请上庄，则系统坐庄，之前上庄玩家可再次申请上庄，无限制。
        4、玩家当庄若是五局未结束就退出房间，则强制下庄，下一局开始则由下一位玩家上庄
        5、庄家输赢金额以玩家下注金额为准。

	闲家
        1、未申请庄家的玩家在桌上三个闲家区域下注，与庄家博弈。
        2、三个闲家区域不相互博弈，只与庄家博弈，单独对比。
        3、庄家必须与闲家博弈比大小，谁大谁赢。
        4、玩家输赢金额以下注金额为准。
                </c>
                    `;
            case GameId.HBSL:
                return `
<color=${cor0}> 【基础规则】：</c>
<color=${cor1}>       1、玩家发红包一次可发1~10个红包，排队结束在线玩家可以立即抢夺红包，所发红包均被抢完后可继续发红包。
        2、抢红包玩家携带金币需不低于所抢红包金额x赔率倍数等额的金币，否则不可以抢该红包。
        3、打开红包如果尾数和发红包玩家所设置雷号相同，即为中雷，中雷玩家需赔付红包金额x赔率倍数的等额金币给发红包玩家。
        4、抢红包未中雷，即为抢红包成功，玩家获的金币=红包显示所抢金额x游戏税率。
        5、玩家不可以抢夺自己所发红包。
        6、红包队列最高可有200个红包，达到上限后暂时不可发红包。
        7、红包池中10秒内无人抢的红包，系统默认过期并将红包剩余的金额退还给发红包玩家。
        8、当您不方便手动抢夺红包时，可设置自动抢红包，包括设置所要抢红包的1个或多个雷号（系统默认为所有）；所要抢红包的金额区间（默认为全部金额）。
        </c>
        `;
            default:
                return "";

        }
    }
}