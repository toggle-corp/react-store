import React from 'react';
import PropTypes from 'prop-types';

import { iconNames } from '../../../../constants';
import styles from './styles.scss';

const ActionButtons = ({
    disabled,
    readOnly,
    onClearButtonClick,
    onTodayButtonClick,
    onCalendarButtonClick,
    className,
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
        <div className={classNames.join(' ')}>
            <button
                className={clearButtonClassName}
                type="button"
                onClick={onClearButtonClick}
                title="Clear date"
                tabIndex="-1"
                disabled={disabled || readOnly}
            >
                <span className={iconNames.closeRound} />
            </button>
            <button
                onClick={onTodayButtonClick}
                className={styles.button}
                type="button"
                title="Set date to today"
                tabIndex="-1"
                disabled={disabled || readOnly}
            >
                <span className={iconNames.clock} />
            </button>
            <button
                onClick={onCalendarButtonClick}
                className={styles.button}
                type="button"
                title="Open date picker"
                tabIndex="-1"
                disabled={disabled || readOnly}
            >
                <span className={iconNames.calendar} />
            </button>
        </div>
    );
};

ActionButtons.propTypes = {
    onClearButtonClick: PropTypes.func.isRequired,
    onTodayButtonClick: PropTypes.func.isRequired,
    onCalendarButtonClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    className: PropTypes.string,
};

ActionButtons.defaultProps = {
    disabled: false,
    readOnly: false,
    className: '',
};

export default ActionButtons;
