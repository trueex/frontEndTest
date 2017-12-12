import React from 'react';
export default function Alert(props) {
    const { show, message, type } = props; 
    const _className = `alert ${show ? "show" : "hide"} ${type}`;
    return (
        <div className={_className}>
            {message}
        </div>
    );
}