import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import './styles.css';

interface QRCodeGeneratorProps {
  onPlayerJoin: (playerId: string) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ onPlayerJoin }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [controllerUrl, setControllerUrl] = useState<string>('');

  useEffect(() => {
    // Generate unique session ID
    const generateSessionId = () => {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    const newSessionId = generateSessionId();
    setSessionId(newSessionId);

    // Create the controller URL
    const newControllerUrl = `${window.location.origin}/controller/${newSessionId}`;
    setControllerUrl(newControllerUrl);

    // Generate QR code
    generateQRCode(newControllerUrl);
  }, []);

  const generateQRCode = async (url: string) => {
    try {
      // Generate actual QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrCodeUrl(url); // Fallback to just showing the URL
    }
  };

  return (
    <div className="qr-code-container">
      <h2>Scan to Join Game</h2>
      <div className="qr-code-placeholder">
        {qrCodeUrl.startsWith('data:') ? (
          <img
            src={qrCodeUrl}
            alt="QR Code for joining game"
            style={{
              width: '200px',
              height: '200px',
              margin: '20px auto',
              display: 'block'
            }}
          />
        ) : (
          <div style={{
            width: '200px',
            height: '200px',
            border: '2px solid black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '20px auto',
            backgroundColor: 'white'
          }}>
            <div style={{ textAlign: 'center', fontSize: '12px' }}>
              Loading QR Code...<br/>
              Session: {sessionId.substring(0, 8)}...
            </div>
          </div>
        )}
      </div>
      <p>Session ID: {sessionId}</p>
      <p>Controller URL: {controllerUrl}</p>
    </div>
  );
};

export default QRCodeGenerator;