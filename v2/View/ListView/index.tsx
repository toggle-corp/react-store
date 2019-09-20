import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { OptionKey } from '../../types';

import DefaultEmptyWhenFilterComponent from '../../../components/View/EmptyWhenFilter';
import LoadingAnimation from '../../../components/View/LoadingAnimation';

import List, { ListProps } from '../List';
import DefaultEmptyComponent from './EmptyComponent';

import styles from './styles.scss';

type ListViewProps<D, P, K extends OptionKey, GP, GK extends OptionKey> = {
    className?: string;
    emptyComponent: any;
    emptyWhenFilterComponent: any;
    filtered: boolean;
    id?: string;
    pending: boolean;
} & ListProps<D, P, K, GP, GK>;

function ListView<
    D,
    P,
    K extends OptionKey, GP, GK extends OptionKey,
>(props: ListViewProps<D, P, K, GP, GK>) {
    const {
        id,
        className: classNameFromProps,

        emptyComponent: EmptyComponent,
        emptyWhenFilterComponent: EmptyWhenFilterComponent,
        filtered,
        pending,

        ...otherProps
    } = props;

    let content = null;

    const isEmpty = otherProps.data.length <= 0;

    if (isEmpty) {
        if (filtered) {
            content = !pending
                ? <EmptyWhenFilterComponent className={styles.empty} />
                : null;
        } else {
            content = EmptyComponent && !pending
                ? <EmptyComponent className={styles.empty} />
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

ListView.defaultProps = {
    data: [],
    emptyComponent: DefaultEmptyComponent,
    emptyWhenFilterComponent: DefaultEmptyWhenFilterComponent,
    filtered: false,
    pending: false,
};

export default ListView;
