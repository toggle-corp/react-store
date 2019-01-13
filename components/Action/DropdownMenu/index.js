import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../constants';
import { calcFloatPositionInMainWindow } from '../../../utils/bounds';
import FloatingContainer from '../../View/FloatingContainer';

import styles from './styles.scss';

const noOp = () => {};

/**
 * Iconleft is the name of ionicon in left of title button
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

    dropdownIcon: PropTypes.string,

    onClick: PropTypes.func,

    closeOnClick: PropTypes.bool,
};

const defaultProps = {
    className: '',
    iconName: undefined,
    leftComponent: undefined,
    hideDropdownIcon: false,
    title: '',
    dropdownClassName: '',
    dropdownIcon: iconNames.chevronDown,
    onClick: noOp,
    closeOnClick: false,
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

        const { onClick } = this.props;
        onClick(!oldShowDropdown, e);
    };

    handleDropdownContainerBlur = () => {
        this.setState({ showDropdown: false });
    }

    handleWindowClick = () => {
        const { closeOnClick } = this.props;

        if (closeOnClick && this.state.showDropdown) {
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
        const {
            hideDropdownIcon,
            dropdownIcon,
        } = this.props;

        const { showDropdown } = this.state;

        if (hideDropdownIcon) {
            return null;
        }

        const classNames = [
            dropdownIcon,
            'dropdown-icon',
            styles.dropdownIcon,
        ];
        if (showDropdown) {
            classNames.push(styles.rotate);
        }

        return <i className={classNames.join(' ')} />;
    }

    renderDropdownButton = () => {
        const { title } = this.props;

        const LeftIcon = this.renderLeftIcon;
        const LeftComponent = this.renderLeftComponent;
        const DropdownIcon = this.renderDropdownIcon;

        const classNames = [
            'dropdown-button',
            styles.dropdownButton,
        ];
        if (this.props.leftComponent || this.props.iconName) {
            classNames.push(styles.hasLeft);
        }

        const titleClassNames = [
            'title',
            styles.title,
        ];

        return (
            <button
                onClick={this.handleDropdownClick}
                className={classNames.join(' ')}
            >
                <LeftIcon />
                <LeftComponent />
                <span className={titleClassNames.join(' ')}>
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
