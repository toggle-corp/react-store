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
    colorScheme: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
    className: '',
    loading: false,
    colorScheme: undefined,
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
            loading,
            colorScheme: capturedColorScheme, // eslint-disable-line no-unused-vars
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
            <div className={`${styles['sunburst-view']} ${className}`}>
                { loading && <LoadingAnimation /> }
                <div className={styles.action}>
                    <div className={styles['action-selects']}>
                        <SelectInput
                            clearable={false}
                            keySelector={d => d.title}
                            labelSelector={d => d.image}
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
                    </div>
                    <div className={styles['action-buttons']}>
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
                        <SunBurst
                            className={styles.sunburst}
                            ref={(instance) => { this.chart = instance; }}
                            {...otherProps}
                            colorScheme={effectiveColorScheme}
                        />
                    )
                }
            </div>
        );
    }
}
