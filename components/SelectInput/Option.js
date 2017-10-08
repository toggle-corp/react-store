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

    /**
     * callback on cllick
     */
    onClick: PropTypes.func.isRequired,

    /**
     * callback on mouse over
     */
    onMouseOver: PropTypes.func,
};

const defaultProps = {
    selected: false,
    marked: false,
    onMouseOver: undefined,
};

/*
const isVisibleInParent = (el) => {
    const parent = el.parentNode;
    const pcr = parent.getBoundingClientRect();
    const cr = el.getBoundingClientRect();

    return (cr.top >= pcr.top) && (pcr.top + pcr.height) > (cr.top + cr.height);
};
*/

@CSSModules(styles, { allowMultiple: true })
export default class Option extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        if (this.props.marked) {
            this.container.scrollIntoView({
                behavior: 'instant',
                block: 'nearest',
                inline: 'nearest',
            });
            // this.container.scrollIntoViewIfNeeded();
        }
    }

    render() {
        return (
            <button
                ref={(el) => { this.container = el; }}
                styleName={`
                    option
                    ${this.props.selected ? 'selected' : ''}
                    ${this.props.marked ? 'marked' : ''}
                `}
                onClick={this.props.onClick}
                onMouseOver={this.props.onMouseOver}
            >
                { this.props.children }
            </button>
        );
    }
}
