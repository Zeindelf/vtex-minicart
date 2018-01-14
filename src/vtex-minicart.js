
import VtexMinicart from './vtex-minicart.class.js';

$.fn.vtexMinicart = function(option, ...args) {
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
            if ( args.length > 1 ) {
                data[option](...Array.prototype.slice.call(args, 1));
            } else {
                data[option]();
            }
        }
    });
};
