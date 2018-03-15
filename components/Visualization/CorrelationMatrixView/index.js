import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { interpolateGnBu, interpolateRdBu } from 'd3-scale-chromatic';

import CorrelationMatrix from '../CorrelationMatrix';
import FullScreen from '../FullScreen';
import ColorPallete from '../ColorPallete';

import SelectInput from '../../Input/SelectInput';
import AccentButton from '../../Action/Button/AccentButton';
import DangerButton from '../../Action/Button/DangerButton';
import LoadingAnimation from '../../View/LoadingAnimation';

import iconNames from '../../../constants/iconNames';
import {
    divergingColorNames,
    sequentialColorNames,
    getDivergingColorScheme,
    getSequentialColorScheme,
    getCategoryForContinuousColorScheme,
} from '../../../utils/ColorScheme';

import styles from './styles.scss';

const propTypes = {
    data: PropTypes.shape({
        labels: PropTypes.arrayOf(PropTypes.string),
        values: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }).isRequired,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    loading: PropTypes.bool,
    vizContainerClass: PropTypes.string,
};

const defaultProps = {
    className: '',
    colorScheme: undefined,
    loading: false,
    vizContainerClass: '',
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
            fullScreen: false,
        };

        this.selectedColorScheme = undefined;
        this.colors = sequentialColorNames()
            .concat(divergingColorNames())
            .map(color => ({
                id: color,
                title: color,
                image: <ColorPallete colorScheme={getCategoryForContinuousColorScheme(color)} />,
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
        this.selectedColorScheme = data;
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
            loading,
            colorScheme: capturedColorScheme, // eslint-disable-line no-unused-vars
            vizContainerClass,
            ...otherProps
        } = this.props;

        const {
            fullScreen,
            colorScheme,
        } = this.state;

        const {
            handleSelection,
            handleSave,
            setFullScreen,
            removeFullScreen,
            colors,
            selectedColorScheme,
        } = this;

        return (
            <div className={`${styles['correlation-matrix-view']} ${className}`}>
                { loading && <LoadingAnimation /> }
                <div className={styles.action}>
                    <div className={styles['action-selects']}>
                        <SelectInput
                            clearable={false}
                            keySelector={d => d.title}
                            labelSelector={d => d.title}
                            optionLabelSelector={d => d.image}
                            onChange={handleSelection}
                            options={colors}
                            showHintAndError={false}
                            className={styles['select-input']}
                            value={selectedColorScheme}
                        />
                    </div>
                    <div className={styles['action-buttons']}>
                        <AccentButton
                            onClick={handleSave}
                            iconName={iconNames.download}
                            transparent
                        />
                        <AccentButton
                            transparent
                            iconName={iconNames.expand}
                            onClick={setFullScreen}
                        />
                    </div>
                </div>
                {
                    fullScreen ? (
                        <FullScreen>
                            <DangerButton
                                className={styles.close}
                                onClick={removeFullScreen}
                                iconName={iconNames.close}
                                transparent
                            />
                            <CorrelationMatrix
                                className={styles['correlation-matrix']}
                                ref={(instance) => { this.chart = instance; }}
                                colorScheme={colorScheme}
                                {...otherProps}
                            />
                        </FullScreen>
                    ) : (
                        <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                            <CorrelationMatrix
                                className={styles['correlation-matrix']}
                                ref={(instance) => { this.chart = instance; }}
                                colorScheme={colorScheme}
                                {...otherProps}
                            />
                        </div>
                    )
                }
            </div>
        );
    }
}
