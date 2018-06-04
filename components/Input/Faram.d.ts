import * as React from 'react';

export declare interface FaramErrors {
    $internal?: undefined | string[];
    [key: string]: string | string[] | undefined | FaramErrors;
}

export declare interface FaramValues {
    [key: string]: any;
}

export type ConditionFn = (value: any) => { ok: boolean, message?: string };
type ConditionFns = ConditionFn[];
type ValidationFn = (value: any) => string[];
interface ObjectSchema {
    validation?: ValidationFn;
    fields: {
        [key: string]: ObjectSchema | ConditionFns;
    };
}
interface ArraySchema {
    validation?: ValidationFn;
    members: ArraySchema | ObjectSchema | ConditionFns;
}
export declare type FaramSchema = ArraySchema | ObjectSchema | ConditionFns;

interface FaramProps {
    className?: string;
    children: React.ReactNode;
    schema: FaramSchema;
    // FIXME: write compute schema
    computeSchema?: object;
    onChange(value: FaramValues, error: FaramErrors): void;
    onValidationFailure(error: FaramErrors): void;
    onValidationSuccess(value: FaramValues): void;
    value?: FaramValues;
    error?: FaramErrors;
    disabled?: boolean;
    changeDelay?: number;
}

declare class Faram extends React.PureComponent<FaramProps, any> {
}
export default Faram;
