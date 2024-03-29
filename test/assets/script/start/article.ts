import ScrollViewBox from "../lobby/scrollViewBox";
import { getAppName } from "../common/app";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Article extends ScrollViewBox {
    @property(cc.Label)
    private lblContent: cc.Label = undefined;

    protected onLoad() {
        super.onLoad();
        let name = getAppName();
        this.lblContent.string = `                           《${name}》用户个人信息及隐私政策须知
        为贯彻执行文化部颁布的《网络游戏管理暂行办法》以及《关于贯彻实施<网络游戏管理暂 行办法>的通知》，${name}（以下称“本游戏”）特此制定本政策。
        本游戏在此特别提醒用户仔细阅读本《本游戏游戏用户个人信息及隐私保护政策》中的各个条款（未成年人应当在其法定监护人陪同下阅读），并选择接受或者不接受本《本游戏游戏用户个人信息及隐私保护政策》。如用户不同意本政策的任意内容，请不要注册或使用本游戏服务。
        1、用户同意：个人隐私信息是指那些能够对用户进行个人辨识或涉及个人通信的信息，包括下列信息：用户的姓名、有效身份证件号码，地址、定位、电话号码，IP地址，电子邮件地址、用户在本游戏中的数据。而非个人隐私信息是指用户对本软件的操作状态以及使用习惯等一些明确且客观反映在本游戏服务器端的基本记录信息和其他一切个人隐私信息范围外的普通信息。
        2、一般而言，本游戏公司基于下列原因需要使用到用户的信息资源：
        （1）执行软件验证服务。
        （2）执行软件升级服务。
        （3）网络同步服务。
        （4）提高用户的使用安全性并提供客户支持。
        （5）因用户使用本软件特定功能或因用户要求本游戏或合作单位提供特定服务时，本游戏或合作单位则需要把用户的信息提供给与此相关联的第三方。
        （6）执行用户协议相关条款。
        （7）其他有利于用户和本游戏利益的。
        3、本游戏尊重个人隐私，注重对用户信息资源的保护。本游戏将使用各种有效安全技术和程序来保护用户信息不被未经授权的访问、使用和泄漏。本游戏不向第三方公开透露用户信息，但下列情形除外：
        （1）基于国家法律法规的规定而披露；
        （2）应国家司法机关及其他有法律赋予权限的政府机关基于法定程序的要求而披露；
        （3）为保护本游戏或您的合法权益而披露；
        （4）在紧急情况下，为保护其他用户及第三方人身安全而披露；
        （5）本游戏为了维护自己合法权益而向用户提起诉讼或者仲裁时；
        （6）用户本人或用户监护人授权披露；
        （7）应用户监护人合法要求而提供用户个人身份信息时。
        4、信息安全
        （1）本游戏对玩家账号有安全保护功能，请妥善保管您的用户名及密码信息。我们将通过对密码进行加密等安全措施确保您的信息不丢失、不被滥用、变造。尽管有前述安全措施，但同时也请您注意保护个人信息和资料的安全。
        （2）如您发现自己的个人信息泄密，特别是本游戏用户名及密码发生泄露，请您立即联络客服，以便我们及时采取相应措施。`
    }
}
