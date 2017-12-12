import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Cell, Column, ColumnGroup, Table } from 'fixed-data-table';
import '../../../node_modules/fixed-data-table/dist/fixed-data-table.css';
import _ from 'lodash';
import MyCell from '../../components/MyCell';
import Alert from '../../components/Alert';

@connect(
  state => ({ rows: state.rows, cols: state.cols || new Array(10) })
)
export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rows: [],
      cols: new Array(10),
      showAlert: false,
      alert: {}
    };
    //By using arrow funcions, we can get rid of these bind functions
    this.onSnapshotReceived = this.onSnapshotReceived.bind(this);
    this.onUpdateReceived = this.onUpdateReceived.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
    this.onReconnnectAttempt = this.onReconnnectAttempt.bind(this);
    this.onReconnect = this.onReconnect.bind(this);
    this.onReconnectFailed = this.onReconnectFailed.bind(this);
    // this._cell = this._cell.bind(this);
    this._headerCell = this._headerCell.bind(this);
    this._generateCols = this._generateCols.bind(this);
    this._shouldUpdate = true;
  }

  //method 1, we can control the lifecycle, in this case the store
  //can be updated without necessarily update the UI
  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this._shouldUpdate) {
  //     this._shouldUpdate = false;
  //     setTimeout(() => {
  //       this._shouldUpdate = true;
  //     }, 500);
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  //if we want to achieve refresh exactly every 0.5 min, we can store each response
  //into the store, and pull the newest data every 0.5 min from the store. The output 
  //would be more consistant  this way.

  onSnapshotReceived(data) {
    let rows = [];
    data.forEach(row => {
      rows[row.id] = row;
    });
    // const rows = this.state.rows.concat(data);
    // console.log('snapshot' + rows);
    const cols = Object.keys(rows[0]);
    this.setState({ rows, cols });
  };

  onUpdateReceived(data) {
    // const rows = this.state.rows.concat(data);

    // method 2, control the data update intead of UI update
    if (this._shouldUpdate) {
      this._shouldUpdate = false;
      setTimeout(() => {
        this._shouldUpdate = true;
      }, 500);
    } else {
      return;
    }

    let rows = this.state.rows;
    data.forEach(newRow => {
      rows[newRow.id] = newRow;
    });

    this.setState({ rows });
  };

  onDisconnect() {
    this.setState({
      showAlert: true,
      alert: {
        message: "Connection lost, trying to reconnect...",
        type: "danger"
      }
    });
  }

  onReconnnectAttempt(number) {
    this.setState({
      showAlert: true,
      alert: {
        message: "Number of attempts: " + number,
        type: "danger"
      }
    });
  }

  onReconnect() {
    this.setState({
      showAlert: true,
      alert: {
        message: "Reconnected!",
        type: "success"
      }
    });
    window.setTimeout(() => {
      this.setState({
        showAlert: false,
        alert: {}
      });
    }, 1500);
  }

  onReconnectFailed() {
    this.setState({
      showAlert: true,
      alert: {
        message: "Unable to reconnect, please try again later.",
        type: "danger"
      }
    });
  }

  // _cell(cellProps) {
  //   const rowIndex = cellProps.rowIndex;
  //   const rowData = this.state.rows[rowIndex];
  //   const col = this.state.cols[cellProps.columnKey];
  //   const content = rowData[col];
  //   return (
  //     <Cell>{content}</Cell>
  //   );
  // }

  _headerCell(cellProps) {
    const col = this.state.cols[cellProps.columnKey];
    return (
      <Cell>{col}</Cell>
    );
  }

  _generateCols() {
    let cols = [];
    this.state.cols.forEach((row, index) => {
      cols.push(
        <Column
          width={100}
          flexGrow={1}
          cell={
            <MyCell
              columnKey={index}
              rows={this.state.rows}
              cols={this.state.cols} />
          }
          header={this._headerCell}
          columnKey={index}
        />
      );
    });
    return cols;
  };
  componentDidMount() {
    if (window.socket) {
      window.socket.on('snapshot', this.onSnapshotReceived);
      window.socket.on('updates', this.onUpdateReceived);
      window.socket.on('disconnect', this.onDisconnect);
      window.socket.on('reconnect_attempt', this.onReconnnectAttempt);
      window.socket.on('reconnect', this.onReconnect);
      window.socket.on('reconnect_failed', this.onReconnectFailed);
    }
  };
  componentWillUnmount() {
    if (window.socket) {
      window.socket.removeListener('snapshot', this.onSnapshotReceived);
      window.socket.removeListener('updates', this.onUpdateReceived);
      window.socket.removeListener('disconnect', this.onDisconnect);
      window.socket.removeListener('reconnect_attempt', this.onReconnnectAttempt);
      window.socket.removeListener('reconnect', this.onReconnect);
      window.socket.removeListener('reconnect_failed', this.onReconnectFailed);
    }
  };

  render() {
    const columns = this._generateCols();
    const { showAlert, alert } = this.state; 
    return (
      <div>
        <Alert show={showAlert} message={alert.message} type={alert.type}/>
        <Table
          rowHeight={30}
          width={window.innerWidth}
          maxHeight={window.innerHeight}
          headerHeight={35}
          rowsCount={this.state.rows.length}
        >
          {columns}
        </Table>
      </div>
    );
  }
}
