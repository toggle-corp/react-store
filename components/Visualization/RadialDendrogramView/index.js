import React, { PureComponent } from 'react';
import { PropTypes } from 'prop-types';

import RadialDendrogram from '../RadialDendrogram';
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

export default class RadialDendrogramView extends PureComponent {
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
            loading,
            colorScheme: capturedColorScheme, // eslint-disable-line no-unused-vars
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
            <div className={`${styles['radial-dendrogram-view']} ${className}`}>
                { loading && <LoadingAnimation /> }
                <div className={styles.action}>
                    <div className={styles['action-selects']}>
                        <SelectInput
                            clearable={false}
                            keySelector={d => d.title}
                            labelSelector={d => d.title}
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
                            <RadialDendrogram
                                className={styles['radial-dendrogram']}
                                ref={(instance) => { this.chart = instance; }}
                                {...otherProps}
                                colorScheme={colorScheme}
                            />
                        </FullScreen>
                    ) : (
                        <RadialDendrogram
                            className={styles['radial-dendrogram']}
                            ref={(instance) => { this.chart = instance; }}
                            {...otherProps}
                            colorScheme={colorScheme}
                        />
                    )
                }
            </div>
        );
    }
}
