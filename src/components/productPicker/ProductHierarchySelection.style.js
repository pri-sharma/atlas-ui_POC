import React from 'react';
import styled from 'styled-components';

const CustomizeContent = styled.div`
    display: grid;
    justify-items: center;
    padding: 40px 60px 10px;
    
    .content-title-row  {
        font-family: ${props => props.theme.fonts.primary};
        font-style: normal;
        font-weight: 500;
        font-size: 28px;
        line-height: 33px;  
        color: #373737;
    }
    
    .content-subtitle-row {
        font-family: ${props => props.theme.fonts.primary};
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 16px;
        color: #8B96A7;
    }
    
    .content-cards {
        display: grid;
        grid-template-columns: 280px 280px;
        grid-gap: 30px;
        padding-top: 30px;
    
        .content-card-paper {
            padding: 15px;
        }
        
        .content-card-title {
            padding-top: 20px 25px 15px 0px;
            color: ${props => props.theme.palette.customize_black};
            font-family: ${props => props.theme.fonts.primary};
            font-style: normal;
            font-weight: 500;
            font-size: 18px;
            line-height: 21px;
            text-transform: capitalize;
        }
        
        .content-card-line {
            border: 1px solid #D0D5DC;
        }
        
        .content-card-list {
            height: 250px;
        }
        
        .content-card-select {
            background: ${props => props.theme.palette.primary};
            text-align: center;
            border-radius: 0;
            position: relative;
            left: 75px;
            padding-left: 16px;
            padding-right: 16px;
        }
        
        .content-card-select-text {
            color: ${props => props.theme.palette.primary_white};
            font-family: ${props => props.theme.fonts.primary};
            font-style: normal;
            font-weight: 500;
            font-size: 14px;
            line-height: 16px;
            text-align: center;
            letter-spacing: 0.75px;
            text-transform: capitalize;
        }
    }
`;

export const Styled = {
    CustomizeContent,
};