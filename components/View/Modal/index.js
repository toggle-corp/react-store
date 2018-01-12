import CSSModules from 'react-css-modules';
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
    show: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class Modal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.syncViewWithBody(props.show);
    }

    componentWillReceiveProps(nextProps) {
        const { show: newShow } = nextProps;
        const { show: oldShow } = this.props;

        if (newShow !== oldShow) {
            this.syncViewWithBody(newShow);
        }
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
        const { show } = this.props;

        if (!show) {
            return null;
        }

        return (
            <Portal>
                <div className={this.getClassName()}>
                    { this.props.children }
                </div>
            </Portal>
        );
    }
}

export { default as Header } from './Header';
export { default as Body } from './Body';
export { default as Footer } from './Footer';
