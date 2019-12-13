import React from 'react';
import styled from 'styled-components';
import CardContent from '@material-ui/core/CardContent';

const CustomCard = styled(CardContent)`
    background-color: rgba(252,252,252, 0.8);
    position: relative;
    display: grid;
    
    &&.MuiCardContent-root:last-child {
        padding-bottom: 16px;
    }
    
    #back_tp_detail {
        display: grid;
        align-items: center;
        grid-auto-flow: column;
        padding: 5px 10px;
    
        >.MuiIconButton-colorPrimary {
            padding: 5px;
        }
    
        .back-action-icon,.back-action-text {
            color: ${props => props.theme.palette.sb_black_contrast2};
        }
    }
    
    #attach_tp_detail {
        display: grid;
        align-items: center;
        grid-auto-flow: column;
        width: 12px;
    
        >.MuiIconButton-colorPrimary {
        padding: 5px;
        }
    
        .attach-action-icon,.attach-action-text {
            color: ${props => props.theme.palette.primary};
        }
    }
    
    .back-action-text,.attach-action-text {
        cursor: pointer;
        font-family: ${props => props.theme.fonts.primary};
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 14px;
        text-transform: uppercase;
    }
    
    .external_tp_detail {
        color: ${props => props.theme.palette.customize_black};
        font-family: ${props => props.theme.fonts.primary};
        font-style: normal;
        font-weight: normal;
        font-size: 20px;
        line-height: 23px;
        text-align: center;
    }
    
    .description-input,.tactics-input,.pattern-input {
        margin-top: -8px;
        
        // material-ui component override
        .MuiOutlinedInput-input {  
            color: ${props => props.theme.palette.sb_black_contrast};
            font-family: ${props => props.theme.fonts.primary};
            font-style: normal;
            font-weight: normal;
            font-size: 12px;
            line-height: 24px;
            letter-spacing: 0.15px;
        }
    }
        
    .description-input {
        width: 360px;
        
        // material-ui component override
        .MuiOutlinedInput-notchedOutline {
            top: 1px;
        }
        .MuiOutlinedInput-input {
            position: relative;
            top: 4px;        
        }
    }
    
    .tactics-input,.pattern-input {
        width: 150px;
        overflow: hidden;
        
        // material-ui component override
        .MuiOutlinedInput-notchedOutline {
            bottom: 4px;
            top: 3px; 
        }
        .MuiOutlinedInput-input {
            position: relative;
            top: 3px; 
        }
    }
    
    .tactics-text {
        width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        color: ${props => props.theme.palette.sb_black_contrast};
        font-family: ${props => props.theme.fonts.primary};
        font-style: normal;
        font-weight: normal;
        font-size: 12px;
        line-height: 24px;
        letter-spacing: 0.15px;
    }
    
    .label-text {
        color: ${props => props.theme.palette.customize_black};
        font-family: ${props => props.theme.fonts.primary};
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 14px;
    }
    
    .content-one,.content-two,.content-three {
        padding: 0px 15px;
        white-space: nowrap;
        display: grid;
        align-items: center;
    }
    .content-one {
        grid-template-columns: 100px ${props => props.ext_len}px 1fr 100px;
        padding-left: 0px;
    }
    .content-two {
        grid-template-columns:  360px 1fr 1fr 1fr 150px;
        grid-gap: 15px;
        
        // ant component override
        .ant-input::before {
            font-family: 'Material Icons';
            content: 'date_range';
            font-size: x-large;
            color: ${props => props.theme.palette.primary};
        }
        .ant-input::hover {
            border: 1px solid ${props => props.theme.palette.primary};
        }
        .ant-input {
            color: ${props => props.theme.palette.sb_black};
            font-family: ${props => props.theme.fonts.primary};
            font-style: normal;
            font-weight: normal;
            font-size: 12px;
            line-height: 24px;
            letter-spacing: 0.15px;
        }
        .ant-calendar-range-picker-input {
            position: relative;
            top: -8px;            
        }
        .ant-calendar-picker-icon {
            color: transparent;
        }
    }
    .content-three {
        grid-template-columns:  160px 1fr;
        margin-top: 15px;
    }
`;

export const Styled = {
    CustomCard,
};