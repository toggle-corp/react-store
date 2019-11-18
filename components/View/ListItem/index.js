import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.string.isRequired,
    marker: PropTypes.string,
};

const defaultProps = {
    className: undefined,
    marker: '•',
};

export default class ListItem extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            value,
            marker,
            className: classNameFromProps,
        } = this.props;

        return (
            <div className={_cs(classNameFromProps, styles.listItem)}>
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
