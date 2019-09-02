import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Message from '../../Message';

interface Props {
    className?: string;
}

function EmptyComponent(props: Props) {
    const {
        className: classNameFromProps,
    } = props;

    const className = _cs(
        'empty',
        classNameFromProps,
    );

    return (
        <div className={className}>
            <Message>
                Nothing to show.
            </Message>
        </div>
    );
}

export default EmptyComponent;
