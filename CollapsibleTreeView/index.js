import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import { PropTypes } from 'prop-types';
import CollapsibleTree from '../CollapsibleTree';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class CollapsibleTreeView extends PureComponent {
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
                styleName="collapsibletree-view"
                className={className}
            >
                <div styleName="buttons">
                    <button styleName="button" onClick={this.handleSave}>
                        Save
                    </button>
                </div>
                <CollapsibleTree
                    styleName="collapsibletree"
                    ref={(instance) => { this.chart = instance; }}
                    {...otherProps}
                />
            </div>
        );
    }
}
