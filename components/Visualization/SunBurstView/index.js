import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';
import { range } from 'd3-array';

import SunBurst from '../SunBurst';
import ColorPallete from '../ColorPallete';
import FullScreen from '../FullScreen';

import SelectInput from '../../Input/SelectInput';
import AccentButton from '../../Action/Button/AccentButton';
import DangerButton from '../../Action/Button/DangerButton';
import LoadingAnimation from '../../View/LoadingAnimation';

import iconNames from '../../../constants/iconNames';
import { categoricalColorNames, getCategoryColorScheme } from '../../../utils/ColorScheme';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    loading: PropTypes.bool,
    headerText: PropTypes.string,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    vizContainerClass: PropTypes.string,
};

const defaultProps = {
    className: '',
    headerText: '',
    loading: false,
    colorScheme: undefined,
    vizContainerClass: '',
};

export default class SunBurstView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            colorScheme: undefined,
            fullScreen: false,
            effectiveColorScheme: undefined,
            selectedColorScheme: undefined,
            selectedNoOfCategories: undefined,
        };

        this.categories = [];
        this.colors = categoricalColorNames()
            .map(color => (
                {
                    title: color,
                    id: name,
                    image: <ColorPallete colorScheme={getCategoryColorScheme(color)} />,
                }));
    }

    componentWillReceiveProps(newProps) {
        if (newProps.colorScheme !== this.props.colorScheme) {
            this.setState({
                colorScheme: newProps.colorScheme,
                effectiveColorScheme: newProps.colorScheme,
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
        const colors = getCategoryColorScheme(data);
        this.categories = range(1, colors.length + 1)
            .map(item => ({ title: item, key: item }));

        this.setState({
            selectedColorScheme: data,
            colorScheme: colors,
            effectiveColorScheme: colors,
        });
    }

    handleNoOfCategories = (data) => {
        this.setState({
            selectedNoOfCategories: data,
            effectiveColorScheme: this.state.colorScheme.slice(0, data),
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
            colorScheme: capturedColorScheme, // eslint-disable-line no-unused-vars
            headerText,
            loading,
            vizContainerClass,
            ...otherProps
        } = this.props;

        const {
            fullScreen,
            selectedColorScheme,
            effectiveColorScheme,
            selectedNoOfCategories,
        } = this.state;

        const {
            handleSelection,
            handleNoOfCategories,
            handleSave,
            handleReset,
            setFullScreen,
            removeFullScreen,
            colors,
            categories,
        } = this;

        return (
            <div className={`${styles.sunburstView} ${className}`}>
                { loading && <LoadingAnimation /> }
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
                            options={colors}
                            showHintAndError={false}
                            className={styles['select-input']}
                            value={selectedColorScheme}
                        />
                        <SelectInput
                            clearable={false}
                            keySelector={d => d.key}
                            labelSelector={d => d.title}
                            onChange={handleNoOfCategories}
                            options={categories}
                            placeholder="No of Data Classes"
                            showHintAndError={false}
                            className={styles['select-input']}
                            value={selectedNoOfCategories}
                        />
                        <AccentButton
                            onClick={handleSave}
                            iconName={iconNames.download}
                            transparent
                        />
                        <AccentButton
                            onClick={setFullScreen}
                            iconName={iconNames.expand}
                            transparent
                        />
                        <AccentButton
                            onClick={handleReset}
                            iconName={iconNames.refresh}
                            transparent
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
                            <SunBurst
                                className={styles.sunburst}
                                ref={(instance) => { this.chart = instance; }}
                                {...otherProps}
                                colorScheme={effectiveColorScheme}
                            />
                        </FullScreen>
                    ) : (
                        <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                            <SunBurst
                                className={styles.sunburst}
                                ref={(instance) => { this.chart = instance; }}
                                {...otherProps}
                                colorScheme={effectiveColorScheme}
                            />
                        </div>
                    )
                }
            </div>
        );
    }
}
