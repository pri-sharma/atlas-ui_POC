import React, {Component} from 'react';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import {Styled} from './LabeledActionIcon.style';
import {Typography} from '@material-ui/core';

export default class LabeledActionIcon extends Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (<Styled.Labeled onClick={this.props.actionCB}>
            <IconButton color='primary' component='span'>
                <Icon className='action-icon' style={{color: this.props.color}} fontSize='small'>{this.props.icon}</Icon>
            </IconButton>
            <Typography className='action-text' style={{color: this.props.color}}>
                {this.props.action}
            </Typography>
        </Styled.Labeled>)
    }
}