import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { Body } from './Body';
import styles from './styles.scss';

const propTypes = {
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
};

@CSSModules(styles, { allowMultiple: true })
export default class RawTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            data,
            headers,
            keyExtractor,
        } = this.props;

        return (
            <table>
                <Body
                    data={data}
                    headers={headers}
                    keyExtractor={keyExtractor}
                />
            </table>
        );
    }
}
