import React, {Fragment} from 'react';
import {Link} from '@material-ui/core';

const CustomLinksHeader = (props => {
    const {displayName, api} = props;

    const expandRow = (event) => {
        let index = 4;
        api.forEachNode((node) => {
            node.expanded = true;
            if (node.group && node.rowGroupColumn.getColDef().headerName === event.currentTarget.innerText) {
                index = node.rowGroupIndex;
                node.expanded = false
            } else if (node.group && node.rowGroupIndex > index){
                node.expanded = false
            }
        });
        api.onGroupExpandedOrCollapsed()
    };

    const DisplayCustomLink = () => {
        let displayArray = [];
        if(displayName === '1PH') {
            displayArray = ['Category', 'Subcategory', 'Subbrand', 'Variant', 'SKU'];
        } else {
            displayArray = displayName.split('/');
        }
        const displayLength = displayArray.length - 1;
        return (<div>
            {displayArray.map((link, i) => (
                <Fragment key={link+i}><Link onClick={expandRow}>{link}</Link>{i === displayLength ? '' : ' / '}</Fragment>))}
        </div>);
    };

    return (
        <div className='ag-header-group-cell-label'>
            <div className='customHeaderLabel'>
                <DisplayCustomLink/>
            </div>
        </div>
    );
});

export default CustomLinksHeader