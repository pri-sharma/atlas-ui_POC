import React from 'react';
import Typography from '@material-ui/core/Typography';
import {Styled} from './ProductHierarchySelection.style';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import CheckedSVG from '../../images/Checked.svg';
import ListItemIcon from '@material-ui/core/ListItemIcon';

const ProductHierarchySelection = (props => {

    return (<Styled.CustomizeContent>
        <Typography className='content-title-row'>
            Pick Your Product Tree
        </Typography>
        <Typography className='content-subtitle-row'>
            How would you like to select products for your promotion?
        </Typography>
        <div className='content-cards'>
            <Paper className='content-card-paper'>
                <Typography className='content-card-title'>1 Product Hierarchy Tree</Typography>
                <hr className='content-card-line'/>
                <List dense={true} className='content-card-list'>
                    <ListItem>
                        <ListItemIcon><img src={CheckedSVG}/></ListItemIcon>
                        <ListItemText><Typography>Category</Typography></ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><img src={CheckedSVG}/></ListItemIcon>
                        <ListItemText><Typography>Sub Category</Typography></ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><img src={CheckedSVG}/></ListItemIcon>
                        <ListItemText><Typography>Sub Brand</Typography></ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><img src={CheckedSVG}/></ListItemIcon>
                        <ListItemText><Typography>Variant</Typography></ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><img src={CheckedSVG}/></ListItemIcon>
                        <ListItemText><Typography>SKU</Typography></ListItemText>
                    </ListItem>
                </List>
                <Button className='content-card-select' value='1PH' onClick={props.changeCallBack}>
                    <Typography className='content-card-select-text'>Get Started</Typography>
                </Button>
            </Paper>
            <Paper className='content-card-paper'>
                <Typography className='content-card-title'>PPG/SKU Tree</Typography>
                <hr className='content-card-line' />
                <List dense={true} className='content-card-list'>
                    <ListItem>
                        <ListItemIcon><img src={CheckedSVG}/></ListItemIcon>
                        <ListItemText><Typography>PPG</Typography></ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><img src={CheckedSVG}/></ListItemIcon>
                        <ListItemText><Typography>SKU</Typography></ListItemText>
                    </ListItem>
                </List>
                <Button className='content-card-select' value='PPG/SKU' onClick={props.changeCallBack}>
                    <Typography className='content-card-select-text'>Get Started</Typography>
                </Button>
            </Paper>
        </div>
    </Styled.CustomizeContent>);
});

export default ProductHierarchySelection;