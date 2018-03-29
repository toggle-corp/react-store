import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../../constants';
import styles from './styles.scss';

const propTypes = {
    active: PropTypes.bool.isRequired,
};

export default class Checkbox extends React.PureComponent {
    static propTypes = propTypes;

    getClassName = () => {
        const { active } = this.props;
        const classNames = [
            'checkbox',
            styles.checkbox,
        ];

        if (active) {
            classNames.push(iconNames.checkbox);
        } else {
            classNames.push(iconNames.checkboxOutlineBlank);
        }

        return classNames.join(' ');
    }

    render() {
        const className = this.getClassName();
        return <span className={className} />;
    }
}

