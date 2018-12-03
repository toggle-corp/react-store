export const union = (seta, setb) => new Set([
    ...seta,
    ...setb,
]);

export const intersection = (seta, setb) => new Set(
    [...seta].filter(x => setb.has(x)),
);

export const getTrigrams = (word) => {
    const newWord = word.trim()
        .toLowerCase()
        .replace(/[^a-zA-z0-9]/g, ' ')
        .replace(/\s+/g, '  ');
    const formattedWord = `  ${newWord} `;

    const trigrams = [];
    for (let i = 0; i < formattedWord.length - 2; i += 1) {
        const trigram = formattedWord.substr(i, 3);
        if (trigram[1] !== ' ' || trigram[2] !== ' ') {
            trigrams.push(trigram);
        }
    }
    return new Set(trigrams);
};

export const getTrigramSimilarity = (foo, bar) => {
    const fooTrigrams = getTrigrams(foo);
    const barTrigrams = getTrigrams(bar);

    const common = intersection(fooTrigrams, barTrigrams);
    const all = union(fooTrigrams, barTrigrams);
    return common.size / all.size;
};
