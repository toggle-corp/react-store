import React from 'react';

const noOp = () => {
    console.warn('setUiMode called before it was assigned');
};

export type UiMode = 'classic' | 'deep';

export interface UiContextProps {
    uiMode: UiMode;
    setUiMode: (newMode: UiMode) => void;
}

const UiContext = React.createContext<UiContextProps>({
    uiMode: 'classic',
    setUiMode: noOp,
});

export default UiContext;
