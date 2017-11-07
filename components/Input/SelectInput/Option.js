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
     * Is option checkable ? (for multiselect)
     */
    checkable: PropTypes.bool,

    /**
     * Is option currently checked ?
     */
    checked: PropTypes.bool,

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

    /**
     * is option currently selected?
     */
    selected: PropTypes.bool,
};

const defaultProps = {
    checkable: false,
    checked: false,
    marked: false,
    onMouseOver: undefined,
    selected: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class Option extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            checked: this.props.checked,
        };
    }

    componentDidUpdate() {
        if (this.props.marked && this.container) {
            this.container.scrollIntoView({
                behavior: 'instant',
                block: 'nearest',
                inline: 'nearest',
            });
            // this.container.scrollIntoViewIfNeeded();
        }
    }

    handleClick = (e) => {
        e.stopPropagation();

        if (this.props.checkable) {
            const checked = !this.state.checked;
            this.setState({
                checked,
            });
            this.props.onClick(checked);
        } else {
            this.props.onClick();
        }
    }

    render() {
        return (
            <button
                className={`
                    select-option
                    ${this.props.selected ? 'selected' : ''}
                    ${this.props.marked ? 'marked' : ''}
                `}
                ref={(el) => { this.container = el; }}
                styleName={`
                    option
                    ${this.props.selected ? 'selected' : ''}
                    ${this.props.marked ? 'marked' : ''}
                `}
                onClick={this.handleClick}
                onMouseOver={this.props.onMouseOver}
            >
                {
                    this.props.checkable &&
                        <span
                            styleName="checkmark"
                            className={`${
                                this.state.checked
                                    ? 'ion-android-checkbox'
                                    : 'ion-android-checkbox-outline-blank'
                            }`}
                        />
                }
                { this.props.children }
            </button>
        );
    }
}
