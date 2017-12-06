import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import SunBurst from '../SunBurst';
import { hierarchicalData } from '../../dummy-data';
import styles from './styles.scss';

@CSSModules(styles)
export default class SunBurstView extends PureComponent {
    handleSave = () => {
        this.chart.wrappedComponent.save();
    }

    handleReset = () => {
        this.chart.wrappedComponent.renderChart();
    }
    render() {
        return (
            <div
                styleName="sunburst-view"
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
                    ref={(instance) => { this.chart = instance; }}
                    data={hierarchicalData}
                    valueAccessor={d => d.size}
                    labelAccessor={d => d.name}
                    className="visualization"
                />
            </div>
        );
    }
}
