let dataAt = {};

export async function initializeData(baseUrl) {
    const response = await fetch(`${baseUrl}/data.json`);
    const responseData = await response.json();
    
    dataAt = responseData.date;
    
    const lastDateString = responseData.lastDateString;
    return {
        lastDateString: lastDateString,
        lastDate: dataAt[lastDateString]
    };
}

export function isInvalidDate(date) {
    const dateString = typeof date === 'string' ? date : date.format('YYYY-MM-DD');
    return !dataAt.hasOwnProperty(dateString);
}

export function getDateTimestamp(date) {
    const dateString = typeof date === 'string' ? date : date.format('YYYY-MM-DD');
    return dataAt[dateString];
}