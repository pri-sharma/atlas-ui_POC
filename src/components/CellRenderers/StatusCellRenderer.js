import React, {Component} from 'react';
import {connect} from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem/index';
import Select from '@material-ui/core/Select';
import * as actions from '../../redux/events/actions';
import {Styled} from './StatusCellRenderer.style';

class StatusCellRenderer extends Component {
    constructor(props){
        super(props);
        this.data = this.props.data;
        this.details = this.data.details;

        this.state = {
            status: props.data.status.technical_name,
            changedStates: []
        };

        this.color = {
            CANCELLED: 'red',
            CORRECTIVEACTIONS: 'yellow',
            PLANNED: 'yellow',
            APPROVED: 'green',
            DRAFTCOPY: 'gray',
            DRAFT: 'gray',
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = (e) => {
        this.setState({
            status: e.target.value
        });
        this.data.status = e.target.value;
        // TODO need to fix these lines and the filter. When the status is changed, the text/color disappear on event container page
        if(!this.details){
            let newState = {'id': this.props.data.id, 'status': e.target.value};
            this.props.api.destroyFilter('status'); //destroys the filter so that when accessing again, updates new values
            this.props.updateStatusChanges(newState);
        }
        else{
            this.props.updateEventChanges({'id': this.props.data.id, 'status': e.target.value})
        }
    };

    render() {
        return (<Styled.CustomSelect color={this.color[this.state.status]}>
            <Select disableUnderline={true}
                    className='status_select'
                    value={this.state.status}
                    onChange={this.handleChange}
                    disabled={!actions.isEventComponentEditable('change_status', this.props.data, this.props.permissionConfig)}
                    >
                {this.props.eventStatuses ? this.props.eventStatuses.map(status =>
                    <MenuItem key={status.technical_name} value={status.technical_name}>{status.description}</MenuItem>
                ): null}
            </Select>
        </Styled.CustomSelect>)
    }
}

const mapStateToProps = state => {
    return {
        pendingStatusChanges: state.Event.pendingStatusChanges,
        permissionConfig: state.PlannableCustomers.permissionConfig,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        updateStatusChanges: (changed) => dispatch(actions.updateStatusChanges(changed)),
        updateEventChanges: (changed) => dispatch(actions.updateEventChanges(changed))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(StatusCellRenderer);