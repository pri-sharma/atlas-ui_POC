import React, {Component, Profiler} from 'react';
import LayoutContentWrapper from '../components/utility/layoutWrapper';
import BVPGrid from '../components/BVPGrid.js';
import Paper from '@material-ui/core/Paper';
import FiltersContainer from './Filters/FiltersContainer';
import {logProfile} from "../profiler/profiler";


class BaselineVolumePlanningContainer extends Component {

    render() {
        return (
            <LayoutContentWrapper className='filteredContent'>
                <Profiler id={window.location.pathname} onRender={logProfile}>
                    <FiltersContainer/>
                    <Paper className='filteredGrid'>
                        <BVPGrid/>
                    </Paper>
                </Profiler>
            </LayoutContentWrapper>
        )
    }
}

export default BaselineVolumePlanningContainer;