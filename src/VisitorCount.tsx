import { useState, useEffect } from "react";
import { Card } from "react-bootstrap";

interface Props {
    style?: React.CSSProperties;
}

const VisitorCount = ({ style }: Props) => {
    const [visitorCount, setVisitorCount] = useState();

    const fetchVisitorCount = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/get-visitor-count`);
        const data = await response.json();
        setVisitorCount(data.visitorCount);
    };

    const incrementVisitorCount = async () => {
        await fetch(`${import.meta.env.VITE_API_URL}/add-visitor`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    };

    useEffect(() => {
        incrementVisitorCount();
        fetchVisitorCount();
    }, []);

    return (
        <Card className="float-end m-3 text-center" style={{ width: '18rem', ...style }}>
            <Card.Body>
                <Card.Title>Visit Count</Card.Title>
                <Card.Text className="fs-4">
                    {visitorCount ?? 'Loading...'}
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default VisitorCount;
