export declare function isTruthy(value: any): boolean;
export declare function isFalsy(value: any): boolean;
export declare function randomString(value?: number): string;

interface ComparisionOutput<T> {
    (x: T | undefined, y: T | undefined, direction?: number): number;
}

export const compareString: ComparisionOutput<string>;
export const compareStringAsNumber: ComparisionOutput<string>;
export const compareStringByWordCount: ComparisionOutput<string>;
export const compareBoolean: ComparisionOutput<boolean>;
export const compareNumber: ComparisionOutput<number>;
export const compareDate: ComparisionOutput<string>;
export const compareLength: ComparisionOutput<string | any[]>;

export declare function caseInsensitiveSubmatch(
        longText: string | undefined,
        shortText: string | undefined,
    ): string;

export declare function getNumDaysInMonthX(
        year: number,
        month: number,
    ): number;

export declare function reverseRoute(
    // FIXME: handle undefined in reverseRoute
    route: string | undefined,
    params?: {
        // FIXME: handle undefined in reverseRoute
        [key: string]: string | number | undefined,
    },
): string;

export declare function getObjectChildren(
    obj: object,
    // FIXME: handle undefined in reverseRoute
    keys: (undefined| number | string)[],
): (any | undefined);
