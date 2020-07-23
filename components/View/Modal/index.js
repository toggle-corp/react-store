import FocusTrap from 'react-focus-trap';
import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Haze from '../Haze';
import Portal from '../Portal';
import styles from './styles.scss';

const ESCAPE_KEY = 27;

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,
    className: PropTypes.string,
    closeOnEscape: PropTypes.bool,
    closeOnOutsideClick: PropTypes.bool,
    onClose: PropTypes.func,
};

const defaultProps = {
    className: '',
    closeOnEscape: false,
    closeOnOutsideClick: false,
    onClose: undefined,
};

// eslint-disable-next-line react/no-multi-comp
export default class Modal extends React.PureComponent {
    static propTypes = propTypes;

    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.wrapperRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyPressed);
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyPressed);
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    handleClickOutside = (event) => {
        const {
            closeOnOutsideClick,
            onClose,
        } = this.props;

        const { current: wrapper } = this.wrapperRef;

        if (closeOnOutsideClick && !wrapper.contains(event.target) && onClose) {
            onClose({ outsideClick: true });
        }
    }

    handleKeyPressed = (event) => {
        const {
            closeOnEscape,
            onClose,
        } = this.props;

        const { current: container } = this.wrapperRef;
        const isLastModal = container && container.dataset.lastModal === 'true';


        if (isLastModal && closeOnEscape && event.keyCode === ESCAPE_KEY && onClose) {
            onClose({ escape: true });
        }
    }

    render() {
        const {
            children,
            className: classNameFromProps,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.modal,
            'modal',
        );

        return (
            <Portal>
                <FocusTrap>
                    <Haze>
                        <div
                            ref={this.wrapperRef}
                            className={className}
                        >
                            { children }
                        </div>
                    </Haze>
                </FocusTrap>
            </Portal>
        );
    }
}
