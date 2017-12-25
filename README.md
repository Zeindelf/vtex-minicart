# VtexMinicart.js
DOM Binding minicart for Vtex stores.

## Main

```text
dist/
├── vtex-minicart.js              (uncompressed)
├── vtex-minicart.min.js          (compressed)
└── vtex-minicart.rivets.min.js   (compressed with Rivets.js)
```

## Example

Useful example can be found on `/example/` dir.

## Getting started

### Install

```shell
npm install vtex-minicart --save
```

Include files:

```html
<!-- With RivetsJS CDNJS -->
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/rivets/0.9.6/rivets.bundled.min.js"></script>
<script type="text/javascript" src="/arquivos/vtex-minicart.min.js"></script>

<!-- With RivetsJS included -->
<script type="text/javascript" src="/arquivos/vtex-minicart.rivets.min.js"></script>
```

### Usage

```js
$('#myMinicart').vtexMinicart(options);
```

All elements inside `#myMinicart` are able to listen all DOM changes.

## Options

### debug

- Type: `Boolean`
- Default: `false`

When `true`, you may access a object of every items on minicart with all options that you can use on Rivets template. There are merged all information of **Product API** and **SKU API**

### bodyClass

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

  body.has--loader .is--loading {
    opacity: 1;
    visibility: visible;
  }
</style>
```

## Data API

### data-minicart-amount

```html
<span class="minicart__amount" data-minicart-amount="0"></span>
```

Sum of all items on minicart.

### data-minicart-item-qty

```html
<a href="#" class="minicart__item-qty-btn has--minus" data-minicart-item-qty="-">-</a>
<a href="#" class="minicart__item-qty-btn has--plus" data-minicart-item-qty="+">+</a>
```

Increase or Decrease item quantity.

### data-minicart-item-remove

```html
<button class="minicart__item-remove" role="remove" data-minicart-item-remove="" rv-data-minicart-index="item.index">X</button
```

Remove item from minicart.

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
            seller: '1'
        }];

        vtexjs.checkout.addToCart(item, null, 1)
            .done(function(orderForm) {
                // Actualize minicart
                $('#myMinicart').vtexMinicart('fillCart');
                // Open minicart
                $('#myMinicart').addClass('is--active');
            })
            .fail(function(err) {
                window.console.log(err)
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
    window.console.log(orderForm); // Actual orderForm {object}
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

Docs incoming. Optionaly, check the `/example/` folder.

## License
VtexMinicart.js is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Dependencies

jQuery 1.8.3+

Rivets.js 0.9.6+

## Todo

- DOM Binding docs
