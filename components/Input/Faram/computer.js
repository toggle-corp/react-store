import update from '../../../utils/immutable-update';


const computeOutputSettings = (obj, schema, data, otherParams = []) => {
    const { fields, member } = schema;

    if (fields) {
        const settings = {};

        Object.keys(fields).forEach((fieldName) => {
            const childSchema = fields[fieldName];
            const isComputer = typeof childSchema === 'function';
            let subSettings;

            if (isComputer) {
                subSettings = { $set: childSchema(data, ...otherParams) };
            } else {
                subSettings = computeOutputSettings(
                    obj[fieldName],
                    childSchema,
                    data,
                    otherParams,
                );
            }

            settings[fieldName] = subSettings;
        });

        return { $auto: settings };
    }

    if (member) {
        const settings = {};

        obj.forEach((arrayItem, index) => {
            const itemSettings = computeOutputSettings(
                arrayItem,
                member,
                data,
                [...otherParams, index],
            );

            settings[index] = itemSettings;
        });

        return { $autoArray: settings };
    }

    return {};
};

const computeOutputs = (obj, schema) => {
    const settings = computeOutputSettings(obj, schema, obj);
    return update(obj, settings);
};

export default computeOutputs;
