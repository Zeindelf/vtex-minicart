
const babel = require('rollup-plugin-babel');
const pkg = require('./package');

const now = new Date();
const banner = `
/*!!
 * VtexMinicart.js v${pkg.version}
 * https://github.com/${pkg.repository}
 *
 * Copyright (c) 2017-${now.getFullYear()} ${pkg.author.name}
 * Released under the ${pkg.license} license
 *
 * Date: ${now.toISOString()}
 */
`;

module.exports = {
    // Export banner
    banner,
    input: 'src/vtex-minicart.js',
    output: [
        {
            banner: banner,
            file: 'dist/vtex-minicart.js',
            format: 'iife',
        },
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**',
            plugins: ['external-helpers'],
        }),
    ],
};
