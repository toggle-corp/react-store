import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { singleColors } from '../../../utils/ColorScheme';
import OrgChart from '../OrgChart';

import SelectInput from '../../Input/SelectInput';
import PrimaryButton from '../../Action/Button/PrimaryButton';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class OrgChartView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            selectColor: undefined,
            fillColor: undefined,
        };

        this.colors = singleColors.map(color => ({
            id: color,
            title: color,
        }));
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            selectColor: newProps.selectcolor,
            fillColor: newProps.fillColor,
            selectedItems: [],
        });
    }

    fillColor = (data) => {
        this.setState({
            fillColor: data,
        });
    }

    selectColor = (data) => {
        this.setState({
            selectColor: data,
        });
    }

    handleSelection = (items) => {
        this.setState({
            selectedItems: items,
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
            <div className={`${styles.orgchartView} ${className}`}>
                <div className={styles.action}>
                    <div className={styles.actionSelects}>
                        <SelectInput
                            clearlable={false}
                            keySelector={d => d.title}
                            labelSelector={d => d.title}
                            onChange={this.fillColor}
                            options={this.colors}
                            showHintAndError={false}
                            className={styles.selectInput}
                            value={this.state.fillColor}
                        />
                        <SelectInput
                            clearlable={false}
                            keySelector={d => d.title}
                            labelSelector={d => d.title}
                            onChange={this.selectColor}
                            options={this.colors}
                            showHintAndError={false}
                            className={styles.selectInput}
                            value={this.state.selectColor}
                        />
                    </div>
                    <div className={styles.actionButtons}>
                        <PrimaryButton onClick={this.handleSave}>
                            Save
                        </PrimaryButton>
                    </div>
                </div>
                <OrgChart
                    className={styles.orgchart}
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    selectColor={this.state.selectColor}
                    fillColor={this.state.fillColor}
                    onSelection={this.addValues}
                    value={this.state.selectedItems}
                />
            </div>
        );
    }
}

