import React, {Component, Profiler} from 'react';
import {bindActionCreators} from 'redux';
import NewsForm from '../components/Forms/NewsForm';
import LayoutContentWrapper from '../components/utility/layoutWrapper'
import {connect} from 'react-redux';
import * as actions from '../redux/assortment/actions';
import MaterialTable from "material-table";
import Add from '@material-ui/icons/Add';
import AssortmentCard from "../components/AssortmentCard";
import {Link} from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import Input from "@material-ui/core/Input";
import {IconButton, MenuItem, Select} from "@material-ui/core";
import {Button} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import Typography from "@material-ui/core/Typography";
import BrushIcon from "../images/Edit.svg";
import {Form} from "antd";
import PlannableCustomerSelect from "../components/Forms/Components/PlannableCustomerSelect";
import CustomizedDialog from "../components/customizedDialog/CustomizedDialog";
import EmptyCart from "../images/CreateListing.svg";
import {Styled} from '../components/assortment/Assortment.style';
import Paper from "@material-ui/core/Paper";
import TextField from '@material-ui/core/TextField';
import {logProfile} from "../profiler/profiler";

const FormItem = Form.Item;

const cardStyle = {
    width: '100%',
    height: '230px',
    marginBottom: '50px',
    marginTop: '32px',
    position: 'relative',
    backgroundColor: 'transparent'
};

const smallCardStyle = {
    marginBottom: '32px',
    marginTop: '0px',
    backgroundColor: 'transparent',

};

const titlefontStyle = {
    fontFamily: 'Roboto',
    fontSize: '18px',
    fontWeight: '500',
    marginTop: '0.795%',
    marginLeft: '1.59%'
};

const inputLabelStyle = {
    fontFamily: 'Roboto',
    fontSize: '12px',
    color: 'rgba(0,0,0,1)',
    fontWeight: 'normal',
    lineHeight: '122.69%',

};

const buttonStyle = {
    fontWeight: '500',
    fontSize: '12px',
    lineHeight: '14px',
    marginLeft: '73.7%',
    marginTop: '5.7%',
    color: 'rgba(29,161,218, 0.8)',
    position: 'static'

};

const dummyKPIs = ['Volume(Cs)', 'Net Sales', 'GTN[%]', 'Margin[%]'];

const dummyData = [
    {title: '2018 [FY]', 'Volume(Cs)': '4 000k', 'Net Sales': '46 000k', 'GTN[%]': '31.0', 'Margin[%]': '64.0'},
];

class Assortment extends Component {
    constructor(props) {
        super(props);

        this.columns = [

            {
                title: 'Customer Hierarchy Name',
                field: 'description',
                filtering: false,
                render: rowData => <Link
                    to={{pathname: '/direct_trade_assortment', state: {kind: 'POST', assortment_id: rowData.id}}}
                    style={{color: '#4286F4'}}>
                    {rowData.description}
                </Link>
            },
            {
                title: 'Customer Hierarchy Level',
                field: 'level',
                filtering: false
            },
            {
                title: 'My Customers',
                field: 'customer.children.description',
                render: rowData => {
                    let len = rowData.customer.children.length;
                    let cust = [];
                    for (let i = 0; i < len; i++) {
                        cust.push(rowData.customer.children[i].description);
                        if (i < len - 1) {
                            cust.push(", ")
                        }
                    }
                    return (
                        <div>{
                            cust.length ? cust.map((itemTestArray, i) =>
                                (<span key={i}> {itemTestArray} </span>)) : ' '
                        }</div>)
                }
            },
        ];
    }

    componentDidMount() {
        this.props.getAssortments();
    }

    state = {
        current: '',
        btnClicked: false,
        kind: '',
        all_assortments: [],
        description: '',
        body: '',
        sales_org: '',
        selectedRowKeys: [],
        all_customers: [],
        assortment_id: null,
        customer_id: null,
    };

    handleBtnClick = (e) => {
        this.setState({
            btnClicked: !this.state.btnClicked,
            kind: e.target.innerText
        })
    };

    handleClick = (news = '') => {
        this.setState({
            showAssignment: !this.state.showAssignment,
            title: news.title,
            body: news.body,
            id: news.id,
            sales_org: news.sales_org
        })
    };

    handleInputChange(e, type = '') {
        this.setState({
            [type]: e.target.value
        });
    };

    createAssortmentOptions = () => {
        return this.state.all_assortments.map(item =>
            <MenuItem value={item.id} key={item.id}>{item.description}</MenuItem>
        )
    };

    handleDelete = (assignment) => {

        this.props.deleteAssignment(assignment);

        this.setState({
            showAssignment: false,
            current: '',
            btnClicked: false
        })
    };

    handleUpdate = (assignment) => {
        this.props.updateAssignment(assignment);
    };

    handleClose = () => {
        this.setState({
            btnClicked: false,
            showAssignment: this.state.showAssignment
        })
    };

    onChange = (event) => {
        this.setState({assortment_id: event.target.value})
    };

    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {

        if (nextProps.customer !== this.props.customer) {
            this.setState({customer_id: nextProps.customer})
        }

        this.setState({
            all_assortments: nextProps.assortments
        });
    }

    onApply = () => {
        this.props.addAssortment(this.state);
        this.handleClose();
    };

    onSelectChange = selectedRowKeys => {
        this.setState({selectedRowKeys});
    };

    render() {

        const {selectedRowKeys} = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: [
                {
                    key: 'all-data',
                    text: 'Select All Data',
                    onSelect: () => {
                        this.setState({
                            selectedRowKeys: [...Array(46).keys()], // 0...45
                        });
                    },
                },]
        };
        return (
            <LayoutContentWrapper>
                <Profiler id={window.location.pathname} onRender={logProfile}>
                    <Grid container style={cardStyle}>
                        <Grid container direction="row" spacing={4}>
                            <Grid item xs={6} style={smallCardStyle}>
                                <Typography variant="h5" gutterBottom style={{color: 'white'}}>
                                    Recently Updated
                                </Typography>
                                <AssortmentCard
                                    style={{height: '220px'}}
                                    columns={dummyKPIs}
                                    rows={dummyData}
                                />
                            </Grid>
                            <Grid item xs={6} style={smallCardStyle}>
                                <Typography variant="h5" gutterBottom style={{color: 'white'}}>
                                    Expiring Validity Dates
                                </Typography>
                                <AssortmentCard
                                    style={{height: '220px'}}
                                    columns={dummyKPIs}
                                    rows={dummyData}
                                />
                            </Grid>
                        </Grid>

                    </Grid>

                    {/*{this.state.all_assortments.length > 0 ?*/}
                    <MaterialTable
                        components={{
                            Toolbar: props => (
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Grid container justify={'flex-start'}>
                                            <Input id={'tp_search_input'} onKeyUp={this.onSearch} endAdornment={
                                                <InputAdornment position={'end'}>
                                                    <IconButton onClick={this.onSearch}>
                                                        <SearchIcon fontSize={'small'} style={{paddingRight: 3}}/>
                                                    </IconButton>
                                                </InputAdornment>
                                            }/>
                                            <Button style={{color: 'rgba(61,69,81)'}} onClick={this.handleBtnClick}>
                                                <Add fontSize={'small'} fontWeight={'500'}/>
                                                <div style={{color: 'rgba(61,69,81)'}}>
                                                    Create Listing
                                                </div>
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )
                        }}
                        options={{
                            selection: true,
                            headerStyle: {backgroundColor: '#EEE', color: "#000", fontSize: 15},
                            pageSize: 10,
                            rowStyle: (rowData, index) => {
                                if (index % 2) {
                                    return {backgroundColor: "#f2f2f2"}
                                }
                            }
                        }}
                        style={{width: '100%'}}
                        editable={{
                            onRowAdd: newData =>
                                new Promise((resolve, reject) => {
                                    setTimeout(() => {
                                        {
                                            const data = this.state.data;
                                            data.push(newData);
                                            this.setState({data}, () => resolve());
                                        }
                                        resolve()
                                    }, 1000)
                                }),
                        }} rowSelection={rowSelection}
                        pagination={{pageSize: 10, defaultValue: 10, default: 10}} onRow={(record, rowIndex) => {

                    }} data={this.state.all_assortments} columns={this.columns} rowKey={record => record.id}/>
                    {/*: 'No Assortments'}*/}

                    <CustomizedDialog onClose={this.handleClose}
                                      open={this.state.btnClicked}
                                      title={<div style={{fontWeight: 'bold'}}>
                                          Create New Listing
                                      </div>}
                                      img={BrushIcon}
                                      submitText={'Create'}
                                      hideSubmit={this.state.selectedGrid === ''}
                                      onSubmit={this.onApply}>
                        <Styled.CustomizeContent>
                            <img className='content-card-left' src={EmptyCart} alt='Empty Cart Icon'/>
                            <div className='content-card-right'>
                                <div style={{margin: '2rem'}}>
                                    <Form>
                                        <FormItem label='For Customer'>
                                            <PlannableCustomerSelect/>
                                        </FormItem>
                                        <FormItem label='Create from existing'>
                                            {/*<AssortmentsSelect assortmentData={this.state.all_assortments}/>*/}
                                            <FormItem style={{width: '15rem'}}>
                                                <Select id={'cpg-input'}
                                                        disableUnderline={true}
                                                        fullWidth={true}
                                                        displayEmpty={true}
                                                        value={this.state.assortment_id}
                                                        onChange={e => this.onChange(e)}
                                                        style={{border: '1px solid #ced4da',}}
                                                        className='customHeaderText customerSelection'>
                                                    {this.createAssortmentOptions()}
                                                </Select>
                                            </FormItem>
                                        </FormItem>
                                        <FormItem label='Description'>
                                            <TextField style={{width: '300px'}} variant="outlined"
                                                       defaultValue={this.state.description}
                                                       placeholder={'Enter Description'}
                                                       onChange={(e) => this.handleInputChange(e, 'description')}
                                                       id='description'>
                                            </TextField>
                                        </FormItem>
                                    </Form>
                                </div>
                            </div>
                        </Styled.CustomizeContent>
                    </CustomizedDialog>
                </Profiler>
            </LayoutContentWrapper>
        )
    }
}

const mapStateToProps = state => {
    return {
        assortments: state.Assortments.assortments,
        customer: state.PlannableCustomers.selectedCustomer,
    }
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        getAssortments: actions.getAssortmentsAction,
        addAssortment: actions.addAssortmentsAction,
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Assortment)