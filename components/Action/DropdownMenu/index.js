import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';
import { calcFloatPositionInMainWindow } from '../../../utils/bounds';
import FloatingContainer from '../../View/FloatingContainer';

import styles from './styles.scss';

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

    leftComponent: PropTypes.node,

    title: PropTypes.string,

    dropdownClassName: PropTypes.string,
};

const defaultProps = {
    className: '',
    iconName: undefined,
    leftComponent: undefined,
    marginTop: 0,
    hideDropdownIcon: false,
    title: '',
    dropdownClassName: '',
};

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

    componentWillMount() {
        window.addEventListener('click', this.handleWindowClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleWindowClick);
    }

    getClassName = () => {
        const { className } = this.props;
        const { showDropdown } = this.state;

        const classNames = [
            className,
            'dropdown-menu',
            styles.dropdownMenu,
        ];

        if (showDropdown) {
            classNames.push('active');
            classNames.push(styles.active);
        }

        return classNames.join(' ');
    }

    handleDropdownClick = (e) => {
        e.stopPropagation();

        if (this.container) {
            this.boundingClientRect = this.container.getBoundingClientRect();
        }

        const { showDropdown: oldShowDropdown } = this.state;

        this.setState({ showDropdown: !oldShowDropdown });
    };

    handleDropdownContainerBlur = () => {
        this.setState({ showDropdown: false });
    }

    handleWindowClick = () => {
        if (this.state.showDropdown) {
            this.setState({ showDropdown: false });
        }
    }

    handleDropdownContainerInvalidate = (dropdownContainer) => {
        const contentRect = dropdownContainer.getBoundingClientRect();
        let parentRect = this.boundingClientRect;
        if (this.container) {
            parentRect = this.container.getBoundingClientRect();
        }

        const optionsContainerPosition = (
            calcFloatPositionInMainWindow({
                parentRect,
                contentRect,
            })
        );
        return optionsContainerPosition;
    }

    renderLeftIcon = () => {
        const { iconName } = this.props;

        if (!iconName) {
            return null;
        }

        const className = [
            iconName,
            'left-icon',
            styles.leftIcon,
        ].join(' ');

        return <i className={className} />;
    }

    renderLeftComponent = () => {
        const { leftComponent } = this.props;

        if (!leftComponent) {
            return null;
        }

        return leftComponent;
    }

    renderDropdownIcon = () => {
        const { hideDropdownIcon } = this.props;

        if (hideDropdownIcon) {
            return null;
        }

        const className = [
            iconNames.chevronDown,
            'dropdown-icon',
            styles.dropdownIcon,
        ].join(' ');

        return <i className={className} />;
    }

    renderDropdownButton = () => {
        const { title } = this.props;

        const LeftIcon = this.renderLeftIcon;
        const LeftComponent = this.renderLeftComponent;
        const DropdownIcon = this.renderDropdownIcon;
        const className = [
            'dropdown-button',
            styles.dropdownButton,
        ].join(' ');
        const titleClassName = [
            'title',
            styles.title,
        ].join(' ');

        return (
            <button
                onClick={this.handleDropdownClick}
                className={className}
            >
                <LeftIcon />
                <LeftComponent />
                <span className={titleClassName}>
                    {title}
                </span>
                <DropdownIcon />
            </button>
        );
    }

    renderDropdownContainer = () => {
        const { showDropdown } = this.state;

        if (!showDropdown) {
            return null;
        }

        const {
            dropdownClassName,
            children,
        } = this.props;

        const className = [
            dropdownClassName,
            'dropdown-container',
            styles.dropdownContainer,
        ].join(' ');

        return (
            <FloatingContainer
                ref={(el) => { this.dropdownContainer = el; }}
                className={className}
                onBlur={this.handleDropdownContainerBlur}
                parent={this.container}
                onInvalidate={this.handleDropdownContainerInvalidate}
            >
                { children }
            </FloatingContainer>
        );
    }

    render() {
        const className = this.getClassName();
        const DropdownButton = this.renderDropdownButton;
        const DropdownContainer = this.renderDropdownContainer;

        return (
            <div
                ref={(el) => { this.container = el; }}
                className={className}
            >
                <DropdownButton />
                <DropdownContainer />
            </div>
        );
    }
}
