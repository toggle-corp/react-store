import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { OptionKey } from '../../types';

import EmptyWhenFilter from '../../../components/View/EmptyWhenFilter';
import LoadingAnimation from '../../../components/View/LoadingAnimation';

import Message from '../Message';
import List, { ListProps } from '../List';

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

type ListViewProps<D, P, K extends OptionKey, GP, GK extends OptionKey> = {
    className?: string;
    emptyComponent: React.ComponentType<unknown>;
    filtered: boolean;
    id?: string;
    pending: boolean;
} & ListProps<D, P, K, GP, GK>;

const defaultProps = {
    data: [],
    emptyComponent: DefaultEmptyComponent,
    filtered: false,
    pending: false,
};

// eslint-disable-next-line react/prefer-stateless-function
export default class ListView<
    D, P, K extends OptionKey, GP, GK extends OptionKey
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

        const className = _cs(
            classNameFromProps,
            styles.listView,
            'list-view',
            pending && styles.pending,
            isEmpty && 'list-view-empty',
            isEmpty && styles.listViewEmpty,
        );

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
