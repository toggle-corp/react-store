import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import { Button, Dropdown } from 'semantic-ui-react';
import { range } from 'd3-array';
import { categoricalColorNames, getCategoryColorScheme } from '../../ColorScheme';
import SunBurst from '../SunBurst';
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
        };
        this.categories = [];
        this.colors = categoricalColorNames()
            .map(name => ({ text: name, value: name }));
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            colorScheme: newProps.colorScheme,
            effectiveColorScheme: newProps.colorScheme,
        });
    }

    handleSelection = (e, data) => {
        const colors = getCategoryColorScheme(data.value);
        this.categories = range(1, colors.length + 1)
            .map(item => ({ text: item, value: item }));
        this.setState({
            colorScheme: colors,
            effectiveColorScheme: colors,
        });
    }

    handleNoOfCategories = (e, data) => {
        this.setState({
            effectiveColorScheme: this.state.colorScheme.slice(0, data.value),
        });
    }

    handleSave = () => {
        this.chart.wrappedComponent.save();
    }

    handleReset = () => {
        this.render();
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
                <div styleName="buttons">
                    <Button primary onClick={this.handleSave}>
                        Save
                    </Button>
                    <Button primary onClick={this.handleReset}>
                        Reset
                    </Button>
                    <Dropdown
                        options={this.colors}
                        openOnFocus
                        selection
                        placeholder="ColorScheme"
                        onChange={this.handleSelection}
                    />
                    <Dropdown
                        options={this.categories}
                        openOnFocus
                        selection
                        placeholder="No of Data Classes"
                        onChange={this.handleNoOfCategories}
                    />
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
