import {
    getStandardFilename,
    unique,
} from './common';

test('get standard filename', () => {
    expect(getStandardFilename('Entries', 'General', new Date(2016, 1, 15)))
        .toEqual('20160215 Entries General');
});

test('should get unique elements in array', () => {
    expect(unique([], d => d)).toEqual([]);

    const before = ['Apple', 'Ball', 'Cat', 'Dog', 'Ball', 'Elephant', 'Fish', 'Apple'];
    const after = ['Apple', 'Ball', 'Cat', 'Dog', 'Elephant', 'Fish'];
    expect(unique(before, d => d)).toEqual(after);

    const beforeObjectArray = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Ball' }, { id: 1, name: 'Apple' }];
    const afterObjectArray = [1, 2];
    expect(unique(beforeObjectArray, d => d.id)).toEqual(afterObjectArray);

    const uniqueArray = ['Apple', 'Ball', 'Cat', 'Dog', 'Elephant', 'Fish'];
    expect(unique(uniqueArray, d => d)).toEqual(uniqueArray);

    const nonuniqueArray1 = [1, 2, 0, 2, 3];
    const uniqueArray1 = [1, 2, 0, 3];
    expect(unique(nonuniqueArray1, d => d)).toEqual(uniqueArray1);

    const objectArray = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Ball' }, { id: 1, name: 'Apple' }];
    const expectedObjectArray = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Ball' }];

    expect(unique(objectArray, undefined, d => d.id)).toEqual(expectedObjectArray);
});
