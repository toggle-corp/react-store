import React from 'react';
import { FaramActionElement } from '@togglecorp/faram';

import { NormalButton, Props } from './index';

function WarningButton<T>(props: Props<T>) {
    return (
        <NormalButton
            buttonType="button-warning"
            {...props}
        />
    );
}

export default FaramActionElement(WarningButton);
