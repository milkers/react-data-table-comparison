import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";

import ReactDataGrid from 'react-data-grid';

import {
  invalidateReposPage,
  selectReposPage,
  fetchTopReposIfNeeded
} from "../../actions/repos";

// import "react-virtualized/styles.css";
import "./repo.css";


/* DOC
- RDG can be extended with types for TypeScript.
  https://www.npmjs.com/package/@types/react-data-grid
- ? Customize checkbox header
  https://github.com/adazzle/react-data-grid/issues/678
*/

// Custom Formatter component
class StargazerFormatter extends React.Component {
  static propTypes = {
    value: PropTypes.number.isRequired
  };

  render() {
    const starCount = this.props.value;
    return (
      <div>
        <span className="float-right">
          {starCount}
          {" "}
          <i className="fa fa-star" style={{ color: "gold" }} />
          {" "}
        </span>
      </div>
    );
  }
}

class StargazerHeaderFormatter extends React.Component {
  render() {
    console.log('StargazerHeaderFormatter: ', this.props);
    return (
      <div>
        <span>
          {" "}
          <i className="fa fa-star" style={{ color: "gold" }} />
          {" "}
        </span>
      </div>
    );
  }
}

class OwnerFormatter extends React.Component {
  static propTypes = {
    value: PropTypes.object.isRequired
  };

  render() {
    const owner = this.props.value;

    return (
      <a href={owner.html_url} target="_blank" rel="noopener noreferrer">
        <img src={owner.avatar_url} width="32" height="32" alt="owner" />
        <span style={{ marginLeft: "0.5em" }}>{owner.login}</span>
      </a>
    );
  }
}

class EmptyRowsView extends React.Component {
  render() {
    return (<div>Nothing to show</div>);
  }
}

class RDGReposPage extends PureComponent {
  constructor(props) {
    super(props);
    this.handleNextPageClick = this.handleNextPageClick.bind(this);
    this.handlePreviousPageClick = this.handlePreviousPageClick.bind(this);
    this.handleRefreshClick = this.handleRefreshClick.bind(this);
    this.getNoRowsRenderer = this.getNoRowsRenderer.bind(this);
    this.getRowClassName = this.getRowClassName.bind(this);
    this.handleSelectionTogglerClick = this.handleSelectionTogglerClick.bind(this);
    this.onRowsSelected = this.onRowsSelected.bind(this);
    this.onRowsDeselected = this.onRowsDeselected.bind(this);

    this.state = {
      selectionType: 2, // 0, 1, 2
      selectedRows: []
    };

    this.initializeColumns();
  }

  initializeColumns() {
    this._columns = [
      {
        key: 'repo',
        name: 'Repository',
        locked: true,
        width: 200
      },
      {
        key: 'language',
        name: this.state.selectionType === 0 ? 'Language' : 'Dil',
        width: 200,
        sortable: true,
        resizable: true
      },
      {
        key: 'owner',
        name: 'Owner',
        formatter: OwnerFormatter,
        width: 200
      },
      {
        key: 'stargazers_count',
        name: 'Stargazers',
        width: 200,
        headerRenderer: <StargazerHeaderFormatter />,
        formatter: StargazerFormatter,
        sortable: true
      },
      {
        key: 'full_name',
        name: 'Full Name',
        width: 200
      },
      {
        key: 'html_url',
        name: 'Repo Url',
        width: 200
      },
      {
        key: 'description',
        name: 'Description',
        width: 400
      }
    ];
    console.log('RDG, initializeCols, _cols, state: ', this._columns, this.state);
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

  handleSelectionTogglerClick(e) {
    e.preventDefault();
    let { selectionType } = this.state;
    selectionType = (selectionType + 1) % 3;

    this.setState({
      selectionType: selectionType,
      selectedRows: []
    });
    
  }

  handleGridSort (sortColumn, sortDirection) {
    console.log('RDG, handleGridsort, column, direction: ', sortColumn, sortDirection);
    // implement your comparer function here.
  }

  onRowsSelected = (rows) => {
    if (this.state.selectionType !== 2 && rows.length > 1) {
      console.log('RDG, onRowsSelected, multi row selection is forbidden, rows: ', rows, this.state);
      return;
    }

    if (this.state.selectionType === 1) {
      this.state.selectedRows = [];
    }

    this.setState({selectedRows: this.state.selectedRows.concat(rows.map(r => r.rowIdx))}, () => {
      console.log('RDG, onRowsSelected, rows, state: ', rows, this.state);
    });
  };

  onRowsDeselected = (rows) => {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({selectedRows: this.state.selectedRows.filter(i => rowIndexes.indexOf(i) === -1 )}, () => {
      console.log('RDG, onRowsDeselected, rows, state: ', rows, this.state);
    });
  };

  createRows = (repos) => {

    let rows = [];
    for (let i = 0; i < repos.length; i++) {
      rows.push({
        repo: repos[i].name,
        language: repos[i].language,
        owner: repos[i].owner,
        stargazers_count: repos[i].stargazers_count,
        full_name: repos[i].full_name,
        html_url: repos[i].html_url,
        description: repos[i].description,
      });
    }

    this._rows = rows;
  };

  rowGetter = (i) => {
    return this._rows[i];
  };

  render() {
    const { page, error, repos, isFetching } = this.props;
    const prevStyles = classNames("page-item", { disabled: page <= 1 });
    const nextStyles = classNames("page-item", {
      disabled: repos.length === 0
    });
    console.log('React Data Grid, render, repos: ', repos, this.state);
    this.initializeColumns();
    this.createRows(repos);

    return (
      <div className="container">
        This is react-data-grid 

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

        {repos &&
          <div
            ref="TABLE_DIV"
            style={{
              opacity: isFetching ? 0.5 : 1,
              width: "100%",
              marginTop: "20px"
            }}
          >
            <ReactDataGrid
              onGridSort={this.handleGridSort}
              columns={this._columns}
              rowGetter={this.rowGetter}
              rowsCount={repos.length}
              minHeight={500} 
              emptyRowsView={EmptyRowsView}
              rowSelection={{
                showCheckbox: this.state.selectionType !== 0,
                enableShiftSelect: false,
                onRowsSelected: this.onRowsSelected,
                onRowsDeselected: this.onRowsDeselected,
                selectBy: {
                  indexes: this.state.selectedRows
                }
              }} 
            /> 

            

          </div>
        }
        <div>
          {this.state.selectedRows.length} items are selected.
        </div>
      </div>
    );
  }
}

RDGReposPage.propTypes = {
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

export default connect(mapStateToProps)(RDGReposPage);
