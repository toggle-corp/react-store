import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import { range } from 'd3-array';
import { categoricalColorNames, getCategoryColorScheme } from '../../../utils/ColorScheme';
import SunBurst from '../SunBurst';
import ColorPallete from '../ColorPallete';

import { SelectInput } from '../../Input';
import { PrimaryButton } from '../../Action';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    className: '',
    colorScheme: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class SunBurstView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            colorScheme: undefined,
            effectiveColorScheme: undefined,
            selectedColorScheme: undefined,
            selectedNoOfCategories: undefined,
        };

        this.categories = [];
        this.colors = categoricalColorNames()
            .map(color => (
                {
                    title: color,
                    id: name,
                    image: <ColorPallete colorScheme={getCategoryColorScheme(color)} />,
                }));
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            colorScheme: newProps.colorScheme,
            effectiveColorScheme: newProps.colorScheme,
        });
    }

    handleSelection = (data) => {
        const colors = getCategoryColorScheme(data);
        this.categories = range(1, colors.length + 1)
            .map(item => ({ title: item, key: item }));

        this.setState({
            selectedColorScheme: data,
            colorScheme: colors,
            effectiveColorScheme: colors,
        });
    }

    handleNoOfCategories = (data) => {
        this.setState({
            selectedNoOfCategories: data,
            effectiveColorScheme: this.state.colorScheme.slice(0, data),
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
            <div
                styleName="sunburst-view"
                className={className}
            >
                <div styleName="action">
                    <div styleName="action-selects">
                        <SelectInput
                            clearable={false}
                            keySelector={d => d.title}
                            labelSelector={d => d.image}
                            onChange={this.handleSelection}
                            options={this.colors}
                            showHintAndError={false}
                            styleName="select-input"
                            value={this.state.selectedColorScheme}
                        />
                        <SelectInput
                            clearable={false}
                            keySelector={d => d.key}
                            labelSelector={d => d.title}
                            onChange={this.handleNoOfCategories}
                            options={this.categories}
                            placeholder="No of Data Classes"
                            showHintAndError={false}
                            styleName="select-input"
                            value={this.state.selectedNoOfCategories}
                        />
                    </div>
                    <div styleName="action-buttons">
                        <PrimaryButton onClick={this.handleSave}>
                            Save
                        </PrimaryButton>
                        <PrimaryButton onClick={this.handleReset}>
                            Reset
                        </PrimaryButton>
                    </div>
                </div>
                <SunBurst
                    styleName="sunburst"
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    colorScheme={this.state.effectiveColorScheme}
                />
            </div>
        );
    }
}
