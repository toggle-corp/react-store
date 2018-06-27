import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import OrgChart from '../OrgChart';
import ColorPalette from '../ColorPalette';
import FullScreen from '../FullScreen';

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
    fillColor: PropTypes.string,
    selectColor: PropTypes.string,
    vizContainerClass: PropTypes.string,
};

const defaultProps = {
    className: '',
    loading: false,
    headerText: '',
    fillColor: undefined,
    selectColor: undefined,
    vizContainerClass: '',
};

export default class OrgChartView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            fullScreen: undefined,
            selectColor: undefined,
            fillColor: undefined,
            selectedItems: [],
        };

        this.colors = singleColors.map(color => ({
            id: color,
            title: color,
            image: <ColorPalette colorScheme={[color]} />,
        }));
    }

    componentWillReceiveProps(newProps) {
        if (newProps.selectColor !== this.props.selectColor) {
            this.setState({
                selectColor: newProps.selectColor,
            });
        }
        if (newProps.fillColor !== this.props.fillColor) {
            this.setState({
                fillColor: newProps.fillColor,
            });
        }
    }

    setFullScreen = () => {
        this.setState({
            fullScreen: true,
        });
    }

    setFillColor = (data) => {
        this.setState({
            fillColor: data,
        });
    }

    setSelectColor = (data) => {
        this.setState({
            selectColor: data,
        });
    }

    removeFullScreen = () => {
        this.setState({
            fullScreen: false,
        });
    }

    handleSelection = (items) => {
        this.setState({
            selectedItems: items,
        });
    }

    handleSave = () => {
        this.chart.wrappedComponent.save();
    }

    renderHeader = ({ fullScreen }) => {
        const {
            selectColor: capturedselectColor, // eslint-disable-line no-unused-vars
            fillColor: capturedfillColor, // eslint-disable-line no-unused-vars
            headerText,
        } = this.props;

        const {
            selectColor,
            fillColor,
        } = this.state;

        const {
            handleSave,
            setFullScreen,
            removeFullScreen,
            setFillColor,
            setSelectColor,
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
                        onChange={setFillColor}
                        options={colors}
                        showHintAndError={false}
                        className={styles['select-input']}
                        value={fillColor}
                    />
                    <SelectInput
                        clearlable={false}
                        keySelector={d => d.title}
                        labelSelector={d => d.title}
                        optionLabelSelector={d => d.image}
                        optionsClassName={styles.selectInputOptions}
                        onChange={setSelectColor}
                        options={colors}
                        showHintAndError={false}
                        className={styles['select-input']}
                        value={selectColor}
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
                            title="expand"
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
            selectColor: capturedselectColor, // eslint-disable-line no-unused-vars
            fillColor: capturedfillColor, // eslint-disable-line no-unused-vars
            headerText, // eslint-disable-line no-unused-vars
            vizContainerClass,
            ...otherProps
        } = this.props;

        const {
            fullScreen,
            selectColor,
            fillColor,
            selectedItems,
        } = this.state;

        const Header = this.renderHeader;
        const {
            handleSelection,
        } = this;


        return (
            <div className={`${styles.orgChartView} ${className}`}>
                { loading && <LoadingAnimation /> }
                <Header fullScreen={false} />
                {
                    fullScreen ? (
                        <FullScreen className={styles.fullScreenContainer}>
                            <Header fullScreen />
                            <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                                <OrgChart
                                    className={styles.orgChart}
                                    ref={(instance) => { this.chart = instance; }}
                                    selectColor={selectColor}
                                    fillColor={fillColor}
                                    onSelection={handleSelection}
                                    value={selectedItems}
                                    {...otherProps}
                                />
                            </div>
                        </FullScreen>
                    ) : (
                        <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                            <OrgChart
                                className={styles.orgChart}
                                ref={(instance) => { this.chart = instance; }}
                                selectColor={selectColor}
                                fillColor={fillColor}
                                onSelection={handleSelection}
                                value={selectedItems}
                                {...otherProps}
                            />
                        </div>
                    )
                }
            </div>
        );
    }
}
