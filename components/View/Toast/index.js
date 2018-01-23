import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Portal from '../Portal';
import { Button } from '../../Action';
import { iconNames } from '../../../constants';

import styles from './styles.scss';

export const NOTIFICATION = {
    INFO: 'info',
    ERROR: 'error',
    WARNING: 'warning',
    SUCCESS: 'success',
};

const iconMap = {
    [NOTIFICATION.INFO]: iconNames.info,
    [NOTIFICATION.ERROR]: iconNames.error,
    [NOTIFICATION.WARNING]: iconNames.warning,
    [NOTIFICATION.SUCCESS]: iconNames.check,
};

const propTypes = {
    notification: PropTypes.shape({
        type: PropTypes.string,
        message: PropTypes.string,
        dismissable: PropTypes.bool,
        duration: PropTypes.number,
        actionButtons: PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.arrayOf(
                PropTypes.node,
            ),
        ]),
    }).isRequired,

    onClose: PropTypes.func.isRequired,
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class Toast extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { notification } = props;
        const shown = Object.keys(notification).length !== 0;

        this.state = {
            shown,
            notification,
        };
    }

    componentDidMount() {
        const { notification } = this.state;
        if (notification.duration !== Infinity) {
            this.timeout = setTimeout(this.handleTimeout, notification.duration);
        }
    }

    componentWillReceiveProps(nextProps) {
        const { notification: nextNotification } = nextProps;
        const { notification: currentNotification } = this.props;

        if (nextNotification !== currentNotification) {
            const isNotificationEmpty = Object.keys(nextNotification).length === 0;
            if (!isNotificationEmpty) {
                this.setState({
                    shown: true,
                    notification: nextNotification,
                });

                if (nextNotification.duration !== Infinity) {
                    if (this.timeout) {
                        clearTimeout(this.timeout);
                    }
                    this.timeout = setTimeout(this.handleTimeout, nextNotification.duration);
                }
            }
        }
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    getStyleName = () => {
        const {
            shown,
            notification,
        } = this.state;

        const styleNames = [];
        styleNames.push('toast');
        if (shown) {
            styleNames.push('shown');
        }
        if (notification) {
            styleNames.push(notification.type);
        }
        return styleNames.join(' ');
    }

    getIconName = () => {
        const { notification: { type } } = this.state;
        return iconMap[type];
    }

    closeNotification = () => {
        const { onClose } = this.props;
        this.setState({ shown: false });
        onClose();
    }

    handleTimeout = () => {
        this.closeNotification();
    }

    handleDissmissButtonClick = () => {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.closeNotification();
    }

    render() {
        const { notification } = this.state;

        return (
            <Portal>
                <div styleName={this.getStyleName()}>
                    {
                        notification && (
                            <div styleName="container">
                                <header styleName="header">
                                    <h4 styleName="heading">
                                        { notification.title }
                                    </h4>
                                    {
                                        notification.dismissable && (
                                            <Button
                                                styleName="close-button"
                                                onClick={this.handleDissmissButtonClick}
                                                transparent
                                            >
                                                <span className={iconNames.close} />
                                            </Button>
                                        )
                                    }
                                </header>
                                <div styleName="main-content">
                                    <span
                                        styleName="icon"
                                        className={this.getIconName()}
                                    />
                                    <div styleName="message">
                                        { notification.message }
                                    </div>
                                    <div styleName="action-buttons">
                                        { notification.actionButtons }
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            </Portal>
        );
    }
}
