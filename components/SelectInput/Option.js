import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.arrayOf(
            PropTypes.node,
        ),
    ]).isRequired,

    /**
     * is option currently selected?
     */
    selected: PropTypes.bool,

    /**
     * is option marked currently? (for selection)
     */
    marked: PropTypes.bool,

    onClick: PropTypes.func.isRequired,
};

const defaultProps = {
    selected: false,
    marked: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class Option extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <button
                styleName={`
                    option
                    ${this.props.selected ? 'selected' : ''}
                    ${this.props.marked ? 'marked' : ''}
                `}
                onClick={this.props.onClick}
            >
                { this.props.children }
            </button>
        );
    }
}
