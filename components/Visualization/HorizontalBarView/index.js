import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import HorizontalBar from '../HorizontalBar';
import FullScreen from '../FullScreen';
import ColorPallete from '../ColorPallete';

import SelectInput from '../../Input/SelectInput';
import AccentButton from '../../Action/Button/AccentButton';
import DangerButton from '../../Action/Button/DangerButton';
import LoadingAnimation from '../../View/LoadingAnimation';

import iconNames from '../../../constants/iconNames';
import { singleColors } from '../../../utils/ColorScheme';

import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
    loading: PropTypes.bool,
    headerText: PropTypes.string,
    barColor: PropTypes.string,
    vizContainerClass: PropTypes.string,
};


const defaultProps = {
    className: '',
    loading: false,
    headerText: '',
    barColor: undefined,
    vizContainerClass: '',
};

export default class HorizontalBarView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            barColor: undefined,
            fullScreen: undefined,
        };
        this.colors = singleColors.map(color => ({
            id: color,
            title: color,
            image: <ColorPallete colorScheme={[color]} />,
        }));
    }

    componentWillReceiveProps(newProps) {
        if (newProps.barColor !== this.props.barColor) {
            this.setState({
                barColor: newProps.barColor,
            });
        }
    }

    setFullScreen = () => {
        this.setState({
            fullScreen: true,
        });
    }

    setBarColor = (data) => {
        this.setState({
            barColor: data,
        });
    }

    removeFullScreen = () => {
        this.setState({
            fullScreen: false,
        });
    }

    handleSave = () => {
        this.chart.wrappedComponent.save();
    }

    renderHeader = ({ fullScreen }) => {
        const {
            barColor: capturedbarColor, // eslint-disable-line no-unused-vars
            headerText,
        } = this.props;

        const {
            barColor,
        } = this.state;

        const {
            handleSave,
            setFullScreen,
            removeFullScreen,
            setBarColor,
            colors,
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
                        clearlable={false}
                        keySelector={d => d.title}
                        labelSelector={d => d.title}
                        optionLabelSelector={d => d.image}
                        optionsClassName={styles.selectInputOptions}
                        onChange={setBarColor}
                        options={colors}
                        showHintAndError={false}
                        className={styles['select-input']}
                        value={barColor}
                    />
                    <AccentButton
                        onClick={handleSave}
                        iconName={iconNames.download}
                        title="save"
                        transparent
                    />
                    {
                        !fullScreen &&
                        <AccentButton
                            onClick={setFullScreen}
                            iconName={iconNames.expand}
                            title="go fullscreen"
                            transparent
                        />
                    }
                    {
                        fullScreen &&
                        <DangerButton
                            onClick={removeFullScreen}
                            iconName={iconNames.close}
                            title="close"
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
            barColor: capturedbarColor, // eslint-disable-line no-unused-vars
            headerText, // eslint-disable-line no-unused-vars
            vizContainerClass,
            ...otherProps
        } = this.props;

        const {
            fullScreen,
            barColor,
        } = this.state;

        const Header = this.renderHeader;

        return (
            <div className={`${styles.horizontalBarView} ${className}`}>
                { loading && <LoadingAnimation /> }
                <Header fullScreen={false} />
                {
                    fullScreen ? (
                        <FullScreen className={styles.fullScreenContainer}>
                            <Header fullScreen />
                            <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                                <HorizontalBar
                                    className={styles.horizontalBar}
                                    ref={(instance) => { this.chart = instance; }}
                                    {...otherProps}
                                    barColor={barColor}
                                />
                            </div>
                        </FullScreen>
                    ) : (
                        <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                            <HorizontalBar
                                className={styles.horizontalBar}
                                ref={(instance) => { this.chart = instance; }}
                                {...otherProps}
                                barColor={barColor}
                            />
                        </div>
                    )
                }
            </div>
        );
    }
}
