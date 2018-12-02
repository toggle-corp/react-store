import FocusTrap from 'react-focus-trap';
import PropTypes from 'prop-types';
import React from 'react';

import Portal from '../Portal';
import styles from './styles.scss';

const ESCAPE_KEY = 27;

const noop = () => {};

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
    onClose: noop,
};

export default class Modal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.wrapperRef = React.createRef();
        this.syncViewWithBody(true);
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyPressed);
        document.addEventListener('mousedown', this.handleClickOutside);

        const modals = document.querySelectorAll('.modal');
        modals.forEach((modal, i) => {
            if (i === modals.length - 1) {
                // eslint-disable-next-line no-param-reassign
                modal.dataset.lastModal = 'true';
            } else {
                // eslint-disable-next-line no-param-reassign
                modal.dataset.lastModal = 'false';
            }
        });
    }

    componentWillUnmount() {
        this.syncViewWithBody(false);
        document.removeEventListener('keydown', this.handleKeyPressed);
        document.removeEventListener('mousedown', this.handleClickOutside);

        const modals = Array.from(document.querySelectorAll('.modal'))
            .filter(n => n !== this.wrapperRef.current);
        modals.forEach((modal, i) => {
            if (i === modals.length - 1) {
                // eslint-disable-next-line no-param-reassign
                modal.dataset.lastModal = 'true';
            } else {
                // eslint-disable-next-line no-param-reassign
                modal.dataset.lastModal = 'false';
            }
        });
    }

    getClassName = () => {
        const { className } = this.props;
        const classNames = [className, 'modal', styles.modal];
        return classNames.join(' ');
    }

    handleClickOutside = (event) => {
        const { closeOnOutsideClick } = this.props;
        if (closeOnOutsideClick && !this.wrapperRef.current.contains(event.target)) {
            this.props.onClose({ outsideClick: true });
        }
    }

    handleKeyPressed = (event) => {
        const { closeOnEscape } = this.props;
        if (closeOnEscape && event.keyCode === ESCAPE_KEY) {
            this.props.onClose({ escape: true });
        }
    }

    syncViewWithBody = (show) => {
        const shownClassName = 'modal-shown';
        const classNames = document.body.className.split(' ');

        if (show) {
            classNames.push(shownClassName);
        } else {
            const index = classNames.findIndex(d => d === shownClassName);
            if (index !== -1) {
                classNames.splice(index, 1);
            }
        }

        document.body.className = classNames.join(' ');
    }

    render() {
        return (
            <Portal>
                <FocusTrap>
                    <div
                        className={this.getClassName()}
                        ref={this.wrapperRef}
                    >
                        { this.props.children }
                    </div>
                </FocusTrap>
            </Portal>
        );
    }
}
