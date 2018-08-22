import { FaramErrors, FaramValues, FaramSchema } from '../Faram';

export declare function accumulateValues(
    obj: FaramValues,
    schema: FaramSchema,
    settings?: {
        noUndefined?: boolean;
    },
): FaramValues;

export declare function accumulateErrors(
    obj: FaramValues,
    schema: FaramSchema,
): FaramValues;

export declare function analyzeErrors(
    errors: FaramErrors,
): boolean;
