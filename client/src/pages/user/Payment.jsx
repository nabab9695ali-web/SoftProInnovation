import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { API_BASE_URL } from '../../config/api';

import qrGpay from '../../assets/qr-gpay.jpg';
import qrPhonepe from '../../assets/qr-phonepe.jpg';

const paymentMethods = [
  { id: 'upi-direct', label: 'Scan & Pay via UPI (GPay / PhonePe)', icon: 'bi-qr-code-scan', sublabel: 'Direct Bank Transfer to Nabab Ali (SBI - 9749)' },
  { id: 'cod', label: 'Cash on Delivery', icon: 'bi-cash-stack', sublabel: 'Pay cash when order arrives' },
  { id: 'razorpay', label: 'Cards / NetBanking (Razorpay)', icon: 'bi-credit-card', sublabel: 'Debit/Credit Card, Netbanking, Wallets' },
  { id: 'gift-card', label: 'Have a Gift Card?', icon: 'bi-gift', sublabel: 'Redeem Gift Card balance or demo code' },
  { id: 'emi', label: 'EMI (Easy Installments)', icon: 'bi-calendar2-week', sublabel: 'No Cost EMI & Bank Plans from ₹167/mo' },
];

const EMI_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank Credit Card', badge: 'Popular', interest: 0, tenureDiscount: 'No Cost EMI on 3M' },
  { id: 'icici', name: 'ICICI Bank Credit Card', badge: 'Fast Approval', interest: 0, tenureDiscount: 'No Cost EMI on 3M' },
  { id: 'sbi', name: 'SBI Card (State Bank)', badge: 'Trusted', interest: 0, tenureDiscount: 'No Cost EMI on 3M' },
  { id: 'axis', name: 'Axis Bank Credit Card', badge: 'Rewards', interest: 0, tenureDiscount: 'No Cost EMI on 3M' },
  { id: 'bajaj', name: 'Bajaj Finserv Insta EMI', badge: '0% Interest', interest: 0, tenureDiscount: 'Zero Down Payment' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', badge: 'Instant', interest: 0, tenureDiscount: 'No Cost EMI on 3M' },
];

const DEMO_GIFT_CARDS = [
  { code: 'SPGIFT500', number: '6014 8821 3491 5001', pin: '123456', balance: 500, label: '₹500 Starter Gift' },
  { code: 'SPGIFT1000', number: '6014 9912 7740 1002', pin: '889900', balance: 1000, label: '₹1,000 Electronics Voucher' },
  { code: 'TECHINVENT2000', number: '6014 3302 4491 2004', pin: '456789', balance: 2000, label: '₹2,000 Mega Gift Card' },
];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Payment = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState('upi-direct');
  const [placed, setPlaced] = useState(false);
  const [address, setAddress] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Direct UPI QR State
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay' or 'phonepe'
  const [upiUtr, setUpiUtr] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Gift Card State
  const [giftCardNumber, setGiftCardNumber] = useState('');
  const [giftCardPin, setGiftCardPin] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState(null);
  const [giftCardError, setGiftCardError] = useState('');
  const [giftCardSuccess, setGiftCardSuccess] = useState('');

  // EMI State
  const [selectedBankId, setSelectedBankId] = useState('hdfc');
  const [selectedTenure, setSelectedTenure] = useState(3);

  const subtotal = getCartTotal();
  const totalMrp = cartItems.reduce(
    (total, item) => total + (Number(item.compareprice) || Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const savings = Math.max(totalMrp - subtotal, 0);
  const fee = 19;
  const baseTotal = Math.max(subtotal + fee, 0);
  const giftCardDeduction = appliedGiftCard ? Math.min(appliedGiftCard.balance, baseTotal) : 0;
  const total = Math.max(baseTotal - giftCardDeduction, 0);

  const activeUpiId = selectedUpiApp === 'gpay' ? 'na2529104@oksbi' : '9695572272@axl';

  const getEmiOptions = (amount) => {
    const amt = Math.max(amount, 100);
    return [
      { months: 3, interestRate: 0, isNoCost: true, monthly: Math.round(amt / 3), totalPaid: amt },
      { months: 6, interestRate: 12, isNoCost: false, monthly: Math.round((amt * 1.04) / 6), totalPaid: Math.round(amt * 1.04) },
      { months: 9, interestRate: 13, isNoCost: false, monthly: Math.round((amt * 1.07) / 9), totalPaid: Math.round(amt * 1.07) },
      { months: 12, interestRate: 14, isNoCost: false, monthly: Math.round((amt * 1.09) / 12), totalPaid: Math.round(amt * 1.09) },
    ];
  };

  useEffect(() => {
    const loadAddress = async () => {
      const token = localStorage.getItem('token');
      let storedUser = null;
      try {
        storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      } catch {
        storedUser = null;
      }
      let userId = storedUser?._id || storedUser?.id;

      if (!userId && token) {
        try {
          const currentUser = await axios.get(`${API_BASE_URL}/api/user/current-user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          userId = currentUser.data?.user?._id;
        } catch {
          userId = null;
        }
      }

      if (!userId) {
        setOrderError('Please sign in before placing this order.');
        return;
      }

      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/address/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const defaultAddr =
          data?.addresses?.find((item) => item.isdefault === 'yes') ||
          data?.addresses?.[0] ||
          data?.[0] ||
          null;
        setAddress(defaultAddr);
        if (!defaultAddr) {
          setOrderError('No delivery address found. Please add an address to continue.');
        }
      } catch (err) {
        console.error('Failed to load address:', err);
        setOrderError('Delivery address could not be loaded.');
      }
    };

    loadAddress();
  }, []);

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeUpiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  // Gift Card Application Handlers
  const handleApplyGiftCard = (manualCode, manualPin) => {
    setGiftCardError('');
    setGiftCardSuccess('');
    const codeToMatch = (manualCode || giftCardNumber).trim().toUpperCase();
    const pinToMatch = (manualPin || giftCardPin).trim();

    if (!codeToMatch) {
      setGiftCardError('Please enter a Gift Card number or Voucher code.');
      return;
    }

    const foundDemo = DEMO_GIFT_CARDS.find(
      (c) => c.code === codeToMatch || c.number.replace(/\s+/g, '') === codeToMatch.replace(/\s+/g, '')
    );

    if (foundDemo) {
      if (manualPin || (foundDemo.pin && pinToMatch === foundDemo.pin) || !pinToMatch) {
        setAppliedGiftCard(foundDemo);
        setGiftCardSuccess(`Gift Card of ₹${foundDemo.balance.toLocaleString('en-IN')} applied successfully!`);
        setGiftCardNumber('');
        setGiftCardPin('');
        return;
      } else {
        setGiftCardError(`Incorrect 6-digit PIN. (PIN for this voucher is: ${foundDemo.pin})`);
        return;
      }
    }

    if (codeToMatch.length >= 6) {
      const customCard = {
        code: codeToMatch,
        number: codeToMatch.length >= 12 ? codeToMatch.replace(/(\d{4})/g, '$1 ').trim() : `GC-${codeToMatch}`,
        balance: 1500,
        label: 'Redeemed Gift Card',
      };
      setAppliedGiftCard(customCard);
      setGiftCardSuccess(`Gift Card applied! ₹1,500 credited to this order.`);
      setGiftCardNumber('');
      setGiftCardPin('');
      return;
    }

    setGiftCardError('Invalid gift card number. Try clicking one of the instant vouchers below.');
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
    setGiftCardSuccess('');
    setGiftCardError('');
  };

  const getAuthUserId = async () => {
    const token = localStorage.getItem('token');
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      storedUser = null;
    }
    let userId = storedUser?._id || storedUser?.id;

    if (!userId && token) {
      try {
        const currentUser = await axios.get(`${API_BASE_URL}/api/user/current-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        userId = currentUser.data?.user?._id;
      } catch {
        userId = null;
      }
    }
    return userId;
  };

  // 1. Direct UPI Order (Google Pay / PhonePe)
  const handleDirectUpiOrder = async () => {
    if (!address) {
      setOrderError('Please add or select a delivery address before placing your order.');
      return;
    }
    const userId = await getAuthUserId();
    if (!userId) {
      setOrderError('Please sign in again before placing this order.');
      return;
    }

    setPlacing(true);
    setOrderError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/order/create`, {
        user_id: userId,
        items: cartItems,
        address,
        subtotal,
        fee,
        discount: savings + giftCardDeduction,
        totalAmount: total,
        paymentMethod: 'upi',
        upiId: activeUpiId,
        paymentReference: upiUtr ? `UTR-${upiUtr.trim()}` : `UPI-${activeUpiId}`,
      });
      setPlacedOrder(response.data.order);
      clearCart();
      setPlaced(true);
    } catch (error) {
      console.error('Direct UPI order error:', error.response?.data || error);
      setOrderError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to confirm UPI order. Please check connection and try again.'
      );
    } finally {
      setPlacing(false);
    }
  };

  // 2. Cash On Delivery Order
  const handleCodOrder = async () => {
    if (!address) {
      setOrderError('Please add or select a delivery address before placing your order.');
      return;
    }
    const userId = await getAuthUserId();
    if (!userId) {
      setOrderError('Please sign in again before placing this order.');
      return;
    }

    setPlacing(true);
    setOrderError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/order/create`, {
        user_id: userId,
        items: cartItems,
        address,
        subtotal,
        fee,
        discount: savings + giftCardDeduction,
        totalAmount: total,
        paymentMethod: 'cod',
      });
      setPlacedOrder(response.data.order);
      clearCart();
      setPlaced(true);
    } catch (error) {
      console.error('Place order error:', error.response?.data || error);
      setOrderError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Order could not be placed. Please try again.'
      );
    } finally {
      setPlacing(false);
    }
  };

  // 3. Razorpay Online Payment (Cards & NetBanking)
  const handleRazorpayPayment = async () => {
    if (!address) {
      setOrderError('Please select a delivery address before proceeding to payment.');
      return;
    }
    const userId = await getAuthUserId();
    if (!userId) {
      setOrderError('Please sign in again before placing this order.');
      return;
    }

    setPlacing(true);
    setOrderError('');

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');
      }

      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

      const { data: orderRes } = await axios.post(`${API_BASE_URL}/api/payment/create-order`, {
        amount: total,
        currency: 'INR',
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to initialize Razorpay transaction.');
      }

      const options = {
        key: orderRes.key,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'SoftPro Innovation',
        description: `Order Payment (${cartItems.length} items)`,
        image: 'https://cdn-icons-png.flaticon.com/512/891/891462.png',
        order_id: orderRes.orderId,
        prefill: {
          name: address.name || storedUser?.name || '',
          email: storedUser?.email || '',
          contact: address.mobile || storedUser?.mobile || '',
        },
        notes: {
          address: `${address.address || ''}, ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`,
        },
        theme: {
          color: '#2563eb',
        },
        handler: async function (razorpayResponse) {
          try {
            setPlacing(true);
            const { data: verifyRes } = await axios.post(`${API_BASE_URL}/api/payment/verify`, {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              orderData: {
                user_id: userId,
                items: cartItems,
                address,
                subtotal,
                fee,
                discount: savings + giftCardDeduction,
                totalAmount: total,
              },
            });

            if (verifyRes.success) {
              setPlacedOrder(verifyRes.order);
              clearCart();
              setPlaced(true);
            } else {
              setOrderError(verifyRes.message || 'Payment verification failed.');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setOrderError(
              err.response?.data?.message || 'Payment verification failed. Please check your transaction history.'
            );
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPlacing(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        console.error('Razorpay Payment Failed:', response.error);
        setOrderError(response.error?.description || 'Payment failed or declined by bank.');
        setPlacing(false);
      });

      razorpayInstance.open();
    } catch (error) {
      console.error('Razorpay initiation error:', error);
      setOrderError(error.response?.data?.message || error.message || 'Payment failed to initiate.');
      setPlacing(false);
    }
  };

  // 4. Gift Card Order
  const handleGiftCardOrder = async () => {
    if (!address) {
      setOrderError('Please add or select a delivery address before placing your order.');
      return;
    }
    const userId = await getAuthUserId();
    if (!userId) {
      setOrderError('Please sign in again before placing this order.');
      return;
    }

    setPlacing(true);
    setOrderError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/order/create`, {
        user_id: userId,
        items: cartItems,
        address,
        subtotal,
        fee,
        discount: savings + giftCardDeduction,
        totalAmount: total,
        paymentMethod: 'gift-card',
        giftCardCode: appliedGiftCard?.code || 'GIFT-CARD-VOUCHER',
      });
      setPlacedOrder(response.data.order);
      clearCart();
      setPlaced(true);
    } catch (error) {
      console.error('Gift card order error:', error.response?.data || error);
      setOrderError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Order could not be placed with Gift Card.'
      );
    } finally {
      setPlacing(false);
    }
  };

  // 5. EMI Order Handler
  const handleEmiOrder = async () => {
    if (!address) {
      setOrderError('Please add or select a delivery address before placing your order.');
      return;
    }
    const userId = await getAuthUserId();
    if (!userId) {
      setOrderError('Please sign in again before placing this order.');
      return;
    }

    setPlacing(true);
    setOrderError('');
    const emiPlans = getEmiOptions(total);
    const selectedPlan = emiPlans.find((p) => p.months === selectedTenure) || emiPlans[0];
    const selectedBank = EMI_BANKS.find((b) => b.id === selectedBankId) || EMI_BANKS[0];

    try {
      const response = await axios.post(`${API_BASE_URL}/api/order/create`, {
        user_id: userId,
        items: cartItems,
        address,
        subtotal,
        fee,
        discount: savings + giftCardDeduction,
        totalAmount: total,
        paymentMethod: 'emi',
        emiDetails: `${selectedBank.name} - ${selectedTenure} Months EMI`,
        emiTenure: `${selectedTenure} Months @ ₹${selectedPlan.monthly.toLocaleString('en-IN')}/mo`,
      });
      setPlacedOrder(response.data.order);
      clearCart();
      setPlaced(true);
    } catch (error) {
      console.error('EMI order error:', error.response?.data || error);
      setOrderError(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'EMI order could not be placed. Please try again.'
      );
    } finally {
      setPlacing(false);
    }
  };

  const renderMethodContent = () => {
    // 1. Direct UPI QR Code (Google Pay & PhonePe - Nabab Ali)
    if (selectedMethod === 'upi-direct') {
      const upiDeepLink = `upi://pay?pa=${activeUpiId}&pn=Nabab%20Ali&am=${total}&cu=INR`;

      return (
        <div className="payment-method-content text-start">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-qr-code-scan text-primary fs-5"></i>
                <span>Scan &amp; Pay via UPI</span>
              </h5>
              <small className="text-muted">Instant transfer directly to Nabab Ali (SBI - 9749)</small>
            </div>
            <span className="badge bg-success text-white fw-bold px-2 py-1">
              <i className="bi bi-shield-fill-check me-1"></i>0% Fee
            </span>
          </div>

          {/* App Switcher Pills */}
          <div className="d-flex gap-2 my-3">
            <button
              type="button"
              className={`btn btn-sm flex-fill fw-bold py-2 rounded-3 border d-flex align-items-center justify-content-center gap-2 ${
                selectedUpiApp === 'gpay'
                  ? 'btn-primary shadow-xs'
                  : 'btn-light text-dark'
              }`}
              onClick={() => setSelectedUpiApp('gpay')}
            >
              <i className="bi bi-google"></i>
              <span>Google Pay</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm flex-fill fw-bold py-2 rounded-3 border d-flex align-items-center justify-content-center gap-2 ${
                selectedUpiApp === 'phonepe'
                  ? 'btn-success shadow-xs'
                  : 'btn-light text-dark'
              }`}
              onClick={() => setSelectedUpiApp('phonepe')}
            >
              <i className="bi bi-phone"></i>
              <span>PhonePe</span>
            </button>
          </div>

          {/* QR Code Container */}
          <div className="p-3 bg-light rounded-3 border text-center mb-3">
            <div className="d-inline-block p-2 bg-white rounded-3 shadow-xs border mb-2 position-relative">
              <img
                src={selectedUpiApp === 'gpay' ? qrGpay : qrPhonepe}
                alt={`${selectedUpiApp === 'gpay' ? 'Google Pay' : 'PhonePe'} QR Code`}
                style={{
                  width: '210px',
                  height: '240px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  display: 'block',
                }}
              />
            </div>

            <div className="mt-1">
              <div className="badge bg-primary fs-6 px-3 py-1.5 rounded-pill mb-2">
                Pay Amount: ₹{total.toLocaleString('en-IN')}
              </div>
              <div className="small text-muted mb-1">
                Account: <strong>Nabab Ali</strong> &bull; State Bank of India - 9749
              </div>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <span className="font-monospace small bg-white px-2.5 py-1 rounded border text-dark fw-bold">
                  {activeUpiId}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary py-0.5 px-2"
                  style={{ fontSize: '11px' }}
                  onClick={handleCopyUpi}
                >
                  <i className={`bi ${copiedUpi ? 'bi-check2' : 'bi-clipboard'} me-1`}></i>
                  <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Mobile App Intent Trigger */}
            <div className="d-block d-md-none mt-2.5">
              <a
                href={upiDeepLink}
                className="btn btn-sm btn-dark w-100 py-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
              >
                <i className="bi bi-box-arrow-up-right"></i>
                <span>Open in {selectedUpiApp === 'gpay' ? 'Google Pay' : 'PhonePe'}</span>
              </a>
            </div>
          </div>

          {/* Step 2: UTR / Reference confirmation */}
          <div className="bg-white p-3 rounded-3 border mb-3">
            <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between">
              <span>Step 2: Enter 12-Digit UTR / UPI Ref (Optional)</span>
              <span className="text-muted" style={{ fontSize: '11px' }}>From receipt</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted small">
                <i className="bi bi-receipt"></i>
              </span>
              <input
                type="text"
                maxLength={16}
                className="form-control font-monospace"
                placeholder="e.g. 425178921045"
                value={upiUtr}
                onChange={(e) => setUpiUtr(e.target.value.replace(/\s+/g, ''))}
              />
            </div>
            <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
              Once you scan and complete the transfer on your phone, click the button below to confirm.
            </small>
          </div>

          {orderError && <div className="alert alert-danger small py-2 mb-3">{orderError}</div>}

          {/* Confirm Button */}
          <button
            type="button"
            className="btn payment-primary-btn w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 shadow-sm"
            onClick={handleDirectUpiOrder}
            disabled={placing}
          >
            {placing ? (
              <span><i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>Confirming Order...</span>
            ) : (
              <>
                <i className="bi bi-check-circle-fill fs-5"></i>
                <span className="fw-bold">I Have Paid ₹{total.toLocaleString('en-IN')} &bull; Confirm Order</span>
              </>
            )}
          </button>
        </div>
      );
    }

    // 2. Cash On Delivery
    if (selectedMethod === 'cod') {
      return (
        <div className="payment-method-content">
          <h5 className="fw-bold mb-2">Cash on Delivery</h5>
          <p className="text-muted mb-4">Pay securely in cash or via UPI when your order arrives at your doorstep.</p>
          <button
            type="button"
            className="btn payment-primary-btn w-100"
            onClick={handleCodOrder}
            disabled={placing}
          >
            {placing ? (
              <span><i className="bi bi-hourglass-split me-2"></i>Placing order...</span>
            ) : (
              <>
                <i className="bi bi-bag-check-fill me-2 fs-5"></i>
                <span>Place Cash on Delivery Order (₹{total.toLocaleString('en-IN')})</span>
              </>
            )}
          </button>
        </div>
      );
    }

    // 3. Razorpay Online (Cards / NetBanking)
    if (selectedMethod === 'razorpay') {
      return (
        <div className="payment-method-content">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0">Debit/Credit Cards &amp; NetBanking</h5>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
              <i className="bi bi-shield-fill-check me-1"></i>Razorpay Gateway
            </span>
          </div>

          <p className="text-muted small mb-3">
            Pay securely using Visa, MasterCard, RuPay, NetBanking, or Digital Wallets with bank-grade encryption.
          </p>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <span className="badge bg-light text-dark border px-2 py-1"><i className="bi bi-credit-card-2-front me-1 text-success"></i>Debit/Credit Cards</span>
            <span className="badge bg-light text-dark border px-2 py-1"><i className="bi bi-bank me-1 text-info"></i>Net Banking (50+ Banks)</span>
            <span className="badge bg-light text-dark border px-2 py-1"><i className="bi bi-wallet2 me-1 text-warning"></i>Wallets</span>
          </div>

          {orderError && <div className="alert alert-danger small py-2 mb-3">{orderError}</div>}

          <button
            type="button"
            className="btn payment-primary-btn w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            onClick={handleRazorpayPayment}
            disabled={placing}
          >
            {placing ? (
              <span><i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>Processing...</span>
            ) : (
              <>
                <i className="bi bi-lock-fill"></i>
                <span>Pay ₹{total.toLocaleString('en-IN')} via Razorpay</span>
              </>
            )}
          </button>
          <div className="text-center mt-2">
            <small className="text-muted" style={{ fontSize: '11px' }}>
              <i className="bi bi-shield-check text-success me-1"></i>256-bit SSL Encrypted &bull; Official Gateway
            </small>
          </div>
        </div>
      );
    }

    // 4. Gift Card Option
    if (selectedMethod === 'gift-card') {
      return (
        <div className="payment-method-content text-start">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-gift-fill text-warning fs-5"></i>
              <span>Electronic Gift Card</span>
            </h5>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
              <i className="bi bi-shield-check me-1"></i>Instant Balance
            </span>
          </div>

          <p className="text-muted small mb-3">
            Redeem your 16-digit Gift Card &amp; PIN or pick a demo voucher. Balance will be deducted immediately from your payable total.
          </p>

          {appliedGiftCard ? (
            <div className="gift-card-visual mb-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span className="badge bg-warning text-dark fw-bold mb-1">
                    <i className="bi bi-patch-check-fill me-1"></i>APPLIED GIFT CARD
                  </span>
                  <h5 className="fw-bold mb-0 text-white font-monospace">{appliedGiftCard.number || appliedGiftCard.code}</h5>
                </div>
                <div className="text-end">
                  <small className="text-white-50 d-block" style={{ fontSize: '11px' }}>Card Value</small>
                  <h4 className="fw-bold text-warning mb-0">₹{appliedGiftCard.balance.toLocaleString('en-IN')}</h4>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center pt-2 border-top border-white border-opacity-25 mt-2">
                <small className="text-white-50" style={{ fontSize: '11px' }}>
                  Deducted on this order: <strong className="text-white">₹{giftCardDeduction.toLocaleString('en-IN')}</strong>
                </small>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light py-0 px-2"
                  style={{ fontSize: '12px' }}
                  onClick={handleRemoveGiftCard}
                >
                  <i className="bi bi-x-circle me-1"></i>Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-light p-3 rounded-3 border mb-3">
              <div className="mb-2">
                <label className="form-label small fw-bold text-dark mb-1">16-Digit Gift Card Number / Voucher</label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><i className="bi bi-credit-card text-muted"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 6014 9912 7740 1002 or SPGIFT1000"
                    value={giftCardNumber}
                    onChange={(e) => setGiftCardNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-dark mb-1">6-Digit Card PIN</label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><i className="bi bi-key text-muted"></i></span>
                  <input
                    type="password"
                    maxLength="6"
                    className="form-control"
                    placeholder="6-digit PIN (e.g. 889900)"
                    value={giftCardPin}
                    onChange={(e) => setGiftCardPin(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary w-100 fw-bold py-2 shadow-xs"
                onClick={() => handleApplyGiftCard()}
              >
                <i className="bi bi-check2-circle me-1"></i>Apply Gift Card
              </button>
            </div>
          )}

          {giftCardSuccess && (
            <div className="alert alert-success small py-2 d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-check-circle-fill text-success"></i>
              <span>{giftCardSuccess}</span>
            </div>
          )}
          {giftCardError && (
            <div className="alert alert-danger small py-2 d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-exclamation-triangle-fill text-danger"></i>
              <span>{giftCardError}</span>
            </div>
          )}

          {/* Quick Demo Vouchers */}
          <div className="mb-3 p-2.5 rounded-3 bg-white border">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <small className="fw-bold text-secondary text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.4px' }}>
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i>Quick Demo Vouchers:
              </small>
              <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '10px' }}>1-Click Apply</span>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {DEMO_GIFT_CARDS.map((card) => (
                <button
                  key={card.code}
                  type="button"
                  className="gift-card-demo-chip"
                  onClick={() => handleApplyGiftCard(card.code, card.pin)}
                >
                  <i className="bi bi-gift-fill text-primary"></i>
                  <span>{card.code}</span>
                  <span className="badge bg-primary text-white ms-1">₹{card.balance}</span>
                </button>
              ))}
            </div>
          </div>

          {appliedGiftCard && total === 0 ? (
            <button
              type="button"
              className="btn payment-primary-btn w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 shadow-sm"
              onClick={handleGiftCardOrder}
              disabled={placing}
            >
              {placing ? (
                <span><i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>Placing Order...</span>
              ) : (
                <>
                  <i className="bi bi-bag-check-fill fs-5"></i>
                  <span className="fw-bold">Pay ₹0 &bull; Place Order with Gift Card</span>
                </>
              )}
            </button>
          ) : appliedGiftCard && total > 0 ? (
            <div className="p-3 bg-light rounded-3 border text-start">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted">Remaining Balance to Pay:</span>
                <span className="fw-bold fs-5 text-dark">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-muted small mb-3" style={{ fontSize: '12px' }}>
                Gift Card covered ₹{giftCardDeduction.toLocaleString('en-IN')}. Choose payment method for the remaining ₹{total.toLocaleString('en-IN')}:
              </p>
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="btn btn-success fw-bold py-2 shadow-xs"
                  onClick={() => setSelectedMethod('upi-direct')}
                >
                  <i className="bi bi-qr-code-scan me-1"></i>Pay ₹{total.toLocaleString('en-IN')} via UPI QR (GPay / PhonePe)
                </button>
                <button
                  type="button"
                  className="btn btn-outline-dark fw-bold py-2"
                  onClick={handleCodOrder}
                  disabled={placing}
                >
                  <i className="bi bi-cash-stack me-1"></i>Pay ₹{total.toLocaleString('en-IN')} via Cash on Delivery
                </button>
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    // 5. EMI Option
    if (selectedMethod === 'emi') {
      const emiPlans = getEmiOptions(total);
      const selectedPlan = emiPlans.find((p) => p.months === selectedTenure) || emiPlans[0];
      const selectedBank = EMI_BANKS.find((b) => b.id === selectedBankId) || EMI_BANKS[0];

      return (
        <div className="payment-method-content text-start">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-calendar2-week-fill text-primary"></i>
                <span>Equated Monthly Installments (EMI)</span>
              </h5>
              <small className="text-muted">No Cost EMI &amp; Easy Bank Installments</small>
            </div>
            <span className="badge bg-success text-white fw-bold px-2 py-1">
              <i className="bi bi-lightning-fill me-1"></i>Pre-Approved
            </span>
          </div>

          {/* Step 1: Select Bank */}
          <div className="mb-3 text-start">
            <label className="form-label small fw-bold text-dark mb-1 d-flex align-items-center justify-content-between">
              <span>1. Select Bank / Issuer:</span>
              <span className="text-primary small" style={{ fontSize: '11px' }}>6 Banks Supported</span>
            </label>
            <select
              className="form-select emi-bank-select-box"
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
            >
              {EMI_BANKS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} &mdash; ({b.tenureDiscount})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Choose Tenure */}
          <div className="mb-3 text-start">
            <label className="form-label small fw-bold text-dark mb-2">
              2. Choose EMI Tenure:
            </label>
            <div className="row g-2">
              {emiPlans.map((plan) => (
                <div className="col-6" key={plan.months}>
                  <div
                    className={`emi-tenure-btn ${selectedTenure === plan.months ? 'active' : ''}`}
                    onClick={() => setSelectedTenure(plan.months)}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>
                        {plan.months} Months
                      </span>
                      {plan.isNoCost ? (
                        <span className="tenure-badge bg-success text-white">0% No Cost</span>
                      ) : (
                        <span className="tenure-badge bg-light text-muted border">{plan.interestRate}% p.a.</span>
                      )}
                    </div>
                    <div className="fw-bold fs-6 text-primary">
                      ₹{plan.monthly.toLocaleString('en-IN')}<small className="text-muted fw-normal" style={{ fontSize: '11px' }}>/mo</small>
                    </div>
                    <div className="text-muted" style={{ fontSize: '11px' }}>
                      Total: ₹{plan.totalPaid.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EMI Breakdown Strip */}
          <div className="emi-summary-strip mb-4 text-start">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted">Monthly Installment:</span>
              <span className="fw-bold text-primary fs-5">₹{selectedPlan.monthly.toLocaleString('en-IN')}/month</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted">Tenure:</span>
              <span className="small fw-semibold text-dark">{selectedPlan.months} Months</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted">Card / Issuer:</span>
              <span className="small fw-semibold text-dark">{selectedBank.name}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
              <span className="small text-muted">Total Amount to be Paid:</span>
              <strong className="text-dark">₹{selectedPlan.totalPaid.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {orderError && <div className="alert alert-danger small py-2 mb-3">{orderError}</div>}

          {/* Order Placement with EMI */}
          <div className="d-flex flex-column gap-2">
            <button
              type="button"
              className="btn payment-primary-btn w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 shadow-sm"
              onClick={handleEmiOrder}
              disabled={placing}
            >
              {placing ? (
                <span><i className="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>Confirming EMI Order...</span>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill"></i>
                  <span className="fw-bold">Confirm EMI Order (₹{selectedPlan.monthly.toLocaleString('en-IN')}/mo)</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center mt-2">
            <small className="text-muted" style={{ fontSize: '11px' }}>
              <i className="bi bi-shield-check text-success me-1"></i>Zero paper documentation &bull; Instant bank approval
            </small>
          </div>
        </div>
      );
    }

    return null;
  };

  if (placed) {
    return (
      <div className="payment-page min-vh-100 d-flex flex-column">
        <Header />
        <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <div className="payment-success bg-white shadow-sm p-4 p-md-5 rounded-4 text-center" style={{ maxWidth: '640px', width: '100%' }}>
            <div className="success-icon mb-2">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3.5rem' }}></i>
            </div>
            <h2 className="fw-bold text-dark mb-1">Order Confirmed!</h2>
            <p className="text-secondary small mb-3">
              Thank you for shopping with SoftPro Innovation. We have received your order.
            </p>

            {/* Flipkart Green Delivery Banner */}
            <div
              className="p-3 rounded-3 text-white text-start mb-4 shadow-xs position-relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)' }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-uppercase fw-bold small opacity-75" style={{ fontSize: '11px', letterSpacing: '0.4px' }}>
                    <i className="bi bi-truck me-1"></i> Delivery Guarantee
                  </div>
                  <h4 className="fw-bold mb-0 mt-1" style={{ fontSize: '1.25rem' }}>
                    Delivery by Tomorrow, 11:00 PM
                  </h4>
                  <small className="opacity-90" style={{ fontSize: '12px' }}>
                    Standard Air Express via BlueDart / Delhivery Logistics
                  </small>
                </div>
                <div className="d-none d-sm-block text-end">
                  <span className="badge bg-white text-success fw-bold px-2.5 py-1.5 shadow-xs">
                    <i className="bi bi-patch-check-fill me-1"></i>Flipkart Assured
                  </span>
                </div>
              </div>
            </div>

            {/* Flipkart 4-Step Stepper */}
            <div className="p-3 rounded-3 bg-light border mb-4 text-start">
              <div className="d-flex justify-content-between align-items-center position-relative mb-2">
                <div className="d-flex flex-column align-items-center text-center" style={{ zIndex: 2 }}>
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mb-1" style={{ width: '26px', height: '26px', fontSize: '12px' }}>
                    <i className="bi bi-check-lg"></i>
                  </div>
                  <small className="fw-bold text-dark" style={{ fontSize: '11px' }}>Confirmed</small>
                </div>

                <div className="d-flex flex-column align-items-center text-center" style={{ zIndex: 2 }}>
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-1" style={{ width: '26px', height: '26px', fontSize: '11px', fontWeight: 'bold' }}>
                    2
                  </div>
                  <small className="fw-bold text-primary" style={{ fontSize: '11px' }}>Shipped</small>
                </div>

                <div className="d-flex flex-column align-items-center text-center" style={{ zIndex: 2 }}>
                  <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mb-1" style={{ width: '26px', height: '26px', fontSize: '11px' }}>
                    3
                  </div>
                  <small className="text-muted" style={{ fontSize: '11px' }}>Out for Delivery</small>
                </div>

                <div className="d-flex flex-column align-items-center text-center" style={{ zIndex: 2 }}>
                  <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mb-1" style={{ width: '26px', height: '26px', fontSize: '11px' }}>
                    4
                  </div>
                  <small className="text-muted" style={{ fontSize: '11px' }}>Delivered</small>
                </div>

                <div
                  className="position-absolute"
                  style={{
                    top: '12px',
                    left: '10%',
                    right: '10%',
                    height: '3px',
                    backgroundColor: '#cbd5e1',
                    zIndex: 1
                  }}
                >
                  <div style={{ width: '35%', height: '100%', backgroundColor: '#16a34a' }}></div>
                </div>
              </div>
            </div>

            {/* Order Summary Specs */}
            <div className="bg-light p-3 rounded-3 text-start mb-4 border">
              {placedOrder?.orderId && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Order ID:</span>
                  <span className="fw-bold small font-monospace text-primary">{placedOrder.orderId}</span>
                </div>
              )}
              {placedOrder?.paymentMethod && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Payment Method:</span>
                  <span className="badge bg-primary text-uppercase">
                    {placedOrder.paymentMethod === 'upi'
                      ? 'Direct UPI Transfer'
                      : placedOrder.paymentMethod === 'gift-card'
                      ? 'Gift Card'
                      : placedOrder.paymentMethod === 'emi'
                      ? 'Bank EMI'
                      : placedOrder.paymentMethod}
                  </span>
                </div>
              )}
              {placedOrder?.paymentReference && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Reference / UTR:</span>
                  <span className="small fw-semibold text-dark font-monospace">{placedOrder.paymentReference}</span>
                </div>
              )}
              {placedOrder?.totalAmount !== undefined && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Amount Paid:</span>
                  <span className="fw-bold text-success">₹{placedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="d-flex justify-content-between pt-2 border-top">
                <span className="text-muted small">Status:</span>
                <span className="text-success fw-bold small">
                  <i className="bi bi-clock-history me-1"></i>Packing for Fast Dispatch
                </span>
              </div>
            </div>

            {/* Dual Actions */}
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-warning fw-bold px-4 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 shadow-xs"
                style={{ backgroundColor: '#ff9f00', borderColor: '#ff9f00', color: '#ffffff' }}
                onClick={() => navigate(`/track-order?id=${placedOrder?.orderId || ''}`)}
              >
                <i className="bi bi-geo-alt-fill"></i>
                <span>Track Order Live</span>
              </button>
              <button
                type="button"
                className="btn btn-outline-dark fw-bold px-4 py-2.5 rounded-3"
                onClick={() => navigate('/Product')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-page min-vh-100 d-flex flex-column">
      <Header />
      <main className="container flex-grow-1 py-4 py-lg-5">
        <div className="payment-shell bg-white shadow-sm">
          <div className="payment-heading d-flex align-items-center justify-content-between px-4 px-lg-5 py-4">
            <button
              type="button"
              className="btn btn-link text-dark p-0 text-decoration-none fw-bold d-flex align-items-center gap-3"
              onClick={() => navigate('/cart')}
            >
              <i className="bi bi-arrow-left fs-4"></i>
              <span className="fs-5">Complete Payment</span>
            </button>
            <span className="secure-badge">
              <i className="bi bi-lock-fill me-1"></i>100% Secure Checkout
            </span>
          </div>

          <div className="row g-0 payment-body">
            {/* Left Column: Payment Methods List */}
            <div className="col-12 col-lg-4 payment-method-list p-3 p-lg-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`payment-method-option ${selectedMethod === method.id ? 'active' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <i className={`bi ${method.icon}`}></i>
                  <span>{method.label}</span>
                  {method.sublabel && <small>{method.sublabel}</small>}
                  {method.id === 'upi-direct' && (
                    <strong className="text-success">Recommended &bull; 0% Fee</strong>
                  )}
                  {method.id === 'emi' && (
                    <strong className="text-success">
                      From ₹{Math.round(total / 3).toLocaleString('en-IN')}/mo
                    </strong>
                  )}
                  {method.id === 'gift-card' && (
                    <strong className={appliedGiftCard ? 'text-success' : 'text-primary'}>
                      {appliedGiftCard ? 'Applied ✓' : 'Instant Redeem'}
                    </strong>
                  )}
                </button>
              ))}
            </div>

            {/* Middle Column: Selected Method Interaction Form */}
            <div className="col-12 col-lg-4 payment-center p-3 p-lg-4">
              {address ? (
                <div className="d-flex align-items-center justify-content-between p-3 bg-white rounded-3 border mb-3">
                  <div>
                    <div className="small fw-bold text-dark">
                      <i className="bi bi-geo-alt-fill text-primary me-1"></i>Delivering to {address.name}
                    </div>
                    <div className="text-muted small" style={{ fontSize: '12px' }}>
                      {address.address || address.Address}, {address.city}, {address.state} - {address.pincode}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm ms-2"
                    onClick={() => navigate('/addresses')}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="alert alert-warning d-flex align-items-center justify-content-between mb-3 p-3">
                  <div>
                    <div className="fw-semibold small text-dark">
                      <i className="bi bi-exclamation-triangle-fill text-warning me-1"></i>No Delivery Address Found
                    </div>
                    <div className="small text-muted" style={{ fontSize: '12px' }}>
                      Please add an address to place your order.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm ms-2"
                    onClick={() => navigate('/addresses', { state: { openForm: true } })}
                  >
                    Add Address
                  </button>
                </div>
              )}
              {orderError && <div className="alert alert-danger small mb-3">{orderError}</div>}
              {renderMethodContent()}
            </div>

            {/* Right Column: Price Summary Details */}
            <div className="col-12 col-lg-4 payment-summary p-3 p-lg-4">
              <div className="summary-card">
                <h5 className="fw-bold mb-4">Price Details</h5>
                <div className="summary-line">
                  <span>MRP (incl. of all taxes)</span>
                  <strong>₹{totalMrp.toLocaleString('en-IN')}</strong>
                </div>
                <div className="summary-line summary-section">
                  <span>Fees <i className="bi bi-chevron-up ms-1"></i></span>
                  <strong>₹{fee}</strong>
                </div>
                <div className="summary-subline">
                  <span>Protect Promise Fee</span>
                  <span>₹{fee}</span>
                </div>
                <div className="summary-line summary-section">
                  <span>Discounts <i className="bi bi-chevron-up ms-1"></i></span>
                  <strong className="text-success">-₹{savings.toLocaleString('en-IN')}</strong>
                </div>
                <div className="summary-subline">
                  <span>MRP Discount</span>
                  <span className="text-success">-₹{savings.toLocaleString('en-IN')}</span>
                </div>

                {appliedGiftCard && (
                  <>
                    <div className="summary-line summary-section">
                      <span>Gift Card Applied <i className="bi bi-gift-fill text-warning ms-1"></i></span>
                      <strong className="text-success">-₹{giftCardDeduction.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="summary-subline">
                      <span>{appliedGiftCard.code}</span>
                      <span className="text-success">-₹{giftCardDeduction.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}

                <div className="summary-total">
                  <span>Total Amount</span>
                  <strong>₹{total.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="cashback-banner mt-3">
                <strong>5% Cashback</strong>
                <span>Claim now with payment offers</span>
                <div>
                  <i className="bi bi-bank"></i>
                  <i className="bi bi-wallet2"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
