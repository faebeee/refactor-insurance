import logSymbols from 'log-symbols';

export const printer = (id, results) => {
    const created = results.filter(r => !!r.file);
    const skipped = results.filter(r => !r.file);
    console.log(logSymbols.success, `Created ${ created.length } and skipped ${ skipped.length} screenshots for ${ id }`);
}
