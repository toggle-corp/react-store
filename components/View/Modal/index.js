import FocusTrap from 'react-focus-trap';
import PropTypes from 'prop-types';
import React from 'react';

import Portal from '../Portal';
import styles from './styles.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class Modal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;
        const classNames = [className, 'modal', styles.modal];
        return classNames.join(' ');
    }

    render() {
        return (
            <Portal>
                <FocusTrap>
                    <div className={styles.backdrop} />
                    <div className={this.getClassName()}>
                        { this.props.children }
                    </div>
                </FocusTrap>
            </Portal>
        );
    }
}
