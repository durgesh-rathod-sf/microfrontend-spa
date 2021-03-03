import React from 'react';
import Modal from 'react-bootstrap4-modal';
import './DeleteModal.css'

const DeleteModal = (props) => {
    return (
        <div className="my-projects-delete">
        <Modal id="modalContainer" visible={props.visible}>
            <div className="modal-header" style={{ borderBottom: '0px', backgroundColor: '#404040', color: '#ffffff' }}>
                <h6 className="modal-title mx-auto md-block">{props.title}</h6>
                {/* <button type="button" onClick={props.modalCloseHandler} className="close" data-dismiss="modal" style={{ color: '#ffffff', opacity: '1' }} >&times;</button> */}
            </div>
            <div className="modal-body" style={{ backgroundColor: '#404040', color: '#ffffff' }}>
                <div className="parent-flex">
                    <div style={{marginLeft: '3%'}}>
                        <button
                            type="button"
                            className="btn btn-light no-button"
                            onClick={props.modalCloseHandler}
                        >
                            No
                            </button>
                    </div>
                    <div>
                        <button
                            type="button"
                            className="btn btn-light yes-button"
                            onClick={props.deleteProjectHandler}
                        >
                           Yes
                            </button>
                    </div>
                </div>
            </div>
        </Modal>
        </div>
    );
}

export default DeleteModal;