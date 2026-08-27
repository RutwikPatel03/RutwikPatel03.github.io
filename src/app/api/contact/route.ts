import { NextRequest } from 'next/server';
import {
  successResponse,
  ApiErrors,
  validateString,
  checkRateLimit,
} from '@/lib/api';
import { recordServerEvent } from '@/lib/analytics';

// Rate limiting: 5 contact form submissions per minute per IP
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';

    // Check rate limit
    const rateLimit = checkRateLimit(`contact-${clientIp}`, RATE_LIMIT, RATE_LIMIT_WINDOW);
    if (!rateLimit.allowed) {
      return ApiErrors.tooManyRequests('Too many messages. Please try again later.');
    }

    // Parse request body
    const body = await request.json();
    const { name, email, message } = body;

    // Validate inputs
    const nameError = validateString(name, 'name', { minLength: 2, maxLength: 100 });
    if (nameError) return ApiErrors.badRequest(nameError);

    const emailError = validateString(email, 'email', { minLength: 5, maxLength: 254 });
    if (emailError) return ApiErrors.badRequest(emailError);

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ApiErrors.badRequest('Please enter a valid email address');
    }

    const messageError = validateString(message, 'message', { minLength: 10, maxLength: 5000 });
    if (messageError) return ApiErrors.badRequest(messageError);

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      // Fallback: Log the message (for development/testing)
      console.log('=== Contact Form Submission ===');
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Message:', message);
      console.log('Timestamp:', new Date().toISOString());
      console.log('===============================');
      
      // In production without Resend, return error
      if (process.env.NODE_ENV === 'production') {
        console.error('RESEND_API_KEY not configured');
        return ApiErrors.serviceUnavailable('Email service not configured');
      }
      
      // In development, simulate success
      return successResponse({ 
        success: true, 
        message: 'Message received (dev mode - check console)' 
      });
    }

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: process.env.CONTACT_EMAIL || 'me.rutwik@gmail.com',
        reply_to: email,
        subject: `Portfolio Contact: ${name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent from your portfolio website at ${new Date().toISOString()}
          </p>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return ApiErrors.internalError('Failed to send email. Please try again.');
    }

    // Counted server-side so the number reflects mail that actually went out,
    // not submit buttons pressed.
    await recordServerEvent('contact_submit');

    return successResponse({ 
      success: true, 
      message: 'Message sent successfully' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return ApiErrors.internalError('An unexpected error occurred');
  }
}

