import React from 'react';
import PropTypes from 'prop-types';

import FloatingContainer from '../../../View/FloatingContainer';
import Icon from '../../../General/Icon';

import styles from './styles.scss';

const ActionButtons = ({
    disabled,
    readOnly,
    onClearButtonClick,
    onTodayButtonClick,
    onCalendarButtonClick,
    className,
    onInvalidate,
}) => {
    const classNames = [
        className,
        'action-buttons',
    ];

    const clearButtonClassName = [
        'button',
        styles.button,
        'clear',
        styles.clear,
    ].join(' ');

    return (
        <FloatingContainer
            className={classNames.join(' ')}
            onInvalidate={onInvalidate}
        >
            <button
                className={clearButtonClassName}
                type="button"
                onClick={onClearButtonClick}
                title="Clear date"
                tabIndex="-1"
                disabled={disabled || readOnly}
            >
                <Icon name="closeRound" />
            </button>
            <button
                onClick={onTodayButtonClick}
                className={styles.button}
                type="button"
                title="Set date to today"
                tabIndex="-1"
                disabled={disabled || readOnly}
            >
                <Icon name="clock" />
            </button>
            <button
                onClick={onCalendarButtonClick}
                className={styles.button}
                type="button"
                title="Open date picker"
                tabIndex="-1"
                disabled={disabled || readOnly}
            >
                <Icon name="calendar" />
            </button>
        </FloatingContainer>
    );
};

ActionButtons.propTypes = {
    onClearButtonClick: PropTypes.func.isRequired,
    onTodayButtonClick: PropTypes.func.isRequired,
    onCalendarButtonClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    className: PropTypes.string,
    onInvalidate: PropTypes.func.isRequired,
};

ActionButtons.defaultProps = {
    disabled: false,
    readOnly: false,
    className: '',
};

export default ActionButtons;
