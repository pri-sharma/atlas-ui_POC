import React, { Component } from 'react';
import { connect } from 'react-redux';
import LayoutContentWrapper from '../../components/utility/layoutWrapper'
import ContentHolder from "../../components/utility/contentHolder";
import LayoutContent from '../../components/utility/layoutContent';
import Grid from "@material-ui/core/Grid";
import { Col, Row } from "antd";
import CustomizedSnackbar from '../../components/CustomizedSnackbar'
import { Link } from 'react-router-dom';

const cardStyle = {
    width: '100%',
    marginTop: '32px',
    display: 'block',
};

const smallCardStyle = {
    marginBottom: '32px',
    marginTop: '0px',
    backgroundColor: 'transparent',

};

class ReportList extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }

    }

    //render report list 
    renderReportList() {
        return this.props.gridviewstate.filter(x => x.user_id == 0).map((rpt, index) => {
            return (<table><tbody><tr key={index}><td>  <Link to={{
                pathname: `/reporting/view`,
                state: {
                    id: rpt.id,
                    viewid: rpt.view_id
                }
            }}>{rpt.view_name}</Link> </td></tr></tbody></table>)

        })

    }
    activeTab()
    {
        if (document.getElementsByClassName('ant-menu-item-selected')[0] != undefined) {
            document.getElementsByClassName('ant-menu-item-selected')[0].classList.remove('ant-menu-item-selected')
        }
        if (document.getElementsByClassName('ant-menu-submenu-vertical')[0] != undefined) {
            document.getElementsByClassName('ant-menu-submenu-vertical')[0].classList.add('ant-menu-item-selected')
        }        

    }

    render() {
  
      this.activeTab();
        return (
            <div>
                <CustomizedSnackbar ref={el => this.snackbar = el} />
                <LayoutContentWrapper>
                    <Grid container style={cardStyle}>
                        <Grid item xs={12} style={smallCardStyle}>
                            <LayoutContent style={{ padding: "35px" }}>
                                <h1>Report List</h1>
                                <Row>
                                    <Col>
                                        <ContentHolder>
                                            {this.renderReportList()}
                                        </ContentHolder>
                                    </Col> </Row>
                            </LayoutContent>
                        </Grid>
                    </Grid>
                </LayoutContentWrapper>
            </div>
        )

    }
}

const mapStateToProps = state => {
    return {
        gridviewstate: state.GridView.gridviewstate,
        user: state.GridView.user,
    }
};

export default connect(mapStateToProps)(ReportList)