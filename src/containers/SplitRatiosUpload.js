import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import Grid from '@material-ui/core/Grid';
import {AttachFile, Close} from "@material-ui/icons";
import {Chip} from "@material-ui/core";
import actions from "../redux/cuassignment/actions";



class SplitRatiosUpload extends Component {


    constructor(props) {
        super(props);
        this.state = {
            file: null,
            attachments: []
        };

        this.handleAttachments = this.handleAttachments.bind(this, 'attachments', 'files');
    }

    handleAttachments = (name, target, props) => {
        const targetValue = props.target && props.target[target];

        if (targetValue) {
            this.setState({[name]: [...this.state[name], targetValue[0]], file: props.target.files[0]});
        }
    };
    handleChipDelete = (name, chipToDelete, props) => () => {
        const newTarget = this.state[name].filter((value) => value.name !== chipToDelete);
        this.setState({[name]: newTarget, file: null});

    };

    getSplitRatios = () => {
        const formData = new FormData();
        formData.append('file', this.state.file);
        const base_url = process.env.REACT_APP_API_URL;
        fetch(`${base_url}/api/v1/bvp/split_ratio_upload/test/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/csv',
                // 'Content-Disposition': 'attachment',
                'Authorization': 'Bearer ' + localStorage.getItem('idToken')
            },
            body: this.state.file
        })
            .then(res => res.json())
            .catch(err => console.error(err))

}


    render() {
        return (
            <div>

                <Button
                    variant='contained'
                    component='label'
                    style={{justifyContent: 'center', marginLeft: '45%', marginTop: '25%'}}

                    // onClick={this.handleAttachments}
                >
                    Upload File
                    <Input
                        onChange={this.handleAttachments}
                        type='file'
                        key = {(this.state.file)? this.state.file.name : null}
                        // accept='.csv'
                        placeholder='Placeholder'
                        style={{display: "none"}}
                    />

                </Button>

                <div>
                    {
                        (this.state.attachments.length != 0)?
                        this.state.attachments.map(value => (
                            <Chip
                                key={value.name}
                                label={value.name}
                                size='small'
                                style={{
                                    backgroundColor: 'rgba(147,213,241, 0.8)',
                                    color: 'rgba(29,161,218, 0.8)',

                                }}
                                deleteIcon={<Close style={{color: 'rgba(29,161,218, 0.8)'}}/>}
                                onDelete={this.handleChipDelete('attachments', value.name)}
                            />
                        )) : null
                    }
                </div>
                <Button
                    variant='contained'
                    style={{justifyContent: 'center', marginLeft: '45%', marginTop: '5%'}}
                    onClick={this.getSplitRatios}>

                    SEND
                </Button>
            </div>
        )
    }
}

export default SplitRatiosUpload;