import styled from 'styled-components';

const DetailContent = styled.div`
    .bsp-detail-item {
        margin-right: 1rem;
    }
    
    .bsp-detail-input {
        margin-top: -1px;
        width: 360px;
        
        // material-ui component override
        .MuiOutlinedInput-notchedOutline {
            top: -4px;
            bottom: 4px;
        }
        .MuiOutlinedInput-input {
            position: relative;
            top: -2px;    
            color: ${props => props.theme.palette.sb_black_contrast};
            font-family: ${props => props.theme.fonts.primary};
            font-style: normal;
            font-weight: normal;
            font-size: 12px;
            line-height: 24px;
            letter-spacing: 0.15px;
        }
    }
    
    .bsp-detail-container {
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
            font-size: 0.85rem;
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
    
    .bsp-label-text {
        color: ${props => props.theme.palette.customize_black};
        font-family: ${props => props.theme.fonts.primary};
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 14px;
    }
`;

export const Styled = {
    DetailContent,
};