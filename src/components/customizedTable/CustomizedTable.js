import React, {Component, Fragment} from 'react';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import RootRef from '@material-ui/core/RootRef';
import Typography from '@material-ui/core/Typography';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import CustomizedDialog from '../customizedDialog/CustomizedDialog';
import LabeledActionIcon from '../labeledIcon/LabeledActionIcon';
import Customize from '../../images/Customize.svg';

export default class CustomizedTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            customizedColumns: [],
            isCustomizeOpen: false,
        };
    }

    /**
     * Customize table checkbox selection handler, sets checked flag in customized columns
     * @param col
     * @returns {Function}
     */
    onCustomizeTableCheck = col => event => {
        const newCols = this.state.customizedColumns.map((obj, idx) => {
            if (obj.id === col.id) {
                obj.checked = !obj.checked;
            }
            return obj;
        });

        this.setState({customizedColumns: newCols});
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
     * Customize table Apply onClick handler, update currentCols, reset the customizedColumns state, and update grid
     */
    onApply = () => {
        this.currentCols = cloneColumns(this.state.customizedColumns);
        this.setState({isCustomizeOpen: false});
        this.props.phTable ? this.props.applyPH(this.currentCols) : this.props.customColDefsCB(this.currentCols);
    };

    /**
     * Customize table button handler, set state to opened and clone copy the currentCols
     * @param event
     */
    onOpen = (event) => {
        if(this.state.customizedColumns.length === 0){
            this.currentCols = cloneColumns(this.props.columns);
            this.setState({isCustomizeOpen: true, customizedColumns: cloneColumns(this.props.columns)})
        }else {
            this.setState({isCustomizeOpen: true});
        }

    };

    /**
     * Customize table button even handler, set state to closed and throw away the customizedColumns state changes
     * @param event
     */
    onCancel = (event) => {
        this.setState({isCustomizeOpen: false, customizedColumns: cloneColumns(this.currentCols)});
    };

    render() {
        return (<Fragment>
                <LabeledActionIcon id='tp_detail_custom_table' icon={'table_chart'} action='Customize Table' actionCB={this.onOpen}/>
                <CustomizedDialog onClose={this.onCancel}
                                  open={this.state.isCustomizeOpen}
                                  img={Customize}
                                  title={'Customize Table'}
                                  submitText={'APPLY'}
                                  onSubmit={this.onApply}>
                    <div style={{margin: '2rem', width: '25rem'}}>
                        <Typography variant={'h6'}>
                            {this.props.phTable ? 'Product Tree' : 'Key Figures'}
                        </Typography>
                        <Paper>
                            {!this.props.phTable ?
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
                                :
                                <List>
                                    {this.state.customizedColumns.map((col) => (
                                        <ListItem dense key={col.id}>
                                            <ListItemIcon>
                                                <Checkbox color={'primary'}
                                                          checked={col.checked}
                                                          onChange={this.onCustomizeTableCheck(col)}/>
                                            </ListItemIcon>
                                            <ListItemText primary={col.value}/>
                                        </ListItem>
                                    ))}
                                </List>
                            }
                        </Paper>
                    </div>
                </CustomizedDialog>
            </Fragment>
        )
    }
}

function cloneColumns(initialCols) {
    return initialCols.map(col => {
        return {...col};
    });
}