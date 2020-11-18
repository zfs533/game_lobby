
/**
 * 事件消息处理
 */
export class EventCenter {
    /** 监听数组 */
    private listeners = {};

    private static _instance = null;
    public static get instance(): EventCenter {
        if (!this._instance || this._instance == null) {
            this._instance = new EventCenter();
        }
        return this._instance;
    }

    /** 
     * 注册事件
     * @param name 事件名称
     * @param callback 回调函数
     * @param context 上下文
     */
    public addListener(name: string, callback: Function, context: any) {
        let observers: Observer[] = this.listeners[name];
        if (!observers) {
            this.listeners[name] = [];
        }
        this.listeners[name].push(new Observer(callback, context));
    }
    /** 
    * 注册事件调用一次
    * @param name 事件名称
    * @param callback 回调函数
    * @param context 上下文
    */
    public addListenerOnce(name: string, callback: Function, context: any) {
        let observers: Observer[] = this.listeners[name];
        if (!observers) {
            this.listeners[name] = [];
        }
        this.listeners[name].push(new Observer(callback, context, 1));
    }

    /** 
        * 注册事件调用一次
        * @param name 事件名称
        * @param callback 回调函数
        * @param context 上下文
        * @param times  调用次数
        */
    public addListenerTimes(name: string, callback: Function, context: any, times: number) {
        if (times < 0) {
            this.addListener(name, callback, context)
        } else if (times === 1) {
            this.addListenerOnce(name, callback, context)
        } else if (times > 1) {
            let observers: Observer[] = this.listeners[name];
            if (!observers) {
                this.listeners[name] = [];
            }
            this.listeners[name].push(new Observer(callback, context, times));
        } else {
            console.log("0次不做监听");
        }

    }
    /**
     * 移除事件
     * @param name 事件名称
     * @param callback 回调函数
     * @param context 上下文
     */
    public removeListener(name: string, context: any) {
        let observers: Observer[] = this.listeners[name];
        if (!observers) return;
        let length = observers.length;
        for (let i = 0; i < length; i++) {
            let observer = observers[i];
            if (observer.compar(context)) {
                observers.splice(i, 1);
                break;
            }
        }
        if (observers.length == 0) {
            delete this.listeners[name];
        }
    }

    public hasListen(name: string, context: any): boolean {
        let observers: Observer[] = this.listeners[name];
        if (!observers) return false
        let length = observers.length;
        for (let i = 0; i < length; i++) {
            let observer = observers[i];
            if (observer.compar(context)) {
                return true
            }
        }
        return false;
    }


    /**
     * 发送事件
     * @param name 事件名称
     */
    public fire(name: string, ...args: any[]) {
        let observers: Observer[] = this.listeners[name];
        if (!observers) return;
        let length = observers.length;
        for (let i = 0; i < length; i++) {
            let observer = observers[i];
            observer.notify(...args);
            observer.callCount();
            if (observer.isRemove) {
                //移除该监听
                this.removeListener(name, observer.content)
            }
        }
    }
}

/**
 * 观察者
 */
class Observer {
    /** 回调函数 */
    private callback: Function = null;
    /** 上下文 */
    private context: any = null;

    /**调用次数 */
    private callTime: number = -1;//-1表示无限次数监听

    constructor(callback: Function, context: any, times: number = -1) {
        let self = this;
        self.callback = callback;
        self.context = context;
        self.callTime = times;
    }


    get times() {
        return this.callTime
    }

    get isRemove() {
        return this.callTime == 0 ? true : false
    }

    get content() {
        return this.content;
    }

    callCount() {
        if (this.callTime == -1) return
        this.callTime--;
    }
    /**
     * 发送通知
     * @param args 不定参数
     */
    notify(...args: any[]): void {
        let self = this;
        self.callback.call(self.context, ...args);
    }

    /**
     * 上下文比较
     * @param context 上下文
     */
    compar(context: any): boolean {
        return context == this.context;
    }
}





