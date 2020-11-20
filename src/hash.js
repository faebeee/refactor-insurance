import { getInterpolatedUrls, hashString } from './utils';

const Table = require('cli-table');
export default async function hash(pages) {
    const table = new Table({
        head: ['group', 'hash', 'URL']
        , colWidths: [20, 20, 100],
    });

    pages.forEach((page) => {
        getInterpolatedUrls(page).forEach((url) => {
            table.push(
                [page.id, hashString(url), url],
            );
        })

    });

    console.log(table.toString());

}
