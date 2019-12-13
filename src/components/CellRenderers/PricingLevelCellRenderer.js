import React, {Component} from 'react';
import {connect} from 'react-redux';
import MenuItem from "@material-ui/core/MenuItem/index";
import Select from "@material-ui/core/Select/index";
import * as actions from '../../redux/events/actions';

class PricingLevelCellRenderer extends Component {
    constructor(props){
        super(props);
        if(!this.props.node.isRowPinned() && this.props.node.rowGroupIndex === 0){
            this.state = {
                pricing_level: this.props.node.allLeafChildren['0'].data.pricing_level, //gets the pricing_level form first sku child since all skus will have the same value
                parent_pricing: null
            };
            this.props.node.pricing_level = this.state.pricing_level;
        }else if(!this.props.node.allChildrenCount && !this.props.node.isRowPinned()){ // In case PricingLevelCellRenderer is called in PPG row (allChildrenCount != null)
            this.data = this.props.data;
            this.state = {
                pricing_level: this.data.pricing_level,
                parent_pricing: this.props.node.parent.pricing_level,
                };
        }else if(!this.props.node.isRowPinned()){
            this.state = {
                pricing_level: this.props.node.allLeafChildren[0].data.pricing_level,
                parent_pricing: true
            }
        }

        this.options = {
            'PPG': ['PPG', 'SKU'],
            'SKU': ['PPG', 'SKU'],
            'CATEGORY': ['CATEGORY', 'SUBCATEGORY'],
            'SUBCATEGORY': ['CATEGORY', 'SUBCATEGORY']
        }
    }

    handleChange = (e) => {
            this.setState({
                pricing_level: e.target.value
            });

            let changedRows = {'pricing_level': {}, 'id': this.props.node.allLeafChildren[0].data.eventplan};
            changedRows['pricing_level'][e.target.value] = [];
            for (let i = 0; i < this.props.node.allLeafChildren.length; i++) {
                changedRows['pricing_level'][e.target.value] = [...changedRows['pricing_level'][e.target.value], this.props.node.allLeafChildren[i].data.id]
            }
            this.props.updateEventChanges(changedRows) //updates pricing_level in all child skus

        };

    createMenuOptions = (options) => {
        return options.map(option => {
            return <MenuItem key={option} value={option}>{option}</MenuItem>
        })
    };

    render(){
        if(!this.props.node.isRowPinned()){ //do not render when top pinned row
            if(this.state.parent_pricing === null){ //do not render for every sku, just for ppg row
                return(
                        <Select id={'pricing_level_select'} disableUnderline={true} value={this.state.pricing_level}
                                onChange={this.handleChange.bind(this)}>
                            {this.createMenuOptions(this.options[this.state.pricing_level])}
                        </Select>
                    )
            }

        }
        return null
    }
}

const mapDispatchToProps = dispatch => {
    return {
        updateEventChanges: (changes) => dispatch(actions.updateEventChanges(changes))
    }
};


export default connect(null, mapDispatchToProps)(PricingLevelCellRenderer);

