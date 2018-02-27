import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { categoricalColorNames, getCategoryColorScheme } from '../../../utils/ColorScheme';
import TreeMap from '../TreeMap';

import SelectInput from '../../Input/SelectInput';
import PrimaryButton from '../../Action/Button/PrimaryButton';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    className: '',
    colorScheme: undefined,
};

export default class TreeMapView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            colorScheme: undefined,
            selectedColorScheme: undefined,
        };
        this.colors = categoricalColorNames()
            .map(color => ({
                id: color,
                title: color,
            }));
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            colorScheme: newProps.colorScheme,
            selectedColorScheme: newProps.colorScheme,
        });
    }

    handleSelection = (data) => {
        const colors = getCategoryColorScheme(data);
        this.setState({
            colorScheme: colors,
            selectedColorScheme: data,
        });
    }

    handleSave = () => {
        this.chart.wrappedComponent.save();
    }

    handleReset = () => {
        this.chart.wrappedComponent.renderChart();
    }
    render() {
        const {
            className,
            ...otherProps
        } = this.props;
        return (
            <div className={`${styles['treemap-view']} ${className}`}>
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
                        <PrimaryButton onClick={this.handleReset}>
                            Reset
                        </PrimaryButton>
                    </div>
                </div>
                <TreeMap
                    className={styles.treemap}
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    colorScheme={this.state.colorScheme}
                />
            </div>
        );
    }
}
