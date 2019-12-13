import React, {Component, Fragment} from 'react';
import CustomizedDialog from '../customizedDialog/CustomizedDialog';
import ProductIcon from '../../images/Products.svg';
import {connect} from 'react-redux';
import LabeledActionIcon from '../labeledIcon/LabeledActionIcon';
import * as actions from '../../redux/events/actions';
import ProductGrid from './ProductGrid';
import ProductHierarchySelection from './ProductHierarchySelection';

class ProductPicker extends Component{

    constructor(props) {
        super(props);

        this.state = {
            isProductPickerOpen: false,
            selectedGrid: this.props.currentEvent.planning_layout,
            selectedProds: []
        };

        this.columnDefsPPGSKU = [
            {
                headerName: 'Category',
                field: 'category.description',
                colId: 'Category',
                editable: true,
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 0,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'PPG',
                field: 'ppg',
                colId: 'PPG',
                valueFormatter: function (params) {
                    let ppg = params.value || '';
                    let desc = params.node.allLeafChildren[0].data.ppg_desc;
                    desc = (desc) ? desc : ''; // make empty string if null
                    return `${ppg} - ${desc}`;
                },
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 1,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'Status',
                field: 'status',
                filter: true,
                icons: {menu: '<i class="material-icons">filter_list</i>'},
                menuTabs: ['filterMenuTab'],
            },
            {
                headerName: 'UoM',
                field:'sales_uom',
                filter: true,
                icons: {menu: '<i class="material-icons">filter_list</i>'},
                menuTabs: ['filterMenuTab'],
            },
            {
                headerName: 'UPC',
                field:'ean_upc',
                filter: true,
                icons: {menu: '<i class="material-icons">filter_list</i>'},
                menuTabs: ['filterMenuTab'],
            },
            // {
            //     headerName: 'List Price',
            //     filter: true,
            //     menuTabs: ['filterMenuTab'],
            // }
        ];

        this.columnDefsPH = [
            {
                headerName: 'Category',
                field: 'category.description',
                colId: 'Category',
                editable: true,
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 0,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'Subcategory',
                field: 'subcategory.description',
                colId: 'Subcategory',
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 1,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'Subbrand',
                field: 'subbrand.description',
                colId: 'Subbrand',
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 2,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'Variant',
                field: 'variant.description',
                colId: 'Variant',
                filter: true,
                enableRowGroup: true,
                rowGroup: true,
                rowGroupIndex: 3,
                menuTabs: ['filterMenuTab'],
                hide: true,
            },
            {
                headerName: 'Status',
                field: 'status',
                filter: true,
                icons: {menu: '<i class="material-icons">filter_list</i>'},
                menuTabs: ['filterMenuTab'],
            },
            {
                headerName: 'UoM',
                field:'sales_uom',
                filter: true,
                icons: {menu: '<i class="material-icons">filter_list</i>'},
                menuTabs: ['filterMenuTab'],
            },
            {
                headerName: 'UPC',
                field:'ean_upc',
                filter: true,
                icons: {menu: '<i class="material-icons">filter_list</i>'},
                menuTabs: ['filterMenuTab'],
            },
            // {
            //     headerName: 'List Price',
            //     filter: true,
            //     menuTabs: ['filterMenuTab'],
            // }
        ];

        this.onChange = this.onChange.bind(this);
    }

    onChange = (event) => {
        this.props.updateTPEvent({id: this.props.currentEvent.id, planning_layout: event.currentTarget.value});

        this.setState({selectedGrid: event.currentTarget.value});
    };

    shouldComponentUpdate(nextProps, nextState, nextContext){
        return this.props !== nextProps || this.state !== nextState;
    }

        /**
     * Customize table button handler, set state to opened and clone copy the currentCols
     * @param event
     */
    onOpen = (event) => {
        this.setState({isProductPickerOpen: true});
    };

       /**
     * Customize table button even handler, set state to closed and throw away the customizedColumns state changes
     * @param event
     */
    onCancel = (event) => {
        this.setState({
            isProductPickerOpen: false,
            selectedProds: []});
    };

     /**
     * Customize table Apply onClick handler, update currentCols, reset the productPicker state, and update grid
     */
    onApply = () => {
        this.props.onPPChange(this.state.selectedProds);
        this.setState({
            isProductPickerOpen: false,
            selectedProds: []
        });
    };

    deleteProd = (prod_id) => {
        this.props.deleteProd(prod_id);
    };

    selectedProds = (selProds) => {
        this.setState({
            selectedProds: selProds,
        });
    };

    render() {
        return (<Fragment>
                <LabeledActionIcon id='tp_detail_products' icon={'layers'} action='Manage Products'
                                   actionCB={this.onOpen}/>
                {this.state.selectedGrid === '' ?
                    <CustomizedDialog onClose={this.onCancel}
                                      open={this.state.isProductPickerOpen}
                                      hideSubmit={true}>
                    <ProductHierarchySelection changeCallBack={this.onChange}/>
                    </CustomizedDialog>
                    :
                    <CustomizedDialog onClose={this.onCancel}
                                      open={this.state.isProductPickerOpen}
                                      img={ProductIcon}
                                      title={'Manage Products'}
                                      submitText={'APPLY'}
                                      onSubmit={this.onApply}>
                        {this.state.selectedGrid === '1PH' ?
                            <div style={{width: '150vh', height: '70vh'}}>
                                <ProductGrid columnDefs={this.columnDefsPH}
                                             headerName={'1PH'}
                                             selectedProds={this.selectedProds}
                                             deleteProd={this.deleteProd}/>
                            </div>
                            :
                            <div style={{width: '150vh', height: '70vh'}}>
                                <ProductGrid columnDefs={this.columnDefsPPGSKU}
                                             headerName={'Category/PPG/SKU'}
                                             selectedProds={this.selectedProds}
                                             deleteProd={this.deleteProd}/>
                            </div>
                        }
                    </CustomizedDialog>
                }
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        currentEvent: state.Event.currentEvent,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        updateTPEvent: (event) => dispatch(actions.updateTPEvent(event))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductPicker);