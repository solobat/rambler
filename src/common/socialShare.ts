export interface Network {
    name: string,
    className: string,
    url: string,
    enable?: boolean
}

export interface NetworkOption {
    title?: string,
    url?: string,
    via?: string,
    hashtags?: string,
    img?: string,
    desc?: string
}

const Networks: Network[] = [
    {
        name: 'Facebook',
        className: 'facebook',
        enable: false,
        url: 'https://www.facebook.com/sharer.php?s=100&p[url]={url}&p[images][0]={img}&p[title]={title}&p[summary]={desc}'
    },
    {
        name: 'Twitter',
        className: 'twitter',
        enable: true,
        url: 'https://twitter.com/intent/tweet?url={url}&text={title}&via={via}&hashtags={hashtags}'
    },
    {
        name: 'Weibo',
        className: 'weibo',
        enable: true,
        url: 'http://service.weibo.com/share/share.php?url={url}&appkey=&title={title}&pic={img}&ralateUid=',
    },
];

export function getValidNetworks(): Network[] {
    return Networks.filter(item => item.enable);
}

export function generateSocialUrls(opt: NetworkOption): Network[] {
    return Networks.filter(item => item.enable).map(network => {
        return {
            name: network.name,
            className: network.className,
            url: generateUrl(network.url, opt)
        };
    });
}

export function generateUrl(url: string, opt: NetworkOption): string {
    let prop, arg, arg_ne;

    for (prop in opt) {
        arg = `{${prop}}`;

        if (url.indexOf(arg) !== -1) {
            url = url.replace(new RegExp(arg, 'g'), encodeURIComponent(opt[prop]));
        }

        arg_ne = `{${prop}-ne}`;

        if (url.indexOf(arg_ne) !== -1) {
            url = url.replace(new RegExp(arg_ne, 'g'), opt[prop]);
        }
    }
    return cleanUrl(url);
}

function cleanUrl(fullUrl: string): string {
    //firstly, remove any expressions we may have left in the url
    const fixedFullUrl = fullUrl.replace(/\{([^{}]*)}/g, '');

    //then remove any empty parameters left in the url
    const params = fixedFullUrl.match(/[^\=\&\?]+=[^\=\&\?]+/g);

    let url = fixedFullUrl.split('?')[0];

    if (params && params.length > 0) {
        url += '?' + params.join('&');
    }

    return url;
}