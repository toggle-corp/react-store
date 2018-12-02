import {
    intersection,
    union,

    getTrigrams,
    getTrigramsForSentence,
    getTrigramSimilarity,
} from './similarity';

test('should union the sets', () => {
    const empty = new Set();
    const seta = new Set([1, 2, 3, 4]);
    const setb = new Set([3, 4, 5, 2]);
    const unioned = new Set([1, 2, 3, 4, 5]);
    const setc = new Set(['a', 'b', 'c']);

    // Commutativity
    expect(union(seta, setb)).toEqual(union(setb, seta));

    expect(union(seta, setb)).toEqual(unioned);

    expect(union(empty, empty)).toEqual(empty);
    expect(union(setc, empty)).toEqual(setc);
    expect(union(setc, empty)).toEqual(setc);
    expect(union(seta, setb)).toEqual(unioned);
});

test('should intersect the sets', () => {
    const empty = new Set();
    const seta = new Set([1, 2, 3, 4]);
    const setb = new Set([3, 4, 5, 2]);
    const intersected = new Set([2, 3, 4]);

    expect(intersection(empty, empty)).toEqual(empty);
    expect(intersection(seta, empty)).toEqual(empty);
    expect(intersection(seta, setb)).toEqual(intersected);
});

test('should get trigram chars for a word', () => {
    const word = 'test';
    const notCleanWord = '.@#teSt';
    const trigrams = new Set(['  t', ' te', 'tes', 'est', 'st ']);

    expect(getTrigrams(word)).toEqual(trigrams);
    // Same result should be for word containing non alpha numeric chars and
    // also, cases ignored
    expect(getTrigrams(notCleanWord)).toEqual(trigrams);
});

test('should get trigram chars for a string', () => {
    const string = 'Chateau blanc';
    const trigrams = new Set([
        '  b', '  c', ' bl', ' ch', 'anc', 'ate', 'au ', 'bla', 'cha',
        'eau', 'hat', 'lan', 'nc ', 'tea',
    ]);
    expect(getTrigramsForSentence(string)).toEqual(trigrams);
});

test('should get trigrams Similarity for two stinrgs', () => {
    const stringA = 'Chateau blanc';
    const stringB = 'Chateau Cheval Blanc';
    const similarity = getTrigramSimilarity(stringA, stringB).toFixed(6);
    expect(similarity).toEqual('0.736842');
});
