import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import { Button, Dropdown } from 'semantic-ui-react';
import { sequentialColorNames, getSequentialColorScheme } from '../../ColorScheme';
import CorrelationMatrix from '../CorrelationMatrix';
import styles from './styles.scss';

const propTypes = {
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
        this.state = { colorScheme: undefined };
        this.colors = sequentialColorNames()
            .map(name => ({ text: name, value: name }));
    }

    componentWillReceiveProps(newProps) {
        this.setState({ colorScheme: newProps.colorScheme });
    }

    handleSelection = (e, data) => {
        const colors = getSequentialColorScheme(data.value);
        this.setState({
            colorScheme: colors,
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
                styleName="correlationmatrix-view"
                className={className}
            >
                <div styleName="buttons">
                    <Button primary onClick={this.handleSave}>
                        Save
                    </Button>
                    <Dropdown
                        options={this.colors}
                        openOnFocus
                        selection
                        placeholder="ColorScheme"
                        onChange={this.handleSelection}
                    />
                </div>
                <CorrelationMatrix
                    styleName="correlationmatrix"
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    colorScheme={this.state.colorScheme}
                />
            </div>
        );
    }
}
