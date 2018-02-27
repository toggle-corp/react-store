import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import { categoricalColorNames, getCategoryColorScheme } from '../../../utils/ColorScheme';
import ChordDiagram from '../ChordDiagram';

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
export default class ChorDiagramView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            colorScheme: undefined,
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

    handleReset = () => {
        this.chart.wrappedComponent.renderChart();
    }
    render() {
        const {
            className,
            ...otherProps
        } = this.props;
        return (
            <div className={`${styles['chord-diagram-view']} ${className}`}>
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
                            value={this.state.colorScheme}
                        />
                    </div>
                    <div className={styles['action-buttons']}>
                        <PrimaryButton onClick={this.handleSave}>
                            Save
                        </PrimaryButton>
                    </div>
                </div>
                <ChordDiagram
                    className={styles['chord-diagram']}
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                    colorScheme={this.state.colorScheme}
                />
            </div>
        );
    }
}
