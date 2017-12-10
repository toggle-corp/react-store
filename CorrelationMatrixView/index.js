import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import CorrelationMatrix from '../CorrelationMatrix';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles)
export default class CorrelationMatrixView extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    handleSave = () => {
        this.chart.wrappedComponent.save();
    }

    render() {
        const {
            className,
            ...otherProps
        } = this.props;
        return (
            <div
                styleName="correlationmatrix-view"
                className={className}
            >
                <div styleName="buttons">
                    <button styleName="button" onClick={this.handleSave}>
                        Save
                    </button>
                </div>
                <CorrelationMatrix
                    styleName="correlationmatrix"
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                />
            </div>
        );
    }
}
