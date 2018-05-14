
const vtexUtilsVersion = '1.7.0';

export default {
    messages: {
        vtexUtils: 'VtexUtils.js is required and must be an instance. Download it from https://www.npmjs.com/package/vtex-utils and use option "vtexUtils: new VTEX.VtexUtils()".',
        vtexUtilsVersion: vtexUtilsVersion,
        vtexUtilsVersionMessage: `VtexUtils version must be higher than ${vtexUtilsVersion}. Download last version on https://www.npmjs.com/package/vtex-utils`,
        vtexCatalog: `VtexCatalog.js is required. Download it from https://www.npmjs.com/package/vtex-catalog and use option "vtexCatalog: VTEX.VtexUtils" (not an instance).`,
        debug: 'Option debug should be a "boolean" value.',
        cache: 'Option cache should be a "boolean" value.',
        bodyClass: 'Option bodyClass should be a "string" value.',
    },
};
