
import CONSTANTS from './vtex-minicart.constants.js';
import DEFAULTS from './vtex-minicart.defaults.js';
import Methods from './vtex-minicart.methods.js';

class VtexMinicart {
    constructor(element, option) {
        /**
         * Plugin options
         * @type {object}
         */
        this.option = $.extend({}, DEFAULTS, option);

        // Validate Vtex Utils
        if ( this.option.vtexUtils === null ) {
            throw new Error(CONSTANTS.messages.vtexUtils);
        }

        if ( this.option.vtexUtils.name !== '@VtexUtils' ) {
            throw new Error(CONSTANTS.messages.vtexUtils);
        }

        if ( ! (typeof this.option.debug === 'boolean') ) {
            throw new Error(CONSTANTS.messages.debug);
        }

        if ( this.option.bodyClass !== null ) {
            if ( ! (typeof this.option.bodyClass === 'string') ) {
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
    }
}

export default VtexMinicart;
