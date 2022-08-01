import { useContext } from "react";
import Accordion from "react-bootstrap/Accordion";
import { useAccordionButton, AccordionContext, Card } from "react-bootstrap";

type Props = {
  description?: string;
};

function Description({ description }: Props) {
  return (
    <Accordion defaultActiveKey="0">
      <Card className="accordionCard">
        <Card.Header>
          <ContextAwareToggle eventKey="0">Product Info</ContextAwareToggle>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body className="accordionBody">{description}</Card.Body>
        </Accordion.Collapse>
      </Card>
      <Card className="accordionCard">
        <Card.Header>
          <ContextAwareToggle eventKey="1">
            Return & Refund Policy
          </ContextAwareToggle>
        </Card.Header>
        <Accordion.Collapse eventKey="1">
          <Card.Body className="accordionBody">
            환불은 미개봉 상품에 대하여 배송완료 이후 7일이내에 가능합니다.
          </Card.Body>
        </Accordion.Collapse>
      </Card>
      <Card className="accordionCard">
        <Card.Header>
          <ContextAwareToggle eventKey="2">Shipping Info</ContextAwareToggle>
        </Card.Header>
        <Accordion.Collapse eventKey="2">
          <Card.Body className="accordionBody">
            저희는 우체국 택배를 이용합니다.\n배송 비용은 기본 3000원 이며
            지역에따라 추가 요금이 발생할 수 있습니다.
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
}

type CProps = {
  children: string;
  eventKey: string;
};

function ContextAwareToggle({ children, eventKey }: CProps) {
  const { activeEventKey } = useContext(AccordionContext);

  const decoratedOnClick = useAccordionButton(eventKey);

  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <div className="accordionTitle" onClick={decoratedOnClick}>
      <div>{children}</div>
      <div>{isCurrentEventKey ? "-" : "+"}</div>
    </div>
  );
}

export default Description;
