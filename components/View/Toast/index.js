import PropTypes from 'prop-types';
import React from 'react';

import Icon from '../../General/Icon';
import Button from '../../Action/Button';
import Portal from '../Portal';

/*
eslint css-modules/no-unused-class: [
    1,
    { markAsUsed: ['info', 'error', 'warning', 'success'], camelCase: true }
]
*/
import styles from './styles.scss';

export const NOTIFICATION = {
    INFO: 'info',
    ERROR: 'error',
    WARNING: 'warning',
    SUCCESS: 'success',
};

const iconMap = {
    [NOTIFICATION.INFO]: 'info',
    [NOTIFICATION.ERROR]: 'error',
    [NOTIFICATION.WARNING]: 'warning',
    [NOTIFICATION.SUCCESS]: 'check',
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

    getClassName = () => {
        const {
            shown,
            notification,
        } = this.state;

        const classNames = [];
        classNames.push(styles.toast);
        if (shown) {
            classNames.push(styles.shown);
        }
        if (notification) {
            classNames.push(styles[notification.type]);
        }
        return classNames.join(' ');
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
                <div className={this.getClassName()}>
                    {
                        notification && (
                            <div className={styles.container}>
                                <header className={styles.header}>
                                    <h4 className={styles.heading}>
                                        { notification.title }
                                    </h4>
                                    {
                                        notification.dismissable && (
                                            <Button
                                                className={styles.closeButton}
                                                onClick={this.handleDissmissButtonClick}
                                                transparent
                                                iconName="close"
                                            />
                                        )
                                    }
                                </header>
                                <div className={styles.mainContent}>
                                    <Icon
                                        className={styles.icon}
                                        name={this.getIconName()}
                                    />
                                    <div className={styles.message}>
                                        { notification.message }
                                    </div>
                                    <div className={styles.actionButtons}>
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
