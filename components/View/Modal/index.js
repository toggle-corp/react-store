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

    constructor(props) {
        super(props);
        this.syncViewWithBody(true);
    }

    componentWillUnmount() {
        this.syncViewWithBody(false);
    }

    getClassName = () => {
        const { className } = this.props;
        const classNames = [className, 'modal', styles.modal];
        return classNames.join(' ');
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
                    <div className={this.getClassName()}>
                        { this.props.children }
                    </div>
                </FocusTrap>
            </Portal>
        );
    }
}
