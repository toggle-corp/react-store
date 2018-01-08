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
    getDifferenceInDays,
    addSeparator,
    formattedNormalize,
    leftPad,
    camelToDash,
    camelToNormal,
    getContrastYIQ,
    getColorOnBgColor,
    getHashFromString,
    getHexFromCode,
    getHexFromString,
    getHexFromRgb,
    getStandardFilename,
    getElementAround,
    unique,
    isValidHexColor,
    splitInWhitespace,
    trimWhitespace,
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

test('get contrast YIQ', () => {
    expect(getContrastYIQ('#000000')).toBeCloseTo(0);
    expect(getContrastYIQ('#ffff00')).toBeCloseTo(0.886);
    expect(getContrastYIQ('#3498db')).toBeCloseTo(0.508);
});

test('get text color on bg color', () => {
    expect(getColorOnBgColor('#000000')).toEqual('#ffffff');
    expect(getColorOnBgColor('#ffff00')).toEqual('#212121');
    expect(getColorOnBgColor('#ffff00', '#ffff00')).toEqual('#ffff00');
    expect(getColorOnBgColor('#000000', '#ffff00', '#f00f00')).toEqual('#f00f00');
});

test('get hash of a string', () => {
    expect(getHashFromString('testing')).toEqual(2872521232);
    expect(getHashFromString('testing123')).toEqual(-1943301598);
});

test('get hex of a hash', () => {
    expect(getHexFromCode(2872521232)).toEqual('#373210');
    expect(getHexFromCode(-1943301598)).toEqual('#2B9222');
});

test('get hex of a string', () => {
    expect(getHexFromString('testing')).toEqual('#373210');
    expect(getHexFromString('testing123')).toEqual('#2B9222');
});

test('get hex from rgb', () => {
    expect(getHexFromRgb('rgb(255,255,255)')).toEqual('#ffffff');
    expect(getHexFromRgb('rgb(188,143,143)')).toEqual('#bc8f8f');
    expect(getHexFromRgb('rgb(205,133,63)')).toEqual('#cd853f');
    expect(getHexFromRgb('rgb(255,0,0)')).toEqual('#ff0000');
    expect(getHexFromRgb('rgb(255,0,255)')).toEqual('#ff00ff');
    expect(getHexFromRgb('rgb(0,255,255)')).toEqual('#00ffff');
    expect(getHexFromRgb('rgb(0,0,255)')).toEqual('#0000ff');
    expect(getHexFromRgb('rgb(0,0,0)')).toEqual('#000000');
});

test('get standard filename', () => {
    expect(getStandardFilename('Entries', 'General', new Date(2016, 1, 15)))
        .toEqual('20160215 Entries General');
});

test('get element around', () => {
    expect(getElementAround([1, 2, 4, 3], 0)).toBe(2);
    expect(getElementAround([1, 2, 4, 3], 3)).toBe(4);
    expect(getElementAround([1, 2, 4, 3], 1)).toBe(4);
});

test('should get unique elements in array', () => {
    const before = ['Apple', 'Ball', 'Cat', 'Dog', 'Ball', 'Elephant', 'Fish', 'Apple'];
    const after = ['Apple', 'Ball', 'Cat', 'Dog', 'Elephant', 'Fish'];
    const beforeObjectArray = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Ball' }, { id: 1, name: 'Apple' }];
    const afterObjectArray = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Ball' }];
    const uniqueArray = ['Apple', 'Ball', 'Cat', 'Dog', 'Elephant', 'Fish'];
    expect(unique(before, d => d)).toEqual(after);
    expect(unique([], d => d)).toEqual([]);
    expect(unique(beforeObjectArray, d => d.id)).toEqual(afterObjectArray);
    expect(unique(uniqueArray, d => d)).toEqual(uniqueArray);
});

test('should return true for valid hex colors', () => {
    expect(isValidHexColor('#000000')).toBe(true);
    expect(isValidHexColor('#000')).toBe(true);
    expect(isValidHexColor('#ffffff')).toBe(true);
    expect(isValidHexColor('#AABBCC')).toBe(true);
    expect(isValidHexColor('#11AAFF')).toBe(true);
    expect(isValidHexColor('#afasdfa')).toBe(false);
    expect(isValidHexColor('#11212121212')).toBe(false);
    expect(isValidHexColor('#hello')).toBe(false);
    expect(isValidHexColor('')).toBe(false);
});

test('split from whitespaces', () => {
    expect(splitInWhitespace('')).toEqual([]);
    expect(splitInWhitespace('hari')).toEqual(['hari']);
    expect(splitInWhitespace('hari is')).toEqual(['hari', 'is']);
    expect(splitInWhitespace(' hari is ')).toEqual(['hari', 'is']);
    expect(splitInWhitespace('  hari  is good     ')).toEqual(['hari', 'is', 'good']);
    // eslint-disable-next-line no-tabs
    expect(splitInWhitespace('hari	is good')).toEqual(['hari', 'is', 'good']);
    expect(splitInWhitespace('hari\t is\ngood boy  ')).toEqual(['hari', 'is', 'good', 'boy']);
});


test('trim out whitespaces', () => {
    expect(trimWhitespace('')).toEqual('');
    expect(trimWhitespace('hari')).toEqual('hari');
    expect(trimWhitespace('hari is')).toEqual('hari is');
    expect(trimWhitespace(' hari is ')).toEqual('hari is');
    expect(trimWhitespace('  hari  is good     ')).toEqual('hari is good');
    // eslint-disable-next-line no-tabs
    expect(trimWhitespace('hari	is good')).toEqual('hari is good');
    expect(trimWhitespace('hari\t is\ngood boy  ')).toEqual('hari is good boy');
});
