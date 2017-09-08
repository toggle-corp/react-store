import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import DataRow from './DataRow';
import styles from './styles.scss';
import {
    TableHeaderPropTypes,
} from '../Table/Header';
import {
    randomString,
} from '../../utils/common';

export const TableDataPropTypes = PropTypes.arrayOf(
    PropTypes.shape({
        key: PropTypes.string,
        // Note: Shape is dynamic
    }).isRequired,
);

const propTypes = {
    headers: TableHeaderPropTypes.isRequired,
    data: TableDataPropTypes.isRequired,
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class Body extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { headers, data } = this.props;

        return (
            <tbody>
                {
                    data.map(datum => (
                        <DataRow
                            key={randomString()}
                            rowData={datum}
                            headers={headers}
                        />
                    ))
                }
            </tbody>
        );
    }
}
