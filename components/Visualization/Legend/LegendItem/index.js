import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    symbolClassName: PropTypes.string,
    label: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.node,
};

const defaultProps = {
    className: '',
    symbolClassName: undefined,
    label: undefined,
    color: undefined,
    icon: undefined,
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
