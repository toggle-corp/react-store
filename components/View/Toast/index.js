import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { FloatingContainer } from '../../View';
import { TransparentButton } from '../../Action';
import { iconNames } from '../../../constants';

import styles from './styles.scss';

export const NOTIFICATION = {
    INFO: 'info',
    ERROR: 'error',
    WARNING: 'warning',
    SUCCESS: 'success',
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
        const keys = Object.keys(notification);

        this.state = {
            shown: keys.length !== 0,
            notification,
        };

        const {
            INFO,
            ERROR,
            WARNING,
            SUCCESS,
        } = NOTIFICATION;

        const iconMap = {
            [INFO]: iconNames.info,
            [ERROR]: iconNames.error,
            [WARNING]: iconNames.warning,
            [SUCCESS]: iconNames.check,
        };

        this.iconMap = iconMap;

        if (notification.duration !== Infinity) {
            this.timeout = setTimeout(this.handleTimeout, notification.duration);
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            notification: nextNotification,
        } = nextProps;

        const {
            notification: currentNotification,
        } = this.props;

        if (nextNotification !== currentNotification) {
            const keys = Object.keys(nextNotification);

            if (keys.length !== 0) {
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

    getStyleName = () => {
        const styleNames = [];
        styleNames.push('toast');

        const {
            shown,
            notification,
        } = this.state;

        if (shown) {
            styleNames.push('shown');
        }

        if (notification) {
            styleNames.push(notification.type);
        }

        return styleNames.join(' ');
    }

    getIconName = () => {
        const {
            notification: { type },
        } = this.state;

        return this.iconMap[type];
    }

    handleContainerClose = () => {
        // no-op
    }

    handleTimeout = () => {
        const {
            onClose,
        } = this.props;

        this.setState({
            shown: false,
        });

        onClose();
    }

    handleDissmissButtonClick = () => {
        const {
            onClose,
        } = this.props;

        this.setState({
            shown: false,
        });

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        onClose();
    }

    render() {
        const show = true;
        const containerId = 'toast';

        const {
            notification,
        } = this.state;

        return (
            <FloatingContainer
                styleName={this.getStyleName()}
                containerId={containerId}
                onClose={this.handleContainerClose}
                ref={(el) => { this.container = el; }}
                show={show}
            >
                {
                    notification && (
                        <div styleName="container">
                            {
                                <header styleName="header">
                                    <h4
                                        styleName="heading"
                                    >
                                        { notification.title }
                                    </h4>
                                    {
                                        notification.dismissable && (
                                            <TransparentButton
                                                onClick={this.handleDissmissButtonClick}
                                            >
                                                <span className={iconNames.close} />
                                            </TransparentButton>
                                        )
                                    }
                                </header>
                            }
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
            </FloatingContainer>
        );
    }
}
