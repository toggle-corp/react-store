import React from 'react';
import PropTypes from 'prop-types';

import FullScreen from '../FullScreen';
import ColorPalette from '../ColorPalette';

import SelectInput from '../../Input/SelectInput';
import AccentButton from '../../Action/Button/AccentButton';
import DangerButton from '../../Action/Button/DangerButton';
import LoadingAnimation from '../../View/LoadingAnimation';

import iconNames from '../../../constants/iconNames';
import {
    getCategoricalColorNames,
    getDivergingColorNames,
    getSequentialColorNames,
    getCategoricalColorScheme,
    getDivergingColorScheme,
    getSequentialColorScheme,
    getCategoryForContinuousColorScheme,
} from '../../../utils/ColorScheme';

import styles from './styles.scss';

const propTypes = {
    loading: PropTypes.bool,
    headerText: PropTypes.string,
    colorScheme: PropTypes.arrayOf(PropTypes.string),
    colorSchemeType: PropTypes.string,
    className: PropTypes.string,
    vizContainerClass: PropTypes.string,
};

const defaultProps = {
    className: '',
    vizContainerClass: '',
    colorScheme: undefined,
    colorSchemeType: undefined,
    loading: false,
    headerText: '',
};

const continuous = 'continuous';
const discrete = 'discrete';

const wrapViz = (WrappedComponent) => {
    const Component = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;

        constructor(props) {
            super(props);
            this.state = {
                colorScheme: this.props.colorScheme,
                colorSchemeName: undefined,
                fullScreen: false,
                colorSchemeType: this.props.colorSchemeType,
                colorSchemeOptions: this.getColorSchemeValues(this.props.colorSchemeType),
            };
        }

        componentWillReceiveProps(newProps) {
            if (newProps.colorScheme !== this.props.colorScheme) {
                this.setState({
                    colorScheme: newProps.colorScheme,
                });
            }
            if (newProps.colorSchemeType !== this.props.colorSchemeType) {
                this.setState({
                    colorSchemeType: newProps.colorSchemeType,
                    colorSchemeOptions: this.getColorSchemeValues(newProps.colorSchemeType),
                });
            }
        }

        getColorSchemeValues = (type) => {
            const mapContinuous = color => ({
                id: color,
                title: color,
                image: <ColorPalette
                    colorScheme={getCategoryForContinuousColorScheme(color)}
                />,
            });

            const mapDiscrete = color => ({
                id: color,
                title: color,
                image: <ColorPalette
                    colorScheme={getCategoricalColorScheme(color) ||
                        getCategoryForContinuousColorScheme(color)}
                />,
            });

            if (type === continuous) {
                return getDivergingColorNames()
                    .concat(getSequentialColorNames())
                    .map(color => mapContinuous(color));
            } else if (type === discrete) {
                return getCategoricalColorNames()
                    .map(color => mapDiscrete(color));
            }
            return getCategoricalColorNames()
                .concat(getDivergingColorNames(), getSequentialColorNames())
                .map(color => mapDiscrete(color));
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
            let colorScheme;
            if (this.state.colorSchemeType === continuous) {
                colorScheme = getSequentialColorScheme(data) || getDivergingColorScheme(data);
            } else if (this.state.colorSchemeType === discrete) {
                colorScheme = getCategoricalColorScheme(data);
            } else {
                colorScheme = getCategoricalColorScheme(data) ||
                         getCategoryForContinuousColorScheme(data);
            }

            this.setState({
                colorSchemeName: data,
                colorScheme,
            });
        }

        handleSave = () => {
            this.chart.wrappedComponent.save();
        }

        renderHeader = ({ fullScreen }) => {
            const {
                headerText,
                colorScheme: capturedColorScheme, // eslint-disable-line no-unused-vars
            } = this.props;

            const {
                handleSelection,
                handleSave,
                setFullScreen,
                removeFullScreen,
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
                            label="Color scheme"
                            labelSelector={d => d.title}
                            optionLabelSelector={d => d.image}
                            optionsClassName={styles.selectInputOptions}
                            onChange={handleSelection}
                            options={this.state.colorSchemeOptions}
                            showHintAndError={false}
                            className={styles.selectInput}
                            value={this.state.colorSchemeName}
                        />
                        <AccentButton
                            title="Download diagram"
                            onClick={handleSave}
                            iconName={iconNames.download}
                            transparent
                        />
                        { !fullScreen &&
                            <AccentButton
                                title="Show on fullscreen"
                                onClick={setFullScreen}
                                iconName={iconNames.expand}
                                transparent
                            />
                        }
                        { fullScreen &&
                            <DangerButton
                                title="Close fullscreen"
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
                headerText, // eslint-disable-line no-unused-vars
                vizContainerClass,
                colorScheme: capturedColorScheme, // eslint-disable-line no-unused-vars,
                ...otherProps
            } = this.props;

            const {
                fullScreen,
                colorScheme,
            } = this.state;

            const Header = this.renderHeader;

            return (
                <div className={`${styles.diagramView} ${className}`}>
                    { loading && <LoadingAnimation /> }
                    <Header fullScreen={false} />
                    {
                        fullScreen ? (
                            <FullScreen className={styles.fullScreenContainer}>
                                <Header fullScreen />
                                <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                                    <WrappedComponent
                                        className={styles.diagram}
                                        colorScheme={colorScheme}
                                        ref={(instance) => { this.chart = instance; }}
                                        {...otherProps}
                                    />
                                </div>
                            </FullScreen>
                        ) : (
                            <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                                <WrappedComponent
                                    className={styles.diagram}
                                    colorScheme={colorScheme}
                                    ref={(instance) => { this.chart = instance; }}
                                    {...otherProps}
                                />
                            </div>
                        )
                    }
                </div>
            );
        }
    };

    return Component;
};

export default wrapViz;
