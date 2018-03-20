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

class RDGReposPage extends PureComponent {
  constructor(props) {
    super(props);
    this.handleNextPageClick = this.handleNextPageClick.bind(this);
    this.handlePreviousPageClick = this.handlePreviousPageClick.bind(this);
    this.handleRefreshClick = this.handleRefreshClick.bind(this);
    this.getNoRowsRenderer = this.getNoRowsRenderer.bind(this);
    this.getRowClassName = this.getRowClassName.bind(this);

    this._columns = [
      {
        key: 'id',
        name: 'ID',
        locked: true
      },
      {
        key: 'repo',
        name: 'Repository',
        width: 200
      },
      {
        key: 'language',
        name: 'Language',
        width: 200
      },
      {
        key: 'owner',
        name: 'Owner',
        width: 200
      },
      {
        key: 'stargazers_count',
        name: 'Stargazers',
        width: 200
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
      },
      {
        key: 'startDate',
        name: 'Start Date',
        width: 200
      },
      {
        key: 'completeDate',
        name: 'Expected Complete',
        width: 200
      }
    ];

    this.state = null;
  }

  componentDidMount() {
    const { dispatch, page } = this.props;
    dispatch(fetchTopReposIfNeeded(page));
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, page } = nextProps;
    dispatch(fetchTopReposIfNeeded(page));
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return shallowCompare(this, nextProps, nextState);
  // }

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

  getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toLocaleDateString();
  };

  createRows = (repos) => {
    console.log('RDG, createRows, repos: ', repos);

    let rows = [];
    for (let i = 0; i < repos.length; i++) {
      rows.push({
        id: i,
        repo: repos[i].name,
        language: repos[i].language,
        owner: repos[i].owner.login,
        stargazers_count: repos[i].stargazers_count,
        full_name: repos[i].full_name,
        html_url: repos[i].html_url,
        description: repos[i].description,
        complete: Math.min(100, Math.round(Math.random() * 110)),
        priority: ['Critical', 'High', 'Medium', 'Low'][Math.floor((Math.random() * 3) + 1)],
        issueType: ['Bug', 'Improvement', 'Epic', 'Story'][Math.floor((Math.random() * 3) + 1)],
        startDate: this.getRandomDate(new Date(2015, 3, 1), new Date()),
        completeDate: this.getRandomDate(new Date(), new Date(2016, 0, 1))
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
    console.log('React Data Grid, render, repos: ', repos);
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

        <ReactDataGrid
          columns={this._columns}
          rowGetter={this.rowGetter}
          rowsCount={repos.length}
          minHeight={500} 
        /> 
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
