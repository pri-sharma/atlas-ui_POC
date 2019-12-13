import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button/index';
import MuiDialogTitle from '@material-ui/core/DialogTitle/index';
import Typography from '@material-ui/core/Typography/index';
import MuiDialogActions from '@material-ui/core/DialogActions/index';
import {Modal} from 'antd';



const CustomModal = styled(Modal)`

    // ant component override
    .ant-modal-body {
        padding: 0;
    }
`;

const TitleText = styled(Typography)`
    color: ${props => props.theme.palette.sb_black};
`;

const TitleHeader = styled.div`
    padding-top: 2rem;
    display: grid;
    justify-items: start;
    grid-template-columns: 40px 1fr;
    margin-left: 50px;
    
    .title-text {
        margin-left: 8px;
        color: ${props => props.theme.palette.sb_black};
        font-family: ${props => props.theme.fonts.primary};
        font-style: normal;
        font-weight: 450;
        font-size: 30px;
        line-height: 35px;
        text-transform: capitalize;
    }
`;

const TitleSubheader = styled.div`
    position: relative;
    bottom: 12px;
    left: 42px;
    display: grid;
    justify-items: start;
    width: 200px;
    
    .subtitle-text{
        margin-left: 8px;
        color: #8B96A7;
        font-family: ${props => props.theme.fonts.primary}
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 16px;
        text-align: center;
    }
`;
const DevidedContent = styled.div`
    display: grid;
    position: relative;
    justify-items: start;
    grid-template-columns: auto auto;
    
    .content-card-left {
        width: 390px;
        height: 628px;
        background: linear-gradient(357.61deg, #E9DFFA 9.72%, rgba(233, 223, 250, 0) 108.02%);
    }
    
    .content-card-right {
        width: 650px;
        height: 628px;
    }
`;

const ModalInputs = styled.div`
     position: relative;
     margin-top: 30px;
     margin-left: 50px;
     margin-right: 150px;
     
     .pickers {
        width: 450px;
        margin-bottom: 15px;
    
        // ant component override
        .ant-input::before {
            font-family: 'Material Icons';
            content: 'date_range';
        }
        .ant-input {
            border: 1px solid ${props => props.theme.palette.content_blue_border};
            box-sizing: border-box;
            border-radius: 4px;
        }
        .ant-input, .ant-calendar-range-picker-separator,.ant-calendar-picker-icon {
            color: #8B96A7;
        }  
        .ant-calendar-picker-icon {
            opacity: 0;
        }  
    }
    
    .attachment{
        margin-top: 8px;
        right: 15px;
        
        &&.attach-action-icon,.attach-action-text {
            color: ${props => props.theme.palette.primary};
        }
    }
    .attachment:hover {
         background-color: inherit !important;  
    }
     
`;

const InputLabel = styled(Typography)`
    color: ${props => props.theme.palette.sb_black};
    position: relative;
`;

const ModalButtons = styled(MuiDialogActions)`
     position: relative;
     margin-right: 30px;
`;

const CreateButton = styled(Button)`
    && {
        border-radius: 0;
        padding: .5rem 1.5rem .5rem 1.5rem;
        color: ${props => props.theme.palette.primary_white};
        background-color: ${props => props.theme.palette.primary};
    }
`;

const CancelButton = styled(Button)`
    && {
        border-radius: 0;
        color: ${props => props.theme.palette.sb_black_contrast2};
    }
`;

export const Styled = {
    CustomModal,
    TitleText,
    TitleHeader,
    TitleSubheader,
    DevidedContent,
    ModalInputs,
    InputLabel,
    ModalButtons,
    CancelButton,
    CreateButton,
};