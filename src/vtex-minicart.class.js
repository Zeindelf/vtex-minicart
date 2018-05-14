
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

        if ( this.option.vtexUtils.version < CONSTANTS.messages.vtexUtilsVersion ) {
            throw new Error(CONSTANTS.messages.vtexUtilsVersionMessage);
        }

        // Validate Debug option
        if ( ! (typeof this.option.debug === 'boolean') ) {
            throw new Error(CONSTANTS.messages.debug);
        }

        // Validate Cache option
        if ( ! (typeof this.option.cache === 'boolean') ) {
            throw new Error(CONSTANTS.messages.cache);
        }

        // Validate Body Class option
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
    }
}

export default VtexMinicart;
