import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
    color: string;
    value: string;
}

function ListItem(props: Props) {
    const {
        value,
        className: classNameFromProps,
        color,
    } = props;

    const className = _cs(
        classNameFromProps,
        styles.listItem,
    );

    const style = {
        backgroundColor: color,
    };

    return (
        <div className={className}>
            <div
                style={style}
                className={styles.marker}
            />
            <div className={styles.label}>
                { value }
            </div>
        </div>
    );
}
ListItem.defaultProps = {
    color: '#dddddd',
};

export default ListItem;
