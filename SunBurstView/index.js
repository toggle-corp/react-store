import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import SunBurst from '../SunBurst';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class SunBurstView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleSave = () => {
        this.chart.wrappedComponent.save();
    }

    handleReset = () => {
        this.chart.wrappedComponent.renderChart();
    }
    render() {
        const {
            className,
            ...otherProps
        } = this.props;

        return (
            <div
                styleName="sunburst-view"
                className={className}
            >
                <div styleName="buttons">
                    <button styleName="button" onClick={this.handleSave}>
                        Save
                    </button>
                    <button styleName="button" onClick={this.handleReset}>
                        Reset
                    </button>
                </div>
                <SunBurst
                    styleName="sunburst"
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                />
            </div>
        );
    }
}
