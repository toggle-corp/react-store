import update from '../../../utils/immutable-update';

const emptyObject = {};
const emptyList = [];

const computeOutputSettings = (obj, schema, data = []) => {
    const { fields, member } = schema;

    if (fields) {
        const settings = {};

        Object.keys(fields).forEach((fieldName) => {
            const childSchema = fields[fieldName];
            const isComputer = typeof childSchema === 'function';
            let subSettings;

            if (isComputer) {
                subSettings = { $set: childSchema(...data) };
            } else {
                subSettings = computeOutputSettings(
                    (obj || emptyObject)[fieldName],
                    childSchema,
                    [...data, (obj || emptyObject)[fieldName]],
                );
            }

            settings[fieldName] = subSettings;
        });

        return { $auto: settings };
    }

    if (member) {
        const settings = {};

        (obj || emptyList).forEach((arrayItem, index) => {
            const itemSettings = computeOutputSettings(
                arrayItem,
                member,
                [...data, arrayItem],
            );

            settings[index] = itemSettings;
        });

        return { $autoArray: settings };
    }

    return {};
};

const MAX_ITERATIONS = 100;

const computeOutputs = (initialObj, schema) => {
    if (!schema) {
        return initialObj;
    }
    let obj = initialObj;
    let finalObj = initialObj;
    let iteration = 0;

    do {
        obj = finalObj;
        const settings = computeOutputSettings(obj, schema, [obj]);
        finalObj = update(obj, settings);
        iteration += 1;
    } while (finalObj !== obj && iteration < MAX_ITERATIONS);

    return finalObj;
};

export default computeOutputs;
