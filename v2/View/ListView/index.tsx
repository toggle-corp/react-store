import React from 'react';
import { _cs } from '@togglecorp/fujs';

import List, { ListProps } from '../List';

import EmptyWhenFilter from '../../../components/View/EmptyWhenFilter';
import LoadingAnimation from '../../../components/View/LoadingAnimation';
import Message from '../../../components/View/Message';

import styles from './styles.scss';

const DefaultEmptyComponent = () => {
    const classNames = [
        'empty',
        styles.empty,
    ];

    return (
        <div className={classNames.join(' ')}>
            <Message>
                Nothing to show.
            </Message>
        </div>
    );
};

type ListViewProps<D, P, K, GP, GK> = ListProps<D, P, K, GP, GK> & {
    id?: string;
    className?: string;

    filtered: boolean;
    pending: boolean;
    emptyComponent: React.ComponentType<unknown>;
};

const defaultProps = {
    data: [],
    emptyComponent: DefaultEmptyComponent,
    pending: false,
    filtered: false,
};

// eslint-disable-next-line react/prefer-stateless-function, max-len
export default class ListView<
    D, P, K extends string | number, GP, GK extends string | number
> extends React.Component<ListViewProps<D, P, K, GP, GK>> {
    public static defaultProps = defaultProps;

    public render() {
        const {
            id,
            className: classNameFromProps,

            emptyComponent: EmptyComponent,
            filtered,
            pending,

            ...otherProps
        } = this.props;

        let content = null;

        const isEmpty = otherProps.data.length <= 0;

        const className = _cs(
            classNameFromProps,
            styles.listView,
            'list-view',
            pending && styles.pending,
            isEmpty && 'list-view-empty',
            isEmpty && styles.listViewEmpty,
        );

        if (isEmpty) {
            if (filtered) {
                content = !pending
                    ? <EmptyWhenFilter className={styles.empty} />
                    : null;
            } else {
                content = EmptyComponent && !pending
                    ? <EmptyComponent />
                    : null;
            }
        } else {
            content = (
                <List
                    {...otherProps}
                />
            );
        }

        return (
            <div
                id={id}
                className={className}
            >
                { pending && <LoadingAnimation /> }
                {content}
            </div>
        );
    }
}
