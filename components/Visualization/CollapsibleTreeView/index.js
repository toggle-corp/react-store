import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import CollapsibleTree from '../CollapsibleTree';
import FullScreen from '../FullScreen';
import ColorPallete from '../ColorPallete';

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
    loading: false,
    headerText: '',
    colorScheme: undefined,
    vizContainerClass: '',
};

export default class CollapsibleTreeView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            colorScheme: undefined,
            fullScreen: false,
        };
        this.selectedColorScheme = undefined;
        this.colors = categoricalColorNames()
            .map(color => ({
                id: color,
                title: color,
                image: <ColorPallete colorScheme={getCategoryColorScheme(color)} />,
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
        const colors = getCategoryColorScheme(data);
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
            headerText,
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
            <div className={`${styles.collapsibleTreeView} ${className}`}>
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
                            className={styles.selectInput}
                            value={selectedColorScheme}
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
                            <CollapsibleTree
                                className={styles.collapsibleTree}
                                ref={(instance) => { this.chart = instance; }}
                                {...otherProps}
                                colorScheme={colorScheme}
                            />
                        </FullScreen>
                    ) : (
                        <div className={`${styles.vizContainer} ${vizContainerClass}`} >
                            <CollapsibleTree
                                className={styles.collapsibleTree}
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
