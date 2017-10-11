import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import Body from './Body';
import Header from './Header';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    headers: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            label: PropTypes.string,
        }),
    ).isRequired,

    data: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
        }),
    ).isRequired,

    /**
     * keyExtractor is used to get a unique key associated with rowData
     */
    keyExtractor: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class RawTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const className = this.getClassName(props);

        this.state = {
            className,
        };
    }

    getClassName = (props) => {
        const classNames = [];
        const {
            className,
        } = props;

        // default className for global override
        classNames.push('raw-table');

        // className provided by parent (through styleName)
        classNames.push(className);
    }

    render() {
        const {
            data,
            headers,
            keyExtractor,
        } = this.props;

        return (
            <table className={this.state.className}>
                <Header
                    headers={headers}
                />
                <Body
                    data={data}
                    headers={headers}
                    keyExtractor={keyExtractor}
                />
            </table>
        );
    }
}
