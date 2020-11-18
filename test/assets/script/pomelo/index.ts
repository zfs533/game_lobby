import { Client, Protos, Dicts } from "./wsclient/wsclient";
import { toj } from "../common/util";


declare global {
    interface Window {
        recharge: Client,
        kefu: Client
    }
}



function initRecharge() {
    function protosGetter(): Protos {
        let protosStr = cc.sys.localStorage.getItem('recharge_protos');
        if (!protosStr) {
            return;
        }
        return toj(protosStr)
    }
    function protosSetter(protos: Protos) {
        cc.sys.localStorage.setItem('recharge_protos', JSON.stringify(protos));
    }

    function dictsGetter(): Dicts {
        let str = cc.sys.localStorage.getItem('recharge_dicts');
        if (!str) {
            return;
        }
        return toj(str)
    }

    function dictsSetter(dicts: Dicts) {
        cc.sys.localStorage.setItem('recharge_dicts', JSON.stringify(dicts));
    }

    return new Client("recharge", { protosSetter, protosGetter, dictsGetter, dictsSetter })
}

function initKefu() {
    function protosGetter(): Protos {
        let protosStr = cc.sys.localStorage.getItem('kefu_protos');
        if (!protosStr) {
            return;
        }
        return toj(protosStr)
    }
    function protosSetter(protos: Protos) {
        cc.sys.localStorage.setItem('kefu_protos', JSON.stringify(protos));
    }

    function dictsGetter(): Dicts {
        let str = cc.sys.localStorage.getItem('kefu_dicts');
        if (!str) {
            return;
        }
        return toj(str)
    }

    function dictsSetter(dicts: Dicts) {
        cc.sys.localStorage.setItem('kefu_dicts', JSON.stringify(dicts));
    }

    return new Client("kefu", { protosSetter, protosGetter, dictsGetter, dictsSetter })
}



export = function () {
    window.recharge = initRecharge();
    window.kefu = initKefu();
}
