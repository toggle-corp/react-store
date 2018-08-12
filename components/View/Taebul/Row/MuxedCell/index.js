import React from 'react';
import PropTypes from 'prop-types';

const MuxedCell = (props) => {
    const {
        columnKey,
        column,
        datumKey,
        datum,
        cellRendererParams,
    } = props;

    const params = cellRendererParams({
        columnKey,
        column,
        datumKey,
        datum,
    });

    const { cellRenderer: Cell } = column;

    // TODO: send useful props
    return (<Cell {...params} />);
};

MuxedCell.propTypes = {
    column: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    datum: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    columnKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    datumKey: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    cellRendererParams: PropTypes.func.isRequired,
};

MuxedCell.defaultProps = {
};

export default MuxedCell;
