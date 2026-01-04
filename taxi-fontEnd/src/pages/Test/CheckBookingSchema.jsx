import React, { useState, useEffect } from 'react';

const CheckBookingSchema = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState('');

  const API_URL = 'https://backend-drive-bgk5.onrender.com/api';

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      // Parse the array
      const bookingArray = Array.isArray(data) ? data : 
                          Array.isArray(data.data) ? data.data :
                          Array.isArray(data.items) ? data.items : [];
      
      setBookings(bookingArray);
      console.log('📋 Existing bookings:', bookingArray);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const testMinimalPayload = async () => {
    setTestResult('Testing...');
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      // Try absolute minimal payload
      const payload = {
        customerName: "Test Customer",
        customerPhone: "0123456789",
        pickup: "Test Pickup",
        dropoff: "Test Dropoff"
      };

      console.log('🧪 Testing payload:', payload);

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ SUCCESS! Status: ${response.status}\n\nCreated:\n${JSON.stringify(result, null, 2)}`);
        fetchBookings(); // Refresh list
      } else {
        setTestResult(`❌ FAILED! Status: ${response.status}\n\nError:\n${JSON.stringify(result, null, 2)}`);
      }
    } catch (error) {
      setTestResult(`❌ ERROR: ${error.message}`);
    }
  };

  const testWithExistingSchema = async () => {
    if (bookings.length === 0) {
      setTestResult('❌ No existing bookings to copy schema from');
      return;
    }

    setTestResult('Testing...');
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      // Copy schema from first booking
      const template = bookings[0];
      const payload = {
        customerName: "Copy Schema Test",
        customerPhone: "0123456789",
        pickup: "Test A",
        dropoff: "Test B",
        // Copy other fields from existing booking
        ...(template.type && { type: template.type }),
        ...(template.status && { status: "pending" }),
        ...(template.price !== undefined && { price: 100000 }),
      };

      // Add any other fields that exist in template
      if (template.customerId) payload.customerId = template.customerId;
      if (template.vehicleId) payload.vehicleId = template.vehicleId;
      if (template.driverId) payload.driverId = template.driverId;

      console.log('🧪 Testing with schema from existing booking:', payload);

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.ok) {
        setTestResult(`✅ SUCCESS! Status: ${response.status}\n\nCreated:\n${JSON.stringify(result, null, 2)}`);
        fetchBookings();
      } else {
        setTestResult(`❌ FAILED! Status: ${response.status}\n\nError:\n${JSON.stringify(result, null, 2)}`);
      }
    } catch (error) {
      setTestResult(`❌ ERROR: ${error.message}`);
    }
  };

  const analyzeSchema = () => {
    if (bookings.length === 0) return null;

    const sample = bookings[0];
    const fields = Object.keys(sample);
    const requiredFields = fields.filter(key => sample[key] !== null && sample[key] !== undefined);

    return (
      <div style={{ marginTop: 20, padding: 15, background: '#f0f8ff', borderRadius: 5 }}>
        <h3>📊 Schema Analysis (from first booking)</h3>
        <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
          <div><strong>All Fields:</strong> {fields.join(', ')}</div>
          <div style={{ marginTop: 10 }}><strong>Sample Booking:</strong></div>
          <pre style={{ background: '#fff', padding: 10, borderRadius: 3, overflow: 'auto' }}>
            {JSON.stringify(sample, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>🔍 Booking Schema Checker</h1>
      
      <div style={{ marginBottom: 20, padding: 15, background: '#fff3cd', borderRadius: 5 }}>
        <h3>Purpose:</h3>
        <p>This tool helps identify the correct schema by:</p>
        <ol>
          <li>Fetching existing bookings to see their structure</li>
          <li>Testing minimal payloads</li>
          <li>Testing with schema copied from existing bookings</li>
        </ol>
      </div>

      <div style={{ display: 'grid', gap: 15, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <button
          onClick={fetchBookings}
          disabled={loading}
          style={{
            padding: 12,
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: 14
          }}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh Bookings'}
        </button>

        <button
          onClick={testMinimalPayload}
          style={{
            padding: 12,
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          🧪 Test Minimal Payload
        </button>

        <button
          onClick={testWithExistingSchema}
          disabled={bookings.length === 0}
          style={{
            padding: 12,
            background: bookings.length > 0 ? '#FF9800' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: bookings.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: 14
          }}
        >
          🔬 Test With Existing Schema
        </button>
      </div>

      {analyzeSchema()}

      <div style={{ marginTop: 20, padding: 15, background: '#fff', borderRadius: 5, border: '1px solid #ddd' }}>
        <h3>📋 Existing Bookings ({bookings.length})</h3>
        {bookings.length === 0 ? (
          <p>No bookings found or still loading...</p>
        ) : (
          <div style={{ maxHeight: 300, overflow: 'auto' }}>
            {bookings.slice(0, 5).map((booking, idx) => (
              <details key={idx} style={{ marginBottom: 10, padding: 10, background: '#f9f9f9', borderRadius: 3 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Booking {idx + 1}: {booking.customerName || 'N/A'}
                </summary>
                <pre style={{ fontSize: 11, marginTop: 10, overflow: 'auto' }}>
                  {JSON.stringify(booking, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        )}
      </div>

      {testResult && (
        <div style={{ 
          marginTop: 20, 
          padding: 15, 
          background: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
          borderRadius: 5,
          border: `1px solid ${testResult.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <h3>Test Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.5 }}>
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CheckBookingSchema;