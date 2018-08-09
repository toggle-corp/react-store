import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.string.isRequired,
    marker: PropTypes.string,
};

const defaultProps = {
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

        const className = `
            ${classNameFromProps}
            ${styles.listItem}
        `;

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
