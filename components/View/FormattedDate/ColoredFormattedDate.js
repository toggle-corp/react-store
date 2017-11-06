import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import FormattedDate from './FormattedDate';
import styles from './styles.scss';
import { getDifferenceInDays } from '../../../public/utils/common';

import {
    currentDateSelector,
} from '../../../common/selectors/datetime';

const mapStateToProps = state => ({
    today: currentDateSelector(state),
});

const mapDispatchToProps = dispatch => ({
    dispatch,
});

const propTypes = {
    /**
     * Timestamp
     */
    date: PropTypes.number,
    /**
     * Timestamp
     */
    today: PropTypes.number,
};

const defaultProps = {
    date: undefined,
    today: undefined,
};

/**
 * Show Timestamp in humanreadable format with color
 * date is compared with current date for coloring
 */

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ColoredFormattedDate extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            date,
            today,
        } = this.props;

        const indicator = getDifferenceInDays(today, date) <= 0 ? 'positive' : 'negative';

        return (
            <span
                className={`colored-formatted-date ${indicator}`}
                styleName={`formatted-date-container ${indicator}`}
            >
                <FormattedDate
                    date={date}
                    {...this.props}
                />
            </span>
        );
    }
}
