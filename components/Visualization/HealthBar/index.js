import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { _cs, getColorOnBgColor } from '@togglecorp/fujs';

import ListView from '../../View/List/ListView';
import Segment from './Segment';
import styles from './styles.scss';

const propTypes = {
    /**
     * Additional sscss classes passed from parent
     */
    className: PropTypes.string,
    /**
     * Title of the HealthBar
     */
    title: PropTypes.string,
    /**
     * Array of data points
     */
    data: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    /**
     * Array of colors as hex color codes
     */
    colorScheme: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    /**
     * Select a label for each data element
     */
    labelSelector: PropTypes.func,
    /**
     * if true, hide label name
     */
    hideLabel: PropTypes.bool,
    /**
     * Select a key for each segment/ data element
     */
    keySelector: PropTypes.func,
    /**
     * Select a value for each element
     */
    valueSelector: PropTypes.func,
    /**
     * if true, increase the size of segment on Hover
     */
    enlargeOnHover: PropTypes.bool,
    /**
     * if true, center the tooltip
     */
    centerTooltip: PropTypes.bool,
};

const defaultProps = {
    className: '',
    enlargeOnHover: true,
    title: undefined,
    hideLabel: false,
    centerTooltip: false,
    labelSelector: e => e.label,
    keySelector: e => e.key,
    valueSelector: e => e.value,
    colorScheme: [
        '#41c9a2',
        '#3ec0a1',
        '#39b4a1',
        '#36aba0',
        '#2f98a0',
        '#28859f',
        '#22769e',
        '#1e699e',
    ],
};

/**
 * Represent data points as a bar with each bar consisting of segments
 * and each segment representing a value.
 */
export default class HealthBar extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    rendererParams = (key, segment, i) => {
        const {
            data,
            valueSelector,
            labelSelector,
            colorScheme,
            hideLabel,
            enlargeOnHover,
            centerTooltip,
        } = this.props;

        const value = valueSelector(segment) || 0;
        const totalValue = data.reduce((acc, d) => (acc + (valueSelector(d) || 0)), 0);

        return ({
            key,
            value,
            hideLabel,
            enlargeOnHover,
            centerTooltip,
            label: labelSelector && labelSelector(segment),
            segment,
            style: {
                width: `${(valueSelector(segment) / totalValue) * 100}%`,
                color: getColorOnBgColor(colorScheme[i]),
                backgroundColor: colorScheme[i],
            },
        });
    }

    render() {
        const {
            keySelector,
            className,
            data,
            title,
        } = this.props;

        return (
            <div className={_cs(styles.healthBar, className)}>
                {title && (
                    <div className={_cs(styles.title, 'tc-health-title')}>
                        {title}
                    </div>
                )}
                <ListView
                    data={data}
                    className={styles.segments}
                    keySelector={keySelector}
                    rendererParams={this.rendererParams}
                    renderer={Segment}
                />
            </div>
        );
    }
}
