import React from 'react';

import { currentStyle } from './index';

const connectWithStyles = (WrappedComponent, styleList = []) => (
    class extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                currentStyles: { ...currentStyle },
                updatedStyles: {},
            };

            // Note: event added in constructor on purpose
            // to avoid any pre render in children without
            // injected props
            document.addEventListener('styleupdate', this.handleStyleUpdate);
        }

        componentWillUnmount() {
            document.removeEventListener('styleupdate', this.handleStyleUpdate);
        }

        handleStyleUpdate = ({ updatedStyles }) => {
            const shouldUpdate = styleList.some(
                style => styleList.includes(style),
            );

            if (shouldUpdate || styleList.length === 0) {
                this.setState({
                    updatedStyles,
                    // Note: creating a new object intentionally
                    currentStyles: { ...currentStyle },
                });
            }
        }

        render() {
            const {
                updatedStyles,
                currentStyles,
            } = this.state;

            return (
                <WrappedComponent
                    updatedStyles={updatedStyles}
                    currentStyles={currentStyles}
                    {...this.props}
                />
            );
        }
    }
);

export default connectWithStyles;
