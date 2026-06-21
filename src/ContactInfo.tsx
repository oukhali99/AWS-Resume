import { useEffect, useState } from 'react';

const Modal = ({
  onClose,
  children,
  title,
  channel,
}: {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  channel: string;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <span className="channel">{channel}</span>
        </div>
        {children}
      </div>
    </div>
  );
};

const ContactInfo = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setEmail(''); setMessage(''); setError(''); };
  const close = () => { setOpen(false); reset(); };

  const send = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Request failed (${res.status})`);
      }
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <span className="item">📍 Montréal · open to relocation</span>
      <a className="item" href="https://github.com/oukhali99" target="_blank" rel="noopener noreferrer">
        github.com/oukhali99
      </a>
      <button className="linklike item" onClick={() => setOpen(true)}>
        send message →
      </button>

      {open && (
        <Modal onClose={close} title="Send a message" channel="POST → λ → SES">
          <div className="modal-body">
            <div>
              <label htmlFor="contact-email">your email</label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="contact-message">message</label>
              <textarea
                id="contact-message"
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                placeholder="Hi Oussama —"
              />
            </div>
            {error && <div className="modal-error">{error}</div>}
          </div>
          <div className="modal-footer">
            <button className="ghost" onClick={close} disabled={loading}>Cancel</button>
            <button
              className="primary"
              onClick={send}
              disabled={loading || !email || !message}
            >
              {loading ? 'sending…' : 'send'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ContactInfo;
