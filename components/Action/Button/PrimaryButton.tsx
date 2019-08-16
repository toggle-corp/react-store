import React from 'react';
import { FaramActionElement } from '@togglecorp/faram';

import { NormalButton, Props } from './index';

function PrimaryButton<T>(props: Props<T>) {
    return (
        <NormalButton
            buttonType="button-primary"
            {...props}
        />
    );
}

export default FaramActionElement(PrimaryButton);
