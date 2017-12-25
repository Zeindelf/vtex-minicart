
import Helpers from './helpers.js';

rivets.formatters['!'] = function(value)
{
  return !value;
};

rivets.formatters.eq = function(value, args)
{
  return value === args;
};

rivets.formatters.neq = function(value, args)
{
  return value !== args;
};

rivets.formatters.gt = function(value, args)
{
  return value > args;
};

rivets.formatters.gte = function(value, args)
{
  return value >= args;
};

rivets.formatters.lt = function(value, args)
{
  return value < args;
};

rivets.formatters.lte = function(value, args)
{
  return value <= args;
};

rivets.formatters.or = function(value, args)
{
  return value || args;
};

rivets.formatters.isEmpty = function(value)
{
  return (typeof value === 'undefined' || value === null || (typeof value === 'string' && value.length === 0));
};

rivets.formatters.isNotEmpty = function(value)
{
  return !rivets.formatters.isEmpty(value);
};

rivets.formatters.pass = function(value, args)
{
  return args;
};

rivets.formatters.json = function(value, intendation)
{
  return JSON.stringify(value, null, intendation || 0);
};

rivets.formatters.prefix = function(value, prefix)
{
  return '' + prefix + value;
};

rivets.formatters.suffix = function(value, suffix)
{
  return '' + value + suffix;
};

rivets.formatters.ucFirst = function(value)
{
  return value.substr(0, 1).toUpperCase() + value.substr(1);
};

rivets.formatters['+'] = function(value, args)
{
  return value + args;
};

rivets.formatters['-'] = function(value, args)
{
  return value - args;
};

rivets.formatters['*'] = function(value, args)
{
  return value * args;
};

rivets.formatters['/'] = function(value, args)
{
  return value / args;
};

rivets.formatters.round = function(value, decimals)
{
  if (decimals) {
    var exp = Math.pow(10, decimals);
    value = Math.round(value * exp) / exp;
  }
  else {
    value = Math.round(value);
  }

  return value;
};

rivets.formatters.get = function(obj, key)
{
  if (obj && typeof obj === 'object') {
    return obj[key];
  }
  return null;
};

rivets.formatters.set = function(obj, key, value)
{
  if (obj && typeof obj === 'object') {
    obj[key] = value;
  }

  return obj;
};

rivets.formatters['.'] = rivets.formatters.get;

rivets.formatters.keys = function(obj)
{
  if (typeof obj === 'object') {
    return Object.keys(obj);
  }

  return [];
};

rivets.formatters.length = function(value)
{
  return value ? (value.length || 0) : 0;
};

rivets.formatters.sort = function(/*value[, by][, direction]*/)
{
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
  }
  else {
    value.sort(function(a, b) {
      if (a[by] === b[by]) return 0;

      return (a[by] < b[by]) ? -1 : 1
    });
  }

  if (direction == 'desc') {
    value.reverse();
  }

  return value;
};

rivets.formatters.default = function(value, args)
{
  return (typeof value !== 'undefined' && value !== null) ? value : args;
};

rivets.formatters.contains = function(value, search)
{
  if (Array.isArray(value)) {
    return (value.indexOf(search) !== -1);
  }

  return false;
};

rivets.formatters.percent = function(value, decimals)
{
  return number_format(value * 100, decimals || 0, ',') + '%';
};

rivets.formatters.bind = function(/*fn, thisArg[, arg1, arg2, ..., argN]*/)
{
  var args = Array.from(arguments);
  var fn = args.shift();
  var self = args.shift();

  if (typeof fn === 'function') {
    return function() {
      fn.apply(self, args);
    }
  }

  return fn;
};

rivets.formatters.with = function(/*fn, arg1, arg2, ..., argN*/)
{
  var args = Array.from(arguments);
  console.log(args);
  var fn = args.shift();

  if (typeof fn === 'function') {
    return fn.bind(null, args);
  }

  return fn;
};

rivets.formatters.slice = function() {
  var args = Array.from(arguments);
  var arr = args.shift();
  return Array.prototype.slice.apply(arr, args);
};

rivets.formatters.formatPrice = function(val)
{
    return Helpers.formatPrice(val);
}

rivets.formatters.productImgSize = function(val, arg1, arg2)
{
    return Helpers.getResizedImage(val, arg1, arg2);
}
