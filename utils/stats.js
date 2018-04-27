export const sum = values => values.reduce(
    (acc, b) => acc + b,
    0,
);

export const mean = values => sum(values) / values.length;

export const median = (values) => {
    const sortedValues = [...values].sort();
    const half = Math.floor(sortedValues.length / 2);

    return (sortedValues.length % 2) ? (
        sortedValues[half]
    ) : (
        (sortedValues[half - 1] + sortedValues[half]) / 2.0
    );
};

export const bucket = (value, buckets) => {
    // buckets: [[min, max, out], [min, max, out] ...]
    const currentBucket = buckets.find(b => (value >= b[0] && value < b[1]));
    return currentBucket && currentBucket[2];
};
