import styled from 'styled-components';
import WithDirection from '../../settings/withDirection';

const rpReportViewWrapper = styled.div`
.updateProgress{
    position: fixed;
    text-align: center;
    height: 100%;
    width: 100%;
    top: 0;
    right: 0;
    left: 0;
    z-index: 9999999;
    background-color: #000000;
    opacity: 0.7;
  }
  .imgUpdateProgress{
    padding: 10px;
    position: fixed;
    top: 30%;
    left: 45%;
  } 
  .dv-padding{
    padding-left:15px;
    padding-right: 15px;
    padding-top: 5px;
    padding-bottom: 7px;
  }  
  .gridcontainer{
    width: 100% !important;
    height: 100%;
    display:grid !Important;
    background-color: #e3f0f5;
    height: auto;
  }
  .filtercontainer{
    background-color: #e3f0f5;
    font-size: 13px;
    padding: 0;
    color: #666 !important;
    margin-top: 67px;
  }
  .box {
    display: flex;
    flex-flow: column;
    height: 100vh
  }
  .box .row .header{
    flex: 0 1 auto;
  }
  .box .row.content {
  display: flex;
  flex-flow: column;
  flex: 1 1 auto;
  overflow-y: auto;
  }
  
  .box .row.footer {
  flex: 0 1 40px;
  }
  .ag-theme-balham{
    font-size: 14px !important;
    z-index:1 !important;
    font-family: 'Source Sans Pro','Helvetica Neue',Helvetica,Arial,sans-serif !important;
    font-weight: 400 !important;
    color: rgb(102,102,102) !important;
  }
  .ag-theme-balham .ag-tool-panel-wrapper .ag-pivot-mode-panel{
    border-bottom: 1px solid #BDC3C7;
  }
  .ag-theme-balham .ag-tool-panel-wrapper .ag-filter-panel .ag-filter-toolpanel-instance{
    font-weight: 400 !important;
  }
  .ag-theme-balham .ag-header{
    background-color: #F3F5F6 !important;
  }
  .ag-theme-balham .ag-row-odd {
    background-color: #EFF1F2 !important;
  }
  .ag-theme-balham .ag-row-even {
    background-color: #FCFCFC !important;
  }
      `;
const ReportViewWrapper = WithDirection(rpReportViewWrapper);

export { ReportViewWrapper };