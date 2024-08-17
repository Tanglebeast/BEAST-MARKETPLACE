//Footer.jsx

import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer>
            <div className='footerDiv'>
            <div className="footer-content">
                <div className="footer-section about">
                <a href="https://fractalz.xyz">
              <div className="logo-footer">
                <img src="/fractalz-logo-black.svg" alt="Logo" />
              </div>
            </a>
            <div className='footerdescription'>
                    <p>
                        We are merging the digital and physical art worlds, enabling everyone to discover and collect physical art NFTs.
                    </p>
            </div>

                    <div className="social-iconDiv">
                        <a href="https://x.com/tanglebeasts">
                        <img className="social-icons" src="/x.png" alt="x" />
                        </a>
                        <a href="https://discord.com/invite/zeMwbxhJuU">
                        <img className="social-icons" src="/discord.png" alt="discord" />
                        </a>
                        <a href="https://beast-art.xyz">
                        <img className="social-icons" src="/beast-art-logo.png" alt="beast-art" />
                        </a>
                    </div>

                </div>
                <div className="footer-section links">
                    <h2>Quick Links</h2>
                    <ul>
                        <li><a href="https://fractalz.xyz">Homepage</a></li>
                        <li><a href="/faucet">Get Testtokens</a></li>
                        <li><a href="/collections">Gallery</a></li>
                        <li><a href="/contact">Contact Us</a></li>
                        <li><a href="/faq">FAQ</a></li>
                    </ul>
                </div>
                <div className="footer-section contact">
                    <h2>Contact Us</h2>
                    <p>Email: info@fractalz.xyz</p>
                </div>
            </div>
            <div className="footer-bottom VisibleLink">
                &copy; 2024 FRACTALZ all rights reserved | <a href="/imprint">Imprint</a> | <a href="/terms">Terms of Use</a> | <a href="/privacy">Privacy Policy</a>
            </div>
            </div>
        </footer>
    );
};

export default Footer;
