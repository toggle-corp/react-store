import {
    setsEqual,
    intersection,
    union,
    getTrigramCharsWord,
    getTrigramCharsString,
    getTrigramSimilarity,
} from './similarity';

test('should test the equality of the sets', () => {
    const empty = new Set();
    const nextempty = new Set();
    const seta = new Set([1, 2, 3]);
    const setb = new Set([2, 1, 3]);
    const setc = new Set([2, 4, 3]);
    const setd = new Set([2, 4, 3, 1]);
    // Test with itself
    expect(setsEqual(empty, empty)).toEqual(true);
    expect(setsEqual(seta, seta)).toEqual(true);

    // Test empty sets
    expect(setsEqual(empty, nextempty)).toEqual(true);
    // Test sets a and b
    expect(setsEqual(seta, setb)).toEqual(true);
    // Test non equality
    expect(setsEqual(seta, setd)).toEqual(false);
    expect(setsEqual(setd, seta)).toEqual(false);
    expect(setsEqual(seta, setc)).toEqual(false);
    expect(setsEqual(seta, empty)).toEqual(false);
    expect(setsEqual(setb, empty)).toEqual(false);
    expect(setsEqual(setb, nextempty)).toEqual(false);
    expect(setsEqual(setc, seta)).toEqual(false);
});

test('should union the sets', () => {
    const seta = new Set([1, 2, 3, 4]);
    const setb = new Set([3, 4, 5, 2]);
    const unioned = new Set([1, 2, 3, 4, 5]);

    // Commutativity
    expect(union(seta, setb)).toEqual(union(setb, seta));

    expect(union(seta, setb)).toEqual(unioned);

    const empty = new Set();
    const setc = new Set(['a', 'b', 'c']);

    expect(setsEqual(union(empty, empty), empty)).toEqual(true);
    expect(setsEqual(union(setc, empty), setc)).toEqual(true);
    expect(setsEqual(union(setc, empty), setc)).toEqual(true);
    expect(setsEqual(union(seta, setb), unioned)).toEqual(true);
});

test('should intersect the sets', () => {
    const empty = new Set();
    const seta = new Set([1, 2, 3, 4]);
    const setb = new Set([3, 4, 5, 2]);
    const intersected = new Set([2, 3, 4]);

    expect(setsEqual(intersection(empty, empty), empty)).toEqual(true);
    expect(setsEqual(intersection(seta, empty), empty)).toEqual(true);
    expect(setsEqual(intersection(seta, setb), intersected)).toEqual(true);
});

test('should get trigram chars for a word', () => {
    const word = 'test';
    const notCleanWord = '.@#teSt';
    const trigrams = new Set(['  t', ' te', 'tes', 'est', 'st ']);

    expect(setsEqual(getTrigramCharsWord(word), trigrams)).toEqual(true);
    // Same result should be for word containing non alpha numeric chars and
    // also, cases ignored
    expect(setsEqual(getTrigramCharsWord(notCleanWord), trigrams)).toEqual(true);
});

test('should get trigram chars for a string', () => {
    const string = 'Chateau blanc';
    const trigrams = new Set([
        '  b', '  c', ' bl', ' ch', 'anc', 'ate', 'au ', 'bla', 'cha',
        'eau', 'hat', 'lan', 'nc ', 'tea',
    ]);
    expect(setsEqual(trigrams, getTrigramCharsString(string))).toEqual(true);
});

test('should get trigrams Similarity for two stinrgs', () => {
    const stringA = 'Chateau blanc';
    const stringB = 'Chateau Cheval Blanc';
    const similarity = getTrigramSimilarity(stringA, stringB).toFixed(6);
    expect(similarity).toEqual('0.736842');
});
