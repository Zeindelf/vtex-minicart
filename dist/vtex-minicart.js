
/*!!
 * VtexMinicart.js v0.5.2
 * https://github.com/zeindelf/vtex-minicart
 *
 * Copyright (c) 2017-2018 Zeindelf
 * Released under the MIT license
 *
 * Date: 2018-12-14T21:18:54.726Z
 */

(function () {
'use strict';

var CONSTANTS = {
    messages: {
        vtexUtils: 'VtexUtils.js is required and must be an instance. Download it from https://www.npmjs.com/package/vtex-utils and use option "vtexUtils: new VTEX.VtexUtils()".',
        vtexCatalog: 'VtexCatalog.js is required. Download it from https://www.npmjs.com/package/vtex-catalog and use option "vtexCatalog: VTEX.VtexUtils" (not an instance).',
        debug: 'Option debug should be a "boolean" value.',
        cache: 'Option cache should be a "boolean" value.',
        bodyClass: 'Option bodyClass should be a "string" value.'
    }
};

var DEFAULTS = {
    vtexUtils: null,
    vtexCatalog: null,
    cache: false,
    debug: false,
    bodyClass: null,
    zeroPadding: false,
    showGifts: false,
    camelizeItems: false,
    camelizeProps: false
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var Private = function () {
    function Private() {
        classCallCheck(this, Private);
    }

    createClass(Private, [{
        key: '_setInstance',
        value: function _setInstance(self) {
            this._self = self;
        }
    }, {
        key: '_debug',
        value: function _debug() {
            if (this._self.option.debug) {
                window.console.group('VtexMinicart Debbug');
                window.console.log(this._self.cart.items);
                window.console.groupEnd();
            }
        }
    }, {
        key: '_removeItem',
        value: function _removeItem(index) {
            var _this = this;

            var product = vtexjs.checkout.orderForm.items[index];

            vtexjs.checkout.getOrderForm().then(function (orderForm) {
                _this._addLoader();

                var item = orderForm.items[index];
                item.index = index;

                return vtexjs.checkout.removeItems([item]);
            }).done(function (orderForm) {
                _this._self.fillCart();
                _this._removeLoader();
                _this._deleteItemEvent(orderForm, product);
            });
        }
    }, {
        key: '_updateItem',
        value: function _updateItem(index, quantity) {
            var _this2 = this;

            vtexjs.checkout.getOrderForm().then(function (orderForm) {
                _this2._addLoader();

                var updateItem = {
                    index: index,
                    quantity: quantity
                };

                return vtexjs.checkout.updateItems([updateItem], null, false);
            }).done(function (orderForm) {
                _this2._self.fillCart();
                _this2._removeLoader();
                _this2._updateItemEvent(orderForm, index);
            });
        }

        // Loaders

    }, {
        key: '_addLoader',
        value: function _addLoader() {
            if (this._self.option.bodyClass) {
                $('body').addClass(this._self.option.bodyClass);
            }
        }
    }, {
        key: '_removeLoader',
        value: function _removeLoader() {
            if (this._self.option.bodyClass) {
                $('body').removeClass(this._self.option.bodyClass);
            }
        }

        // Helpers

    }, {
        key: '_setPadding',
        value: function _setPadding(qty) {
            return this._self.option.zeroPadding ? this._self.globalHelpers.pad(qty) : qty;
        }

        // Custom events

    }, {
        key: '_requestStartEvent',
        value: function _requestStartEvent() {
            /* eslint-disable */
            var ev = $.Event('requestStart.vtexMinicart');
            /* eslint-enable */

            $(document).trigger(ev);
        }
    }, {
        key: '_requestEndEvent',
        value: function _requestEndEvent(orderForm) {
            /* eslint-disable */
            var ev = $.Event('requestEnd.vtexMinicart');
            /* eslint-enable */

            $(document).trigger(ev, [orderForm]);
        }
    }, {
        key: '_updateItemEvent',
        value: function _updateItemEvent(orderForm, index) {
            /* eslint-disable */
            var ev = $.Event('update.vtexMinicart');
            /* eslint-enable */
            var item = orderForm.items[index];

            $(document).trigger(ev, [orderForm, index, item]);
        }
    }, {
        key: '_deleteItemEvent',
        value: function _deleteItemEvent(orderForm, product) {
            /* eslint-disable */
            var ev = $.Event('delete.vtexMinicart');
            /* eslint-enable */

            $(document).trigger(ev, [orderForm, product]);
        }
    }]);
    return Private;
}();

var _private = new Private();

var Methods = {
    cart: {
        items: {},
        itemCount: 0
    },

    init: function init() {
        _private._setInstance(this);

        this.bindData();
        this.fillCart();
        this.updateItem();
        this.removeItem();
    },
    bindData: function bindData() {
        rivets.bind(this.$element, {
            controller: this,
            cart: this.cart
        });
    },
    fillCart: function fillCart() {
        var _this = this;

        _private._requestStartEvent();

        vtexjs.checkout.getOrderForm().done(function (orderForm) {
            var orderFormItems = orderForm.items;

            if (!_this.option.showGifts) {
                orderFormItems = orderFormItems.filter(function (item) {
                    return !item.isGift;
                });
            }

            _this.$element.find('[data-minicart-subtotal]').html(_this.vtexHelpers.formatPrice(orderForm.value));
            _this.cart.itemCount = orderFormItems.length;
            _this.cart.items = orderFormItems;

            if (_this.cart.itemCount > 0) {
                var sumQuantity = orderFormItems.reduce(function (acc, obj) {
                    return acc + obj.quantity;
                }, 0);
                $('[data-minicart-amount]').text(_private._setPadding(sumQuantity));

                var _loop = function _loop(index, len) {
                    var _item = orderFormItems[index];

                    if (_item.sellingPrice === _item.listPrice) {
                        _this.cart.items[index].listPrice = 0;
                    }

                    _this.cart.items[index].imageUrl = _this.globalHelpers.stripHttp(_this.cart.items[index].imageUrl);
                    _this.cart.items[index].index = index;

                    // Items is on cache
                    _this.vtexCatalog.searchProduct(_item.productId).then(function (product) {
                        var productSkuSearch = void 0;

                        if (product) {
                            productSkuSearch = product.items.filter(function (sku) {
                                return parseInt(sku.itemId, 10) === parseInt(_item.id, 10);
                            });
                        }

                        _this.cart.items[index].productFullInfo = product;
                        _this.cart.items[index].productSkuSearch = productSkuSearch[0];
                    });

                    // Check API with prices
                    vtexjs.catalog.getProductWithVariations(_item.productId).done(function (product) {
                        var productSkuVariations = product.skus.filter(function (sku) {
                            return parseInt(sku.sku, 10) === parseInt(_item.id, 10);
                        });

                        _this.cart.items[index].productSkuVariations = _this.option.camelizeItems ? _this.globalHelpers.camelize(productSkuVariations[0]) : productSkuVariations[0];
                    });
                };

                for (var index = 0, len = orderFormItems.length; index < len; index += 1) {
                    _loop(index, len);
                }

                _private._debug();
            } else {
                $('[data-minicart-amount]').text(_private._setPadding(0));
            }
        }).always(function (orderForm) {
            _private._requestEndEvent(orderForm);
        });
    },
    removeItem: function removeItem() {
        $(document).on('click', '[data-minicart-item-remove]', function (ev) {
            var index = $(ev.currentTarget).data('minicartIndex');
            _private._removeItem(index);
        });
    },
    updateItem: function updateItem() {
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
                        _private._removeItem(index);

                        return false;
                    }
                } else {
                    newVal = 0;
                }
            }

            _private._updateItem(index, newVal);
        });
    }
};

var VtexMinicart = function VtexMinicart(element, option) {
    classCallCheck(this, VtexMinicart);

    /**
     * Plugin options
     * @type {object}
     */
    this.option = $.extend({}, DEFAULTS, option);

    // Validate Vtex Utils
    if (this.option.vtexUtils === null) {
        throw new Error(CONSTANTS.messages.vtexUtils);
    }

    if (this.option.vtexUtils.name !== '@VtexUtils') {
        throw new Error(CONSTANTS.messages.vtexUtils);
    }

    // Validate Debug option
    if (!(typeof this.option.debug === 'boolean')) {
        throw new Error(CONSTANTS.messages.debug);
    }

    // Validate Cache option
    if (!(typeof this.option.cache === 'boolean')) {
        throw new Error(CONSTANTS.messages.cache);
    }

    // Validate Body Class option
    if (this.option.bodyClass !== null) {
        if (!(typeof this.option.bodyClass === 'string')) {
            throw new Error(CONSTANTS.messages.bodyClass);
        }
    }

    /**
     * Global Helpers instance
     * @type {GlobalHelpers}
     */
    this.globalHelpers = this.option.vtexUtils.globalHelpers;

    /**
     * Vtex Helpers instance
     * @type {VtexHelpers}
     */
    this.vtexHelpers = this.option.vtexUtils.vtexHelpers;

    /**
     * Vtex Catalog instance
     * @type {VtexCatalog}
     */
    /* eslint-disable */
    this.vtexCatalog = new this.option.vtexCatalog(this.option.vtexUtils, this.option.cache);
    this.vtexCatalog.setCamelize(this.option.camelizeItems, this.option.camelizeProps);
    /* eslint-enable */

    /**
     * Element
     * @type {DOMElement}
     */
    this.$element = $(element);

    /**
     * Extend public methods
     */
    this.globalHelpers.extend(VtexMinicart.prototype, Methods);

    /**
     * Initialize
     */
    this.init();
};

$.fn.vtexMinicart = function (option) {
    var _this = this;

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) === 'object' && option;

    return this.each(function (ev) {
        var $this = $(_this);
        var data = $this.data('vtexMinicart');

        if (!data) {
            $this.data('vtexMinicart', data = new VtexMinicart(_this, options));
        }

        if (typeof option === 'string') {
            if (args.length > 1) {
                var _data;

                (_data = data)[option].apply(_data, toConsumableArray(Array.prototype.slice.call(args, 1)));
            } else {
                data[option]();
            }
        }
    });
};

}());
