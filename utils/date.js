const getStartEnd = (mode, matches) => {
    let minStart;
    let maxEnd;

    matches.forEach((val) => {
        const start = mode.indexOf(val);
        if (start === -1) {
            return;
        }
        const end = start + val.length;

        if (start < minStart || minStart === undefined) {
            minStart = start;
        }
        if (end > maxEnd || maxEnd === undefined) {
            maxEnd = end;
        }
    });
    return { start: minStart, end: maxEnd };
};

export const breakFormat = (mode) => {
    const dateIndices = getStartEnd(mode, ['yyyy', 'yy', 'MMM', 'MM', 'dd', 'EEE']);
    const timeIndices = getStartEnd(mode, ['hh', 'mm', 'ss', 'aaa']);

    const partOfMode = (start, end) => mode.substring(start, end);

    if (dateIndices.start === undefined && timeIndices.start === undefined) {
        return [
            { value: mode },
        ];
    } else if (dateIndices.start === undefined) {
        return [
            { value: partOfMode(0, timeIndices.start) },
            { type: 'time', value: partOfMode(timeIndices.start, timeIndices.end) },
            { value: partOfMode(timeIndices.end, mode.length) },
        ].filter(a => a.value !== '');
    } else if (timeIndices.start === undefined) {
        return [
            { value: partOfMode(0, dateIndices.start) },
            { type: 'date', value: partOfMode(dateIndices.start, dateIndices.end) },
            { value: partOfMode(dateIndices.end, mode.length) },
        ].filter(a => a.value !== '');
    } else if (dateIndices.start < timeIndices.start) {
        return [
            { value: partOfMode(0, dateIndices.start) },
            { type: 'date', value: partOfMode(dateIndices.start, dateIndices.end) },
            { value: partOfMode(dateIndices.end, timeIndices.start) },
            { type: 'time', value: partOfMode(timeIndices.start, timeIndices.end) },
            { value: partOfMode(timeIndices.end, mode.length) },
        ].filter(a => a.value !== '');
    }
    return [
        { value: partOfMode(0, timeIndices.start) },
        { type: 'time', value: partOfMode(timeIndices.start, timeIndices.end) },
        { value: partOfMode(timeIndices.end, dateIndices.start) },
        { type: 'date', value: partOfMode(dateIndices.start, dateIndices.end) },
        { value: partOfMode(dateIndices.end, mode.length) },
    ].filter(a => a.value !== '');
};

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAYS = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
];

const padding = (number, length, str = '0') => (
    String(number).padStart(length, str)
);

export const insertValues = (formatList, date) => (
    formatList.map((format) => {
        if (format.type === 'date') {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const weekName = DAYS[date.getDay()];

            const newFormat = { ...format };
            newFormat.value = newFormat.value
                .replace('yyyy', year)
                .replace('yy', date.getFullYear() % 100)
                .replace('MMM', MONTHS[date.getMonth()])
                .replace('MM', padding(month, 2))
                .replace('EEE', weekName)
                .replace('dd', padding(day, 2));
            return newFormat;
        } else if (format.type === 'time') {
            const ttIndex = format.value.indexOf('aaa');

            const originalHour = date.getHours();

            const hour = ttIndex >= 0
                ? ((originalHour - 1) % 12) + 1
                : originalHour;
            const amPm = originalHour >= 12 ? 'PM' : 'AM';
            const minute = date.getMinutes();
            const second = date.getSeconds();

            const newFormat = { ...format };
            newFormat.value = newFormat.value
                .replace('hh', padding(hour, 2))
                .replace('mm', padding(minute, 2))
                .replace('ss', padding(second, 2))
                .replace('aaa', amPm);
            return newFormat;
        }
        return format;
    })
);

export const formatDate = (date, mode) => (
    insertValues(breakFormat(mode), date)
        .map(e => e.value)
        .join('')
);
