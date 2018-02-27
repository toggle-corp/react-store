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
            <div className={`${styles['horizontal-bar-view']} ${className}`}>
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
                            value={this.state.selectedBarColor}
                        />
                    </div>
                    <div className={styles['action-buttons']}>
                        <PrimaryButton onClick={this.handleSave}>
                            Save
                        </PrimaryButton>
                    </div>
                </div>
                <HorizontalBar
                    className={styles['horizontal-bar']}
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    barColor={this.state.barColor}
                />
            </div>
        );
    }
}
