import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import { Button, Dropdown } from 'semantic-ui-react';
import { singleColors } from '../../ColorScheme';
import HorizontalBar from '../HorizontalBar';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class HorizontalBarView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = { barColor: undefined };
        this.colors = singleColors
            .map(name => ({ text: name, value: name }));
    }

    componentWillReceiveProps(newProps) {
        this.setState({ barColor: newProps.barColor });
    }

    handleSelection = (e, data) => {
        this.setState({
            barColor: data.value,
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
            <div
                styleName="horizontalbar-view"
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
                <HorizontalBar
                    styleName="horizontalbar"
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    barColor={this.state.barColor}
                />
            </div>
        );
    }
}
