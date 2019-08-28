import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    value: string;
    marker?: string;
    className?: string;
}

export default class ListItem extends React.PureComponent<Props> {
    static defaultProps = {
        marker: '•',
    };

    render() {
        const {
            value,
            marker,
            className: classNameFromProps,
        } = this.props;

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
}
