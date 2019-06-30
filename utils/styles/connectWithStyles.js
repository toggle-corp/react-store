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

            document.addEventListener('styleupdate', this.handleStyleUpdate);
        }

        componentWillUnmount() {
            document.removeEventListner('styleupdate', this.handleStyleUpdate);
        }

        handleStyleUpdate = ({ updatedStyles }) => {
            let shouldUpdate = false;

            styleList.forEach((style) => {
                if (style in styleList) {
                    shouldUpdate = true;
                    return false;
                }

                return true;
            });

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
