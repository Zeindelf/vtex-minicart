// VtexMinicart.js
// version: 0.0.1
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
    },
    formatPrice: function formatPrice(number, thousands, decimals, length, currency) {
        currency = typeof currency == 'string' ? currency : 'R$ ';
        length = typeof length !== 'number' ? 2 : length;

        var re = '\\d(?=(\\d{' + 3 + '})+' + (length > 0 ? '\\D' : '$') + ')';
        number = number / 100;
        number = (number * 1).toFixed(Math.max(0, ~~length));

        return currency + number.replace('.', decimals || ',').replace(new RegExp(re, 'g'), '$&' + (thousands || '.'));
    },
    getResizedImage: function getResizedImage(src, width, height) {
        src = this.stripHttp(src);

        if (width === undefined || height === undefined || typeof src != 'string') {
            return src;
        }

        src = src.replace(/(?:ids\/[0-9]+)-([0-9]+)-([0-9]+)\//, function (match, matchedWidth, matchedHeight) {
            return match.replace('-' + matchedWidth + '-' + matchedHeight, '-' + width + '-' + height);
        });

        return src.replace(/(ids\/[0-9]+)\//, '$1-' + width + '-' + height + '/');
    }
};

},{}],2:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _helpers = require('./helpers.js');

var _helpers2 = _interopRequireDefault(_helpers);

require('./rivets-formatters.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function ($) {
    'use strict';

    var VtexMinicart = function VtexMinicart(element, option) {
        var defaults = {
            debug: false,
            bodyClass: null
        };

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
                _this.$element.find('[data-minicart-subtotal]').html('R$ ' + _helpers2.default.formatPrice(orderForm.value));
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

                if ($this.data('minicartItemQty') === '+') {
                    newVal = parseFloat(oldVal) + 1;

                    if (newVal > availableQty) {
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

},{"./helpers.js":1,"./rivets-formatters.js":3}],3:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _helpers = require('./helpers.js');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

rivets.formatters['!'] = function (value) {
  return !value;
};
rivets.formatters.eq = function (value, args) {
  return value === args;
};
rivets.formatters.neq = function (value, args) {
  return value !== args;
};
rivets.formatters.gt = function (value, args) {
  return value > args;
};
rivets.formatters.gte = function (value, args) {
  return value >= args;
};
rivets.formatters.lt = function (value, args) {
  return value < args;
};
rivets.formatters.lte = function (value, args) {
  return value <= args;
};
rivets.formatters.or = function (value, args) {
  return value || args;
};
rivets.formatters.isEmpty = function (value) {
  return typeof value === 'undefined' || value === null || typeof value === 'string' && value.length === 0;
};
rivets.formatters.isNotEmpty = function (value) {
  return !rivets.formatters.isEmpty(value);
};

rivets.formatters.pass = function (value, args) {
  return args;
};

rivets.formatters.json = function (value, intendation) {
  return JSON.stringify(value, null, intendation || 0);
};

rivets.formatters.prefix = function (value, prefix) {
  return '' + prefix + value;
};

rivets.formatters.suffix = function (value, suffix) {
  return '' + value + suffix;
};

rivets.formatters.ucFirst = function (value) {
  return value.substr(0, 1).toUpperCase() + value.substr(1);
};

rivets.formatters['+'] = function (value, args) {
  return value + args;
};

rivets.formatters['-'] = function (value, args) {
  return value - args;
};

rivets.formatters['*'] = function (value, args) {
  return value * args;
};

rivets.formatters['/'] = function (value, args) {
  return value / args;
};

rivets.formatters.round = function (value, decimals) {
  if (decimals) {
    var exp = Math.pow(10, decimals);
    value = Math.round(value * exp) / exp;
  } else {
    value = Math.round(value);
  }

  return value;
};

rivets.formatters.get = function (obj, key) {
  if (obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
    return obj[key];
  }
  return null;
};

rivets.formatters.set = function (obj, key, value) {
  if (obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
    obj[key] = value;
  }

  return obj;
};

rivets.formatters['.'] = rivets.formatters.get;

rivets.formatters.keys = function (obj) {
  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
    return Object.keys(obj);
  }

  return [];
};

rivets.formatters.length = function (value) {
  return value ? value.length || 0 : 0;
};

rivets.formatters.sort = function () /*value[, by][, direction]*/{
  return value;

  var args = Array.from(arguments);
  var value = args.shift();
  var by = args.shift();
  var direction = args.shift();

  if (!direction && (by == 'asc' || by == 'desc')) {
    direction = by;
    by = null;
  }

  if (!by) {
    value.sort();
  } else {
    value.sort(function (a, b) {
      if (a[by] === b[by]) return 0;

      return a[by] < b[by] ? -1 : 1;
    });
  }

  if (direction == 'desc') {
    value.reverse();
  }

  return value;
};

rivets.formatters.default = function (value, args) {
  return typeof value !== 'undefined' && value !== null ? value : args;
};

rivets.formatters.contains = function (value, search) {
  if (Array.isArray(value)) {
    return value.indexOf(search) !== -1;
  }

  return false;
};

rivets.formatters.percent = function (value, decimals) {
  return number_format(value * 100, decimals || 0, ',') + '%';
};

rivets.formatters.bind = function () /*fn, thisArg[, arg1, arg2, ..., argN]*/{
  var args = Array.from(arguments);
  var fn = args.shift();
  var self = args.shift();

  if (typeof fn === 'function') {
    return function () {
      fn.apply(self, args);
    };
  }

  return fn;
};

rivets.formatters.with = function () /*fn, arg1, arg2, ..., argN*/{
  var args = Array.from(arguments);
  console.log(args);
  var fn = args.shift();

  if (typeof fn === 'function') {
    return fn.bind(null, args);
  }

  return fn;
};

rivets.formatters.slice = function () {
  var args = Array.from(arguments);
  var arr = args.shift();
  return Array.prototype.slice.apply(arr, args);
};

rivets.formatters.formatPrice = function (val) {
  return _helpers2.default.formatPrice(val);
};

rivets.formatters.productImgSize = function (val, arg1, arg2) {
  return _helpers2.default.getResizedImage(val, arg1, arg2);
};

},{"./helpers.js":1}]},{},[2]);
