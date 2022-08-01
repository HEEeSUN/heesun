import { Modal, Button } from "react-bootstrap";

type Props = {
  showModal: boolean;
  handleClose: () => void;
  handleMove: () => void;
  titleTxt: string;
  bodyTxt: string;
};

function Alert(props: Props) {
  let { showModal, handleClose, handleMove, titleTxt, bodyTxt } = props;

  return (
    <Modal
      show={showModal}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>{titleTxt}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{bodyTxt}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleMove}>
          네
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          아니오
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Alert;
