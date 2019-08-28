import React from 'react';
import { FaramActionElement } from '@togglecorp/faram';

import { NormalButton, Props } from './index';

function DangerButton<T>(props: Props<T>) {
    return (
        <NormalButton
            buttonType="button-danger"
            {...props}
        />
    );
}

export default FaramActionElement(DangerButton);
