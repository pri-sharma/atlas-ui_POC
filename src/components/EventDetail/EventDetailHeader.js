import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {connect} from 'react-redux';
import React from "react";
import {NavLink} from "react-router-dom";
import StatusCellRenderer from "../CellRenderers/StatusCellRenderer";
import LabeledActionIcon from "../labeledIcon/LabeledActionIcon";
import {Styled} from './EventDetailsHeader.style';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Button from '@material-ui/core/Button';

const EventDetailHeader = props => {
    const {event, statuses, backUrl, setCopyDialogOpen, children} = props;

    return (
        <Styled.EventHeader>
            <Grid container>
                <Grid item xs={6}>
                    <Grid container justify={'flex-start'} alignItems={'center'}>
                        <Grid item className={'event-detail-header-left-item'}>
                            <NavLink id='event-detail-back-button' to={backUrl}>
                                <Button color='primary' size={'small'} startIcon={<ArrowBackIcon/>}>
                                    Back
                                </Button>
                            </NavLink>
                        </Grid>
                        <Grid item className={'event-detail-header-left-item'}>
                            <Typography className={'event-detail-external-id'}>
                                {event.external_id ? event.external_id : 'external_id'}
                            </Typography>
                        </Grid>
                        <Grid item className={'event-detail-header-left-item event-detail-status-cell'}>
                            <StatusCellRenderer
                                eventStatuses={statuses}
                                data={{
                                    details: true,
                                    status: event.status,
                                    id: event.id
                                }}/>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={6}>
                    <Grid container justify={'flex-end'}>
                        <Grid item>
                            <LabeledActionIcon id='copy_tp_detail' icon={'file_copy'} action='Copy Event'
                            actionCB={()=>setCopyDialogOpen(true)}/>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {children}
        </Styled.EventHeader>
    );
};

export default EventDetailHeader;