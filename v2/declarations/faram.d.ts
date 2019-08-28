type PickPartial<I, T extends keyof I> = Partial<Pick<I, T>> & Omit<I, T>;

declare module '@togglecorp/faram' {
    import * as React from 'react';

    interface ActionIdentifier {
        faramElementName: string;
        faramAction?: () => void;
    }

    interface ActionElement<T> {
        onClick: (value: { event: React.MouseEvent; params?: T }) => void;
        disabled?: boolean;
        changeDelay?: number;
    }

    // eslint-disable-next-line import/prefer-default-export
    export function FaramActionElement<T, P extends ActionElement<T>>(
        component: React.ComponentType<P>
    ): React.ComponentType<P | (PickPartial<P, 'onClick' | 'disabled' | 'changeDelay'> & ActionIdentifier)>;

    interface ListIdentifier {
        faramElement: boolean;
    }

    interface ListElement<D, K> {
        data: D[];
        keySelector(datum: D, index: number): K;
    }

    export function FaramListElement<D, K, P>(
        component: React.ComponentType<P>
    ): React.ComponentType<P>;

    /*
    export function FaramListElement<D, K, P extends ListElement<D, K>>(
        component: React.ComponentType<P>
    ): React.ComponentType<P | (PickPartial<P, 'data' | 'keySelector'> & ListIdentifier)>;
    */
}
