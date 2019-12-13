import React from 'react';
import styled from 'styled-components';
import {Button} from '@material-ui/core';
import {KeyboardArrowUp} from '@material-ui/icons';

const CollapsedButton = styled(props => (
  <Button {...props}>
      <UpArrowIcon />
  </Button>
))`
    && {
        border-radius: 45px;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%, 50%);
        background-color: rgba(237,248,253, 0.8);
        border-color: rgba(237,248,253, 0.8);
        min-width: unset;
        width: 2.5rem;
        padding: 0;
    }
`;

const UpArrowIcon = styled(KeyboardArrowUp)`
    && {
        color: rgba(29,161,218, 0.8);
    }
`;

export const Styled = {
    CollapsedButton,
};