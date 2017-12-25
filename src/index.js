
import Helpers from './helpers.js';
import './rivets-formatters.js';

(($) => {
    'use strict';

    let VtexMinicart = function(element, option) {
        let defaults = {
            debug: false,
            bodyClass: null,
        };

        this.option = $.extend({}, defaults, option);
        this.$element = $(element);
        this.init();
    };

    VtexMinicart.prototype = {
        cart: {
            items: {},
            itemCount: 0,
        },

        init() {
            this.bindData();
            this.fillCart();
            this.updateItem();
            this.removeItem();
        },

        bindData() {
            rivets.bind(this.$element, {
                controller: VtexMinicart,
                cart: this.cart,
            });
        },

        fillCart() {
            this._requestStartEvent();

            vtexjs.checkout.getOrderForm().done((orderForm) => {
                this.$element.find('[data-minicart-subtotal]').html(`R$ ${Helpers.formatPrice(orderForm.value)}`);
                this.cart.itemCount = orderForm.items.length;
                this.cart.items = orderForm.items;

                if ( this.cart.itemCount > 0 ) {
                    const sumQuantity = orderForm.items.reduce((acc, obj) => acc + obj.quantity, 0);
                    $('[data-minicart-amount]').text(sumQuantity);

                    orderForm.items.map((item, index) => {
                        vtexjs.catalog.getProductWithVariations(item.productId).done((product) => {
                            const variantInfo = product.skus.filter((sku) => parseInt(sku.sku) === parseInt(item.id));

                            if ( item.sellingPrice === item.listPrice ) {
                                this.cart.items[index].listPrice = 0;
                            }

                            // Custom product properties
                            this.cart.items[index].productInfo = product;
                            this.cart.items[index].index = index;
                            this.cart.items[index].availablequantity = variantInfo[0].availablequantity;
                            this.cart.items[index].installments = variantInfo[0].installments;
                            this.cart.items[index].installmentsInsterestRate = variantInfo[0].installmentsInsterestRate;
                            this.cart.items[index].installmentsValue = variantInfo[0].installmentsValue;
                            this.cart.items[index].variants = variantInfo[0].dimensions;
                        });
                    });

                    this._debug();
                } else {
                    $('[data-minicart-amount]').text(0);
                }

            }).always((orderForm) => {
                this._requestEndEvent(orderForm);
            });
        },

        removeItem() {
            $(document).on('click', '[data-minicart-item-remove]', (ev) => {
                const index = $(ev.currentTarget).data('minicartIndex');
                this._removeItem(index);
            });
        },

        updateItem() {
            $(document).on('click', '[data-minicart-item-qty]', (ev) => {
                ev.preventDefault();
                const $this = $(ev.currentTarget);
                const itemQtyVal = $this.parent().find('[data-minicart-item-qty-val]');
                const index = itemQtyVal.data('minicartIndex');
                const availableQty = itemQtyVal.data('minicartAvailablequantity');
                let oldVal = itemQtyVal.val();
                let newVal = 0;

                if ( $this.data('minicartItemQty') === '+' ) {
                    newVal = parseFloat(oldVal) + 1;

                    if ( newVal > availableQty ) {
                        return false;
                    }
                } else {
                    if ( oldVal > 0 ) {
                        newVal = parseFloat(oldVal) - 1;

                        if ( newVal === 0 ) {
                            this._removeItem(index);

                            return false;
                        }
                    } else {
                        newVal = 0;
                    }
                }

                this._updateItem(index, newVal);
            });
        },

        // Privates
        _debug() {
            if ( this.option.debug ) {
                window.console.group('VtexMinicart Debbug');
                window.console.log(this.cart.items);
                window.console.groupEnd();
            }
        },

        _removeItem(index) {
            vtexjs.checkout.getOrderForm().then((orderForm) => {
                this._addLoader();

                let item = orderForm.items[index];
                item.index = index;

                return vtexjs.checkout.removeItems([item]);
            }).done((orderForm) => {
                this.fillCart();
                this._removeLoader();
                this._deleteItemEvent(orderForm);
            });
        },

        _updateItem(index, quantity) {
            vtexjs.checkout.getOrderForm().then((orderForm) => {
                this._addLoader();

                const updateItem = {
                    index: index,
                    quantity: quantity,
                };

                return vtexjs.checkout.updateItems([updateItem], null, false);
            }).done((orderForm) => {
                this.fillCart();
                this._removeLoader();
                this._updateItemEvent(orderForm, index);
            });
        },

        // Loaders
        _addLoader() {
            if ( this.option.bodyClass ) {
                $('body').addClass(this.option.bodyClass);
            }
        },

        _removeLoader() {
            if ( this.option.bodyClass ) {
                $('body').removeClass(this.option.bodyClass);
            }
        },

        // Custom events
        _requestStartEvent() {
            const ev = $.Event('vtexMinicart.requestStart');

            $(document).trigger(ev);
        },

        _requestEndEvent(orderForm) {
            const ev = $.Event('vtexMinicart.requestEnd');

            $(document).trigger(ev, [orderForm]);
        },

        _updateItemEvent(orderForm, index) {
            const ev = $.Event('vtexMinicart.update');
            const item = orderForm.items[index];

            $(document).trigger(ev, [orderForm, index, item]);
        },

        _deleteItemEvent(orderForm) {
            const ev = $.Event('vtexMinicart.delete');

            $(document).trigger(ev, [orderForm]);
        },
    };

    $.fn.vtexMinicart = function(option) {
        let arg = arguments;
        let options = typeof option === 'object' && option;


        return this.each((ev) => {
            const $this = $(this);
            let data = $this.data('vtexMinicart');

            if ( ! data ) {
                $this.data('vtexMinicart', (
                    data = new VtexMinicart(this, options)
                ));
            }

            if ( typeof option === 'string' ) {
                if ( arg.length > 1 ) {
                    data[option].apply(data, Array.prototype.slice.call(arg, 1));
                } else {
                    data[option]();
                }
            }
        });
    };
})(jQuery);
