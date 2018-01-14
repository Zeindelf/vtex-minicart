
class Private {
    _setInstance(self) {
        this._self = self;
    }

    _debug() {
        if ( this._self.option.debug ) {
            window.console.group('VtexMinicart Debbug');
            window.console.log(this._self.cart.items);
            window.console.groupEnd();
        }
    }

    _removeItem(index) {
        vtexjs.checkout.getOrderForm().then((orderForm) => {
            this._addLoader();

            let item = orderForm.items[index];
            item.index = index;

            return vtexjs.checkout.removeItems([item]);
        }).done((orderForm) => {
            this._self.fillCart();
            this._removeLoader();
            this._deleteItemEvent(orderForm);
        });
    }

    _updateItem(index, quantity) {
        vtexjs.checkout.getOrderForm().then((orderForm) => {
            this._addLoader();

            const updateItem = {
                index: index,
                quantity: quantity,
            };

            return vtexjs.checkout.updateItems([updateItem], null, false);
        }).done((orderForm) => {
            this._self.fillCart();
            this._removeLoader();
            this._updateItemEvent(orderForm, index);
        });
    }

    // Loaders
    _addLoader() {
        if ( this._self.option.bodyClass ) {
            $('body').addClass(this._self.option.bodyClass);
        }
    }

    _removeLoader() {
        if ( this._self.option.bodyClass ) {
            $('body').removeClass(this._self.option.bodyClass);
        }
    }

    // Custom events
    _requestStartEvent() {
        /* eslint-disable */
        const ev = $.Event('vtexMinicart.requestStart');
        /* eslint-enable */

        $(document).trigger(ev);
    }

    _requestEndEvent(orderForm) {
        /* eslint-disable */
        const ev = $.Event('vtexMinicart.requestEnd');
        /* eslint-enable */

        $(document).trigger(ev, [orderForm]);
    }

    _updateItemEvent(orderForm, index) {
        /* eslint-disable */
        const ev = $.Event('vtexMinicart.update');
        /* eslint-enable */
        const item = orderForm.items[index];

        $(document).trigger(ev, [orderForm, index, item]);
    }

    _deleteItemEvent(orderForm) {
        /* eslint-disable */
        const ev = $.Event('vtexMinicart.delete');
        /* eslint-enable */

        $(document).trigger(ev, [orderForm]);
    }
}

export default Private;
