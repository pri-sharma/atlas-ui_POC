import styled from "styled-components";

const EventHeader = styled.div`
    background-color: rgba(252,252,252, 0.8);
    padding: 0.5rem;
    
    .event-detail-header-left-item {
        margin-right: 1.5rem;
    }
    
    #event-detail-back-button {
        .MuiButton-textPrimary {
            color: ${props => props.theme.palette.sb_black_contrast2};
        }
    }

    .event-detail-external-id {
        color: ${props => props.theme.palette.customize_black};
        font-family: ${props => props.theme.fonts.primary};
        font-style: normal;
        font-weight: normal;
        font-size: 1.25rem;
    }
    
    .event-detail-status-cell {
        min-width: 8rem;
    }
`;

export const Styled = {
    EventHeader,
};