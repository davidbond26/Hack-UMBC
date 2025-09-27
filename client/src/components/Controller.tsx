import React from 'react';
import { useParams } from 'react-router-dom';

const Controller: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div>
      <h1>Mobile Controller - Ready for new UI</h1>
      <p>Session: {sessionId}</p>
    </div>
  );
};

export default Controller;