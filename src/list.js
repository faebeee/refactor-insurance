const Table = require('cli-table');

export async function list(pages) {
    const table = new Table({
        head: ['ID', 'Url', 'Sites']
        , colWidths: [20, 100, 20],
    });

    pages.forEach(({ base_url, id, urls }) => {
        table.push(
            [id, base_url, urls.length],
        );
    });

    console.log(table.toString());

}
