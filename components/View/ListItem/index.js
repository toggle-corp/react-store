import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

export default class ListItem extends React.PureComponent {
    static defaultProps = {
        color: '#dddddd',
        className: undefined,
        value: undefined,
    };

    static propTypes = {
        className: PropTypes.string,
        color: PropTypes.string,
        value: PropTypes.node,
    }

    render() {
        const {
            value,
            color,
            className,
        } = this.props;

        const style = {
            backgroundColor: color,
        };

        return (
            <div className={_cs(styles.listItem, className)}>
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
}
