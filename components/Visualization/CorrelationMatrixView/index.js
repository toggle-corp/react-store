import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { interpolateGnBu, interpolateRdBu } from 'd3-scale-chromatic';
import {
    divergingColorNames,
    sequentialColorNames,
    getDivergingColorScheme,
    getSequentialColorScheme,
} from '../../../utils/ColorScheme';
import CorrelationMatrix from '../CorrelationMatrix';

import Modal from '../../View/Modal';
import SelectInput from '../../Input/SelectInput';
import AccentButton from '../../Action/Button/AccentButton';
import DangerButton from '../../Action/Button/DangerButton';
import iconNames from '../../../constants/iconNames';
import styles from './styles.scss';

const propTypes = {
    data: PropTypes.shape({
        labels: PropTypes.arrayOf(PropTypes.string),
        values: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }).isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    colorScheme: [],
};

export default class CorrelationMatrixView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            colorScheme: [].concat(...this.props.data.values)
                .some(v => v < 0) ?
                interpolateRdBu : interpolateGnBu,
            selectedColorScheme: undefined,
            fullScreen: false,
        };

        this.colors = sequentialColorNames()
            .concat(divergingColorNames())
            .map(color => ({
                id: color,
                title: color,
            }));
    }


    setFullScreen = () => {
        this.setState({
            fullScreen: true,
        });
    }

    removeFullScreen = () => {
        this.setState({
            fullScreen: false,
        });
    }


    handleSelection = (data) => {
        const colors = getSequentialColorScheme(data) || getDivergingColorScheme(data);
        this.setState({
            colorScheme: colors,
            selectedColorScheme: data,
        });
    }

    handleSave = () => {
        this.chart.wrappedComponent.save();
    }

    render() {
        const {
            className,
            colorScheme: capturedColorScheme, // eslint-disable-line no-unused-vars
            ...otherProps
        } = this.props;

        const { fullScreen, colorScheme } = this.state;

        return (
            <div className={`${styles['correlation-matrix-view']} ${className}`}>
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
                            value={this.state.selectedColorScheme}
                        />
                    </div>
                    <div className={styles['action-buttons']}>
                        <AccentButton
                            onClick={this.handleSave}
                            iconName={iconNames.download}
                            transparent
                        />
                        <AccentButton
                            transparent
                            iconName={iconNames.expand}
                            onClick={this.setFullScreen}
                        />
                    </div>
                </div>
                {
                    fullScreen ? (
                        <Modal
                            className={styles.modal}
                        >
                            <DangerButton
                                className={styles.close}
                                onClick={this.removeFullScreen}
                                iconName={iconNames.close}
                                transparent
                            />
                            <CorrelationMatrix
                                className={styles['correlation-matrix']}
                                ref={(instance) => { this.chart = instance; }}
                                colorScheme={colorScheme}
                                {...otherProps}
                            />
                        </Modal>
                    ) : (
                        <CorrelationMatrix
                            className={styles['correlation-matrix']}
                            ref={(instance) => { this.chart = instance; }}
                            colorScheme={colorScheme}
                            {...otherProps}
                        />
                    )
                }
            </div>
        );
    }
}
