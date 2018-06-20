import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import TreeMap from '../TreeMap';
import FullScreen from '../FullScreen';
import ColorPalette from '../ColorPalette';

import SelectInput from '../../Input/SelectInput';
import AccentButton from '../../Action/Button/AccentButton';
import DangerButton from '../../Action/Button/DangerButton';
import LoadingAnimation from '../../View/LoadingAnimation';

import iconNames from '../../../constants/iconNames';
import { getCategoricalColorNames, getCategoricalColorScheme } from '../../../utils/ColorScheme';

import styles from './styles.scss';

const propTypes = {
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    headerText: PropTypes.string,
    loading: PropTypes.bool,
    vizContainerClass: PropTypes.string,
};

const defaultProps = {
    colorScheme: undefined,
    className: '',
    headerText: '',
    loading: false,
    vizContainerClass: '',
};

export default class TreeMapView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            colorScheme: undefined,
        };
        this.selectedColorScheme = 'schemepaired';
        this.colors = getCategoricalColorNames()
            .map(color => ({
                id: color,
                title: color,
                image: <ColorPalette colorScheme={getCategoricalColorScheme(color)} />,
            }));
    }

    componentWillReceiveProps(newProps) {
        if (newProps.colorScheme !== this.props.colorScheme) {
            this.setState({
                colorScheme: newProps.colorScheme,
            });
        }
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
        this.selectedColorScheme = data;
        const colors = getCategoricalColorScheme(data);
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

    renderHeader = ({ fullScreen }) => {
        const {
            headerText,
            colorScheme: capturedColorScheme, // eslint-disable-line no-unused-vars
        } = this.props;

        const {
            handleSelection,
            handleSave,
            handleReset,
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
                        onChange={handleSelection}
                        optionsClassName={styles.selectInputOptions}
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
                    <AccentButton
                        onClick={handleReset}
                        iconName={iconNames.refresh}
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
            <div className={`${styles.treemapView} ${className}`}>
                { loading && <LoadingAnimation /> }
                <Header fullScreen={false} />
                {
                    fullScreen ? (
                        <FullScreen className={styles.fullScreenContainer}>
                            <Header fullScreen />
                            <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                                <TreeMap
                                    className={styles.treemap}
                                    ref={(instance) => { this.chart = instance; }}
                                    {...otherProps}
                                    colorScheme={colorScheme}
                                />
                            </div>
                        </FullScreen>
                    ) : (
                        <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                            <TreeMap
                                className={styles.treemap}
                                ref={(instance) => { this.chart = instance; }}
                                {...otherProps}
                                colorScheme={colorScheme}
                            />
                        </div>
                    )
                }
            </div>
        );
    }
}
