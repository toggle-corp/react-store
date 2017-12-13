import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { FloatingContainer } from '../../View';
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
            show: false,
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.calculateDimension);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.calculateDimension);
    }

    handleDropdownClick = () => {
        if (this.container) {
            this.containerClientRect = this.container.getBoundingClientRect();
        }

        this.setState({ show: !this.state.show });
    };

    handleDynamicStyling = (optionContainer) => {
        let parentClientRect;

        if (this.container) {
            parentClientRect = this.container.getBoundingClientRect();
        } else if (this.containerClientRect) {
            parentClientRect = this.containerClientRect;
        } else {
            return null;
        }

        const offsetTop = 0;
        const offsetBottom = 0;

        const MIN_WIDTH = 192;
        const width = Math.max(MIN_WIDTH, parentClientRect.width);
        const xOffset = MIN_WIDTH > parentClientRect.width ? MIN_WIDTH - parentClientRect.width : 0;

        const newStyle = {
            top: `${parentClientRect.top + (parentClientRect.height - offsetBottom)}px`,
            left: `${parentClientRect.left - xOffset}px`,
            width: `${width}px`,
        };

        const optionRect = optionContainer.getBoundingClientRect();

        const pageOffset = window.innerHeight;
        const containerOffset = parentClientRect.top + optionRect.height + parentClientRect.height;

        if (pageOffset < containerOffset) {
            newStyle.top = `${(parentClientRect.top + window.scrollY) - optionRect.height - offsetTop}px`;
        }

        return newStyle;
    }

    handleContainerClose = () => {
        this.setState({ show: false });
    }

    handleDropdownContainerBlur = () => {
        this.setState({ show: false });
    }

    handleDropdownContainerClick = () => {
        this.setState({ show: false });
    }

    render() {
        const { show } = this.state;
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
                                styleName={show ? 'rotated dropdown-icon' : 'dropdown-icon'}
                            />
                        )
                    }
                </button>
                <FloatingContainer
                    ref={(el) => { this.dropdownContainer = el; }}
                    containerId="dropdown-container"
                    onClose={this.handleContainerClose}
                    onDynamicStyleOverride={this.handleDynamicStyling}
                    show={show}
                    styleName="dropdown-container"
                    onBlur={this.handleDropdownContainerBlur}
                    onClick={this.handleDropdownContainerClick}
                    parentContainer={this.container}
                >
                    { this.props.children }
                </FloatingContainer>
            </div>
        );
    }
}

export { default as DropdownItem } from './DropdownItem';
export { default as Group } from './Group';
export { default as GroupTitle } from './GroupTitle';
