import update from './immutable-update';

test('should create auto object', () => {
    const before = {
        a: { name: 'hari' },
        b: { name: 'shyam' },
    };
    const after = {
        a: { name: 'hari' },
        b: { name: 'chyame' },
        c: { name: 'gita' },
    };
    const settings = {
        b: { $auto: {
            $set: { name: 'chyame' },
        } },
        c: { $auto: {
            $set: { name: 'gita' },
        } },
    };
    expect(update(before, settings)).toEqual(after);
});

test('should create auto array', () => {
    const before = {
        a: ['hari'],
        b: ['shyam'],
    };
    const after = {
        a: ['hari'],
        b: ['shyam', 'chyame'],
        c: ['gita'],
    };
    const settings = {
        b: { $autoArray: {
            $push: ['chyame'],
        } },
        c: { $autoArray: {
            $push: ['gita'],
        } },
    };
    expect(update(before, settings)).toEqual(after);
});

test('should set conditionally', () => {
    const before = {
        a: { name: 'hari' },
        b: { name: 'shyam' },
    };
    const after = {
        a: { name: 'hari' },
        b: { name: 'gita' },
    };
    const settings = {
        a: { $if: [
            false,
            { $set: { name: 'chyame' } },
        ] },
        b: { $if: [
            true,
            { $set: { name: 'gita' } },
        ] },
    };
    expect(update(before, settings)).toEqual(after);
});

test('should filter array', () => {
    const before = {
        a: ['hari'],
        b: ['shyam', 'chyame'],
    };
    const after = {
        a: ['hari'],
        b: ['shyam'],
    };
    const settings = {
        b: {
            $filter: word => word.length <= 5,
        },
    };
    expect(update(before, settings)).toEqual(after);
});

test('should apply bulk action', () => {
    const before = {
        a: ['hari'],
        b: ['shyam', 'chyame'],
    };
    const after = {
        a: ['hari'],
        b: ['shyam', 'sundar'],
    };
    const settings = {
        b: {
            $bulk: [
                { $filter: word => word.length <= 5 },
                { $push: ['sundar'] },
            ],
        },
    };
    expect(update(before, settings)).toEqual(after);
});

test('should apply auto push', () => {
    const before = {
        b: ['shyam'],
    };
    const after = {
        a: ['hari'],
        b: ['shyam', 'sundar'],
    };
    const settings = {
        a: {
            $autoPush: ['hari'],
        },
        b: {
            $autoPush: ['sundar'],
        },
    };
    expect(update(before, settings)).toEqual(after);
});

test('should sort array', () => {
    const before = {
        b: ['ram', 'hari', 'kiran'],
    };
    const after = {
        b: ['kiran', 'hari', 'ram'],
    };
    const settings = {
        b: {
            $sort: (a, b) => b.length - a.length,
        },
    };
    expect(update(before, settings)).toEqual(after);
});

test('should get unique elements in array', () => {
    const before = {
        b: ['ram', 'hari', 'kiran', 'ram', 'ram', 'kiran'],
    };
    const after = {
        b: ['ram', 'hari', 'kiran'],
    };
    const settings = {
        b: {
            $unique: a => a,
        },
    };
    expect(update(before, settings)).toEqual(after);
});

test('should get unique element in array, no change in array', () => {
    const before = {
        b: ['shyam', 'hari', 'kiran'],
    };
    const settings = {
        b: {
            $unique: a => a,
        },
    };
    const after = update(before, settings);
    expect(after.b).toEqual(before.b);
});

test('should filter array', () => {
    const before = {
        b: ['shyam', 'hari', 'kiran'],
    };
    const after = {
        b: ['shyam', 'kiran'],
    };
    const settings = {
        b: {
            $filter: a => (a.length > 4),
        },
    };
    expect(update(before, settings)).toEqual(after);
});

test('should filter array, no change in array', () => {
    const before = {
        b: ['shyam', 'hari', 'kiran'],
    };
    const settings = {
        b: {
            $filter: a => (a.length !== 1),
        },
    };
    const after = update(before, settings);
    expect(after.b).toEqual(before.b);
});
