const dataAt = {
    '2025-08-19': '1755532802',
    '2025-08-20': '1755619201',
    '2025-08-21': '1755705601',
    '2025-08-22': '1755792001',
};

export const lastDateString = '2025-08-22';
export const lastDate = dataAt[lastDateString];

export function isInvalidDate(date) {
    const dateString = typeof date === 'string' ? date : date.format('YYYY-MM-DD');
    return !dataAt.hasOwnProperty(dateString);
}

export function getDateTimestamp(date) {
    const dateString = typeof date === 'string' ? date : date.format('YYYY-MM-DD');
    return dataAt[dateString];
}