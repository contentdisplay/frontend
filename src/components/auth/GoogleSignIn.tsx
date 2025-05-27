import { useEffect, useRef } from 'react';

interface GoogleSignInProps {
  onSuccess: (credential: string) => void;
  onError: (error: any) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  onSuccess,
  onError,
  text = 'signin_with',
  disabled = false
}) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const initializeGoogleSignIn = () => {
    if (!window.google?.accounts?.id || isInitialized.current || disabled) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: '51846475472-u7nv69nnui7jjba6vn7luks53ehtkqsd.apps.googleusercontent.com',
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: text,
          width: '100%',
          logo_alignment: 'left',
        });
      }

      isInitialized.current = true;
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      onError(error);
    }
  };

  const handleCredentialResponse = (response: any) => {
    if (disabled) return;
    
    try {
      console.log('Google Sign-In response received:', response);
      
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        throw new Error('No credential received from Google');
      }
    } catch (error) {
      console.error('Error handling Google credential:', error);
      onError(error);
    }
  };

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Initialize after script loads
      setTimeout(initializeGoogleSignIn, 100);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Identity Services script:', error);
      onError(new Error('Failed to load Google Sign-In'));
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      isInitialized.current = false;
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Re-initialize if disabled state changes
    if (!disabled && window.google?.accounts?.id && !isInitialized.current) {
      initializeGoogleSignIn();
    }
  }, [disabled]);

  return (
    <div className="w-full">
      <div 
        ref={googleButtonRef} 
        className={`w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ minHeight: '40px' }}
      />
      {disabled && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded">
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleSignIn;