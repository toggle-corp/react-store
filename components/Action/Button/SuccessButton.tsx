import React from 'react';
import { FaramActionElement } from '@togglecorp/faram';

import { NormalButton, Props } from './index';

function SuccessButton<T>(props: Props<T>) {
    return (
        <NormalButton
            buttonType="button-success"
            {...props}
        />
    );
}

export default FaramActionElement(SuccessButton);
