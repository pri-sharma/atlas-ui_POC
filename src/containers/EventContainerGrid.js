import React, {Component} from 'react';
import {AgGridReact} from 'ag-grid-react';
import {connect} from 'react-redux';
import StatusCellRenderer from '../components/CellRenderers/StatusCellRenderer';
import LinkCellRenderer from '../components/CellRenderers/LinkCellRenderer';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import RootRef from '@material-ui/core/RootRef';
import Typography from '@material-ui/core/Typography';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import SearchIcon from '@material-ui/icons/Search';
import CustomizedSnackbar from '../components/CustomizedSnackbar';
import * as action from '../redux/events/actions';
import CustomizedDialog from '../components/customizedDialog/CustomizedDialog';
import CreateEvent from '../components/createEvent/createEvent';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {Link} from 'react-router-dom';
import {Styled} from './EventContainerGrid.style';
import CopyIcon from "../images/Copy.png";
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import {InputNumber as InputANTD} from 'antd';
import LabeledActionIcon from '../components/labeledIcon/LabeledActionIcon';
import Customize from '../images/Customize.svg';
import {CircularProgress} from '@material-ui/core';

const levels = [{value: 'Day(s)'}, {value: 'Week(s)'}, {value: 'Month(s)'}, {value: 'Quarter(s)'},{value: 'Year(s)'}];

class EventContainerGrid extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isSelected: false,
            columnDefs: this.props.columnDefs,
            rowData: this.props.data,
            frameworkComponents: {
                statusCellRenderer: StatusCellRenderer,
                linkCellRenderer: LinkCellRenderer
            },
            isCustomizeOpen: false,
            customizedColumns: null,
            increment: '0',
            level: 'Day(s)',
            copies: '0'
        };
        this.api = null;
        this.columnApi = null;
        this.selectedRows = [];
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // get plannable customers when user is updated
        if (prevProps.user !== this.props.user) {
            this.props.getPlannableCustomers(this.props.user);
        }
    }

    handleDelete = () => {
        this.selectedRows = this.api.getSelectedRows();
        for (let i = 0; i < this.selectedRows.length; i++) {
            if (this.selectedRows[i].status.description === 'Draft') {
                this.props.deleteTPEvent(this.selectedRows[i].id, 'TP');
                this.setState({isSelected: false});
            } else {
                this.snackbar.error('Unable to delete a trade promotion whose status is not Draft');
            }
        }

    };

    isChecked = () => {
        if (this.api.getSelectedRows().length > 0) {
            this.setState({isSelected: true});
        } else {
            this.setState({isSelected: false});
        }
    };

    /**
     * Initialize customized columns based on columns of the grid TODO: do this for key figure columns only, dont forget to change logic of drag and drop idx+1
     * @returns {Array}
     */
    getCustomizedColumns = () => {
        const colsArr = [];
        // shouldComponentUpdate(nextProps, nextState, nextContext) {
        //     if (nextProps.data !== this.props.data || nextState !== this.state) {
        //         this.state.rowData = nextProps.data;
        //         return true
        //     }
        //     return true;
        //
        // }

        this.columnApi.getAllGridColumns().forEach((col) => {
            if (!col.getColDef().checkboxSelection) { // dont care about checkbox column
                const colObj = {id: col.getColId(), value: col.getColDef().headerName, checked: col.isVisible()};
                colsArr.push(colObj);
            }
        });
        return colsArr;
    };

    /**
     * Drag and drop event handler, created a new customized columns list to reflect the updated order
     * @param result
     */
    onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const newList = [...this.state.customizedColumns];
        const [removed] = newList.splice(result.source.index, 1);
        newList.splice(result.destination.index, 0, removed);

        this.setState({customizedColumns: newList});
    };

    /**
     * Customize table button even handler, set state to opened
     * @param event
     */
    onCustomizeTable = (event) => {
        this.setState({isCustomizeOpen: true});
    };

    /**
     * Customize table checkbox selection handler, sets checked flag in customized columns
     * @param col
     * @returns {Function}
     */
    onCustomizeTableCheck = col => event => {
        const newCols = this.state.customizedColumns.map((obj, idx) => {
            if (obj.value === col.value) {
                obj.checked = !obj.checked;
            }
            return obj;
        });
        this.setState({customizedColumns: newCols});
    };

    /**
     * Customize table Apply onClick handler, hides and orders columns
     */
    onCustomizeTableApply = () => {
        this.state.customizedColumns.forEach((obj, idx) => {
            this.columnApi.moveColumn(obj.id, idx + 1); // idx + 1 to ignore checkbox column
            this.columnApi.setColumnVisible(obj.id, obj.checked); // column visibility
        });
        this.setState({isCustomizeOpen: false});
    };

    /**
     * Resize all columns to minimum width
     * @param params
     */
    onDataFirstRendered = (params) => {
        params.columnApi.autoSizeColumns(['2', '3', '4']);
        params.api.setHeaderHeight(38)
    };

    /**
     * Set instance references to ag grid apis, initialize customized columns for Customize Table
     * @param params
     */
    onGridReady = (params) => {
        this.api = params.api;
        this.columnApi = params.columnApi;
        this.setState({customizedColumns: this.getCustomizedColumns()});
    };

    onSearch = (event) => {
        if (event.type === 'click' || event.keyCode === 13) {
            this.api.setQuickFilter(document.getElementById('tp_search_input').value);
        }
    };

    /**
     * Copy promos & container
     */
    onCopyTable = (event) => {
        this.setState({isCopyOpen: true});
    };

    onCopyCancel = (event) => {
        this.setState({isCopyOpen: false,
                                  level: 'Day(s)',
                                 increment:'0',
                                    copies:'0'})
    };

    toggle = () => {
        this.setState({
            disabled: !this.state.disabled,
        });
    };

    handleChange = (value, state_value) => {
        if (state_value === 'increment') {
            this.setState({
                [state_value]: value
            });

            } else if (state_value === 'copies') {
                this.setState({
                    copies: value,
            });
        }
    };

    onChange = (value) => {
        console.log('changed', value);
     };

    handleCopy = () => {
        this.selectedRows = this.api.getSelectedRows();
        for (let i = 0; i < this.selectedRows.length; i++) {
            if (this.selectedRows[i]) {
                this.props.copyTPEvent(this.selectedRows[i].id, 'TP', this.state.increment, this.state.level, this.state.copies);
                // this.setState({isSelected: false});
            }
        }
        this.setState({isCopyOpen: false,
                                  level: 'Day(s)',
                                 increment:'0',
                                    copies:'0'})
    };


    render() {
        if (this.props.eventPending) {
            return (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh'}}>
                    <CircularProgress/>
                </div>
            );
        } else {
            return (
                <Styled.GridContent className='ag-theme-material'>
                    {this.state.isSelected ?
                        (<Grid container style={{backgroundColor: '#116183', color: '#FCFCFC'}}>
                            <Grid item xs style={{marginTop: 5}}>
                                <Grid container justify={'flex-start'}>
                                    <Box style={{width: '10rem', margin: '.5rem', align: "center"}}>
                                        {this.api.getSelectedRows().length}{'  '}
                                        Items Selected
                                    </Box>
                                </Grid>
                            </Grid>
                            <Grid item xs style={{marginRight: 15}}>
                                <Grid container justify={'flex-end'}>
                                    <LabeledActionIcon id='tp_copy' icon={'file_copy'} action='Copy'
                                                       actionCB={this.onCopyTable} color={'#FCFCFC'}/>
                                    <CustomizedDialog open={this.state.isCopyOpen}
                                                      title={'Copy Events'}
                                                      img={CopyIcon}
                                                      closeText={'CANCEL'}
                                                      onClose={this.onCopyCancel}
                                                      onSubmit={this.handleCopy}
                                                      submitText={'APPLY'}>
                                        <div>
                                            <div style={{margin: '1rem', width: '28rem', display: "flex"}}>
                                                <div style={{
                                                    margin: '1rem',
                                                    width: '8rem',
                                                    display: "flex",
                                                    fontSize: 'large'
                                                }}>
                                                    Shift Dates By
                                                </div>
                                                <div style={{margin: '1rem', width: '5rem', display: "flex"}}>
                                                    <InputANTD defaultValue={this.state.increment} id={'increment'}
                                                               style={{width: 60,}}
                                                               min={-52} max={52}
                                                               disabled={this.state.disabled}
                                                               onChange={(e) => this.handleChange(e, 'increment')}/>
                                                </div>
                                                <div style={{width: '10rem', display: "flex"}}>
                                                    <TextField
                                                        id={'level'}
                                                        style={{width: 100}}
                                                        select
                                                        // label="Select"
                                                        value={this.state.level}
                                                        onChange={event => {
                                                            const {value} = event.target;
                                                            this.setState({level: value});
                                                        }}
                                                        SelectProps={{
                                                            MenuProps: {
                                                                width: 100,
                                                            },
                                                        }}
                                                        margin="normal">
                                                        {levels.map(option => (
                                                            <MenuItem key={option.value} value={option.value}>
                                                                {option.value}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{margin: '1rem', width: '28rem', display: "flex"}}>
                                                    <div style={{
                                                        margin: '1rem',
                                                        width: '8rem',
                                                        display: "flex",
                                                        fontSize: 'large'
                                                    }}>
                                                        Copies
                                                    </div>
                                                    <div style={{margin: '1rem', width: '5rem', display: "flex"}}>
                                                        <InputANTD defaultValue={this.state.copies} id={'copies'}
                                                                   style={{width: 60}}
                                                                   min={0} max={12}
                                                                   disabled={this.state.disabled}
                                                                   onChange={(e) => this.handleChange(e, 'copies')}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/*</div>*/}
                                    </CustomizedDialog>
                                    <LabeledActionIcon id='tp_delete' icon={'delete'} action='Delete'
                                                       actionCB={this.handleDelete} color={'#FCFCFC'}/>
                                </Grid>
                            </Grid>
                        </Grid>)
                        :
                        (<Grid container>
                            <Grid item xs>
                                <Grid container justify={'flex-start'}>
                                    <Input id={'tp_search_input'} onKeyUp={this.onSearch} endAdornment={
                                        <InputAdornment position={'end'}>
                                            <IconButton onClick={this.onSearch}>
                                                <SearchIcon fontSize={'small'} style={{paddingRight: 3}}/>
                                            </IconButton>
                                        </InputAdornment>
                                    }/>
                                    <CreateEvent eventType={this.props.eventType}/>
                                </Grid>
                            </Grid>

                            <Grid item xs={6}>
                                <Grid container justify={'flex-end'}>
                                    <LabeledActionIcon id='tp_custom_table' icon={'table_chart'}
                                                       action='Customize Table' actionCB={this.onCustomizeTable}/>
                                    <CustomizedDialog onClose={() => this.setState({isCustomizeOpen: false})}
                                                      open={this.state.isCustomizeOpen}
                                                      img={Customize}
                                                      title={'Customize Table'}
                                                      submitText={'APPLY'}
                                                      onSubmit={this.onCustomizeTableApply}>
                                        <div style={{margin: '2rem', width: '25rem'}}>
                                            <Typography variant={'h6'}>
                                                Key Figures
                                            </Typography>
                                            <Paper>
                                                <DragDropContext onDragEnd={this.onDragEnd}>
                                                    <Droppable droppableId='droppable'>
                                                        {(provided, snapshot) => (
                                                            <RootRef rootRef={provided.innerRef}>
                                                                <List>
                                                                    {this.state.customizedColumns.map((col, index) => (
                                                                        <Draggable key={col.id}
                                                                                   draggableId={col.id}
                                                                                   index={index}>
                                                                            {(provided, snapshot) => (
                                                                                <ListItem dense
                                                                                          ContainerComponent='li'
                                                                                          ref={provided.innerRef}
                                                                                          {...provided.draggableProps}
                                                                                          {...provided.dragHandleProps}
                                                                                          style={{...snapshot.isDragging, ...provided.draggableProps.style}}>
                                                                                    <ListItemIcon>
                                                                                        <Checkbox color='primary'
                                                                                                  onChange={this.onCustomizeTableCheck(col)}
                                                                                                  checked={col.checked}/>
                                                                                    </ListItemIcon>
                                                                                    <ListItemText
                                                                                        primary={col.value}/>
                                                                                    <ListItemIcon>
                                                                                        <DragIndicatorIcon/>
                                                                                    </ListItemIcon>
                                                                                </ListItem>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                    {provided.placeholder}
                                                                </List>
                                                            </RootRef>
                                                        )}
                                                    </Droppable>
                                                </DragDropContext>
                                            </Paper>
                                        </div>
                                    </CustomizedDialog>
                                </Grid>
                            </Grid>
                        </Grid>)}

                    <AgGridReact
                        reactNext={true}
                        onGridReady={this.onGridReady}
                        columnDefs={this.state.columnDefs}
                        onFirstDataRendered={this.onDataFirstRendered}
                        rowSelection={'multiple'}
                        onRowSelected={this.isChecked}
                        suppressRowClickSelection={true}
                        rowData={this.props.data}
                        pagination={true}
                        frameworkComponents={this.state.frameworkComponents}
                        getRowHeight={(params) => {
                            return 40
                        }}
                        getRowStyle={(params) => {
                            let color = params.node.rowIndex % 2 !== 0 ? '#F5F7FA' : '#fff';
                            return {'background-color': color}

                        }}
                    />
                    <CustomizedSnackbar ref={el => this.snackbar = el}/>
                </Styled.GridContent>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        currentTab: state.App.currentTab,
        eventPending: state.Event.getEventPending,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        deleteTPEvent: (event_id) => dispatch(action.deleteEvent(event_id, 'TP')),
        copyTPEvent: (event_id, event_type, increment, level, copies) => dispatch(action.copyEvent(event_id, 'TP', increment, level, copies)),
    }

};

export default connect(mapStateToProps, mapDispatchToProps)(EventContainerGrid);