import * as React from 'react';
import { FaramErrors, FaramValues } from '../Faram';

import { ExternalProps } from './FaramElement';

interface FaramProps {
    children: React.ReactNode;
    onChange(value: FaramValues, error: FaramErrors): void;
    value?: FaramValues;
    error?: FaramErrors;
    disabled?: boolean;
    changeDelay?: number;
}

declare class FaramGroup extends React.PureComponent<FaramProps & ExternalProps, any> {
}

export default FaramGroup;
