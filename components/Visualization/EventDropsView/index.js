import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import { categoricalColorNames, getCategoryColorScheme } from '../../../utils/ColorScheme';
import EventDrops from '../EventDrops';
import SelectInput from '../../Input/SelectInput';
import PrimaryButton from '../../Action/Button/PrimaryButton';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class EventDropsView extends PureComponent {
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
        });
    }

    handleSelection = (data) => {
        const colors = getCategoryColorScheme(data);

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
                styleName="event-drops-view"
                className={className}
            >
                <div styleName="action">
                    <div styleName="action-selects">
                        <SelectInput
                            clearable={false}
                            keySelector={d => d.title}
                            labelSelector={d => d.title}
                            onChange={this.handleSelection}
                            options={this.colors}
                            showHintAndError={false}
                            styleName="select-input"
                            value={this.state.selectedColorScheme}
                        />
                    </div>
                    <div styleName="action-buttons">
                        <PrimaryButton onClick={this.handleSave}>
                            Save
                        </PrimaryButton>
                    </div>
                </div>
                <EventDrops
                    styleName="event-drops"
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    colorScheme={this.state.colorScheme}
                />
            </div>
        );
    }
}
