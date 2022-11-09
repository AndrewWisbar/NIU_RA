
/**
 * An implementation of the observer pattern, based on delegates found
 * in the C# language.
 * 
 * An object that wishes to be notified (the observer) of an event in 
 * another object (the subject), can subscribe a function to the delegate 
 * belonging to the subject. Then the subject can invoke the delegate when the
 * event occurs, calling the subscribed function in the observer. 
 * 
 * When subscribing a function, you must pass an object like:
 *   {"fn": funcToSub, "scope": refToObserver}
 * So that the function can be called in the scope of the observing object
 */
class Delegate {
    #subscribers = [];

    /**
     * Add a function to be called when the delegate is invoked
     * @param {function} fn 
     */
    subscribe(fn) {
        this.#subscribers.push(fn);
    }

    /**
     * Remove a function from the list of functions to invoke
     * @param {function} fn 
     */
    unsubscribe(fn) {
        this.#subscribers = this.#subscribers.filter(
            function (item) {
                if (item !== fn) {
                    return item;
                }
            }
        );
    }

    /**
     * Invoke each of the subscribed functions
     * @param {Object} obj An optional reference to an object, generally the 
     * owner of the delegate
     */
    invoke(obj) {
        
        this.#subscribers.forEach(item => {
            item.fn.call(item.scope, obj);
        });
    }
}