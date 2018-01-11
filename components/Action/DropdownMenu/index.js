import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { FloatingContainer } from '../../View';
import {
    calcFloatingPositionInMainWindow,
} from '../../../utils/common';
import styles from './styles.scss';

import { iconNames } from '../../../constants';

/**
 * Iconleft is the name of ionicon in left of title button
 * MarginTop is extra top shift if required
 * showDropdown shows chevron on right of title button
 * */
const propTypes = {
    className: PropTypes.string,

    /**
     * child elements
     */
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,

    iconName: PropTypes.string,

    hideDropdownIcon: PropTypes.bool,

    title: PropTypes.string,
};

const defaultProps = {
    className: '',
    iconName: '',
    marginTop: 0,
    hideDropdownIcon: false,
    title: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class DropdownMenu extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showDropdown: false,
        };

        this.boundingClientRect = {};
    }

    componentDidUpdate() {
        if (this.state.showDropdown) {
            window.addEventListener('click', this.handleClick);
        } else {
            window.removeEventListener('click', this.handleClick);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleClick);
    }

    handleDropdownClick = (e) => {
        e.stopPropagation();

        if (this.container) {
            this.boundingClientRect = this.container.getBoundingClientRect();
        }

        this.setState({ showDropdown: !this.state.showDropdown });
    };

    handleContainerClose = () => {
        this.setState({ showDropdown: false });
    }

    handleDropdownContainerBlur = () => {
        this.setState({ showDropdown: false });
    }

    handleClick = () => {
        if (this.state.showDropdown) {
            this.setState({ showDropdown: false });
        }
    }

    handleDropdownContainerInvalidate = (dropdownContainer) => {
        const containerRect = dropdownContainer.getBoundingClientRect();
        let parentRect = this.boundingClientRect;
        if (this.container) {
            parentRect = this.container.getBoundingClientRect();
        }

        const optionsContainerPosition = (
            calcFloatingPositionInMainWindow(parentRect, containerRect)
        );
        return optionsContainerPosition;
    }

    render() {
        const { showDropdown } = this.state;
        const {
            title,
            iconName,
            hideDropdownIcon,
        } = this.props;

        return (
            <div
                ref={(el) => { this.container = el; }}
                className={this.props.className}
                styleName="dropdown-menu"
            >
                <button
                    onClick={this.handleDropdownClick}
                    styleName="dropdown-header"
                >
                    <div>
                        <i
                            className={iconName}
                            styleName="item-icon"
                        />
                        {title}
                    </div>
                    {
                        !hideDropdownIcon && (
                            <i
                                className={iconNames.chevronDown}
                                styleName={showDropdown ? 'rotated dropdown-icon' : 'dropdown-icon'}
                            />
                        )
                    }
                </button>
                {
                    showDropdown && (
                        <FloatingContainer
                            ref={(el) => { this.dropdownContainer = el; }}
                            styleName="dropdown-container"
                            onBlur={this.handleDropdownContainerBlur}
                            parent={this.container}
                            onInvalidate={this.handleDropdownContainerInvalidate}
                        >
                            { this.props.children }
                        </FloatingContainer>
                    )
                }
            </div>
        );
    }
}

export { default as DropdownItem } from './DropdownItem';
export { default as Group } from './Group';
export { default as GroupTitle } from './GroupTitle';
