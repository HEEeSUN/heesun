import { useState } from "react";
import { Modal } from "react-bootstrap";
import { Status } from "../../../model/member.model";

type Props = {
  deliveryStatus: Status[];
  setShowStatusModal: React.Dispatch<React.SetStateAction<boolean>>;
};

function StatusModal(props: Props) {
  const [show, setShow] = useState(true);
  const { deliveryStatus, setShowStatusModal } = props;

  const handleClose = () => {
    setShow(false);
    setShowStatusModal(false);
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>배송진행현황</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <table>
          <tr>
            <th style={{ width: "150px" }}> 일자</th>
            <th style={{ width: "100px" }}>배송현황</th>
          </tr>

          {deliveryStatus.map((item, key) => {
            return (
              <tr>
                <td>{item.date}</td>
                <td>{item.status}</td>
              </tr>
            );
          })}
        </table>
      </Modal.Body>
    </Modal>
  );
}

export default StatusModal;
