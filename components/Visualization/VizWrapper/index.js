import React from 'react';
import PropTypes from 'prop-types';

import FullScreen from '../FullScreen';
import ColorPalette from '../ColorPalette';

import SelectInput from '../../Input/SelectInput';
import AccentButton from '../../Action/Button/AccentButton';
import PrimaryButton from '../../Action/Button/PrimaryButton';
import DangerButton from '../../Action/Button/DangerButton';
import LoadingAnimation from '../../View/LoadingAnimation';

import Label from '../../Input/Label';

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
    const WrapperComponent = class extends React.PureComponent {
        static propTypes = propTypes;
        static defaultProps = defaultProps;
        static keySelector = d => d.title;
        static labelSelector = d => d.title;
        static optionLabelSelector = d => d.image;


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
            const {
                colorScheme: oldColorScheme,
                colorSchemeType: oldColorSchemeType,
            } = this.props;

            const {
                colorScheme,
                colorSchemeType,
            } = newProps;

            if (colorScheme !== oldColorScheme) {
                this.setState({
                    colorScheme,
                });
            }
            if (colorSchemeType !== oldColorSchemeType) {
                this.setState({
                    colorSchemeType,
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

        setSaveFunction = (saveFn) => {
            this.save = saveFn;
        }

        handleSave = () => {
            this.save();
        }

        removeFullScreen = () => {
            this.setState({
                fullScreen: false,
            });
        }

        handleSelection = (data) => {
            let colorScheme;
            const { colorSchemeType } = this.state;

            if (colorSchemeType === continuous) {
                colorScheme = getSequentialColorScheme(data) || getDivergingColorScheme(data);
            } else if (colorSchemeType === discrete) {
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

            const {
                colorSchemeName,
                colorSchemeOptions,
            } = this.state;

            // FIXME: use strings
            const colorSchemeLabelText = 'Color scheme';

            return (
                <div className={styles.header}>
                    <h3 className={styles.heading}>
                        {headerText}
                    </h3>
                    <div className={styles.rightContent}>
                        <div className={styles.colorSchemeInputContainer}>
                            <Label
                                show
                                text={colorSchemeLabelText}
                                className={styles.colorSchemeLabel}
                            />
                            <SelectInput
                                clearable={false}
                                keySelector={WrapperComponent.keySelector}
                                labelSelector={WrapperComponent.labelSelector}
                                optionLabelSelector={WrapperComponent.optionLabelSelector}
                                optionsClassName={styles.selectInputOptions}
                                onChange={handleSelection}
                                options={colorSchemeOptions}
                                showHintAndError={false}
                                showLabel={false}
                                className={styles.selectInput}
                                value={colorSchemeName}
                            />
                        </div>
                        <div className={styles.actionButtons} >
                            <PrimaryButton
                                title="Download diagram"
                                onClick={handleSave}
                                iconName="download"
                                transparent
                            />
                            { fullScreen ? (
                                <DangerButton
                                    title="Close fullscreen"
                                    onClick={removeFullScreen}
                                    iconName="close"
                                    transparent
                                />
                            ) : (
                                <AccentButton
                                    title="Show on fullscreen"
                                    onClick={setFullScreen}
                                    iconName="expand"
                                    transparent
                                />
                            )}
                        </div>
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
                    <Header fullScreen={fullScreen} />
                    {
                        fullScreen ? (
                            <FullScreen className={styles.fullScreenContainer}>
                                <Header fullScreen />
                                <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                                    <WrappedComponent
                                        className={styles.diagram}
                                        colorScheme={colorScheme}
                                        setSaveFunction={this.setSaveFunction}
                                        {...otherProps}
                                    />
                                </div>
                            </FullScreen>
                        ) : (
                            <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                                <WrappedComponent
                                    className={styles.diagram}
                                    colorScheme={colorScheme}
                                    setSaveFunction={this.setSaveFunction}
                                    {...otherProps}
                                />
                            </div>
                        )
                    }
                </div>
            );
        }
    };

    return WrapperComponent;
};

export default wrapViz;
