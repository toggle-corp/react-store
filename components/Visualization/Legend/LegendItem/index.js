import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    radius: 5,
    maxRadius: 5,
};

export default class LegendItem extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            symbolClassName,
            icon,
            label,
            color,
            radius,
            maxRadius,
        } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.legendItem}
        `;

        return (
            <div className={className}>
                { icon ? (
                    <div
                        className={styles.icon}
                        style={{
                            color,
                        }}
                    >
                        { icon }
                    </div>
                ) : (
                    <div
                        className={`${styles.color} ${symbolClassName}`}
                        style={{
                            backgroundColor: color,
                            width: `${2 * radius}px`,
                            height: `${2 * radius}px`,
                            margin: `${maxRadius - radius}px`,
                        }}
                    />
                )}
                <div className={styles.label}>
                    { label }
                </div>
            </div>
        );
    }
}
