import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import {Button} from 'semantic-ui-react';

import { AutoSizer, Table, Column, Grid, CellMeasurer } from "react-virtualized";

import {
  invalidateReposPage,
  selectReposPage,
  fetchTopReposIfNeeded
} from "../../actions/repos";

import "react-virtualized/styles.css";
import "./repo.css";
// import { Button } from "bootstrap/dist/js/bootstrap";

/* DOC
- RV is TypeScript ready afaik.
- Custom styles: https://github.com/bvaughn/react-virtualized/blob/master/docs/customizingStyles.md
- Table, multi column sort: https://github.com/bvaughn/react-virtualized/blob/master/docs/multiColumnSortTable.md
- ? Footer: https://github.com/bvaughn/react-virtualized/issues/805
*/

class RVReposPage extends PureComponent {

  constructor(props) {
    super(props);
    this.handleNextPageClick = this.handleNextPageClick.bind(this);
    this.handlePreviousPageClick = this.handlePreviousPageClick.bind(this);
    this.handleRefreshClick = this.handleRefreshClick.bind(this);
    this.getNoRowsRenderer = this.getNoRowsRenderer.bind(this);
    this.getRowClassName = this.getRowClassName.bind(this);
    this.handleCheckboxCheck = this.handleCheckboxCheck.bind(this);
    this.handleSelectionTogglerClick = this.handleSelectionTogglerClick.bind(this);

    this.state = {
      selectionType: 2, // 0, 1, 2
      selectedRows: {}
    };
  }

  componentDidMount() {
    const { dispatch, page } = this.props;
    dispatch(fetchTopReposIfNeeded(page));
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, page } = nextProps;
    dispatch(fetchTopReposIfNeeded(page));
  }

  getNoRowsRenderer() {
    return (
      <div className="noRows">
        No rows
      </div>
    );
  }

  getRowClassName({ index }) {
    if (index < 0) {
      return "headerRow";
    }
    return index % 2 === 0 ? "evenRow" : "oddRow";
  }

  handleNextPageClick(e) {
    e.preventDefault();
    const { page, repos } = this.props;
    if (repos.length > 0) {
      // go to next page only if more data may be available
      this.props.dispatch(selectReposPage(page + 1));
    }
  }

  handlePreviousPageClick(e) {
    e.preventDefault();
    const page = this.props.page;
    if (page > 1) {
      this.props.dispatch(selectReposPage(page - 1));
    }
  }

  handleRefreshClick(e) {
    e.preventDefault();

    const { dispatch, page } = this.props;
    dispatch(invalidateReposPage(page));
  }

  handleCheckboxCheck(e, cellData, cellDataKey, columnData, rowData, rowIndex) {
    let selectedRows = Object.assign({}, this.state.selectedRows ); 

    if (this.state.selectionType === 1) {
      selectedRows = {};
    }
    selectedRows[rowIndex] = e.target.checked;


    this.setState({ selectedRows }, () => {
      console.log("checked row: ", this.state, cellData, cellDataKey, columnData, rowData, rowIndex);
    });
  }

  handleSelectionTogglerClick(e) {
    e.preventDefault();
    let { selectionType } = this.state;
    selectionType = (selectionType + 1) % 3;

    this.setState({
      selectionType: selectionType,
      selectedRows: {}
    });
  }

  ownerCellRenderer = ({
    cellData,
    cellDataKey,
    columnData,
    rowData,
    rowIndex
  }) => (
      <a href={cellData.html_url} target="_blank" rel="noopener noreferrer">
        <img src={cellData.avatar_url} width="32" height="32" alt="owner" />
        <span style={{ marginLeft: "0.5em" }}>{cellData.login}</span>
      </a>
    );

  linkCellRenderer = ({
    cellData,
    cellDataKey,
    columnData,
    rowData,
    rowIndex
  }) => (
      <a href={cellData} target="_blank" rel="noopener noreferrer">{cellData}</a>
    );

  stargazerCellRenderer = ({
    cellData,
    cellDataKey,
    columnData,
    rowData,
    rowIndex
  }) => (
      <div>
        <span className="float-right">
          {cellData.toLocaleString()}
          {" "}
          <i className="fa fa-star" style={{ color: "gold" }} />
          {" "}
        </span>
      </div>
    );

  checkboxCellRenderer = ({
    cellData,
    cellDataKey,
    columnData,
    rowData,
    rowIndex
  }) => (
      <input
        type="checkbox"
        checked={this.state.selectedRows[rowIndex]}
        onChange={(e) => this.handleCheckboxCheck(e, cellData, cellDataKey, columnData, rowData, rowIndex)}
      />
    );

  // This is a custom header example for a single cell
  // You have access to all of the named params,
  // But you don't necessarily need to use them all.
  headerRenderer = ({
    columnData,
    dataKey,
    disableSort,
    label,
    sortBy,
    sortDirection
  }) => (
    <span className="float-right">
      {" "}
      <i className="fa fa-star" style={{ color: "gold" }} />
      {" "}
    </span>
  )


  render() {
    const { page, error, repos, isFetching } = this.props;
    const prevStyles = classNames("page-item", { disabled: page <= 1 });
    const nextStyles = classNames("page-item", {
      disabled: repos.length === 0
    });
    console.log('RV, repos, page: ', repos, page);

    return (
      <div className="container">

        This is react-virtualized

        <nav>
          <ul className="pagination pagination-sm">
            <li className={prevStyles}>
              <a
                className="page-link"
                href=""
                onClick={this.handlePreviousPageClick}
              >
                <span>Previous</span>
              </a>
            </li>
            {!isFetching &&
              <li className="page-item">
                <a
                  className="page-link"
                  href=""
                  onClick={this.handleRefreshClick}
                >
                  <span>Refresh page {page}</span>
                </a>
              </li>}
            {isFetching &&
              <li className="page-item">
                <span className="page-link">
                  <i className="fa fa-refresh fa-spin" /> Refreshing page {page}
                </span>
              </li>}
            <li className={nextStyles}>
              <a
                className="page-link"
                href=""
                onClick={this.handleNextPageClick}
              >
                <span>Next</span>
              </a>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          className="btn btn-primary"
          onClick={this.handleSelectionTogglerClick}
        >
          Selection Toggler-{this.state.selectionType}
        </button>
        {" "}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => console.log('Get Selections: ', this.state.selectedRows)}
        >
          Get Selections
        </button>

        {error &&
          <div className="alert alert-danger">
            {error.message || "Unknown errors."}
          </div>}

        {!isFetching &&
          repos.length === 0 &&
          <div className="alert alert-warning">Oops, nothing to show.</div>}

        {repos &&
          <div
            className="container"
            ref="TABLE_DIV"
            style={{
              opacity: isFetching ? 0.5 : 1,
              width: "100%",
              height: "80vh",
              position: "absolute"
            }}
          >
            <AutoSizer>
              {({ width, height }) => (
                <Table
                  headerClassName={"headerColumn"}
                  noRowsRenderer={this.getNoRowsRenderer}
                  rowClassName={this.getRowClassName}
                  width={width}
                  height={500}
                  headerHeight={50}
                  rowHeight={50}
                  rowCount={repos.length}
                  rowGetter={({ index }) => repos[index]}
                  sort={({sortBy, sortDirection}) => console.log("RV, header clicked; ", sortBy, sortDirection)}
                >
                  {this.state.selectionType !== 0 &&
                    <Column dataKey="id" cellRenderer={this.checkboxCellRenderer} width={60} />
                  }

                  <Column label="Repository" dataKey="name" width={200} />

                  <Column label={this.state.selectionType === 0 ? "Language" : "Dil"} dataKey="language" width={200} />

                  <Column
                    label="Owner"
                    dataKey="owner"
                    cellRenderer={this.ownerCellRenderer}
                    width={200}
                  />

                  <Column
                    label="Stargazers"
                    dataKey="stargazers_count"
                    cellRenderer={this.stargazerCellRenderer}
                    headerRenderer={this.headerRenderer}
                    width={150}
                  />

                  <Column label="Full Name" dataKey="full_name" width={400} />

                  <Column
                    label="Repository URL"
                    dataKey="html_url"
                    cellRenderer={this.linkCellRenderer}
                    width={400}
                  />

                  <Column
                    label="Description"
                    dataKey="description"
                    width={500}
                    flexGrow={1}
                  />
                </Table>
              )}
            </AutoSizer>

            <div className="footer">
              {Object.keys(this.state.selectedRows).length} items are selected.
            </div>
          </div>
        }
     
      </div>
    );
  }
}

RVReposPage.propTypes = {
  page: PropTypes.number.isRequired,
  repos: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  left: PropTypes.number,
  top: PropTypes.number
};

function mapStateToProps(state) {
  const { selectedReposPage, reposByPage } = state;
  const page = selectedReposPage || 1;
  if (!reposByPage[page]) {
    return {
      page,
      error: null,
      isFetching: false,
      didInvalidate: false,
      totalCount: 0,
      repos: []
    };
  }

  return {
    page,
    error: reposByPage[page].error,
    isFetching: reposByPage[page].isFetching,
    didInvalidate: reposByPage[page].didInvalidate,
    totalCount: reposByPage[page].totalCount,
    repos: reposByPage[page].repos
  };
}

export default connect(mapStateToProps)(RVReposPage);
