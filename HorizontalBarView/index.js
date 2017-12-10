import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import HorizontalBar from '../HorizontalBar';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class HorizontalBarView extends PureComponent {
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
                styleName="horizontalbar-view"
                className={className}
            >
                <div styleName="buttons">
                    <button styleName="button" onClick={this.handleSave}>
                        Save
                    </button>
                </div>
                <HorizontalBar
                    styleName="horizontalbar"
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                />
            </div>
        );
    }
}
