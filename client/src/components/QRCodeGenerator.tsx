import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  onPlayerJoin: (playerId: string) => void;
  sessionId?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ onPlayerJoin, sessionId: propSessionId }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [controllerUrl, setControllerUrl] = useState<string>('');

  useEffect(() => {
    // Use provided sessionId or generate new one
    const newSessionId = propSessionId || (
      Math.random().toString(36).substring(2) + Date.now().toString(36)
    );
    setSessionId(newSessionId);

    // Create the controller URL
    const newControllerUrl = `${window.location.origin}/controller/${newSessionId}`;
    setControllerUrl(newControllerUrl);

    // Generate QR code
    generateQRCode(newControllerUrl);
  }, [propSessionId]);

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
    <div className="text-center">
      <h2 className="text-black text-3xl mb-5" style={{ fontFamily: 'LL Baguid, Arial, sans-serif' }}>Scan to Join Game</h2>
      <div>
        {qrCodeUrl.startsWith('data:') ? (
          <img
            src={qrCodeUrl}
            alt="QR Code for joining game"
            className="w-64 h-64 mx-auto block border-4 border-white rounded-xl"
          />
        ) : (
          <div className="w-64 h-64 border-4 border-white rounded-xl flex items-center justify-center mx-auto bg-white">
            <div className="text-center text-sm text-black">
              Loading QR Code...<br/>
              Session: {sessionId.substring(0, 8)}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;