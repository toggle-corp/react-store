import React from 'react';
import {
    _cs,
    bound,
} from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
    progressClassName?: string;
    progress: number;
}

class ProgressBar extends React.PureComponent<Props> {
    public render() {
        const {
            className,
            progressClassName,
            progress,
        } = this.props;

        const progressWidth = `${bound(progress, 0, 100)}%`;

        return (
            <div className={_cs(styles.progressBar, className)}>
                <div
                    style={{
                        width: progressWidth,
                    }}
                    className={
                        _cs(
                            styles.progress,
                            progressClassName,
                            progress === 100 && styles.completed,
                        )
                    }
                />
            </div>
        );
    }
}

export default ProgressBar;
