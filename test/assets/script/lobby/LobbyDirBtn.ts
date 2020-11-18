import LobbyDirector from "./lobbyDirector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LobbyDirBtn extends cc.Component {

    @property(cc.Label)
    label1: cc.Label = undefined;

    @property(cc.Label)
    label2: cc.Label = undefined;

    private lobbyDir: LobbyDirector;

    private index: number = 0;

    private data: ps.GameCategory;

    init(ld: LobbyDirector, data: ps.GameCategory) {
        this.lobbyDir = ld;
        this.data = data;
        this.label1.string = data.name;
        this.label2.string = data.name;
    }

    onToggleClicke() {
        this.lobbyDir.onToggleClick(this.data.idx, this.data.games);
    }
}
