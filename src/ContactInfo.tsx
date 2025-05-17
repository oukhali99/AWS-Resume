import styled from "styled-components";
import { Button, Modal, Form } from "react-bootstrap";
import { useState } from "react";

const ContactInfoDiv = styled.div`
	display: flex;
	justify-content: center;
	gap: 1.5rem;
	flex-wrap: wrap;

	@media (max-width: 600px) {
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
`;

const ContactItem = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
`;

const StyledModal = styled(Modal)`
	.modal-dialog {
		max-width: 900px;
		width: 90%;
	}
`;

const StyledButton = styled(Button)`
	padding: 0.25rem;
`;

const ContactInfo = () => {
	const [showEmailModal, setShowEmailModal] = useState(false);
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const sendEmailClicked = async () => {
		try {
			setIsLoading(true);
			setError("");
			
			const response = await fetch(`${import.meta.env.VITE_API_URL}/send-message`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email,
					message
				})
			});

			if (!response.ok) {
				const responseBody = await response.json();
				throw new Error(`Failed to send email: ${responseBody?.message}`);
			}

			setShowEmailModal(false);
			setEmail("");
			setMessage("");
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to send email');
		} finally {
			setIsLoading(false);
		}
	}

	const closeModalClicked = () => {
		setShowEmailModal(false);
		setEmail("");
		setMessage("");
		setError("");
	}

	return (
		<div>
			<StyledModal show={showEmailModal} onHide={closeModalClicked}>
				<Modal.Header>
					<Modal.Title>Send Me a Message! (Sent using AWS SES)</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group>
							<Form.Control 
								type="email" 
								placeholder="Please Enter your Email" 
								value={email} 
								onChange={(e) => setEmail(e.target.value)}
								disabled={isLoading}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label></Form.Label>
							<Form.Control 
								as="textarea" 
								rows={10} 
								placeholder="Enter Your Message" 
								value={message} 
								onChange={(e) => setMessage(e.target.value)}
								disabled={isLoading}
							/>
						</Form.Group>
						{error && <div className="text-danger mt-2">{error}</div>}
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={closeModalClicked} disabled={isLoading}>Close</Button>
					<Button 
						variant="primary" 
						onClick={sendEmailClicked}
						disabled={isLoading || !email || !message}
					>
						{isLoading ? 'Sending...' : 'Send'}
					</Button>
				</Modal.Footer>
			</StyledModal>
			<ContactInfoDiv>
				<ContactItem>📱 *Removed For Privacy*</ContactItem>
				<ContactItem>📍 Montreal, Canada (Easy Relocation)</ContactItem>
				<ContactItem>
					<span>📧</span>
					<StyledButton variant="success" target="_blank" className="me-2" size="sm" onClick={() => setShowEmailModal(true)}>Send E-Mail</StyledButton>
				</ContactItem>
				<ContactItem>👨‍💻 <StyledButton variant="success" href="https://github.com/oukhali99" target="_blank" rel="noopener noreferrer">GitHub</StyledButton></ContactItem>
			</ContactInfoDiv>
		</div>
	);
};

export default ContactInfo;
