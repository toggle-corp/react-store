import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import { Button, Dropdown } from 'semantic-ui-react';
import { categoricalColorNames, getCategoryColorScheme } from '../../ColorScheme';
import ChordDiagram from '../ChordDiagram';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class ChorDiagramView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { colorScheme: undefined };
        this.colors = categoricalColorNames()
            .map(name => ({ text: name, value: name }));
    }

    componentWillReceiveProps(newProps) {
        this.setState({ colorScheme: newProps.colorScheme });
    }

    handleSelection = (e, data) => {
        const colors = getCategoryColorScheme(data.value);
        this.setState({
            colorScheme: colors,
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
                styleName="chorddiagram-view"
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
                </div>
                <ChordDiagram
                    styleName="chorddiagram"
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    colorScheme={this.state.colorScheme}
                />
            </div>
        );
    }
}
