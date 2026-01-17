'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside className={`sidebar ${isExpanded ? 'active' : ''}`}>
      <div className="sidebar-info">
        <div className="avatar-box">
          <Image
            className="avatar-img"
            src="/myimg/me.jpg"
            alt="Rutwik Patel"
            width={80}
            height={80}
          />
        </div>

        <div className="info-content">
          <h1 className="name">Rutwik Patel</h1>
          <Link
            href="https://www.linkedin.com/in/rutwikpatel13"
            target="_blank"
            rel="noopener noreferrer"
          >
            <p className="title">Software Developer</p>
          </Link>
          <Link href="/resume.pdf" className="resume-button" target="_blank" download>
            <button className="btn-download">Download Resume</button>
          </Link>
        </div>

        <button
          className="info_more-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>Show Contacts</span>
          <svg
            className={`chevron-icon ${isExpanded ? 'rotated' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 512 512"
            fill="currentColor"
          >
            <path d="M256 294.1L383 167c9.4-9.4 24.6-9.4 33.9 0s9.3 24.6 0 34L273 345c-9.1 9.1-23.7 9.3-33.1.7L95 201.1c-4.7-4.7-7-10.9-7-17s2.3-12.3 7-17c9.4-9.4 24.6-9.4 33.9 0l127.1 127z" />
          </svg>
        </button>
      </div>

      <div className="sidebar-info_more">
        <div className="separator"></div>

        <ul className="contacts-list">
          <li className="contact-item">
            <div className="icon-box">
              <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                <path d="M464 80H48a16 16 0 00-16 16v320a16 16 0 0016 16h416a16 16 0 0016-16V96a16 16 0 00-16-16zM265.82 284.63a16 16 0 01-19.64 0L89.55 162.81l19.64-25.26L256 251.73l146.81-114.18 19.64 25.26z" />
              </svg>
            </div>
            <div className="contact-info">
              <p className="contact-title">Email</p>
              <a href="mailto:rutwikdh@usc.edu" className="contact-link">
                rutwikdh@usc.edu
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                <path d="M164 480c-3.3 0-6.5-1.3-8.9-3.6l-50-48.3c-32.5-31.4-50.1-73.5-50.1-118.1 0-38.6 13.3-75.3 37.5-104 24-28.4 57.3-48.2 94.5-56 8.5-1.8 17-1.8 25.5 0 37.2 7.8 70.5 27.6 94.5 56 24.2 28.7 37.5 65.4 37.5 104 0 44.6-17.6 86.7-50.1 118.1l-50 48.3c-2.4 2.3-5.6 3.6-8.9 3.6h-71.5z" />
              </svg>
            </div>
            <div className="contact-info">
              <p className="contact-title">Phone</p>
              <a href="tel:+12139138803" className="contact-link">
                +1 213-913-8803
              </a>
            </div>
          </li>

          <li className="contact-item">
            <div className="icon-box">
              <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                <path d="M256 32C167.67 32 96 96.51 96 176c0 128 160 304 160 304s160-176 160-304c0-79.49-71.67-144-160-144zm0 224a64 64 0 1164-64 64.07 64.07 0 01-64 64z" />
              </svg>
            </div>
            <div className="contact-info">
              <p className="contact-title">Location</p>
              <address>San Francisco, USA</address>
            </div>
          </li>
        </ul>

        <div className="separator"></div>

        <ul className="social-list">
          <li className="social-item">
            <a href="https://www.linkedin.com/in/rutwikpatel13" className="social-link linkedin" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                <path d="M444.17 32H70.28C49.85 32 32 46.7 32 66.89v374.72C32 461.91 49.85 480 70.28 480h373.78c20.54 0 35.94-18.21 35.94-38.39V66.89C480.12 46.7 464.6 32 444.17 32zm-273.3 373.43h-64.18V205.88h64.18zM141 175.54h-.46c-20.54 0-33.84-15.29-33.84-34.43 0-19.49 13.65-34.42 34.65-34.42s33.85 14.82 34.31 34.42c-.01 19.14-13.31 34.43-34.66 34.43zm264.43 229.89h-64.18V296.32c0-26.14-9.34-44-32.56-44-17.74 0-28.24 12-32.91 23.69-1.75 4.2-2.22 9.92-2.22 15.76v113.66h-64.18V205.88h64.18v27.77c9.34-13.3 23.93-32.44 57.88-32.44 42.13 0 74 27.77 74 87.64z" />
              </svg>
            </a>
          </li>
          <li className="social-item">
            <a href="https://github.com/RutwikPatel13" className="social-link github" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                <path d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9a17.56 17.56 0 003.8.4c8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1a102.4 102.4 0 01-22.6 2.7c-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1a63 63 0 0025.6-6c2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8a18.64 18.64 0 015-.5c8.1 0 26.4 3.1 56.6 24.1a208.21 208.21 0 01112.2 0c30.2-21 48.5-24.1 56.6-24.1a18.64 18.64 0 015 .5c12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5a19.35 19.35 0 004-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z" />
              </svg>
            </a>
          </li>
          <li className="social-item">
            <a href="https://medium.com/@rutwikpatel1313" className="social-link medium" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                <path d="M28 28v456h456V28H28zm378.83 108.04l-24.46 23.45a7.162 7.162 0 00-2.72 6.86v172.28c-.44 2.61.61 5.26 2.72 6.86l23.88 23.45v5.15H286.13v-5.15l24.74-24.02c2.43-2.43 2.43-3.15 2.43-6.86V198.81l-68.79 174.71h-9.3l-80.09-174.71v117.1c-.67 4.92.97 9.88 4.43 13.44l32.18 39.03v5.15h-91.24v-5.15l32.18-39.03c3.44-3.57 4.98-8.56 4.15-13.44V180.5c.38-3.76-1.05-7.48-3.86-10.01l-28.6-34.46v-5.15h88.81l68.65 150.55 60.35-150.55h84.66v5.16z" />
              </svg>
            </a>
          </li>
          <li className="social-item">
            <a href="https://www.instagram.com/rutwik1313" className="social-link instagram" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                <path d="M349.33 69.33a93.62 93.62 0 0193.34 93.34v186.66a93.62 93.62 0 01-93.34 93.34H162.67a93.62 93.62 0 01-93.34-93.34V162.67a93.62 93.62 0 0193.34-93.34h186.66m0-37.33H162.67C90.8 32 32 90.8 32 162.67v186.66C32 421.2 90.8 480 162.67 480h186.66C421.2 480 480 421.2 480 349.33V162.67C480 90.8 421.2 32 349.33 32z" />
                <path d="M377.33 162.67a28 28 0 1128-28 27.94 27.94 0 01-28 28zM256 181.33A74.67 74.67 0 11181.33 256 74.75 74.75 0 01256 181.33m0-37.33a112 112 0 10112 112 112 112 0 00-112-112z" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}

