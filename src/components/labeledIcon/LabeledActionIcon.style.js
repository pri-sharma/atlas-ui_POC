import React from 'react';
import styled from 'styled-components';

const Labeled = styled.div`
    display: grid;
    align-items: center;
    grid-auto-flow: column;
    padding: 5px 10px;
    
    >.MuiIconButton-colorPrimary {
        padding: 5px;
    }

    .action-icon{
        color: ${props => props.theme.palette.sb_black_contrast};
        font-family: 'Material Icons Outlined';
    }
    
    .action-text {
        cursor: pointer;
        color: ${props => props.theme.palette.sb_black_contrast};
        font-family: ${props => props.theme.fonts.primary};
        font-style: normal;
        font-weight: normal;
        font-size: 14px;
        line-height: 16px;
    }
`;

export const Styled = {
    Labeled,
};