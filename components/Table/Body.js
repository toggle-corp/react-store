import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import DataRow from './DataRow';
import styles from './styles.scss';
import { TableHeaderPropTypes } from '../Table/Header';
import { randomString } from '../../utils/common';

export const TableDataPropTypes = PropTypes.arrayOf(
    PropTypes.shape({
        key: PropTypes.string,
        // Note: Shape is dynamic
    }).isRequired,
);

const propTypes = {
    data: TableDataPropTypes.isRequired,
    headers: TableHeaderPropTypes.isRequired,
};

@CSSModules(styles, { allowMultiple: true })
export default class Body extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const {
            headers,
            data,
        } = this.props;

        // FIXME: randomString() must not be called inside loops, every time the Body component
        // is rerendered, all the keys will change
        // That is the exact opposite of what we want
        // Instead, extract some value from data and use it as key

        return (
            <tbody>
                {
                    data.map(datum => (
                        <DataRow
                            headers={headers}
                            key={randomString()}
                            rowData={datum}
                        />
                    ))
                }
            </tbody>
        );
    }
}
