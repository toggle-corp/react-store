import * as React from 'react';

interface Props {
    className?: string;
    children: React.ReactNode;
}

// eslint-disable-next-line react/prefer-stateless-function, @typescript-eslint/no-explicit-any
declare class Message extends React.Component<Props, any> {
}
export default Message;
