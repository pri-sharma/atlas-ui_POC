import React, {Component, Fragment} from 'react';
import Typography from '@material-ui/core/Typography';
import {Styled} from './PublishedButton.style';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';

export default class PublishedButton extends Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (<Styled.Published
            color='primary'
            disabled={this.props.changeReady}
            onClick={this.props.handleSaveCB}>
            <SaveOutlinedIcon style={{marginRight: 4}} fontSize='small'/>
            <Typography className='buttonText'>Publish</Typography>
        </Styled.Published>)
    }
}