
export default {
    stripHttp(url) {
        return url.replace(/^https?:/, '');
    },

    formatPrice(number, thousands, decimals, length, currency) {
        currency = typeof currency == 'string' ? currency : 'R$ ';
        length = typeof length !== 'number' ? 2 : length;

        const re = '\\d(?=(\\d{' + (3) + '})+' + (length > 0 ? '\\D' : '$') + ')';
        number = number / 100;
        number = (number * 1).toFixed(Math.max(0, ~~length));

        return currency + number.replace('.', (decimals || ',')).replace(new RegExp(re, 'g'), '$&' + (thousands || '.'));
    },

    getResizedImage(src, width, height) {
        src = this.stripHttp(src);

        if ( width === undefined || height === undefined || typeof src != 'string' ) {
            return src;
        }

        src = src.replace(/(?:ids\/[0-9]+)-([0-9]+)-([0-9]+)\//, function(match, matchedWidth, matchedHeight) {
            return match.replace('-' + matchedWidth + '-' + matchedHeight, '-' + width + '-' + height);
        });

        return src.replace(/(ids\/[0-9]+)\//, '$1-' + width + '-' + height + '/');
    },
};
