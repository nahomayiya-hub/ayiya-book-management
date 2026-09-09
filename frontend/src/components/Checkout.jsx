import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById, createPayment } from '../services/bookService';
import API from '../services/api';

const Checkout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [discount, setDiscount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(10.00);
    const [userType, setUserType] = useState('normal');

    useEffect(() => {
        fetchBook();
        fetchUserType();
    }, [id]);

    const fetchBook = async () => {
        try {
            const data = await getBookById(id);
            setBook(data);
        } catch (error) {
            console.error('Error fetching book:', error);
        } finally {
            setLoading(false);
        }
    };

   const fetchUserType = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("No token found");
            return;
        }
        const res = await API.get('/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const userTypeData = res.data.user_type || 'normal';
        setUserType(userTypeData);
        
        let discountPercent = 0;
        switch (userTypeData) {
            case 'student':
                discountPercent = 20;
                break;
            case 'teacher':
                discountPercent = 15;
                break;
            case 'disabled':
                discountPercent = 25;
                break;
            default:
                discountPercent = 0;
        }
        setDiscount(discountPercent);
        const amount = 10.00 * (1 - discountPercent / 100);
        setFinalAmount(Math.round(amount * 100) / 100);
    } catch (error) {
        console.error('Error fetching user type:', error);
    }
};

    const handlePayment = async () => {
        console.log("📖 Book ID:", id);
        console.log("💳 Payment Method:", paymentMethod);
        setProcessing(true);
        try {
            const result = await createPayment(id, paymentMethod);
            alert(`Payment successful! Transaction ID: ${result.transactionId}`);
            navigate('/');
        } catch (error) {
            console.error("❌ Payment error:", error);
            alert(error.response?.data?.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-xl">Book not found</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                    <h1 className="text-3xl font-bold text-white mb-6">Checkout</h1>
                    
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white">{book?.title}</h2>
                        <p className="text-gray-400">✍️ {book?.author}</p>
                        
                        {/* ===== DISCOUNT DISPLAY ===== */}
                        {discount > 0 ? (
                            <div className="mt-2">
                                <p className="text-green-400">
                                    🎉 {discount}% discount applied! ({userType})
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Original Price: <span className="line-through">$10.00</span>
                                </p>
                                <p className="text-2xl font-bold text-green-400 mt-1">
                                    ${finalAmount.toFixed(2)}
                                </p>
                            </div>
                        ) : (
                            <p className="text-2xl font-bold text-green-400 mt-2">$10.00</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="text-gray-400 block mb-2">Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="credit_card">Credit Card</option>
                            <option value="paypal">PayPal</option>
                            <option value="bank_transfer">Bank Transfer</option>
                        </select>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                        {processing ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;