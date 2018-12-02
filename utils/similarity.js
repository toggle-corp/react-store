export const union = (seta, setb) => new Set([
    ...seta,
    ...setb,
]);

export const intersection = (seta, setb) => new Set(
    [...seta].filter(x => setb.has(x)),
);

export const getTrigrams = (word) => {
    // Remove non-numeric characters
    const replaced = word.replace(/[^a-zA-z0-9 ]/g, '');
    // Append two spaces to the beginning and end
    const formattedWord = `  ${replaced.trim().toLowerCase()} `;

    const trigrams = [];
    for (let i = 0; i < formattedWord.length - 2; i += 1) {
        trigrams.push(formattedWord.substr(i, 3));
    }
    return new Set(trigrams);
};

export const getTrigramsForSentence = (string) => {
    const words = string.trim().split(/\s+/);
    return words.reduce(
        (acc, word) => union(acc, getTrigrams(word)),
        new Set(),
    );
};

export const getTrigramSimilarity = (foo, bar) => {
    const fooTrigrams = getTrigramsForSentence(foo);
    const barTrigrams = getTrigramsForSentence(bar);

    const common = intersection(fooTrigrams, barTrigrams);
    const all = union(fooTrigrams, barTrigrams);
    return common.size / all.size;
};
