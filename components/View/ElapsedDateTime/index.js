import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getDateDifferenceHumanReadable,
} from '../../../utils/common';

import {
    currentTimeSelector,
    currentDateSelector,
} from '../../../../common/selectors/datetime';
import styles from './styles.scss';


const propTypes = {
    /**
     * Timestamp for end Date
     */
    end: PropTypes.number,
    /**
     * Timestamp for start Date
     */
    start: PropTypes.number,
};

const defaultProps = {
    end: undefined,
    start: undefined,
};


/**
 * Human Readable Date component provide diff between given and current date
 * (end - start)
 */
@CSSModules(styles, { allowMultiple: true })
class ElapsedDateTime extends React.PureComponent {
    static defaultProps = defaultProps;
    static propTypes = propTypes;

    render() {
        const {
            end,
            start,
        } = this.props;

        const diff = getDateDifferenceHumanReadable(end, start);
        return (
            <span
                className="elapsed-date-time"
                styleName="elapsed-date-value"
            >
                { diff }
            </span>
        );
    }
}

const mapStateToDateProps = state => ({
    start: currentDateSelector(state),
});

const mapStateToTimeProps = state => ({
    start: currentTimeSelector(state),
});

/**
 * Update at the end of the day
 */
export const ElapsedDate = connect(mapStateToDateProps)(ElapsedDateTime);

/**
 *  Update at the interval of second
 */
export const ElapsedTime = connect(mapStateToTimeProps)(ElapsedDateTime);
