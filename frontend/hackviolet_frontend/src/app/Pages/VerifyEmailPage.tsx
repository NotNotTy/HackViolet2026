import { useState, useEffect } from "react";
import { verificationAPI } from "../../util/api";
import { Page } from "../../types/page";
import './VerifyEmailPage.css';

interface VerifyEmailPageProps {
    setPage: (page: Page) => void;
}

function VerifyEmailPage({ setPage }: VerifyEmailPageProps) {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');
    const [resending, setResending] = useState(false);
    const [hasVerified, setHasVerified] = useState(false);

    useEffect(() => {
        // Get token from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        // Also try to get from hash if not in query (some email clients modify URLs)
        if (!token) {
            const hash = window.location.hash;
            const hashParams = new URLSearchParams(hash.substring(1));
            const hashToken = hashParams.get('token');
            if (hashToken) {
                verifyEmail(hashToken);
                return;
            }
        }
        
        if (token) {
            verifyEmail(token);
        } else {
            setStatus('error');
            setMessage('No verification token provided. Please check your email for the verification link.');
        }
    }, []);

    const verifyEmail = async (token: string) => {
        // Prevent duplicate verification attempts
        if (hasVerified) {
            return;
        }
        
        try {
            const response = await verificationAPI.verifyEmail(token);
            setHasVerified(true);
            setStatus('success');
            if (response.already_verified) {
                setMessage('Your email was already verified! You can log in normally.');
            } else {
                setMessage('Email verified successfully! You can now access all features.');
            }
            // Clean up URL by removing token parameter
            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            window.history.replaceState({}, '', url.toString());
            // Store verification status to prevent redirect on refresh
            sessionStorage.setItem('email_verified', 'true');
        } catch (err: any) {
            setHasVerified(true); // Mark as attempted to prevent retries
            setStatus('error');
            // Check if error message suggests already verified
            const errorMsg = err.message || 'Invalid or expired verification token';
            if (errorMsg.includes('already verified') || errorMsg.includes('already been used')) {
                setMessage('This verification link has already been used. Your email is verified - you can log in normally.');
                // If already verified, treat as success
                setStatus('success');
                // Clean up URL even on error if already verified
                const url = new URL(window.location.href);
                url.searchParams.delete('token');
                window.history.replaceState({}, '', url.toString());
                // Store verification status
                sessionStorage.setItem('email_verified', 'true');
            } else {
                setMessage(errorMsg);
            }
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await verificationAPI.resendVerification();
            setMessage('Verification email sent! Please check your inbox.');
        } catch (err: any) {
            setMessage(err.message || 'Failed to resend verification email');
        } finally {
            setResending(false);
        }
    };

    const handleGoToLogin = () => {
        setPage(Page.Login);
    };

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                <h1>Email Verification</h1>
                
                {status === 'verifying' && (
                    <div className="verifying">
                        <div className="spinner"></div>
                        <p>Verifying your email...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="success">
                        <div className="success-icon">✓</div>
                        <p className="success-message">{message}</p>
                        <button onClick={handleGoToLogin} className="primary-button">
                            Go to Login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="error">
                        <div className="error-icon">✗</div>
                        <p className="error-message">{message}</p>
                        <div className="error-actions">
                            <button 
                                onClick={handleResend} 
                                disabled={resending}
                                className="primary-button"
                            >
                                {resending ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                            <button 
                                onClick={handleGoToLogin}
                                className="secondary-button"
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmailPage;
