import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';


import Icon from '../../General/Icon';
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
    dropdownIconClassName: PropTypes.string,

    onClick: PropTypes.func,

    closeOnClick: PropTypes.bool,
};

const defaultProps = {
    className: '',
    iconName: undefined,
    leftComponent: undefined,
    hideDropdownIcon: false,
    title: undefined,
    dropdownClassName: '',
    dropdownIcon: 'chevronDown',
    dropdownIconClassName: '',
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

    componentDidMount() {
        window.addEventListener('click', this.handleWindowClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleWindowClick);
    }

    createContainerRef = (el) => { this.container = el; }

    createDropdownContainerRef = (el) => { this.dropdownContainer = el; }

    handleDropdownClick = (e) => {
        e.stopPropagation();

        if (this.container) {
            this.boundingClientRect = this.container.getBoundingClientRect();
        }

        const { showDropdown: oldShowDropdown } = this.state;
        this.setState(state => ({ showDropdown: !state.oldShowDropdown }));

        const { onClick } = this.props;
        onClick(!oldShowDropdown, e);
    };

    handleDropdownContainerBlur = () => {
        this.setState({ showDropdown: false });
    }

    handleCloseFromChildren = () => {
        this.setState({ showDropdown: false });
    }

    handleWindowClick = () => {
        const { closeOnClick } = this.props;

        setTimeout(() => {
            if (closeOnClick && this.state.showDropdown) {
                this.setState({ showDropdown: false });
            }
        }, 0);
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

    renderDropdownButton = () => {
        const {
            title,
            hideDropdownIcon,
            dropdownIcon,
            iconName,
            leftComponent,
            dropdownIconClassName,
        } = this.props;

        const leftIconClassName = _cs(
            'left-icon',
            styles.leftIcon,
        );

        const className = _cs(
            'dropdown-button',
            styles.dropdownButton,
            (leftComponent || iconName) && styles.hasLeft,
        );

        const titleClassName = _cs(
            'title',
            styles.title,
        );

        const iconClassName = _cs(
            'dropdown-icon',
            styles.dropdownIcon,
            dropdownIconClassName,
        );

        return (
            <button
                onClick={this.handleDropdownClick}
                className={className}
                type="button"
            >
                { iconName && (
                    <Icon
                        className={leftIconClassName}
                        name={iconName}
                    />
                )}
                { leftComponent }
                { title && (
                    <span className={titleClassName}>
                        {title}
                    </span>
                )}
                { !hideDropdownIcon && (
                    <Icon
                        className={iconClassName}
                        name={dropdownIcon}
                    />
                )}
            </button>
        );
    }

    renderDropdownContainer = () => {
        const {
            dropdownClassName,
            children,
        } = this.props;

        const className = _cs(
            dropdownClassName,
            'dropdown-container',
            styles.dropdownContainer,
        );


        let modifiedChildren = children;

        if (React.Children.count(children) === 1 && React.isValidElement(children)) {
            const newProps = { closeModal: this.handleCloseFromChildren };

            modifiedChildren = React.cloneElement(children, newProps);
        }

        return (
            <FloatingContainer
                ref={this.createDropdownContainerRef}
                className={className}
                onBlur={this.handleDropdownContainerBlur}
                parent={this.container}
                onInvalidate={this.handleDropdownContainerInvalidate}
            >
                { modifiedChildren }
            </FloatingContainer>
        );
    }

    render() {
        const { className: classNameFromProps } = this.props;
        const { showDropdown } = this.state;

        const className = _cs(
            classNameFromProps,
            'dropdown-menu',
            styles.dropdownMenu,
            showDropdown && 'active',
            showDropdown && styles.active,
        );

        const DropdownButton = this.renderDropdownButton;
        const DropdownContainer = this.renderDropdownContainer;

        return (
            <div
                ref={this.createContainerRef}
                className={className}
            >
                <DropdownButton />
                { showDropdown && (
                    <DropdownContainer />
                )}
            </div>
        );
    }
}
