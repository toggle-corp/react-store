import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import DateUnit from './DateUnit';
import styles from './styles.scss';


const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};


@CSSModules(styles, { allowMultiple: true })
export default class DateInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            dayUnit: undefined,
            monthUnit: undefined,
            yearUnit: undefined,
        };
    }

    render() {
        const {
            className,
        } = this.props;

        return (
            <div styleName="date-input-wrapper" className={className}>
                <DateUnit
                    placeholder="dd"
                    ref={(unit) => { this.setState({ dayUnit: unit }); }}
                    length={2}
                    max={32}
                    nextUnit={this.state.monthUnit}
                />
                <span styleName="separator">-</span>
                <DateUnit
                    placeholder="mm"
                    ref={(unit) => { this.setState({ monthUnit: unit }); }}
                    length={2}
                    max={12}
                    nextUnit={this.state.yearUnit}
                />
                <span styleName="separator">-</span>
                <DateUnit
                    placeholder="yyyy"
                    ref={(unit) => { this.setState({ yearUnit: unit }); }}
                    length={4}
                />
            </div>
        );
    }
}
