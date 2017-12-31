
export default {
    stripHttp(url) {
        return url.replace(/^https?:/, '');
    },
};
