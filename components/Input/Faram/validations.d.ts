import { ConditionFn } from '../Faram';

export declare function lessThanCondition(value: number): ConditionFn;
export declare function greaterThanCondition(value: number): ConditionFn;
export declare function lessThanOrEqualToCondition(value: number): ConditionFn;
export declare function greaterThanOrEqualToCondition(value: number): ConditionFn;
export declare function lengthLessThanCondition(value: number): ConditionFn;
export declare function lengthGreaterThanCondition(value: number): ConditionFn;
export declare function lengthLessThanCondition(value: number): ConditionFn;
export declare function lengthGreaterThanCondition(value: number): ConditionFn;
export declare function lengthEqualToCondition(value: number): ConditionFn;
export const requiredCondition: ConditionFn;
export const numberCondition: ConditionFn;
export const integerCondition: ConditionFn;
export const emailCondition: ConditionFn;
export const urlCondition: ConditionFn;
export const dateCondition: ConditionFn;
