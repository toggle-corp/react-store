import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import TreeMap from '../TreeMap';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    zoomable: PropTypes.bool,
};

const defaultProps = {
    className: '',
    zoomable: true,
};

@CSSModules(styles, { allowMultiple: true })
export default class TreeMapView extends PureComponent {
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
                styleName="treemap-view"
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
                <TreeMap
                    styleName="treemap"
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                />
            </div>
        );
    }
}
