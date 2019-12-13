import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';

const AutoGroupCellRenderer = (props => {
    const value = props.valueFormatted || props.value;
    const tooltipText = props.node.rowGroupColumn.getColDef().headerName;

    return (
        <Tooltip title={tooltipText} leaveDelay={100} placement={'top-start'} arrow={true}>
            <span>{value}</span>
        </Tooltip>
    )
});

export default AutoGroupCellRenderer;