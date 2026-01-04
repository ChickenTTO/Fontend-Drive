import React, { useState } from 'react';

const BookingAPITester = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://backend-drive-bgk5.onrender.com/api/bookings';

  const testPayloads = [
    {
      name: "Minimal Fields",
      payload: {
        customerName: "Test Customer",
        customerPhone: "0123456789",
        pickup: "Point A",
        dropoff: "Point B"
      }
    },
    {
      name: "With Type",
      payload: {
        customerName: "Test Customer",
        customerPhone: "0123456789",
        pickup: "Point A",
        dropoff: "Point B",
        type: "Chở khách"
      }
    },
    {
      name: "With Status",
      payload: {
        customerName: "Test Customer",
        customerPhone: "0123456789",
        pickup: "Point A",
        dropoff: "Point B",
        type: "Chở khách",
        status: "pending"
      }
    },
    {
      name: "With All Fields",
      payload: {
        customerName: "Test Customer",
        customerPhone: "0123456789",
        pickup: "Point A",
        dropoff: "Point B",
        type: "Chở khách",
        status: "pending",
        price: 100000,
        pickupTime: new Date().toISOString()
      }
    },
    {
      name: "Alternative Field Names",
      payload: {
        customerName: "Test Customer",
        customerPhone: "0123456789",
        from: "Point A",
        to: "Point B",
        type: "Chở khách"
      }
    },
    {
      name: "With Customer Object",
      payload: {
        customer: {
          name: "Test Customer",
          phone: "0123456789"
        },
        pickup: "Point A",
        dropoff: "Point B",
        type: "Chở khách"
      }
    }
  ];

  const testPayload = async (payload) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.text();
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = data;
      }

      setResult(`✅ Status: ${response.status}\n\nResponse:\n${JSON.stringify(parsedData, null, 2)}`);
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetAll = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setResult(`✅ GET Status: ${response.status}\n\nExisting Bookings:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>🧪 Booking API Tester</h1>
      
      <div style={{ marginBottom: '30px', padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Backend: {API_URL}</h3>
        <button 
          onClick={testGetAll}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {loading ? '⏳ Testing...' : '📋 Get All Bookings (Check Schema)'}
        </button>
      </div>

      <h2 style={{ marginBottom: '15px' }}>Test Different Payloads:</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        {testPayloads.map((test, index) => (
          <div key={index} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px', background: 'white' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px' }}>{test.name}</h3>
            <pre style={{ 
              fontSize: '11px', 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '3px',
              overflow: 'auto',
              maxHeight: '150px'
            }}>
              {JSON.stringify(test.payload, null, 2)}
            </pre>
            <button
              onClick={() => testPayload(test.payload)}
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                marginTop: '10px'
              }}
            >
              {loading ? '⏳ Testing...' : '🚀 Test This'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: '#1e1e1e', 
        color: '#fff', 
        borderRadius: '5px',
        minHeight: '200px'
      }}>
        <h3 style={{ marginTop: 0, color: '#4CAF50' }}>Result:</h3>
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          wordBreak: 'break-word',
          fontSize: '13px',
          lineHeight: '1.5'
        }}>
          {result || 'Click a button to test...'}
        </pre>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        background: '#fff3cd', 
        borderLeft: '4px solid #ffc107',
        borderRadius: '3px'
      }}>
        <h3 style={{ marginTop: 0 }}>💡 Next Steps:</h3>
        <ol style={{ marginBottom: 0 }}>
          <li>Click "Get All Bookings" first to see existing schema</li>
          <li>Test each payload variation to find which one works</li>
          <li>Look at successful response structure</li>
          <li>Update your OperationMap.jsx with the correct payload format</li>
        </ol>
      </div>
    </div>
  );
};

export default BookingAPITester;