import {
    listToMap,
    groupList,
    caseInsensitiveSubmatch,
    getNumbers,
    getRandomFromList,
    isFalsy,
    isInteger,
    getKeyByValue,
    isObjectEmpty,
    bound,
    normalize,
    extractDate,
    getDifferenceInDays,
    addSeparator,
    formattedNormalize,
    leftPad,
    camelToDash,
    camelToNormal,
} from './common';

test('convert list to map without modifier', () => {
    const input = [
        { id: 1, name: 'hari' },
        { id: 2, name: 'shyam' },
        { id: 3, name: 'kiran' },
        { id: 4, name: 'ale' },
    ];
    const output = {
        1: { id: 1, name: 'hari' },
        2: { id: 2, name: 'shyam' },
        3: { id: 3, name: 'kiran' },
        4: { id: 4, name: 'ale' },
    };
    const keySelector = e => e.id;
    expect(listToMap(input, keySelector)).toEqual(output);
});


test('convert list to map with modifier', () => {
    const input = [
        { id: 1, name: 'hari' },
        { id: 2, name: 'shyam' },
        { id: 3, name: 'kiran' },
        { id: 4, name: 'ale' },
    ];
    const output = {
        1: 'hari',
        2: 'shyam',
        3: 'kiran',
        4: 'ale',
    };
    const keySelector = e => e.id;
    const modifier = e => e.name;
    expect(listToMap(input, keySelector, modifier)).toEqual(output);
});


test('group list into map without modifier', () => {
    const input = [
        { id: 1, name: 'hari' },
        { id: 2, name: 'shyam' },
        { id: 1, name: 'kiran' },
        { id: 1, name: 'ale' },
    ];
    const output = {
        1: [
            { id: 1, name: 'hari' },
            { id: 1, name: 'kiran' },
            { id: 1, name: 'ale' },
        ],
        2: [
            { id: 2, name: 'shyam' },
        ],
    };
    const keySelector = e => e.id;
    expect(groupList(input, keySelector)).toEqual(output);
});


test('group list into map with modifier', () => {
    const input = [
        { id: 1, name: 'hari' },
        { id: 2, name: 'shyam' },
        { id: 1, name: 'kiran' },
        { id: 1, name: 'ale' },
    ];
    const output = {
        1: [
            'hari',
            'kiran',
            'ale',
        ],
        2: [
            'shyam',
        ],
    };
    const keySelector = e => e.id;
    const modifier = e => e.name;
    expect(groupList(input, keySelector, modifier)).toEqual(output);
});


test('case-insensitive submatch', () => {
    expect(caseInsensitiveSubmatch('HArI', 'ari')).toEqual(true);
    expect(caseInsensitiveSubmatch('haRI', 'hari')).toEqual(true);
    expect(caseInsensitiveSubmatch('HAri', 'haris')).toEqual(false);
});


test('case-insensitive submatch for empty strings', () => {
    expect(caseInsensitiveSubmatch('', '')).toEqual(true);
    expect(caseInsensitiveSubmatch('', 'hari')).toEqual(false);
    expect(caseInsensitiveSubmatch('hari', '')).toEqual(true);
});

test('get list of numbers', () => {
    expect(getNumbers(0, 4)).toEqual([0, 1, 2, 3]);
    expect(getNumbers(-2, 4)).toEqual([-2, -1, 0, 1, 2, 3]);
    expect(getNumbers(0, 1)).toEqual([0]);
    expect(getNumbers(0, 0)).toEqual([]);
    expect(getNumbers(0, -1)).toEqual([]);
});

test('random is from list', () => {
    const listing = [1, 2, 'hari', 'shyam'];
    expect(listing).toContain(getRandomFromList(listing));
    expect(listing).toContain(getRandomFromList(listing));
    expect(listing).toContain(getRandomFromList(listing));
    expect(listing).toContain(getRandomFromList(listing));
});

test('isFalsy', () => {
    expect(isFalsy(NaN)).toBe(true);
    expect(isFalsy(undefined)).toBe(true);
    expect(isFalsy(null)).toBe(true);
    expect(isFalsy(false)).toBe(true);
    expect(isFalsy('')).toBe(false);
    expect(isFalsy([])).toBe(false);
    expect(isFalsy(0)).toBe(false);
});

test('isInteger', () => {
    expect(isInteger(12)).toBe(true);
    expect(isInteger(-12)).toBe(true);
    expect(isInteger(0)).toBe(true);
    expect(isInteger(0.00)).toBe(true);
    expect(isInteger(-1.12)).toBe(false);
    expect(isInteger(12.012)).toBe(false);
    expect(isInteger('12')).toBe(false);
    expect(isInteger('23.12')).toBe(false);
    expect(isInteger({})).toBe(false);
    expect(isInteger(undefined)).toBe(false);
    expect(isInteger(null)).toBe(false);
    expect(isInteger(NaN)).toBe(false);
    expect(isInteger([])).toBe(false);
});

test('get key by value', () => {
    const map = { ram: 'ram', shyam: 'shyam', hari: 'ram' };
    expect(getKeyByValue(map, 'ram')).toEqual('ram');
    expect(getKeyByValue(map, 'ram')).not.toEqual('hari');
    expect(getKeyByValue(map, 'shyam')).toEqual('shyam');
});

test('check if object is empty', () => {
    expect(isObjectEmpty({})).toBe(true);
    expect(isObjectEmpty({ some: 'object' })).toBe(false);
});

test('bound', () => {
    expect(bound(12, 8, 1)).toBe(8);
    expect(bound(12, 1, 1)).toBe(1);
    expect(bound(12, 20, 0)).toBe(12);
    expect(bound(-12, 10, -10)).toBe(-10);
});

test('normalize', () => {
    expect(normalize(0.5, 1, 0)).toBeCloseTo(0.5);
    expect(normalize(-1, -2, 0)).toBeCloseTo(0.5);
    expect(normalize(12, 20, 10)).toBeCloseTo(0.2);
});

test('extract date from timestamp', () => {
    expect(extractDate(1513443573714)).toEqual(1513361700000);
});

test('get difference in days', () => {
    const a = new Date();
    a.setHours(10);
    const b = (new Date());
    b.setHours(23);
    b.setMinutes(2);
    b.setDate(a.getDate() - 1);
    expect(getDifferenceInDays(a.getTime(), b.getTime())).toEqual(1);
});

test('add thousand separator in number', () => {
    expect(addSeparator(1000000000)).toBe('1,000,000,000');
    expect(addSeparator(1000000000, '.')).toBe('1.000.000.000');
});

test('normalize numbers', () => {
    expect(formattedNormalize(80000)).toEqual({ number: 80000, normalizeSuffix: undefined });
    expect(formattedNormalize(100000)).toEqual({ number: 1, normalizeSuffix: 'Lac' });
    expect(formattedNormalize(111110)).toEqual({ number: 1.1111, normalizeSuffix: 'Lac' });
    expect(formattedNormalize(30000000)).toEqual({ number: 3, normalizeSuffix: 'Cr' });
    expect(formattedNormalize(2000000000)).toEqual({ number: 2, normalizeSuffix: 'Ar' });
});

test('left padding in number', () => {
    expect(leftPad(121, 2, 'x')).toEqual('121');
    expect(leftPad(121, 4, 'x')).toEqual('x121');
    expect(leftPad(121, 4)).toEqual('0121');
});

test('camel case to kebab case', () => {
    expect(camelToDash('hariIsGood')).toEqual('hari-is-good');
    expect(camelToDash('HariIsGood')).toEqual('hari-is-good');
    expect(camelToDash('HariIsGOOD')).toEqual('hari-is-g-o-o-d');
    expect(camelToDash('hari')).toEqual('hari');
    expect(camelToDash('Hari')).toEqual('hari');
});

test('camel case to normal', () => {
    expect(camelToNormal('hariIsGood')).toEqual('hari is good');
    expect(camelToNormal('HariIsGood')).toEqual('hari is good');
    expect(camelToNormal('HariIsGOOD')).toEqual('hari is g o o d');
    expect(camelToNormal('hari')).toEqual('hari');
    expect(camelToNormal('Hari')).toEqual('hari');
});
