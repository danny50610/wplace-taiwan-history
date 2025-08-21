const dataAt = {
    '2025-08-19': '1755532802',
    '2025-08-20': '1755619201',
    '2025-08-21': '1755705601',
};

export const lastDateString = '2025-08-21';
export const lastDate = dataAt[lastDateString];

export function hasData(date) {
    return !dataAt.hasOwnProperty(date.format('YYYY-MM-DD'));
}

export function getDateTimestamp(date) {
    return dataAt[date.format('YYYY-MM-DD')];
}