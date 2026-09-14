import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/complaint/show`).catch(() => ({ data: [] }));
        if (Array.isArray(res.data)) {
          setComplaints(res.data);
        } else {
          setComplaints([]);
        }
      } catch {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filtered = complaints;

  const openComplaint = (item) => {
    setSelectedComplaint(item);
    setReplyText(item.adminReply || '');
    setReplyMessage('');
  };

  const saveReply = async () => {
    if (!selectedComplaint || !replyText.trim()) {
      setReplyMessage('Please write a reply first.');
      return;
    }
    setReplying(true);
    setReplyMessage('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/complaint/${selectedComplaint._id}/reply`, { reply: replyText });
      setSelectedComplaint(response.data.complaint);
      setComplaints((current) => current.map((item) => item._id === response.data.complaint._id ? response.data.complaint : item));
      setReplyMessage(response.data.message || 'Reply saved successfully.');
    } catch (error) {
      setReplyMessage(error.response?.data?.message || 'Reply could not be saved.');
      if (error.response?.data?.complaint) {
        setSelectedComplaint(error.response.data.complaint);
        setComplaints((current) => current.map((item) => item._id === error.response.data.complaint._id ? error.response.data.complaint : item));
      }
    } finally {
      setReplying(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="dashboard-header-title mb-1">
            Customer <span>Complaints & Inquiries</span>
          </h1>
          <p className="dashboard-subtitle mb-0">
            View customer support requests, feedback, and issue tickets
          </p>
        </div>
      </div>
      
      <div className="dashboard-section p-4" style={{ borderRadius: '18px' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '6%' }} className="text-center">S.No</th>
                <th style={{ width: '16%' }}>Ticket ID</th>
                <th style={{ width: '22%' }}>Customer</th>
                <th style={{ width: '28%' }}>Subject</th>
                <th style={{ width: '14%' }}>Status</th>
                <th style={{ width: '14%' }} className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading complaints...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="py-4">
                      <i className="bi bi-chat-left-check fs-1 d-block mb-3 text-secondary opacity-50"></i>
                      <h5 className="text-dark fw-bold mb-1">No Active Complaints or Tickets</h5>
                      <p className="text-muted small mb-0">
                        All customer inquiries and support tickets will appear here when submitted.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item._id || index}>
                    <td className="text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                      {index + 1}
                    </td>
                    <td><strong>#TKT-{item._id ? item._id.slice(-6).toUpperCase() : index + 1}</strong></td>
                    <td>{item.name || item.user?.name || 'Customer'}</td>
                    <td>{item.subject || 'Inquiry'}</td>
                    <td>
                      <span className="badge bg-warning text-dark">
                        {item.status || 'Open'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        style={{ backgroundColor: '#3945E0', border: 'none' }}
                        onClick={() => openComplaint(item)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedComplaint && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '18px' }}>
              <div className="modal-header border-0 px-4 pt-4">
                <div>
                  <span className="badge bg-primary-subtle text-primary mb-2">
                    #{selectedComplaint._id ? selectedComplaint._id.slice(-6).toUpperCase() : 'TICKET'}
                  </span>
                  <h5 className="modal-title fw-bold mb-0">{selectedComplaint.subject || 'Customer Inquiry'}</h5>
                </div>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setSelectedComplaint(null)}></button>
              </div>
              <div className="modal-body px-4 pb-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted d-block">Customer</small>
                      <strong>{selectedComplaint.name || 'Customer'}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted d-block">Email</small>
                      <strong>{selectedComplaint.email || 'Not provided'}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted d-block">Category</small>
                      <strong>{selectedComplaint.category || 'General Inquiry'}</strong>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light rounded-3 p-3">
                      <small className="text-muted d-block">Status</small>
                      <span className="badge bg-warning text-dark">{selectedComplaint.status || 'Open'}</span>
                    </div>
                  </div>
                </div>
                <div className="border rounded-3 p-3">
                  <small className="text-muted d-block mb-2">Customer message</small>
                  <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{selectedComplaint.message || 'No message provided.'}</p>
                </div>
                <div className="mt-3">
                  <label className="form-label fw-semibold">Reply to customer</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder="Write your response to this customer..."
                  ></textarea>
                  {selectedComplaint.adminReply && (
                    <small className="text-success d-block mt-2"><i className="bi bi-check-circle-fill me-1"></i>Reply already saved</small>
                  )}
                  {replyMessage && <div className="small mt-2 text-primary">{replyMessage}</div>}
                  <button type="button" className="btn btn-primary mt-3" onClick={saveReply} disabled={replying}>
                    <i className="bi bi-send me-1"></i>{replying ? 'Saving...' : 'Save Reply'}
                  </button>
                </div>
              </div>
              <div className="modal-footer border-0 px-4 pb-4">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setSelectedComplaint(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Complaints;
