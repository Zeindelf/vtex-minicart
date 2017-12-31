// VtexMinicart.js
// version: 0.2.1
// author: Wellington Barreto
// license: MIT
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {
    stripHttp: function stripHttp(url) {
        return url.replace(/^https?:/, '');
    }
};

},{}],2:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _helpers = require('./helpers.js');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function ($) {
    'use strict';

    var VtexMinicart = function VtexMinicart(element, option) {
        var defaults = {
            debug: false,
            bodyClass: null
        };

        if ('VtexHelpers' in window) {
            this.vtexHelpers = new VtexHelpers();
        }

        if (!(this.vtexHelpers instanceof VtexHelpers)) {
            throw new Error('VtexHelpers is required. Download it from https://www.npmjs.com/package/vtex-helpers');
        }

        this.option = $.extend({}, defaults, option);
        this.$element = $(element);
        this.init();
    };

    VtexMinicart.prototype = {
        cart: {
            items: {},
            itemCount: 0
        },

        init: function init() {
            this.bindData();
            this.fillCart();
            this.updateItem();
            this.removeItem();
        },
        bindData: function bindData() {
            rivets.bind(this.$element, {
                controller: VtexMinicart,
                cart: this.cart
            });
        },
        fillCart: function fillCart() {
            var _this = this;

            this._requestStartEvent();

            vtexjs.checkout.getOrderForm().done(function (orderForm) {
                _this.$element.find('[data-minicart-subtotal]').html(_this.vtexHelpers.formatPrice(orderForm.value));
                _this.cart.itemCount = orderForm.items.length;
                _this.cart.items = orderForm.items;

                if (_this.cart.itemCount > 0) {
                    var sumQuantity = orderForm.items.reduce(function (acc, obj) {
                        return acc + obj.quantity;
                    }, 0);
                    $('[data-minicart-amount]').text(sumQuantity);

                    orderForm.items.map(function (item, index) {
                        vtexjs.catalog.getProductWithVariations(item.productId).done(function (product) {
                            var variantInfo = product.skus.filter(function (sku) {
                                return parseInt(sku.sku) === parseInt(item.id);
                            });

                            if (item.sellingPrice === item.listPrice) {
                                _this.cart.items[index].listPrice = 0;
                            }

                            _this.cart.items[index].imageUrl = _helpers2.default.stripHttp(_this.cart.items[index].imageUrl);

                            // Custom product properties
                            _this.cart.items[index].productInfo = product;
                            _this.cart.items[index].index = index;
                            _this.cart.items[index].availablequantity = variantInfo[0].availablequantity;
                            _this.cart.items[index].installments = variantInfo[0].installments;
                            _this.cart.items[index].installmentsInsterestRate = variantInfo[0].installmentsInsterestRate;
                            _this.cart.items[index].installmentsValue = variantInfo[0].installmentsValue;
                            _this.cart.items[index].variants = variantInfo[0].dimensions;
                        });
                    });

                    _this._debug();
                } else {
                    $('[data-minicart-amount]').text(0);
                }
            }).always(function (orderForm) {
                _this._requestEndEvent(orderForm);
            });
        },
        removeItem: function removeItem() {
            var _this2 = this;

            $(document).on('click', '[data-minicart-item-remove]', function (ev) {
                var index = $(ev.currentTarget).data('minicartIndex');
                _this2._removeItem(index);
            });
        },
        updateItem: function updateItem() {
            var _this3 = this;

            $(document).on('click', '[data-minicart-item-qty]', function (ev) {
                ev.preventDefault();
                var $this = $(ev.currentTarget);
                var itemQtyVal = $this.parent().find('[data-minicart-item-qty-val]');
                var index = itemQtyVal.data('minicartIndex');
                var availableQty = itemQtyVal.data('minicartAvailablequantity');
                var oldVal = itemQtyVal.val();
                var newVal = 0;

                availableQty = availableQty ? availableQty : 99999;

                if ($this.data('minicartItemQty') === '+') {
                    newVal = parseFloat(oldVal) + 1;

                    if (newVal > parseInt(availableQty)) {
                        return false;
                    }
                } else {
                    if (oldVal > 0) {
                        newVal = parseFloat(oldVal) - 1;

                        if (newVal === 0) {
                            _this3._removeItem(index);

                            return false;
                        }
                    } else {
                        newVal = 0;
                    }
                }

                _this3._updateItem(index, newVal);
            });
        },


        // Privates
        _debug: function _debug() {
            if (this.option.debug) {
                window.console.group('VtexMinicart Debbug');
                window.console.log(this.cart.items);
                window.console.groupEnd();
            }
        },
        _removeItem: function _removeItem(index) {
            var _this4 = this;

            vtexjs.checkout.getOrderForm().then(function (orderForm) {
                _this4._addLoader();

                var item = orderForm.items[index];
                item.index = index;

                return vtexjs.checkout.removeItems([item]);
            }).done(function (orderForm) {
                _this4.fillCart();
                _this4._removeLoader();
                _this4._deleteItemEvent(orderForm);
            });
        },
        _updateItem: function _updateItem(index, quantity) {
            var _this5 = this;

            vtexjs.checkout.getOrderForm().then(function (orderForm) {
                _this5._addLoader();

                var updateItem = {
                    index: index,
                    quantity: quantity
                };

                return vtexjs.checkout.updateItems([updateItem], null, false);
            }).done(function (orderForm) {
                _this5.fillCart();
                _this5._removeLoader();
                _this5._updateItemEvent(orderForm, index);
            });
        },


        // Loaders
        _addLoader: function _addLoader() {
            if (this.option.bodyClass) {
                $('body').addClass(this.option.bodyClass);
            }
        },
        _removeLoader: function _removeLoader() {
            if (this.option.bodyClass) {
                $('body').removeClass(this.option.bodyClass);
            }
        },


        // Custom events
        _requestStartEvent: function _requestStartEvent() {
            var ev = $.Event('vtexMinicart.requestStart');

            $(document).trigger(ev);
        },
        _requestEndEvent: function _requestEndEvent(orderForm) {
            var ev = $.Event('vtexMinicart.requestEnd');

            $(document).trigger(ev, [orderForm]);
        },
        _updateItemEvent: function _updateItemEvent(orderForm, index) {
            var ev = $.Event('vtexMinicart.update');
            var item = orderForm.items[index];

            $(document).trigger(ev, [orderForm, index, item]);
        },
        _deleteItemEvent: function _deleteItemEvent(orderForm) {
            var ev = $.Event('vtexMinicart.delete');

            $(document).trigger(ev, [orderForm]);
        }
    };

    $.fn.vtexMinicart = function (option) {
        var _this6 = this;

        var arg = arguments;
        var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) === 'object' && option;

        if (!(typeof option.debug === 'boolean')) {
            throw new Error('Option debug should be a "boolean" value');
        }

        if (option.bodyClass !== null) {
            if (!(typeof option.bodyClass === 'string')) {
                throw new Error('Option bodyClass should be a "string" value.');
            }
        }

        return this.each(function (ev) {
            var $this = $(_this6);
            var data = $this.data('vtexMinicart');

            if (!data) {
                $this.data('vtexMinicart', data = new VtexMinicart(_this6, options));
            }

            if (typeof option === 'string') {
                if (arg.length > 1) {
                    data[option].apply(data, Array.prototype.slice.call(arg, 1));
                } else {
                    data[option]();
                }
            }
        });
    };
})(jQuery);

},{"./helpers.js":1}]},{},[2]);
