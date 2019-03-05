import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { _cs } from '@togglecorp/fujs';

import Tooltip from '../../../View/Tooltip';
import Numeral from '../../../View/Numeral';

import styles from './styles.scss';

const propTypes = {
    value: PropTypes.number.isRequired,
    hideLabel: PropTypes.bool.isRequired,
    label: PropTypes.string,
    style: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    enlargeOnHover: PropTypes.bool.isRequired,
};

const defaultProps = {
    label: '',
};

export default class Segment extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            value,
            label,
            style,
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

        const tooltip = (
            <div className={styles.tooltip} >
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
        );

        return (
            <Tooltip tooltip={tooltip} >
                <div
                    className={classNames}
                    style={style}
                >
                    {!hideLabel &&
                        <div className={styles.value}>
                            {value}
                        </div>
                    }
                </div>
            </Tooltip>
        );
    }
}
