interface Window {
    readonly pomelo: pomelo.Pomelo;
}

declare namespace pomelo {
    class Emitter {
        /**
         * Listen on the given `event` with `fn`.
         *
         * @param {String} event
         * @param {Function} fn
         * @return {Emitter}
         * @api public
         */
        // addEventListener: (event: string, fn: Function) => Emitter;
        on(event: string, fn: Function): Emitter;
        /**
       * Adds an `event` listener that will be invoked a single
       * time then automatically removed.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */
        once(event: string, fn: Function): Emitter;
        /**
       * Remove all registered callback for all `event`.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */
        // removeEventListener: (event: string, fn: Function) => Emitter;
        // removeAllListeners: (event: string, fn: Function) => Emitter;
        // removeListener: (event: string, fn: Function) => Emitter;
        off(): Emitter;
        /**
       * Remove all registered callback for `event`.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */
        off(event: string): Emitter;
        /**
       * Remove the given callback for `event`
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */
        off(event: string, fn: Function): Emitter;
        /**
       * Emit `event` with the given args.
       *
       * @param {String} event
       * @param {Mixed} ...
       * @return {Emitter}
       */
        emit(event: string, ...args): Emitter;
        /**
       * Return array of callbacks for `event`.
       *
       * @param {String} event
       * @return {Array}
       * @api public
       */
        listeners(event: string): Array<Function>;
        /**
       * Check if this Emitter has `event` handlers.
       *
       * @param {String} event
       * @return {Boolean}
       * @api public
       */
        hasListeners(event: string): boolean;
    }

    class Pomelo extends Emitter {
        /**初始化 */
        init(params, log: any, callback: Function): void;
        /**请求服务器 */
        request(route: string, msg, callback: Function): void;
        /**通知服务器 */
        notify(route: string, params): void;
        disconnect(): void;
    }
}