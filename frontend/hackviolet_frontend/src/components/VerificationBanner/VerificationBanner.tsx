import { useState, useEffect } from "react";
import { verificationAPI, authAPI } from "../../util/api";
import './VerificationBanner.css';

function VerificationBanner() {
    const [showBanner, setShowBanner] = useState(false);
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        checkVerificationStatus();
        // Re-check verification status every 5 seconds to catch updates
        const interval = setInterval(checkVerificationStatus, 5000);
        
        // Also check when page becomes visible (user returns to tab)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkVerificationStatus();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const checkVerificationStatus = async () => {
        try {
            const user = await authAPI.getCurrentUser();
            if (user && !user.verified) {
                setShowBanner(true);
            } else {
                setShowBanner(false);
            }
        } catch (err) {
            // User not logged in or error - hide banner
            setShowBanner(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setMessage("");
        try {
            await verificationAPI.resendVerification();
            setMessage("Verification email sent! Please check your inbox.");
            setTimeout(() => setMessage(""), 5000);
        } catch (err: any) {
            setMessage(err.message || "Failed to resend verification email");
        } finally {
            setResending(false);
        }
    };

    if (!showBanner) return null;

    return (
        <div className="verification-banner">
            <div className="verification-content">
                <div className="verification-icon">⚠️</div>
                <div className="verification-text">
                    <strong>Please verify your email address</strong>
                    <p>You need to verify your email to access all features. Check your inbox for the verification link.</p>
                    {message && <p className="verification-message">{message}</p>}
                </div>
                <button 
                    onClick={handleResend} 
                    disabled={resending}
                    className="resend-button"
                >
                    {resending ? 'Sending...' : 'Resend Email'}
                </button>
            </div>
        </div>
    );
}

export default VerificationBanner;
