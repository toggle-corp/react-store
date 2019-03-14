import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class LegendItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            label,
            color,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.legendItem}
        `;


        return (
            <div className={className}>
                <div
                    className={styles.color}
                    style={{
                        backgroundColor: color,
                    }}
                />
                <div className={styles.label}>
                    { label }
                </div>
            </div>
        );
    }
}

