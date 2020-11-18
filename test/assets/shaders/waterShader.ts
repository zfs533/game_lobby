
const { ccclass, property } = cc._decorator;

@ccclass
export default class waterShader extends cc.Component {

    private renderComponent: cc.RenderComponent;
    private material: cc.Material
    private startTime = 0;

    start() {
        this.renderComponent = this.node.getComponent(cc.RenderComponent)
        this.material = this.renderComponent.getMaterial(0);
        this.startTime = Date.now();
    }

    update(dt) {
        this.updateMaterial();
    }
    updateMaterial() {
        const now = Date.now();
        let time = (now - this.startTime) / 800;
        this.material.setProperty("iTime", time);
        this.renderComponent.setMaterial(0, this.material);
    }


}
