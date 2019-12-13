import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import LayoutContentWrapper from '../components/utility/layoutWrapper'
import {connect} from 'react-redux';
import FiltersContainer from "./Filters/FiltersContainer";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import AssortmentGrid from "./AssortmentGrid";
import * as assortment_action from "../redux/assortment/actions";


class DirectTradeAssortment extends Component {
    constructor(props){
        super(props);
        this.props.getAssortmentProducts(this.props.location.state.assortment_id);
    }

    state = {
        current: '',
        btnClicked: false,
        kind: '',
        all_news: [],
        title: '',
        body: '',
        sales_org: '',
        selectedRowKeys: [],
        all_assormtents: []
    };

    componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
        this.setState({
            all_assortments: nextProps.assortmentProducts,
        })
    }

    render(){
        return(
            <LayoutContentWrapper className='filteredContent3'>
                <h4 style={{height:'25px', marginTop:'10px', marginLeft:'10px', background:'#FFF', fontSize:'17px'}}>Customer Hierarchy Level 2: Customer 1, Customer 2, Customer 3, Customer 4</h4>
                <FiltersContainer/>

                <Paper className='filteredContainerGrid'>
                    <AssortmentGrid assortment_product_data={this.props.assortmentProducts} assortment_id={this.props.location.state.assortment_id}/>
                </Paper>
            </LayoutContentWrapper>
        )
    }
}

const mapStateToProps = state => {
    return {
        assortmentProducts: state.Assortments.assortment_products
    }
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        getAssortmentProducts: assortment_action.getAssortmentProductAction
    }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(DirectTradeAssortment)