import React from 'react';
import PropTypes from 'prop-types';
import { _cs } from '@togglecorp/fujs';

import List from '../../../View/List';
import LegendItem from './LegendItem';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    legendItems: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        color: PropTypes.color,
        innerText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        textColor: PropTypes.string,
        size: PropTypes.number,
        rightComponent: PropTypes.func,
    })),
    type: PropTypes.string,
};

const defaultProps = {
    className: '',
    legendItems: [],
    label: 'Legend',
    type: 'circle',
};

export default class Legend extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static legendItemKeySelector = l => l.label;

    legendItemRendererParams = (key, data) => ({
        label: data.label,
        color: data.color,
        innerText: data.innerText,
        textColor: data.textColor,
        size: data.size,
        rightComponent: data.rightComponent,
        type: this.props.type,
    });

    render() {
        const {
            legendItems,
            className,
            label,
        } = this.props;

        return (
            <div
                className={_cs(
                    styles.legend,
                    className,
                    'legend',
                )}
            >
                {legendItems.length > 0 &&
                    <h5 className={styles.header}>{label}</h5>
                }
                <List
                    data={legendItems}
                    rendererParams={this.legendItemRendererParams}
                    renderer={LegendItem}
                    keySelector={Legend.legendItemKeySelector}
                />
            </div>
        );
    }
}
