import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { _cs } from '@togglecorp/fujs';

import Tooltip from '../../../View/Tooltip';
import Numeral from '../../../View/Numeral';

import styles from './styles.scss';

const propTypes = {
    /**
     * if ture, center tooltip
     */
    centerTooltip: PropTypes.bool,
    /**
     * value of the segment
     */
    value: PropTypes.number.isRequired,
    /**
     * if ture, hide the label
     */
    hideLabel: PropTypes.bool.isRequired,
    /**
     * name of the segment
     */
    label: PropTypes.string,
    /**
     * additional styling classes
     */
    style: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    /**
     * if true, increase the size of segment on hover
     */
    enlargeOnHover: PropTypes.bool.isRequired,
};

const defaultProps = {
    label: '',
    centerTooltip: false,
};

/**
 * Represent a segment of HealthBar. Length of segment corresponds to the value of the data
 * element
 */
export default class Segment extends PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    render() {
        const {
            value,
            label,
            style,
            centerTooltip,
            hideLabel,
            enlargeOnHover,
        } = this.props;

        if (value === 0 || value === undefined) {
            return null;
        }
        const classNames = _cs(
            enlargeOnHover && styles.enlarge,
            styles.segment,
            'tc-health-bar-segment',
        );

        return (
            <Tooltip
                tooltip={(
                    <div className={styles.tooltip}>
                        {label === '' ? (
                            value
                        ) : (
                            <div>
                                {`${label}: `}
                                <Numeral
                                    value={value}
                                    precision={0}
                                />
                            </div>
                        )}
                    </div>
                )}
                center={centerTooltip}
            >
                <div
                    className={classNames}
                    style={style}
                >
                    {!hideLabel && (
                        <div className={styles.value}>
                            {value}
                        </div>
                    )}
                </div>
            </Tooltip>
        );
    }
}
