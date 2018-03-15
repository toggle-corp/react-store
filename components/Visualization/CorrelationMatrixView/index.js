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
    headerText: PropTypes.string,
    vizContainerClass: PropTypes.string,
};

const defaultProps = {
    className: '',
    colorScheme: undefined,
    loading: false,
    headerText: '',
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

    renderHeader = ({ fullScreen }) => {
        const {
            colorScheme: capturedColorScheme, // eslint-disable-line no-unused-vars
            headerText,
        } = this.props;

        const {
            handleSelection,
            handleSave,
            setFullScreen,
            removeFullScreen,
            colors,
            selectedColorScheme,
        } = this;

        return (
            <div className={styles.header}>
                <div className={styles.leftContent}>
                    <span className={styles.heading}>
                        {headerText}
                    </span>
                </div>
                <div className={styles.rightContent}>
                    <SelectInput
                        clearable={false}
                        keySelector={d => d.title}
                        labelSelector={d => d.title}
                        optionLabelSelector={d => d.image}
                        optionsClassName={styles.selectInputOptions}
                        onChange={handleSelection}
                        options={colors}
                        showHintAndError={false}
                        className={styles.selectInput}
                        value={selectedColorScheme}
                    />
                    <AccentButton
                        onClick={handleSave}
                        iconName={iconNames.download}
                        transparent
                    />
                    { !fullScreen &&
                        <AccentButton
                            onClick={setFullScreen}
                            iconName={iconNames.expand}
                            transparent
                        />
                    }
                    { fullScreen &&
                        <DangerButton
                            onClick={removeFullScreen}
                            iconName={iconNames.close}
                            transparent
                        />
                    }
                </div>
            </div>
        );
    }

    render() {
        const {
            className,
            loading,
            colorScheme: capturedColorScheme, // eslint-disable-line no-unused-vars
            headerText, // eslint-disable-line no-unused-vars
            vizContainerClass,
            ...otherProps
        } = this.props;

        const {
            fullScreen,
            colorScheme,
        } = this.state;

        const Header = this.renderHeader;

        return (
            <div className={`${styles.correlationMatrixView} ${className}`}>
                { loading && <LoadingAnimation /> }
                <Header fullScreen={false} />
                {
                    fullScreen ? (
                        <FullScreen className={styles.fullScreenContainer}>
                            <Header fullScreen />
                            <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                                <CorrelationMatrix
                                    className={styles.correlationMatrix}
                                    ref={(instance) => { this.chart = instance; }}
                                    colorScheme={colorScheme}
                                    {...otherProps}
                                />
                            </div>
                        </FullScreen>
                    ) : (
                        <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                            <CorrelationMatrix
                                className={styles.correlationMatrix}
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
