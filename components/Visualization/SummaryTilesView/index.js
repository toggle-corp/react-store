import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import {
    divergingColorNames,
    sequentialColorNames,
} from '../../../utils/ColorScheme';
import SummaryTiles from '../SummaryTiles';

import { SelectInput } from '../../Input';
import { PrimaryButton } from '../../Action';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles)
export default class SummaryTilesView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            colorScheme: undefined,
        };
        this.colors = divergingColorNames()
            .concat(sequentialColorNames())
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

    handleSelection = (color) => {
        this.setState({
            colorScheme: color,
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
                styleName="summary-tiles-view"
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
                            value={this.state.colorScheme}
                        />
                    </div>
                    <div styleName="action-buttons">
                        <PrimaryButton onClick={this.handleSave}>
                            Save
                        </PrimaryButton>
                    </div>
                </div>
                <SummaryTiles
                    styleName="summary-tiles"
                    ref={(element) => { this.chart = element; }}
                    {...otherProps}
                    colorScheme={this.state.colorScheme}
                />
            </div>
        );
    }
}
