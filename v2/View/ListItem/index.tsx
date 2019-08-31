import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
    marker: string;
    value: string;
}

function ListItem(props: Props) {
    const {
        value,
        marker,
        className: classNameFromProps,
    } = props;

    const className = _cs(
        classNameFromProps,
        styles.listItem,
    );

    return (
        <div className={className}>
            <div className={styles.marker}>
                { marker }
            </div>
            <div className={styles.label}>
                { value }
            </div>
        </div>
    );
}
ListItem.defaultProps = {
    marker: '•',
};

export default ListItem;
