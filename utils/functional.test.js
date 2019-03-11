import { mapToMap, mapToList } from '@togglecorp/fujs';

import {
    zipWith,
    zip,
} from './functional';

test('zipWith', () => {
    const f = (x, y) => x * y;
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const c = [...zipWith(f, a, b)];
    expect(c).toEqual([4, 10, 18]);
});

test('interesting zipWith', () => {
    // NOTE: This tests converting an object with list values to list of objects
    // with original keys, look obj and expectedRows below
    const obj = {
        apple: [1, 2, 3],
        mango: [4, 5, 6],
        banana: [7, 8, 9],
    };
    const expectedRows = [
        { apple: 1, mango: 4, banana: 7 },
        { apple: 2, mango: 5, banana: 8 },
        { apple: 3, mango: 6, banana: 9 },
    ];

    const objCreator = (...zippedRow) => mapToMap(
        obj,
        k => k,
        (k, v, i) => zippedRow[i],
    );

    const rows = zipWith(objCreator, ...mapToList(obj));
    expect([...rows]).toEqual(expectedRows);
});

test('zip', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const c = [...zip(a, b)];
    expect(c).toEqual([[1, 4], [2, 5], [3, 6]]);
});

test('zip', () => {
    const a = [1, 2, 3];
    const b = [...zip(a)];
    expect(b).toEqual([]);
});

test('zip', () => {
    const a = [];
    const b = [...zip(a)];
    expect(b).toEqual([]);
});
