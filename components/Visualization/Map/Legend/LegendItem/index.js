import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    color: PropTypes.string,
    label: PropTypes.string,
    innerText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    textColor: PropTypes.string,
    size: PropTypes.number,
    rightComponent: PropTypes.func,
    type: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    textColor: '#000',
    size: 10,
    innerText: '',
    rightComponent: undefined,
    color: 'rgba(0, 0, 0, 0.5)',
    label: '',
};

export default class LegendItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            label,
            color,
            size,
            textColor,
            innerText,
            rightComponent,
            type,
        } = this.props;

        return (
            <div
                className={_cs(
                    styles.legendItem,
                    className,
                    styles[type],
                    'legend-item',
                )}
            >
                <div className={styles.leftChild}>
                    <div className={styles.iconContainer}>
                        <span
                            className={styles.icon}
                            style={{
                                backgroundColor: color,
                                width: size,
                                height: size,
                                color: textColor,
                            }}
                        >
                            {innerText}
                        </span>
                    </div>
                    <p className={_cs(styles.label, 'label')} >
                        {label}
                    </p>
                </div>
                <div>
                    {rightComponent && <rightComponent />}
                </div>
            </div>
        );
    }
}
