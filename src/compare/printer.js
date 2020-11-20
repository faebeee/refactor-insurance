import Table from 'cli-table';
import logSymbols from 'log-symbols';
import { hashString } from '../utils';

export const printer = (id, results) => {
    const table = new Table({
        head: ['Hash ID', 'Equal', 'Url', 'Image'],
        colWidths: [20, 10, 80, 100],
    });

    results.forEach(({ isEqual, diff, url, image }, index) => {
        table.push([hashString(url), isEqual ? logSymbols.success : logSymbols.error, url.substr(0, 80), image]);
    });

    console.log(table.toString());
}

export default printer;
