import React, {Component} from 'react';
import {AgGridReact} from 'ag-grid-react';
import {connect} from 'react-redux';
import StatusCellRenderer from '../components/CellRenderers/StatusCellRenderer';
import LinkCellRenderer from '../components/CellRenderers/LinkCellRenderer';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
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
import * as assortment_action from '../redux/assortment/actions';
import CustomizedDialog from '../components/customizedDialog/CustomizedDialog';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';
import {Link} from 'react-router-dom';
import {Styled} from './EventContainerGrid.style';
import CopyIcon from "../images/Copy.png";
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import {InputNumber as InputANTD, Input as InputText} from 'antd';
import LabeledActionIcon from '../components/labeledIcon/LabeledActionIcon';
import Customize from '../images/Customize.svg';
import moment from "./PromoEvent/PromoEventContainer";
import {Button} from "@material-ui/core";
import Add from "@material-ui/core/SvgIcon/SvgIcon";
import AddIcon from "../images/Add.svg";
import {Sync} from "@material-ui/icons";
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import AddMaterialIcon from '@material-ui/icons/Add';
import ReplaceIcon from "../images/Replace.svg";
import DeleteIcon from "../images/Delete.svg";
import CustomLinksHeader from "../components/customGridHeader/CustomLinksHeader";
import Form from '../components/uielements/form';
import Assortments from "../redux/assortment/reducers";
import {IconButton, MenuItem, Select} from "@material-ui/core";

const levels = [{value: 'Day(s)'}, {value: 'Week(s)'}, {value: 'Month(s)'}, {value: 'Quarter(s)'},{value: 'Year(s)'}];
const FormItem = Form.Item;
const { TextArea } = InputText;
let products_list = [];

class AssortmentGrid extends Component {
    constructor(props) {
        super(props);

        this.frameworkComponents = {
            customLinkHeaderComponent: CustomLinksHeader};
        console.log(this.props.assortment_product_data, 'assortment');
        this.state = {
            sku_id: null,
            data_list: [],
            isSelected: false,
            columnDefs: this.defineColumnDefs(),
            rowData: this.props.assortment_product_data,
            frameworkComponents: {
                statusCellRenderer: StatusCellRenderer,
                linkCellRenderer: LinkCellRenderer
            },
            isCustomizeOpen: false,
            customizedColumns: null,
        };
        this.api = null;
        this.columnApi = null;
    }

    defineColumnDefs(){
        return [
            // {
            //     headerCheckboxSelection: true,
            //     // checkboxSelection: true,
            //     suppressMenu: true,
            //     width: 65,
            //     headerHeight: 40,
            // },
            {
                headerName: 'Category',
                field: 'product.category.description',
                colId: 'Category',
                // editable: true,
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 0,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'Subcategory',
                field: 'product.subcategory.description',
                colId: 'Subcategory',
                // editable: true,
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 1,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'PPG',
                field: 'product.ppg',
                colId: 'PPG',
                // editable: true,
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 2,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'Product Number',
                field: 'product.material_number',
                filter: true,
                icons: {menu: '<i class="material-icons">filter_list</i>'},
                menuTabs: ['filterMenuTab'],
                resizable: true
            },
            {
                headerName: 'Non Promoted Retail Price',
                field: 'non_promoted_retail_price',
                editable: true,
                filter: true,
                icons: {menu: '<i class="material-icons">filter_list</i>'},
                menuTabs: ['filterMenuTab'],
                resizable: true
            },
            {
                headerName: 'Future Non-Promo Retail Price',
                field: 'future_non_promoted_retail_price',
                filter: true,
                icons: {menu: '<i class="material-icons">filter_list</i>'},
                menuTabs: ['filterMenuTab'],
                resizable: true
            },
            {
                headerName: 'Future Price',
                field: 'future_price',
                editable: true,
                filter: true,
                icons: {menu: '<i class="material-icons">filter_list</i>'},
                menuTabs: ['filterMenuTab'],
                resizable: true
            },
            {
                headerName: 'Validity Dates',
                field: 'validity_date',
                filter: true,
                icons: {menu: '<i class="material-icons">filter_list</i>'},
                menuTabs: ['filterMenuTab'],
                resizable: true
            }
        ];
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
            if (this.selectedRows[i].status === 'Draft') {
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


    onAddSku = () => {
        this.setState({addSkuElement: true});
    };

    onCopyBtnClick = () => {
        this.setState({copyModal: true});
    };

    onDeleteBtnClick = () => {
        this.setState({deleteModal: true});
    };

    onReplaceBtnClick = () => {
        this.setState({replaceModal: true});
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

    onChangeSku = (event) => {
        let a = [];
        a.push({'assortment_id':this.props.assortment_id, 'product_id':event.target.value, 'valid_from': '2019-12-08', valid_to: '2020-09-12'});
        this.setState({
            sku_id: event.target.value,
            data_list: a
        })
    };

    handleCopy = () => {
        this.selectedRows = this.api.getSelectedRows();
        for (let i = 0; i < this.selectedRows.length; i++) {
            if (this.selectedRows[i]) {
                this.props.copyTPEvent(this.selectedRows[i].id, 'TP', this.state.increment, this.state.level, this.state.copies);
                this.setState({isSelected: false});
            } else {
                this.snackbar.error('Unable to copy a trade promotion'); //required if cancel is not allowed
            }
        }
        this.setState({isCopyOpen: false});

    };

    componentDidMount() {
        this.props.getProductsToAdd(this.props.assortment_id);
    }

    createProductOptions = () => {
        if (this.props.productsToAdd) {
            products_list = this.props.productsToAdd.map(product => {
                return (
                    <option key={product.id} value={product.id}>{product.description + " - " + product.material_number}</option>
                )
            });
        }
    };

    onAddSkuSubmit = () => {
        if(this.state.sku_id){
            this.props.addSku(this.state, this.props.assortment_id)
        }
        else{
            alert("Please select an SKU")
        }
    };

    render() {
        this.createProductOptions();
        return (
            <Styled.GridContent className='ag-theme-material'>
                {this.state.isSelected ?
                    (<Grid container>
                        <Grid item xs={5}>
                            <Grid container justify={'flex-start'}>
                                <Box style={{width: '10rem', margin:'.5rem', align:"center"}}>
                                        {this.api.getSelectedRows().length}{'  '}
                                        Items Selected
                                    </Box>
                            </Grid>
                        </Grid>
                        <Grid item xs={5}>
                            <Grid container justify={'flex-end'}>
                                <LabeledActionIcon id='tp_copy' icon={'file_copy'} action='Copy' actionCB={this.onCopyTable}/>
                                <CustomizedDialog open={this.state.isCopyOpen}
                                             title={<div>
                                                <img src={CopyIcon} style={{paddingRight: 20}}/>
                                                Copy Events
                                             </div>}
                                           cancelText={'CANCEL'}
                                           onCancel={this.onCopyCancel}
                                           onSubmit={this.handleCopy}
                                           submitText={'APPLY'}>
                                    {/*<div>*/}
                                        <div>
                                            <div style={{margin: '1rem', width: '28rem', display: "flex"}}>
                                                <div style={{margin: '1rem', width: '8rem', display: "flex",  fontSize: 'large'}} >
                                                    Shift Dates By
                                                </div>
                                                <div style={{margin: '1rem', width: '5rem', display: "flex"}}>
                                                    <InputANTD defaultValue={this.state.increment} id={'increment'}
                                                               style={{ width: 60,}}
                                                               min={-50} max={50}
                                                               disabled={this.state.disabled}
                                                               onChange={(e) => this.handleChange(e, 'increment')}/>
                                                </div>
                                                <div style={{width: '10rem', display: "flex"}}>
                                                    <TextField
                                                      id={'level'}
                                                      style={{ width: 100}}
                                                      select
                                                      // label="Select"
                                                      value={this.state.level}
                                                      onChange={event => {
                                                        const { value } =event.target;
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
                                                    <div style={{margin: '1rem', width: '8rem', display: "flex",  fontSize: 'large'}} >
                                                        Copies
                                                    </div>
                                                    <div style={{margin: '1rem', width: '5rem', display: "flex"}}>
                                                        <InputANTD defaultValue={this.state.copies} id={'copies'}
                                                                   style={{ width: 60 }}
                                                                   min={0} max={12}
                                                                   disabled={this.state.disabled}
                                                                   onChange={(e) => this.handleChange(e, 'copies')}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    {/*</div>*/}
                                </CustomizedDialog>
                                <LabeledActionIcon id='tp_delete' icon={'delete'} action='Delete' actionCB={this.handleDelete}/>
                            </Grid>
                        </Grid>
                    </Grid>)
                    :
                    (<Grid container>
                        <Grid item xs={6}>
                            <Grid container justify={'flex-start'}>
                                <Input id={'tp_search_input'} onKeyUp={this.onSearch} endAdornment={
                                    <InputAdornment position={'end'}>
                                        <IconButton onClick={this.onSearch}>
                                            <SearchIcon fontSize={'small'} style={{paddingRight: 3}}/>
                                        </IconButton>
                                    </InputAdornment>
                                }/>
                                <Button style={{color: 'rgba(61,69,81)'}} onClick={this.onAddSku}>
                                    <AddMaterialIcon fontSize={'small'} fontWeight={'500'}/>
                                    <td style={{color: 'rgba(61,69,81)'}}>
                                        Add
                                    </td>
                                </Button>

                                <Button style={{color: 'rgba(61,69,81)'}} onClick={this.onReplaceBtnClick}>
                                    <Sync fontSize={'small'} fontWeight={'500'}/>
                                    <td style={{color: 'rgba(61,69,81)'}}>
                                        Replace
                                    </td>
                                </Button>

                                <Button style={{color: 'rgba(61,69,81)'}} onClick={this.onCopyBtnClick}>
                                    <FileCopyOutlinedIcon fontSize={'small'} fontWeight={'500'}/>
                                    <td style={{color: 'rgba(61,69,81)'}}>
                                        Copy
                                    </td>
                                </Button>

                                <Button size={"small"} style={{color: 'rgba(61,69,81)'}} onClick={this.onDeleteBtnClick}>
                                    <DeleteOutlinedIcon fontSize={'small'} fontWeight={'500'}/>
                                    <td style={{color: 'rgba(61,69,81)'}}>
                                        Delete
                                    </td>
                                </Button>
                            </Grid>
                        </Grid>

                        <Grid item xs={6}>
                            <Grid container justify={'flex-end'}>
                                <LabeledActionIcon id='tp_custom_table' icon={'table_chart'} action='Customize Table' actionCB={this.onCustomizeTable}/>
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

                                {/*HERE*/}
                                <CustomizedDialog onClose={() => this.setState({addSkuElement: false})}
                                                  open={this.state.addSkuElement}
                                                  img={AddIcon}
                                                  title={'Add Products'}
                                                  submitText={'APPLY'}
                                                  onSubmit={this.onAddSkuSubmit}>
                                    <div style={{margin: '2rem', width: '25rem'}}>
                                        {/*<Typography variant={'h6'}>*/}
                                        {/*    Rows*/}
                                        {/*</Typography>*/}
                                        <Paper>
                                            <Form>
                                                <FormItem label='SKU'>
                                                    <Select disableUnderline={true}
                                                        fullWidth={true}
                                                        displayEmpty={true}
                                                        value={this.state.sku_id}
                                                        onChange={e => this.onChangeSku(e)}
                                                        style={{border: '1px solid #ced4da',}}
                                                        className='customHeaderText customerSelection'>
                                                        {products_list}
                                                    </Select>
                                                </FormItem>
                                                <FormItem label='Validity Start'>
                                                    <Input defaultValue={this.state.title} placeholder={'Enter Validity Start Date'} onChange={(e) => this.handleInputChange(e, 'title')} id='title'>
                                                    </Input>
                                                </FormItem>
                                                <FormItem label='Validity End'>
                                                    <Input defaultValue={this.state.body} placeholder={'Enter Validity End Date'} onChange={(e) => this.handleInputChangeDescription(e, 'body')} id='body'>
                                                    </Input>
                                                </FormItem>
                                            </Form>
                                        </Paper>
                                    </div>
                                </CustomizedDialog>

                                <CustomizedDialog onClose={() => this.setState({copyModal: false})}
                                                  open={this.state.copyModal}
                                                  img={CopyIcon}
                                                  title={'Copy Products'}
                                                  submitText={'APPLY'}
                                                  onSubmit={this.onCustomizeTableApply}>
                                    <div style={{margin: '2rem', width: '25rem'}}>
                                        <Typography variant={'h6'}>
                                            Rows
                                        </Typography>
                                        <Paper>
                                            <DragDropContext onDragEnd={this.onDragEnd}>
                                                <Droppable droppableId="droppable">
                                                    {(provided, snapshot) => (
                                                        <RootRef rootRef={provided.innerRef}>
                                                            <List>
                                                                {this.state.customizedColumns.map((kfg, index) => (
                                                                    (kfg.id !== 'material_number') ?
                                                                        <Draggable key={kfg.id}
                                                                                   draggableId={kfg.id}
                                                                                   index={index}
                                                                                   isDragDisabled={!kfg.checked}>
                                                                            {(provided, snapshot) => (
                                                                                <ListItem dense
                                                                                          ContainerComponent="li"
                                                                                          ref={provided.innerRef}
                                                                                          {...provided.draggableProps}
                                                                                          {...provided.dragHandleProps}
                                                                                          style={{...snapshot.isDragging, ...provided.draggableProps.style}}>
                                                                                    <ListItemIcon>
                                                                                        <Checkbox color='primary'
                                                                                            onChange={this.onCustomizeTableCheck(kfg)}
                                                                                            checked={kfg.checked}/>
                                                                                    </ListItemIcon>
                                                                                    <ListItemText
                                                                                        primary={kfg.value}/>
                                                                                    {(kfg.checked) ?
                                                                                        <ListItemIcon>
                                                                                            <DragIndicatorIcon/>
                                                                                        </ListItemIcon>
                                                                                        : null}
                                                                                </ListItem>
                                                                            )}
                                                                        </Draggable> : null
                                                                ))}
                                                                {provided.placeholder}
                                                                <ListItem dense>
                                                                    <ListItemIcon>
                                                                        <Checkbox color='primary'
                                                                            checked={true}
                                                                            disabled={true}/>
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={'SKU'}/>
                                                                </ListItem>
                                                            </List>
                                                        </RootRef>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>
                                        </Paper>
                                    </div>
                                </CustomizedDialog>

                                <CustomizedDialog onClose={() => this.setState({replaceModal: false})}
                                                  open={this.state.replaceModal}
                                                  img={ReplaceIcon}
                                                  title={'Replace Products'}
                                                  submitText={'APPLY'}
                                                  onSubmit={this.onCustomizeTableApply}>
                                    <div style={{margin: '2rem', width: '25rem'}}>
                                        <Typography variant={'h6'}>
                                            Rows
                                        </Typography>
                                        <Paper>
                                            <DragDropContext onDragEnd={this.onDragEnd}>
                                                <Droppable droppableId="droppable">
                                                    {(provided, snapshot) => (
                                                        <RootRef rootRef={provided.innerRef}>
                                                            <List>
                                                                {this.state.customizedColumns.map((kfg, index) => (
                                                                    (kfg.id !== 'material_number') ?
                                                                        <Draggable key={kfg.id}
                                                                                   draggableId={kfg.id}
                                                                                   index={index}
                                                                                   isDragDisabled={!kfg.checked}>
                                                                            {(provided, snapshot) => (
                                                                                <ListItem dense
                                                                                          ContainerComponent="li"
                                                                                          ref={provided.innerRef}
                                                                                          {...provided.draggableProps}
                                                                                          {...provided.dragHandleProps}
                                                                                          style={{...snapshot.isDragging, ...provided.draggableProps.style}}>
                                                                                    <ListItemIcon>
                                                                                        <Checkbox color='primary'
                                                                                            onChange={this.onCustomizeTableCheck(kfg)}
                                                                                            checked={kfg.checked}/>
                                                                                    </ListItemIcon>
                                                                                    <ListItemText
                                                                                        primary={kfg.value}/>
                                                                                    {(kfg.checked) ?
                                                                                        <ListItemIcon>
                                                                                            <DragIndicatorIcon/>
                                                                                        </ListItemIcon>
                                                                                        : null}
                                                                                </ListItem>
                                                                            )}
                                                                        </Draggable> : null
                                                                ))}
                                                                {provided.placeholder}
                                                                <ListItem dense>
                                                                    <ListItemIcon>
                                                                        <Checkbox color='primary'
                                                                            checked={true}
                                                                            disabled={true}/>
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={'SKU'}/>
                                                                </ListItem>
                                                            </List>
                                                        </RootRef>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>
                                        </Paper>
                                    </div>
                                </CustomizedDialog>

                                <CustomizedDialog onClose={() => this.setState({deleteModal: false})}
                                                  open={this.state.deleteModal}
                                                  img={DeleteIcon}
                                                  title={'Delete Products'}
                                                  submitText={'APPLY'}
                                                  onSubmit={this.onCustomizeTableApply}>
                                    <div style={{margin: '2rem', width: '25rem'}}>
                                        <Typography variant={'h6'}>
                                            Rows
                                        </Typography>
                                        <Paper>
                                            <DragDropContext onDragEnd={this.onDragEnd}>
                                                <Droppable droppableId="droppable">
                                                    {(provided, snapshot) => (
                                                        <RootRef rootRef={provided.innerRef}>
                                                            <List>
                                                                {this.state.customizedColumns.map((kfg, index) => (
                                                                    (kfg.id !== 'material_number') ?
                                                                        <Draggable key={kfg.id}
                                                                                   draggableId={kfg.id}
                                                                                   index={index}
                                                                                   isDragDisabled={!kfg.checked}>
                                                                            {(provided, snapshot) => (
                                                                                <ListItem dense
                                                                                          ContainerComponent="li"
                                                                                          ref={provided.innerRef}
                                                                                          {...provided.draggableProps}
                                                                                          {...provided.dragHandleProps}
                                                                                          style={{...snapshot.isDragging, ...provided.draggableProps.style}}>
                                                                                    <ListItemIcon>
                                                                                        <Checkbox color='primary'
                                                                                            onChange={this.onCustomizeTableCheck(kfg)}
                                                                                            checked={kfg.checked}/>
                                                                                    </ListItemIcon>
                                                                                    <ListItemText
                                                                                        primary={kfg.value}/>
                                                                                    {(kfg.checked) ?
                                                                                        <ListItemIcon>
                                                                                            <DragIndicatorIcon/>
                                                                                        </ListItemIcon>
                                                                                        : null}
                                                                                </ListItem>
                                                                            )}
                                                                        </Draggable> : null
                                                                ))}
                                                                {provided.placeholder}
                                                                <ListItem dense>
                                                                    <ListItemIcon>
                                                                        <Checkbox color='primary'
                                                                            checked={true}
                                                                            disabled={true}/>
                                                                    </ListItemIcon>
                                                                    <ListItemText primary={'SKU'}/>
                                                                </ListItem>
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
                    rowSelection={'multiple'}
                    groupSelectsChildren={true}
                    onRowSelected={this.isChecked}
                    // isRowSelectable={this.selectPrevProds}
                    suppressRowClickSelection={true}
                    rowData={this.props.assortment_product_data}
                    pagination={true}
                    getRowHeight={() => {
                        return 40
                    }}
                    onFirstDataRendered={(params) => {
                        params.api.sizeColumnsToFit();
                    }}
                    getRowStyle={(params) => {
                        let color = params.node.rowIndex % 2 !== 0 ? '#EBEDF0' : '#fff';
                        return {'background-color': color}

                    }}
                    autoGroupColumnDef={{
                        headerName: 'Category/Subcategory/PPG/SKU',
                        cellRendererParams: {
                            checkbox: true,
                        },
                        menuTabs: ['filterMenuTab'],
                        icons: {menu: '<i class="material-icons">filter_list</i>'},
                        resizable: true,
                        field:'product.sku'
                    }}
                    frameworkComponents={this.state.frameworkComponents}

                />
                <CustomizedSnackbar ref={el => this.snackbar = el}/>
            </Styled.GridContent>
        )
    }
}

const mapStateToProps = state => {
    return {
        currentTab: state.App.currentTab,
        singleSkuData: state.Assortments.assortment_products,
        productsToAdd: state.Assortments.products_to_add,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        deleteTPEvent: (event_id) => dispatch(action.deleteEvent(event_id, 'TP')),
        copyTPEvent: (event_id, event_type, increment, level, copies) => dispatch(action.copyEvent(event_id,  'TP', increment, level, copies)),
        addSku: (sku, assortment_id) => dispatch(assortment_action.addAssortmentProductsAction(sku, assortment_id)),
        getProductsToAdd: (assortment_id) => dispatch(assortment_action.getProductsNotInAssortmtentAction(assortment_id))
    }

};

export default connect(mapStateToProps, mapDispatchToProps)(AssortmentGrid);
