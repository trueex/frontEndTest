import React, { Component } from 'react';
import { Cell } from 'fixed-data-table';
import '../styles/app.css';

//Wanted to extends PureComponent instead of implement shouldComponentUpdate, 
//but it looks like react 14 doesn't come with it
export default class MyCell extends Component {
    constructor(props) {
        super(props);
        this._className = "";
        this.state = {
            content: this.getInitContent(props)
        };
    }

    componentWillReceiveProps(nextProps, nextState) {
        const { content } = this.state;
        const newContent = this.getInitContent(nextProps);
        if (content !== newContent) {
            this._className = newContent > content ? "up" : (newContent < content ? "down" : "");
            this.setState({
                content: newContent
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { content } = this.state;
        return content !== nextState.content;
    }

    getInitContent = (cellProps) => {
        const { rows, cols, rowIndex, columnKey } = cellProps;
        const rowData = rows[rowIndex];
        const col = cols[columnKey];
        return rowData[col];
    }

    render() {
        const { content } = this.state;
        return <Cell className={this._className} {...this.props}>{content}</Cell>
    }
}