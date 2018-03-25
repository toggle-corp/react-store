import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { singleColors } from '../../../utils/ColorScheme';
import HorizontalBar from '../HorizontalBar';

import SelectInput from '../../Input/SelectInput';
import PrimaryButton from '../../Action/Button/PrimaryButton';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class HorizontalBarView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            barColor: undefined,
            selectedBarColor: undefined,
        };
        this.colors = singleColors.map(color => ({
            id: color,
            title: color,
        }));
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            barColor: newProps.barColor,
            selectedBarColor: newProps.barColor,
        });
    }

    handleSelection = (data) => {
        this.setState({
            barColor: data,
            selectedBarColor: data,
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
            <div className={`${styles.horizontalBarView} ${className}`}>
                <div className={styles.action}>
                    <div className={styles.actionSelects}>
                        <SelectInput
                            clearable={false}
                            keySelector={d => d.title}
                            labelSelector={d => d.title}
                            optionsClassName={styles.selectInputOptions}
                            onChange={this.handleSelection}
                            options={this.colors}
                            showHintAndError={false}
                            className={styles.selectInput}
                            value={this.state.selectedBarColor}
                        />
                    </div>
                    <div className={styles.actionButtons}>
                        <PrimaryButton onClick={this.handleSave}>
                            Save
                        </PrimaryButton>
                    </div>
                </div>
                <HorizontalBar
                    className={styles.horizontalBar}
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    barColor={this.state.barColor}
                />
            </div>
        );
    }
}
