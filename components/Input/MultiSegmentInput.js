import React from 'react';
import ChecklistInput from './ChecklistInput';

const MultiSegmentInput = props => (
    <ChecklistInput
        {...props}
        segment
    />
);

export default MultiSegmentInput;
