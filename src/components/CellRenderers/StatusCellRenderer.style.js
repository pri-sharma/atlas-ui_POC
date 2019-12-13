import React from 'react';
import styled from 'styled-components';

const CustomSelect = styled.div`

    .status_select {
        width: 160px;
        
        // material-ui component override
        .MuiInputBase-inputSelect {
            color: ${props => props.theme.palette.primary_black};
            font-family: ${props => props.theme.fonts.primary};
            font-style: normal;
            font-weight: normal;
            font-size: 14px;
            line-height: 16px;
        }
        .MuiInputBase-inputSelect::before {
            content: '\\25CF';
            font-size: 25px;
            position: relative;
            top: 4px;
            margin-right: 7px;
            color: ${props => props.theme.palette.semantic[props.color]};
        }
    }
`;

export const Styled = {
    CustomSelect,
};
