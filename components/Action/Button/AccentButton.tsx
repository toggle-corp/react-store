import React from 'react';
import { FaramActionElement } from '@togglecorp/faram';

import { NormalButton, Props } from './index';

function AccentButton<T>(props: Props<T>) {
    return (
        <NormalButton
            buttonType="button-accent"
            {...props}
        />
    );
}

export default FaramActionElement(AccentButton);
