export const setsEqual = (seta, setb) => {
    // Check the length first
    if (seta.size !== setb.size) return false;
    // eslint-disable-next-line no-restricted-syntax
    for (const elem of seta) {
        if (!setb.has(elem)) {
            return false;
        }
    }
    return true;
};

export const union = (seta, setb) => {
    const newSet = new Set(setb);
    seta.forEach(x => newSet.add(x));
    return newSet;
};

export const intersection = (seta, setb) => {
    const newSet = new Set();
    setb.forEach((x) => {
        if (seta.has(x)) {
            newSet.add(x);
        }
    });
    return newSet;
};

export const getTrigramCharsWord = (word) => {
    // Append two spaces to the beginning and end and remove non alphanumeric
    const replaced = word.replace(/[^a-zA-z0-9 ]/g, '');
    const formattedWord = `  ${replaced.trim().toLowerCase()} `;
    const trigrams = [];
    for (let i = 0; i < formattedWord.length - 2; i += 1) {
        trigrams.push(formattedWord.substr(i, 3));
    }
    // Return a Set
    return new Set(trigrams);
};

export const getTrigramCharsString = (string) => {
    const words = string.trim().split(/\s+/);
    return words.reduce(
        (acc, word) => union(acc, getTrigramCharsWord(word)),
        new Set(),
    );
};

export const getTrigramSimilarity = (stringA, stringB) => {
    const trigramsA = getTrigramCharsString(stringA);
    const trigramsB = getTrigramCharsString(stringB);
    const common = intersection(trigramsA, trigramsB);
    const all = union(trigramsA, trigramsB);
    return common.size / all.size;
};
