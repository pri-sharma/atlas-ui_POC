import styled from 'styled-components';

const ContentHolder = styled.div`
    
.customContent {
    background: linear-gradient(to bottom, ${props => props.theme.palette.tb_blue} 244px, 
        ${props => props.theme.palette.content_white} 0%);
        overflow: auto;
        height: 100vh;
        
    .newContent {
        padding-top: 50px;
    }
    
    .filteredContent {
        padding: 300px 30px 0px 30px;
        display: grid;
        align-items: end;
        justify-items: stretch;
        grid-gap: 4px;
        grid-template-rows: 1fr 10fr;
    }
        
    .filteredGrid {
        height: 55vh !important;
    }
    
    .filteredContainerGrid {
        height: 59vh !important;
    }

    .filteredContent2 {
        background: ${props => props.theme.palette.content_white};
        padding: 74px 30px 10px 30px;
        display: grid;
        align-items: end;
        justify-items: stretch;
        grid-gap: 120px;
        grid-template-rows: 2fr auto;
        
        >.MuiCard-root {
            overflow: unset;
        }
    }
    
    .filteredContent3 {
        background: ${props => props.theme.palette.content_white};
        padding: 74px 30px 10px 30px;
        display: grid;
        align-items: end;
        justify-items: stretch;
        grid-gap: 10px;
        grid-template-rows: 2fr auto;
        
        >.MuiCard-root {
            overflow: unset;
        }
    }
}
`;

export const Styled = {
    ContentHolder,
};
