# VtexMinicart.js

DOM Binding minicart for Vtex stores.

## Table of contents

- [Main](#main)
- [Getting started](#getting-started)
- [Options](#options)
- [Cart Data](#cart-data)
- [Data API](#data-api)
- [Methods](#methods)
- [Events](#events)
- [DOM Binding](#dom-binding)
- [License](#license)
- [Dependencies](#dependencies)


## Main

```text
dist/
├── vtex-minicart.js         (uncompressed)
└── vtex-minicart.min.js     (compressed)
```

## Getting started

### Direct download

Download the script [here](https://github.com/Zeindelf/vtex-minicart/blob/master/dist/vtex-minicart.min.js) and include it.

### Install

You will need [Rivets.js](http://rivetsjs.com/), [VtexUtils](https://github.com/zeindelf/vtex-utils) and [VtexCatalog](https://github.com/zeindelf/vtex-catalog)

For minimal dependencies, use `v0.3.0` instead.

Include files:

```html
<!-- With Rivets.js CDNJS (recommended) -->
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/rivets/0.9.6/rivets.bundled.min.js"></script>
<script type="text/javascript" src="/arquivos/vtex-utils.min.js"></script>
<script type="text/javascript" src="/arquivos/vtex-catalog.min.js"></script>
<script type="text/javascript" src="/arquivos/vtex-minicart.min.js"></script>

<!-- With Rivets.js file -->
<script type="text/javascript" src="/arquivos/rivets.bundled.min.js"></script>
<script type="text/javascript" src="/arquivos/vtex-utils.min.js"></script>
<script type="text/javascript" src="/arquivos/vtex-catalog.min.js"></script>
<script type="text/javascript" src="/arquivos/vtex-minicart.rivets.min.js"></script>
```

### Package Managers

VtexMinicart.js supports [npm](https://www.npmjs.com/package/vtex-minicart) under the name `vtex-minicart`.

```shell
npm install vtex-minicart --save
```


### Usage

```js
$('#myMinicart').vtexMinicart(options);
```

All elements inside `#myMinicart` are able to listen all DOM changes.

## Options

### vtexUtils (required)

- Type: `Constructor`
- Default: `null`
- Required

You will need pass `VtexUtils` as a constructor:

```js
$('#myMinicart').vtexMinicart({
  vtexUtils: new VTEX.VtexUtils(),
});
```

### vtexCatalog (required)

- Type: `Class`
- Default: `null`
- Required

You will need pass entire `VtexCatalog`

```js
$('#myMinicart').vtexMinicart({
  vtexCatalog: VTEX.VtexCatalog,
});
```

### debug (optional)

- Type: `Boolean`
- Default: `false`

When `true`, you may access a object of every items on minicart with all options that you can use on Rivets template. There are merged all information of **Product API** and **SKU API**

### bodyClass (optional)

- Type: `String`
- Default: `null`

If provided, VtexMinicart.js will automatically apply this class to the body element while an Ajax request is ongoing.

Useful for displaying a loading animation while an Ajax request is waiting to complete - for example:

```html
<style>
  .is--loading {
    opacity: 0;
    visibility: hidden;
  }

  body.has--minicart-loader .is--loading {
    opacity: 1;
    visibility: visible;
  }
</style>
```

## Cart Data

You can access original data from Order Form Vtex API. With these data, there are 3 new objects:

- productFullInfo (from `/api/catalog_system/pub/products/search` endpoint)
- productSkuSearch (filtered SKU info from `/api/catalog_system/pub/products/search` endpoint)
- productSkuVariations (filtered SKU info from `/api/catalog_system/pub/products/variations` endpoint)

## Data API

These data-atribute can be set in any place.

### data-minicart-amount

```html
<span class="minicart__amount" data-minicart-amount=""></span>
```

Sum of all items on minicart.

### data-minicart-subtotal

```html
<p class="minicart__subtotal-price" data-minicart-subtotal="">R$ 0,00</p>
```

Render minicart total items price.

## Methods

### fillCart

Rendering minicart. Useful to call after AJAX asynchronus add to cart button - for example:

```html
<a href="#" class="js--add-to-cart" data-product-id="1">Add to Cart</a>

<script type="text/javascript">
$(function() {
  $(document).on('click', '.js--add-to-cart', function(ev) {
    var item = [{
      id: $(this).data('productId'),
      quantity: 1,
      seller: '1',
    }];

    vtexjs.checkout.addToCart(item, null, 1)
      .done(function(orderForm) {
        $('#myMinicart').vtexMinicart('fillCart'); // Re-renderize minicart
        $('#myMinicart').addClass('is--active'); // Open minicart
      })
      .fail(function(err) {
        window.console.log(err);
      });
  });
});
</script>
```

## Events

Events are triggered on the document and prefixed with the vtexMinicart namespace.

### vtexMinicart.update [orderForm, itemIndex, item]

Triggered when item are updated.

```js
$(document).on('vtexMinicart.update', function(ev, orderForm, itemIndex, item) {
  window.console.group('Cart Updated');
  window.console.log(orderForm); // OrderForm updated {object}
  window.console.log(itemIndex); // Item index changed {int}
  window.console.log(item);      // Item changed {object}
  window.console.groupEnd();
});
```

### vtexMinicart.delete [orderForm]

Triggered when item are deleted. Useful to do actions when minicart are cleared.

```js
$(document).on('vtexMinicart.delete', function(ev, orderForm) {
  if ( orderForm.items.length < 1 ) {
    $('#myMinicart').removeClass('is--active');
  }
});
```

### vtexMinicart.requestStart

Triggered whenever VtexMinicart.js begins to process the request queue.

```js
$(document).on('vtexMinicart.requestStart', function(ev) {
  // Event handling here
});
```

### vtexMinicart.requestEnd [orderForm]

Triggered whenever VtexMinicart.js completes processing the current request queue.

```js
$(document).on('vtexMinicart.requestEnd', function(ev, orderForm) {
  // Event handling here
});
```

## DOM Binding

### Cart container

Init markup

```html
<div id="myMinicart" class="minicart">
  <!-- Your cart properties goes here -->
</div>

<script type="text/javascript">
$(function() {
  $('#myMinicart').vtexMinicart({
    vtexUtils: new VTEX.VtexUtils(),
    vtexCatalog: VTEX.VtexCatalog,
    debug: true,
    bodyClass: 'has--minicart-loader',
  });
});
</script>
```

### Cart conditional

With Rivets.js, you can show content based on cart's item with directive `rv-show` or `rv-if` with conditional filters `gt` (greater than) or `lt` (less than).

```html
<!-- This element will show only if have items on cart -->
<div class="minicart__middle" rv-show="cart.itemCount | gt 0">
  <!-- Cart content -->
</div>

<!-- If there's no item on cart, this element will be show -->
<div class="minicart__empty" rv-show="cart.itemCount | lt 1">
  <p class="minicart__empty-text">Você não possui produtos no seu carrinho</p>
</div>
```

### Cart loop

Renders your items on a cart with `rv-each-{objName}`.

```html
<!-- While have items on 'cart.items' object, this loop will be rendering -->
<li class="minicart__item-container" rv-each-item="cart.items"></li>
```

### Cart properties

`{objName}` is your object with all cart properties. With example above, each cart item is on `item` object.

You can see all properties changing **debug option** to `true` and check your console.

```html
<div class="minicart__item-name">
  <h4 class="minicart__item-title" rv-text="item.productFullInfo.name"></h4>
  <small class="minicart__item-sku-title" rv-text="item.name"></small>
</div>
```

### Cart filters

There are two Vtex Custom Filters you can use to format images and prices:

- productImgSize: following by `width` and `height` values
- formatPrice: formats `int` value price provided by Vtex API

```html
<div class="minicart__item-img-wrapper">
  <!-- Rendering product image with 110x110 size -->
  <img class="minicart__item-img" rv-src="item.imageUrl | productImgSize 110 110" rv-alt="item.name" rv-title="item.name"/>
</div>

<div class="minicart__item-price-wrapper">
  <!-- Only shows old price if exists -->
  <del class="minicart__item-old-price" rv-if="item.listPrice | gt 0" rv-text="item.listPrice | formatPrice"></del>
  <!-- Best price -->
  <p class="minicart__item-best-price" rv-text="item.sellingPrice | formatPrice"></p>
</div>
```

### Cart tips markup

**Show product selected variants**
```html
<p class="minicart__item-variant" rv-if="item.variants | isNotEmpty">
  <span rv-text="item.variants.Cor"></span> - <span rv-text="item.variants.Tamanho"></span>
</p>
```

**Show installments**
```html
<div class="minicart__item-installments-wrapper" rv-if="item.installments | gt 1">
  ou <span rv-text="item.installments"></span>X de <span rv-text="item.installmentsValue | formatPrice"></span>
</div>
```

**Remove item**
```html
<button class="minicart__item-remove" role="remove" data-minicart-item-remove="" rv-data-minicart-index="item.index">X</button
```

**Set item quantity**
```html
<!-- Uses this markup to properly functionality -->
<div class="minicart__item-qty-wrapper">
  <a href="#" class="minicart__item-qty-btn has--minus" data-minicart-item-qty="-">-</a>
  <input type="text"
      class="minicart__item-qty-val"
      readonly="readonly"
      data-minicart-item-qty-val=""
      rv-value="item.quantity"
      rv-data-minicart-availablequantity="item.availablequantity"
      rv-data-minicart-index="item.index"/>
  <a href="#" class="minicart__item-qty-btn has--plus" data-minicart-item-qty="+">+</a>
</div>
```

See complete example markup on `/example/` dir.

For advanced [Rivets.js](http://rivetsjs.com) use, check full documentation [here](http://rivetsjs.com/docs/guide/)

## License
VtexMinicart.js is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Dependencies

jQuery 1.8.3+

Rivets.js 0.9.6+

VtexUtils.js

VtexCatalog.js
