import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';

const propTypes = {
    colSpan: PropTypes.number.isRequired,
    rowData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    expandedRowModifier: PropTypes.func.isRequired,
};

const defaultProps = {
};

export default class ExpandedRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            expandedRowModifier,
            colSpan,
            rowData,
        } = this.props;

        return (
            <tr className={`${styles.row} expanded-row row`}>
                <td colSpan={colSpan}>
                    {expandedRowModifier && expandedRowModifier(rowData)}
                </td>
            </tr>
        );
    }
}
