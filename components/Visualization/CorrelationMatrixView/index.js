import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import { interpolateGnBu, interpolateRdBu } from 'd3-scale-chromatic';
import {
    divergingColorNames,
    sequentialColorNames,
    getDivergingColorScheme,
    getSequentialColorScheme,
} from '../../../utils/ColorScheme';
import CorrelationMatrix from '../CorrelationMatrix';

import SelectInput from '../../Input/SelectInput';
import PrimaryButton from '../../Action/Button/PrimaryButton';

import styles from './styles.scss';

const propTypes = {
    data: PropTypes.shape({
        labels: PropTypes.arrayOf(PropTypes.string),
        values: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }).isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles)
export default class CorrelationMatrixView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            colorScheme: [].concat(...this.props.data.values)
                .some(v => v < 0) ?
                interpolateRdBu : interpolateGnBu,
            selectedColorScheme: undefined,
        };

        this.colors = sequentialColorNames()
            .concat(divergingColorNames())
            .map(color => ({
                id: color,
                title: color,
            }));
    }

    handleSelection = (data) => {
        const colors = getSequentialColorScheme(data) || getDivergingColorScheme(data);
        this.setState({
            colorScheme: colors,
            selectedColorScheme: data,
        });
    }

    handleSave = () => {
        this.chart.wrappedComponent.save();
    }

    render() {
        const {
            className,
            ...otherProps
        } = this.props;

        return (
            <div className={`${styles['correlation-matrix-view']} ${className}`}>
                <div className={styles.action}>
                    <div className={styles['action-selects']}>
                        <SelectInput
                            clearable={false}
                            keySelector={d => d.title}
                            labelSelector={d => d.title}
                            onChange={this.handleSelection}
                            options={this.colors}
                            showHintAndError={false}
                            className={styles['select-input']}
                            value={this.state.selectedColorScheme}
                        />
                    </div>
                    <div className={styles['action-buttons']}>
                        <PrimaryButton onClick={this.handleSave}>
                            Save
                        </PrimaryButton>
                    </div>
                </div>
                <CorrelationMatrix
                    className={styles['correlation-matrix']}
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    colorScheme={this.state.colorScheme}
                />
            </div>
        );
    }
}
